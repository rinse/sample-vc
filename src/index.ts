import jsonld from "jsonld";
import { JwkKeyExportOptions, createPrivateKey, createPublicKey, generateKeyPair } from "crypto";
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
    const issuer = "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com";
    const secretKeyPem = await multikeyToPrivateKeyPem(fullMultikey);
    const unsignedCredential = makeUnsignedCredential({
        issuer: issuer,
    });
    const signed = jwt.sign({
        vc: unsignedCredential,
    }, secretKeyPem, {
        algorithm: "ES384",
        issuer: issuer,
        header: {
            alg: "ES384",
            typ: "vc+ld+json+sd-jwt",
            kid: "key1",
        },
    });
    console.log(signed);

    // const jwk = await multikeyToPublicKeyJwk(fullMultikey);
    // console.log(JSON.stringify(jwk));

    const unverifiedJWT: jwt.Jwt | null = jwt.decode(signed, { json: true, complete: true })
    // @ts-ignore
    const payload: jwt.JwtPayload | undefined = unverifiedJWT?.payload;
    const iss = payload?.iss;
    if (iss === undefined) {
        throw new Error("The iss is missing in the JWT");
    }
    const kid = unverifiedJWT?.header?.kid;
    if (kid === undefined) {
        throw new Error("The kid is missing in the JOSE header");
    }
    const res = await fetch(`${iss}/.well-known/jwt-issuer`);
    const jwtIssuer = await res.json();
    if (jwtIssuer.issuer !== iss) {
        throw new Error(`/.well-known/jwt-ssuer#/issuer does not match to issuer. Expected: ${iss}, actual: ${jwtIssuer.issuer}`);
    }
    const jwks: any[] = jwtIssuer.jwks.keys;
    const jwk = jwks.find(jwk => jwk.kid === kid);
    const publicKeyObject = createPublicKey({
        key: jwk,
        format: "jwk",
    });
    const publicKeyPem = publicKeyObject.export({ format: "pem", type: "spki" }).toString();
    const verificationResult = jwt.verify(signed, publicKeyPem, {
        issuer: iss,
    });
    console.log(`Verification succeeded. Payload: ${JSON.stringify(verificationResult)}`);
}

main()
