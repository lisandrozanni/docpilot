import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestDatabase, type TestDatabase } from '../../test-support/test-database.js';

// documents.repository imports the module-level `db` singleton from
// infra/db/client.ts, which reads DATABASE_URL at import time. That module
// must not be imported until the container's real connection string is set —
// hence the dynamic import after startTestDatabase(), not a static one above.
let testDb: TestDatabase;
let documentsRepository: typeof import('./documents.repository.js');

const USER_ID = 'test-user-1';

beforeAll(async () => {
  testDb = await startTestDatabase();
  process.env.DATABASE_URL = testDb.connectionString;
  documentsRepository = await import('./documents.repository.js');
  await testDb.db.execute(sql`insert into "user" (id) values (${USER_ID})`);
}, 60_000);

afterAll(async () => {
  await testDb.stop();
});

describe('documents.repository (integration)', () => {
  it('inserts a document and reads it back scoped to its owner', async () => {
    const id = crypto.randomUUID();
    await documentsRepository.insertDocument({
      id,
      userId: USER_ID,
      filename: 'test.pdf',
      s3Key: `users/${USER_ID}/${id}.pdf`,
      sizeBytes: 1024,
    });

    const found = await documentsRepository.findDocumentById(id, USER_ID);
    expect(found?.filename).toBe('test.pdf');
    expect(found?.status).toBe('pending');

    const wrongUser = await documentsRepository.findDocumentById(id, 'someone-else');
    expect(wrongUser).toBeUndefined();
  });

  it('enforces the unique constraint on s3Key', async () => {
    const sharedKey = `users/${USER_ID}/duplicate.pdf`;

    await documentsRepository.insertDocument({
      id: crypto.randomUUID(),
      userId: USER_ID,
      filename: 'a.pdf',
      s3Key: sharedKey,
      sizeBytes: 100,
    });

    await expect(
      documentsRepository.insertDocument({
        id: crypto.randomUUID(),
        userId: USER_ID,
        filename: 'b.pdf',
        s3Key: sharedKey,
        sizeBytes: 100,
      }),
    ).rejects.toThrow();
  });

  it('orders documents by createdAt descending', async () => {
    const older = crypto.randomUUID();
    const newer = crypto.randomUUID();

    await documentsRepository.insertDocument({
      id: older,
      userId: USER_ID,
      filename: 'older.pdf',
      s3Key: `users/${USER_ID}/${older}.pdf`,
      sizeBytes: 100,
    });
    await documentsRepository.insertDocument({
      id: newer,
      userId: USER_ID,
      filename: 'newer.pdf',
      s3Key: `users/${USER_ID}/${newer}.pdf`,
      sizeBytes: 100,
    });

    const results = await documentsRepository.findDocumentsByUserId(USER_ID);
    const olderIndex = results.findIndex((doc) => doc.id === older);
    const newerIndex = results.findIndex((doc) => doc.id === newer);

    expect(newerIndex).toBeLessThan(olderIndex);
  });

  it('updateDocumentStatus only affects the owning user', async () => {
    const id = crypto.randomUUID();
    await documentsRepository.insertDocument({
      id,
      userId: USER_ID,
      filename: 'status-test.pdf',
      s3Key: `users/${USER_ID}/${id}.pdf`,
      sizeBytes: 100,
    });

    const updatedByWrongUser = await documentsRepository.updateDocumentStatus(
      id,
      'someone-else',
      'ready',
    );
    expect(updatedByWrongUser).toBeUndefined();

    const updated = await documentsRepository.updateDocumentStatus(id, USER_ID, 'ready');
    expect(updated?.status).toBe('ready');
  });

  it("deleteDocumentById only deletes the owning user's document", async () => {
    const id = crypto.randomUUID();
    await documentsRepository.insertDocument({
      id,
      userId: USER_ID,
      filename: 'delete-test.pdf',
      s3Key: `users/${USER_ID}/${id}.pdf`,
      sizeBytes: 100,
    });

    const deletedByWrongUser = await documentsRepository.deleteDocumentById(id, 'someone-else');
    expect(deletedByWrongUser).toBeUndefined();

    const stillThere = await documentsRepository.findDocumentById(id, USER_ID);
    expect(stillThere).toBeDefined();

    const deleted = await documentsRepository.deleteDocumentById(id, USER_ID);
    expect(deleted?.id).toBe(id);

    const goneNow = await documentsRepository.findDocumentById(id, USER_ID);
    expect(goneNow).toBeUndefined();
  });
});
