// Issues credentials for the fictional demo personas and writes the holder bundles
// the web app offers under "Load a demo persona".
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createHolderSecret,
  holderCommitOf,
  holderSecretToHex,
  issueCredential,
  issuerKeyPairFromHex,
  publicKeyFromJson,
  verifyCredentialDocument,
  type CredentialDocument,
  type CredentialSubject,
} from '@stateproof/core';
import { REPO_ROOT, findIssuer, issuerSecretHex, loadRegistry, type IssuerRegistry } from '../registry.js';

const PERSONAS_FILE = fileURLToPath(new URL('./personas.json', import.meta.url));
export const DEMO_BUNDLE_FILE = path.join(REPO_ROOT, 'packages', 'web', 'src', 'state', 'demo-personas.json');

interface PersonaCredentialSpec {
  readonly issuer: string;
  readonly schema: string;
  readonly subject: CredentialSubject;
}

interface PersonaSpec {
  readonly id: string;
  readonly displayName: string;
  readonly credentials: readonly PersonaCredentialSpec[];
}

interface PersonasFile {
  readonly validity: { readonly issuedAt: string; readonly expiresAt: string };
  readonly personas: readonly PersonaSpec[];
}

export interface PersonaBundle {
  readonly id: string;
  readonly displayName: string;
  readonly holderSecret: string;
  readonly credentials: readonly CredentialDocument[];
}

const issueForPersona = (registry: IssuerRegistry, file: PersonasFile, persona: PersonaSpec): PersonaBundle => {
  const holderSecret = createHolderSecret();
  const holderCommit = holderCommitOf(holderSecret);
  const credentials = persona.credentials.map((spec) => {
    const entry = findIssuer(registry, spec.issuer);
    if (!entry.schemas.includes(spec.schema)) throw new Error(`${spec.issuer} does not issue ${spec.schema}`);
    if (entry.publicKey === null) throw new Error(`${spec.issuer} has no public key yet; run keygen`);
    const keyPair = issuerKeyPairFromHex(issuerSecretHex(entry));
    const doc = issueCredential(
      {
        schema: spec.schema,
        issuer: { id: entry.id, name: entry.name },
        issuedAt: file.validity.issuedAt,
        expiresAt: file.validity.expiresAt,
        credentialSubject: spec.subject,
        holderCommit,
      },
      keyPair,
    );
    if (!verifyCredentialDocument(doc, publicKeyFromJson(entry.publicKey))) {
      throw new Error(`${spec.issuer}: .env secret does not match the public key in config/issuers.json`);
    }
    return doc;
  });
  return { id: persona.id, displayName: persona.displayName, holderSecret: holderSecretToHex(holderSecret), credentials };
};

export const issuePersonas = async (): Promise<string> => {
  const registry = await loadRegistry();
  const file = JSON.parse(await readFile(PERSONAS_FILE, 'utf8')) as PersonasFile;
  const bundles = file.personas.map((p) => issueForPersona(registry, file, p));
  const output = {
    $comment: `Generated ${new Date().toISOString()} by packages/issuer (personas). Fictional people; holder secrets are public on purpose so anyone can replay the demo.`,
    personas: bundles,
  };
  await writeFile(DEMO_BUNDLE_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return `Issued ${bundles.reduce((n, b) => n + b.credentials.length, 0)} credentials for ${bundles.length} personas -> ${path.relative(REPO_ROOT, DEMO_BUNDLE_FILE)}`;
};
