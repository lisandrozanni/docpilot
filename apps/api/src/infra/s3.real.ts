import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../lib/env.js';

const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

// env.ts's superRefine guarantees these are set whenever MOCK_EXTERNAL_SERVICES
// is false, which is the only condition under which this module is loaded.
const s3Client = new S3Client({
  region: env.AWS_REGION!,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function buildS3Key(userId: string, documentId: string): string {
  return `users/${userId}/${documentId}.pdf`;
}

export async function createPresignedUploadUrl(
  s3Key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });
}

export async function downloadObject(s3Key: string): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: s3Key }),
  );

  if (!response.Body) {
    throw new Error(`S3 object ${s3Key} has no body`);
  }

  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes);
}

export async function objectExists(s3Key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: s3Key }));
    return true;
  } catch (error) {
    // Only a genuine "object not found" means the upload hasn't happened. Any
    // other error (bad credentials, wrong region, network failure) is a real
    // infra problem and must not be silently treated as "not uploaded yet".
    if (error instanceof Error && error.name === 'NotFound') {
      return false;
    }

    throw error;
  }
}
