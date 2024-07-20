import { Knex } from "knex";

export type TGenerateKMSDTO = {
  orgId: string;
  isReserved?: boolean;
  slug?: string;
  tx?: Knex;
};

export type TEncryptWithKmsDTO = {
  kmsId: string;
  plainText: Buffer;
};

export type TEncryptionWithKeyDTO = {
  key: Buffer;
  plainText: Buffer;
};

export type TDecryptWithKmsDTO = {
  kmsId: string;
  cipherTextBlob: Buffer;
};

export type TDecryptWithKeyDTO = {
  key: Buffer;
  cipherTextBlob: Buffer;
};

export enum KmsDataKey {
  Organization,
  SecretManager
  // CertificateManager
}

export type TEncryptWithKmsDataKeyDTO =
  | { type: KmsDataKey.Organization; orgId: string }
  | { type: KmsDataKey.SecretManager; projectId: string };
// akhilmhdh: not implemented yet
// | {
//     type: KmsDataKey.CertificateManager;
//     projectId: string;
//   };
