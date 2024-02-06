import jsonld from "jsonld";
import { createPrivateKey, createPublicKey, generateKeyPair } from "crypto";
import jwt from "jsonwebtoken";
import { makeUnsignedCredential } from "./unsignedCredential.js";
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey"
import * as Types from "./@types/commonTypes.js"

async function generateKeyPairP() {
    return new Promise((resolve, reject) => {
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

const fullMultikey: Types.Multikey = {
    '@context': 'https://w3id.org/security/multikey/v1',
    id: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationMethod.json',
    type: 'Multikey',
    controller: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json',
    publicKeyMultibase: 'z82Lm4xyCxFwD1jCh6cTuQnQ2Kp2pVUbJHUcrcZbfUr9J8nVDdztKuvG7KHcKHpCNPCRpmA',
    secretKeyMultibase: 'z2fanWaRmNUryCkenKhX4saWRdviV7W6LDkWtDupTr5TjNxrwt23UDoZyMGHbaK6rS8JFm'
} as const;

async function multikeyToPrivateKeyPem(multikey: Types.Multikey): Promise<string> {
    const keyPair = await EcdsaMultikey.from(fullMultikey);
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

async function multikeyToPublicKeyJwk(multikey: Types.Multikey): Promise<JsonWebKey> {
    const keyPair = await EcdsaMultikey.from(fullMultikey);
    return await EcdsaMultikey.toJwk({
        keyPair: keyPair,
        secretKey: false,
    });
}

async function main() {
    // const keyPair = await generateKeyPairP();
    // console.log(keyPair);
    // const [publicKey, privateKey] = keyPair;

    // Import multikey used in data-integrity to share with the same key.
    const secretKeyPem = await multikeyToPrivateKeyPem(fullMultikey);
    const unsignedCredential = makeUnsignedCredential({
        issuer: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/jwks.json",
    });
    const signed = jwt.sign({
        vc: unsignedCredential,
    }, secretKeyPem, {
        algorithm: "ES384",
        issuer: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/jwks.json",
        header: {
            alg: "ES384",
            typ: "vc+ld+json+sd-jwt",
        },
    });
    console.log(signed);

    // const jwk = await multikeyToPublicKeyJwk(fullMultikey);
    // console.log(JSON.stringify(jwk));

    const res = await fetch("https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/jwks.json");
    const jwks = await res.json();
    const publicKeyObject = createPublicKey({
        key: jwks.keys[0],
        format: "jwk",
    });
    const publicKeyPem = publicKeyObject.export({ format: "pem", type: "spki" }).toString();
    const verificationResult = jwt.verify(signed, publicKeyPem, {
        issuer: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/jwks.json",
    });
    console.log(`Verification succeeded. Payload: ${JSON.stringify(verificationResult)}`);
}

main()
