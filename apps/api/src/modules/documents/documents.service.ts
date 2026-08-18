import { NotFoundError } from '../../lib/errors.js';
import * as documentsRepository from './documents.repository.js';
import type { CreateDocumentInput } from './documents.schemas.js';

export async function createDocument(input: CreateDocumentInput) {
  return documentsRepository.insertDocument(input);
}

export async function listDocuments(userId: string) {
  return documentsRepository.findDocumentsByUserId(userId);
}

export async function getDocument(id: string, userId: string) {
  const document = await documentsRepository.findDocumentById(id, userId);

  if (!document) {
    throw new NotFoundError(`Document ${id} not found`);
  }

  return document;
}

export async function deleteDocument(id: string, userId: string) {
  const deleted = await documentsRepository.deleteDocumentById(id, userId);

  if (!deleted) {
    throw new NotFoundError(`Document ${id} not found`);
  }

  return deleted;
}
