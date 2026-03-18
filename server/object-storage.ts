import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID!;
const privateDir = process.env.PRIVATE_OBJECT_DIR || ".private";

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
  contentType,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
  contentType?: string;
}): Promise<string> {
  const request: Record<string, unknown> = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  
  if (contentType) {
    request.content_type = contentType;
  }
  
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

export async function generateSignedUploadUrl(fileName: string, contentType: string): Promise<{ signedUrl: string; filePath: string }> {
  const fileId = randomUUID();
  const extension = fileName.split('.').pop() || 'jpg';
  const objectName = `photos/${fileId}.${extension}`;
  
  // privateDir is the full path like ".private" or "bucket-id/.private"
  // We need the object path within the bucket
  const privateDirName = privateDir.split('/').pop() || '.private';
  const fullObjectName = `${privateDirName}/${objectName}`;
  const filePath = `${privateDirName}/${objectName}`;

  const signedUrl = await signObjectURL({
    bucketName: bucketId,
    objectName: fullObjectName,
    method: 'PUT',
    ttlSec: 900,
    contentType,
  });

  return { signedUrl, filePath };
}

export async function getSignedDownloadUrl(filePath: string): Promise<string> {
  const signedUrl = await signObjectURL({
    bucketName: bucketId,
    objectName: filePath,
    method: 'GET',
    ttlSec: 3600,
  });

  return signedUrl;
}
