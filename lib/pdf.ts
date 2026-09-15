import { PDFDocument } from "pdf-lib";

function hasEncryptMarker(data: Buffer): boolean {
  // Cheap structural check — good enough since we only use this to verify our
  // own cleanup worked, not to parse arbitrary PDFs.
  return data.toString("latin1").includes("/Encrypt");
}

/**
 * Some "exam question bank" PDFs are saved with owner-password-only encryption
 * (print/copy restrictions, no password needed to open) — those open fine in
 * any viewer, but Gemini's document ingestion rejects them outright with a
 * bare 400 INVALID_ARGUMENT. Since no real password is needed to read them,
 * pdf-lib can losslessly strip that restriction layer.
 *
 * Returns the cleaned bytes, or null if the file still needs an actual
 * (unknown) password — that case can't be fixed automatically.
 */
export async function stripPdfEncryption(data: Buffer): Promise<Buffer | null> {
  if (!hasEncryptMarker(data)) return data;

  try {
    const doc = await PDFDocument.load(data, { ignoreEncryption: true });
    const cleaned = Buffer.from(await doc.save());
    // pdf-lib's ignoreEncryption only bypasses the load-time error; it does not
    // guarantee the restriction layer is actually removed on save. Verify.
    return hasEncryptMarker(cleaned) ? null : cleaned;
  } catch {
    return null;
  }
}
