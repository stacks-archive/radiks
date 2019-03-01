interface Signature {
  signature: string,
  publicKey: string
}

declare module 'blockstack/lib/encryption' {
  export function signECDSA(privateKey: string, message: string): Signature
  export function encryptECIES(publicKey: string, content: string): any
  export function decryptECIES(privateKey: string, value: any): string
}

declare module 'blockstack/lib/keys' {
  export function getPublicKeyFromPrivate(privateKey: string): string
  export function makeECPrivateKey(): string;
}
