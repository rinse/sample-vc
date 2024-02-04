export type ECDSACurve = "P-256" | "P-384" | "P-521";

export interface Signer {
    algorithm: ECDSACurve,
    id: string,
    sign(options: { data: Uint8Array }): Uint8Array,
}

export interface Verifier {
    algorithm: ECDSACurve,
    id: string,
    verify(options: { data: Uint8Array, signature: Uint8Array }): boolean,
}

/**
 * {@link https://www.w3.org/TR/vc-data-integrity/#multikey}
 */
export type Multikey = {
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
    }): Multikey;

    deriveSecret(options: {
        publicKey?: string,
        remotePublicKey?: string,
    }): Promise<Uint8Array>;
}

export type DocumentLoader = (url: string, options?: object) => Promise<object>;
