import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// Configure storage client to use Replit's sidecar endpoint for authentication
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID!;
const privateDir = process.env.PRIVATE_OBJECT_DIR!;

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
  const extension = fileName.split('.').pop();
  const objectName = `photos/${fileId}.${extension}`;
  const filePath = `${privateDir}/${objectName}`;

  const signedUrl = await signObjectURL({
    bucketName: bucketId,
    objectName: `${privateDir.split('/')[1]}/${objectName}`,
    method: 'PUT',
    ttlSec: 900, // 15 minutes
    contentType,
  });

  return { signedUrl, filePath };
}

export async function getSignedDownloadUrl(filePath: string): Promise<string> {
  // Extract object name from filePath (remove bucket prefix)
  const parts = filePath.split('/');
  const objectName = parts.slice(1).join('/');

  const signedUrl = await signObjectURL({
    bucketName: bucketId,
    objectName,
    method: 'GET',
    ttlSec: 3600, // 1 hour
  });

  return signedUrl;
}