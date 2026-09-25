// Byte and hex helpers shared by browser and Node code.

const BYTES32 = 32;

// Same layout as Compact's pad(32, "..."): UTF-8 bytes, zero-filled on the right.
export const labelToBytes32 = (label: string): Uint8Array => {
  const encoded = new TextEncoder().encode(label);
  if (encoded.length === 0) throw new Error('Label must not be empty');
  if (encoded.length > BYTES32) throw new Error(`Label longer than ${BYTES32} bytes: ${label}`);
  const out = new Uint8Array(BYTES32);
  out.set(encoded);
  return out;
};

export const bytes32ToLabel = (bytes: Uint8Array): string => {
  const end = bytes.indexOf(0);
  return new TextDecoder().decode(end === -1 ? bytes : bytes.slice(0, end));
};

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export const fromHex = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) throw new Error(`Invalid hex string: ${hex}`);
  return Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16));
};

export const fromHex32 = (hex: string): Uint8Array => {
  const bytes = fromHex(hex);
  if (bytes.length !== BYTES32) throw new Error(`Expected 32 bytes, got ${bytes.length}`);
  return bytes;
};

export const bigintToHex = (value: bigint): string => `0x${value.toString(16)}`;

export const hexToBigint = (hex: string): bigint => {
  if (!/^0x[0-9a-fA-F]+$/.test(hex)) throw new Error(`Invalid bigint hex: ${hex}`);
  return BigInt(hex);
};

export const randomBytes32 = (): Uint8Array => {
  const out = new Uint8Array(BYTES32);
  crypto.getRandomValues(out);
  return out;
};
