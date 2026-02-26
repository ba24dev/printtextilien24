import { createHash, randomBytes } from "crypto";

export function randomState(length = 32) {
  return base64urlEncode(randomBytes(length));
}

export function base64urlEncode(buffer: Buffer | Uint8Array) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCE() {
  const verifier = base64urlEncode(randomBytes(32));
  const challenge = base64urlEncode(
    createHash("sha256").update(verifier).digest(),
  );
  return { verifier, challenge };
}
