// Subject binding: which person a credential is about, without putting the person on chain.
//
// subjectId = subjectIdOf(SHA-256("<normalized name>|<YYYYMMDD>")). The issuer computes it from
// the documents it checked; a hiring verifier computes the same value from the applicant's
// resume. A request for one named applicant carries only subjectCommitment(subjectId, nonce),
// and the nonce travels in the private link, so the public value cannot be tested against
// guessed names.
import { pureCircuits } from '@stateproof/contract';
import { randomBytes32 } from '../encoding/bytes.js';

// NFC, no whitespace at all, ASCII letters lower-cased. "김 민지" and "김민지" are the same person;
// "Kim Minji" and "kimminji" too.
export const normalizeName = (name: string): string => name.normalize('NFC').replace(/\s+/g, '').toLowerCase();

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const subjectString = (name: string, birthDate: string): string => {
  const m = ISO_DATE.exec(birthDate);
  if (!m) throw new Error(`Expected YYYY-MM-DD birth date, got ${birthDate}`);
  const normalized = normalizeName(name);
  if (normalized.length === 0) throw new Error('Name is empty');
  return `${normalized}|${m[1]}${m[2]}${m[3]}`;
};

export const subjectDigest = async (name: string, birthDate: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(subjectString(name, birthDate))));

export const subjectIdFor = async (name: string, birthDate: string): Promise<bigint> =>
  pureCircuits.subjectIdOf(await subjectDigest(name, birthDate));

export interface SubjectSeal {
  // Goes on chain inside the request.
  readonly commitment: bigint;
  // Goes only into the private link sent to the applicant.
  readonly nonce: Uint8Array;
}

export const sealSubject = async (name: string, birthDate: string, nonce: Uint8Array = randomBytes32()): Promise<SubjectSeal> => ({
  commitment: pureCircuits.subjectCommitment(await subjectIdFor(name, birthDate), nonce),
  nonce,
});
