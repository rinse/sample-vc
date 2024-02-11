import jsonld from "jsonld";
import { createPublicKey } from "crypto";
import jwt from "jsonwebtoken";
import { makeUnsignedCredential } from "./unsignedCredential.js";
import { pemSecretKey } from "./keyPair.js";

type SignOptions = {
    issuer: string,
    pemSecretKey: string,
};

async function signCredential(unsecuredDocument: jsonld.JsonLdDocument, options: SignOptions): Promise<string> {
    return jwt.sign({
        vc: unsecuredDocument,
    }, options.pemSecretKey, {
        algorithm: "ES384",
        issuer: options.issuer,
        header: {
            alg: "ES384",
            typ: "vc+ld+json+sd-jwt",
            kid: "key1",
        },
    });
}

async function verifyCredential(verifiableCredential: string): Promise<jwt.JwtPayload> {
    const unverifiedJWT: jwt.Jwt | null = jwt.decode(verifiableCredential, { json: true, complete: true })
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
    // Fetch a public key
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
    // @ts-ignore
    const verificationResult: jwt.JwtPayload = jwt.verify(verifiableCredential, publicKeyPem, {
        issuer: iss,    // Make sure the issuer field matches to iss on the JOSE header.
    });
    return verificationResult;
}

export async function main() {
    const issuer = "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com";
    const unsignedCredential = makeUnsignedCredential({ issuer });
    const signedCredential = await signCredential(unsignedCredential, {
        issuer,
        pemSecretKey: await pemSecretKey,
    });
    console.log("\n=== Signing credential ===\n");
    console.log(JSON.stringify(signedCredential));

    console.log("\n=== verifyCredential ===\n");
    const verifiedPayload = await verifyCredential(signedCredential);
    console.log(`Verification succeeded. Payload: ${JSON.stringify(verifiedPayload)}`);
}
