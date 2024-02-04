import jsonld from "jsonld";
import jsigs, { VerificationResult } from "jsonld-signatures";
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey"
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
import { unsignedCredential } from "./unsignedCredential.js";
import *  as Types from "./@types/commonTypes.js"

// Type declarations not having documentLoader for some reason.
// declare module "jsonld" {
//     export function documentLoader(url: URL, options: {}): any;
// }

// 1. Which key type and suite to use?
// 2. What is your Private Key Storage strategy? (KMS, file system, secure wallet)
// 3. Where will you publish your Public Key? (What is your key resolving strategy)
//    This will influence what you'll use for Key IDs
// 4. What is your Controller document strategy? (DID, embedded, web, ...)

// Sign data with KeyPairInterface
async function sign(data: Uint8Array, keyPair: Types.KeyPairInterface): Promise<Uint8Array> {
    const { sign } = keyPair.signer();
    return sign({ data });
}

// Verify signature with KeyPairInterface
async function verify(data: Uint8Array, publicKey: Types.KeyPairInterface, signature: Uint8Array): Promise<boolean> {
    const { verify } = publicKey.verifier();
    return await verify({ data, signature });
}

// A document loader compatible with jsonld and jsonld-signatures.
async function documentLoader(url: string): Promise<object> {
    const res = await fetch(url);
    let document;
    try {
        document = await res.json();
    } catch (e) {
        throw new Error(`URL ${url} must be resolved to a json object. Result: ${document}.`)
    }
    if (typeof document !== "object") {
        throw new Error(`URL ${url} must be resolved to a document. Result: ${document}.`);
    }
    return {
        contextUrl: null,
        documentUrl: url,
        document: document,
    };
}

// Sign an unsecured document with the given key.
async function signCredential(unsecuredDocument: jsonld.JsonLdDocument, fullKeyPair: Types.KeyPairInterface): Promise<jsonld.JsonLdDocument> {
    const cryptographicSuite = new DataIntegrityProof({
        signer: fullKeyPair.signer(),
        cryptosuite: ecdsaRdfc2019Cryptosuite,
    });
    return await jsigs.sign(unsecuredDocument, {
        suite: cryptographicSuite,
        purpose: new jsigs.purposes.AssertionProofPurpose(),
        documentLoader: documentLoader,
    });
}

// Verify an verifiable credential.
async function verifyCredential(verifiableCredential: jsonld.JsonLdDocument): Promise<VerificationResult> {
    return await jsigs.verify(verifiableCredential, {
        suite: new DataIntegrityProof({
            cryptosuite: ecdsaRdfc2019Cryptosuite,
        }),
        purpose: new jsigs.purposes.AssertionProofPurpose(),
        documentLoader: documentLoader,
    });
}

async function main() {
    // Generates an ECDSA key pair in the multikey format.
    // const fullKeyPair = await EcdsaMultikey.generate({
    //     curve: "P-384",
    //     id: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationMethod.json",
    //     controller:  "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json",
    // });
    // console.log(await fullKeyPair.export({publicKey: true, secretKey: true}));

    const fullMultikey: Types.Multikey = {
        '@context': 'https://w3id.org/security/multikey/v1',
        id: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationMethod.json',
        type: 'Multikey',
        controller: 'https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json',
        publicKeyMultibase: 'z82Lm4xyCxFwD1jCh6cTuQnQ2Kp2pVUbJHUcrcZbfUr9J8nVDdztKuvG7KHcKHpCNPCRpmA',
        secretKeyMultibase: 'z2fanWaRmNUryCkenKhX4saWRdviV7W6LDkWtDupTr5TjNxrwt23UDoZyMGHbaK6rS8JFm'
    } as const;

    // Instantiate a convenient interface with multikey
    const fullKeyPair: Types.KeyPairInterface = await EcdsaMultikey.from(fullMultikey);

    const signedCredential = await signCredential(unsignedCredential, fullKeyPair);
    console.log("\n=== Signing credential ===\n");
    console.log(JSON.stringify(signedCredential));

    console.log("\n=== verifyCredential ===\n");
    const verificationResult = await verifyCredential(signedCredential);
    console.log(JSON.stringify(verificationResult));
}

main();
