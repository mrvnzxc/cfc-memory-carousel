import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireEnv } from "./env";

let cachedClient: S3Client | null = null;

function getStorageConfig() {
  const config = useRuntimeConfig();
  const storage = config.storage;

  return {
    endpoint: requireEnv(storage.endpoint, "STORAGE_ENDPOINT"),
    region: requireEnv(storage.region, "STORAGE_REGION"),
    accessKeyId: requireEnv(storage.accessKeyId, "STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv(
      storage.secretAccessKey,
      "STORAGE_SECRET_ACCESS_KEY"
    ),
    bucketName: requireEnv(storage.bucketName, "STORAGE_BUCKET_NAME"),
    publicBaseUrl: requireEnv(storage.publicBaseUrl, "STORAGE_PUBLIC_BASE_URL")
  };
}

function getS3Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const storage = getStorageConfig();

  cachedClient = new S3Client({
    endpoint: storage.endpoint,
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey
    },
    forcePathStyle: false,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED"
  });

  return cachedClient;
}

export async function getPresignedUploadUrl(input: {
  fileKey: string;
  mimeType: string;
}) {
  const storage = getStorageConfig();
  const command = new PutObjectCommand({
    Bucket: storage.bucketName,
    Key: input.fileKey,
    ContentType: input.mimeType
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 300
  });

  return {
    uploadUrl,
    publicUrl: `${storage.publicBaseUrl.replace(/\/$/, "")}/${input.fileKey}`
  };
}

export async function deleteFromStorage(storageKey: string) {
  const storage = getStorageConfig();
  const command = new DeleteObjectCommand({
    Bucket: storage.bucketName,
    Key: storageKey
  });

  await getS3Client().send(command);
}

export async function getObjectBuffer(storageKey: string): Promise<Buffer> {
  const storage = getStorageConfig();
  const command = new GetObjectCommand({
    Bucket: storage.bucketName,
    Key: storageKey
  });

  const response = await getS3Client().send(command);
  if (!response.Body) {
    throw new Error("Empty response body from storage");
  }

  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes);
}
