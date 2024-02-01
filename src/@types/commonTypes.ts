export type ECDSACurve = "P-256" | "P-384" | "P-521";

export interface Signer {
    algorithm: ECDSACurve,
    id: string,     // Is it required?
    sign(options: { data: Uint8Array }): Uint8Array,
}

export interface Verifier {
    algorithm: ECDSACurve,
    id: string, // Is it required?
    verify(options: { data: Uint8Array, signature: Uint8Array }): boolean,
}

export interface MultiKey {
    "@context": "https://w3id.org/security/multikey/v1",
    type: "Multikey",
    id?: string,
    controller?: string,
    publicKeyMultibase?: string,
    secretKeyMultibase?: string,
}

export interface KeyPairInterface {
    signer(): Signer;
    verifier(): Verifier;

    export(options: {
        publicKey?: boolean,
        secretKey?: boolean,
    }): MultiKey;

    deriveSecret(options: {
        publicKey?: string,
        remotePublicKey?: string,
    }): Promise<Uint8Array>;
}
