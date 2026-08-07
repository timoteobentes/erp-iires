import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  region: process.env.SUPABASE_S3_REGION!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.SUPABASE_S3_BUCKET!;
const UPLOAD_URL_EXPIRES_SECONDS = 300; // 5 min
const DOWNLOAD_URL_EXPIRES_SECONDS = 300; // 5 min

/** Nome de arquivo seguro para compor a chave — sem espaços/acentos/caracteres especiais. */
function slugifyFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot) : '';
  const safeBase = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'arquivo';
  return `${safeBase}${ext.toLowerCase()}`;
}

/** Monta a chave do objeto seguindo o padrão org/{orgId}/{categoria}/{uuid}-{nome}. */
export function buildStorageKey(organizationId: string, category: string, fileName: string): string {
  return `org/${organizationId}/${category}/${crypto.randomUUID()}-${slugifyFileName(fileName)}`;
}

export async function getUploadUrl(storageKey: string, contentType: string): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: storageKey, ContentType: contentType }),
    { expiresIn: UPLOAD_URL_EXPIRES_SECONDS },
  );
}

export async function getDownloadUrl(storageKey: string): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: storageKey }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_SECONDS },
  );
}

export async function deleteObject(storageKey: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }));
}

/** Confirma que o objeto realmente chegou ao Storage antes de gravar os metadados no banco. */
export async function objectExists(storageKey: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: storageKey }));
    return true;
  } catch {
    return false;
  }
}
