import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Configurazione Client S3 (Cloudflare R2 / Backblaze B2 / MinIO)
// Inserisci queste variabili nel tuo .env.local
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "nexus-cloud-storage";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const path = formData.get("path"); // Esempio: userId/Musica/nomefile.mp3

    if (!file || !path) {
      return NextResponse.json({ error: "File o percorso mancante" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Generiamo un URL pubblico (se il bucket è pubblico) o un URL firmato
    // Per ora restituiamo il path per recuperarlo dopo
    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const path = searchParams.get("path");

  try {
    if (action === "list") {
      const prefix = searchParams.get("prefix");
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      });
      const response = await s3Client.send(command);
      const files = response.Contents?.map(item => ({
        name: item.Key.split('/').pop(),
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified
      })) || [];
      return NextResponse.json({ files });
    }

    if (action === "getUrl") {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
      });
      // URL firmato valido per 1 ora
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  } catch (error) {
    console.error("S3 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { path } = await req.json();
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });
    await s3Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
