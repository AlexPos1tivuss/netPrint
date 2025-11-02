import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const storage = new Storage();
const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID!;
const privateDir = process.env.PRIVATE_OBJECT_DIR!;

export async function generateSignedUploadUrl(fileName: string, contentType: string): Promise<{ signedUrl: string; filePath: string }> {
  const bucket = storage.bucket(bucketId);
  const fileId = randomUUID();
  const extension = fileName.split('.').pop();
  const filePath = `${privateDir}/photos/${fileId}.${extension}`;
  const file = bucket.file(filePath);

  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return { signedUrl, filePath };
}

export async function getSignedDownloadUrl(filePath: string): Promise<string> {
  const bucket = storage.bucket(bucketId);
  const file = bucket.file(filePath);

  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  return signedUrl;
}