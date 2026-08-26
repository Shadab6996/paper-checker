import { get } from "@vercel/blob";

export async function fetchBlobBuffer(
  pathname: string
): Promise<{ data: Buffer; contentType: string } | null> {
  const result = await get(pathname, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || result.statusCode !== 200) return null;

  const chunks: Uint8Array[] = [];
  const reader = result.stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return { data: Buffer.concat(chunks), contentType: result.blob.contentType };
}
