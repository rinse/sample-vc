import { createPrivateKey, generateKeyPair } from "crypto";
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey"
import * as Types from "./@types/commonTypes.js"

// Generates an ECDSA key pair in the multikey format. Typically for VC Data Integrity.
export async function generateMultikey(): Promise<Types.Multikey> {
    const fullKeyPair = await EcdsaMultikey.generate({
        curve: "P-384",
        id: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationMethod.json",
        controller:  "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json",
    });
    console.log(await fullKeyPair.export({publicKey: true, secretKey: true}));
    return fullKeyPair.export({ publicKey: true, secretKey: true });
}

// Create a key pair of JWK and PEM. Typically for Securing VC using JOSE and COSE.
export async function generateJWKPEMPair(): Promise<[string, string]> {
    return new Promise<[string, string]>((resolve, reject) => {
        // @ts-ignore 謎の型エラー
        generateKeyPair("ec", {
            namedCurve: "P-256",
            privateKeyEncoding: {
                format: "pem",
                type: "pkcs8",
            },
            publicKeyEncoding: {
                format: "jwk",
                type: "spki",
            },
        }, (error: Error | null, publicKey: string, privateKey: string) => {
            if (error) {
                reject(error);
            } else {
                resolve([publicKey, privateKey]);
            }
        })
    })
}

// A pre-generated key pair.
export const fullMultikey: Types.Multikey = {
    '@context': 'https://w3id.org/security/multikey/v1',
    id: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationMethod.json',
    type: 'Multikey',
    controller: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json',
    publicKeyMultibase: 'z82Lm4xyCxFwD1jCh6cTuQnQ2Kp2pVUbJHUcrcZbfUr9J8nVDdztKuvG7KHcKHpCNPCRpmA',
    secretKeyMultibase: 'z2fanWaRmNUryCkenKhX4saWRdviV7W6LDkWtDupTr5TjNxrwt23UDoZyMGHbaK6rS8JFm'
} as const;

// Ignores the id and controller fields in multikey.
async function multikeyToPEMPrivateKey(multikey: Types.Multikey): Promise<string> {
    const keyPair = await EcdsaMultikey.from(multikey);
    const jwk = await EcdsaMultikey.toJwk({
        keyPair: keyPair,
        secretKey: true,
    });
    const keyObject = createPrivateKey({
        key: jwk,
        format: "jwk",
    });
    return keyObject.export({ format: "pem", type: "pkcs8" }).toString();
}

// Ignores the id and controller fields in multikey.
async function multikeyToJWKPublicKey(multikey: Types.Multikey): Promise<JsonWebKey> {
    const keyPair = await EcdsaMultikey.from(multikey);
    return await EcdsaMultikey.toJwk({
        keyPair: keyPair,
        secretKey: false,
    });
}

export const pemSecretKey: Promise<string> = multikeyToPEMPrivateKey(fullMultikey);
