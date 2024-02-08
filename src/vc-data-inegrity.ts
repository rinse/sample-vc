import jsonld from "jsonld";
import jsigs, { VerificationResult } from "jsonld-signatures";
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey"
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
import { makeUnsignedCredential } from "./unsignedCredential.js";
import * as Types from "./@types/commonTypes.js"
import { fullMultikey } from "./keyPair.js";

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

export async function main() {
    // Instantiate a convenient interface with multikey
    const fullKeyPair: Types.KeyPairInterface = await EcdsaMultikey.from(fullMultikey);

    const unsignedCredential = makeUnsignedCredential({
        issuer: "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com/verificationRelationship.json"
    });
    const signedCredential = await signCredential(unsignedCredential, fullKeyPair);
    console.log("\n=== Signing credential ===\n");
    console.log(JSON.stringify(signedCredential));

    console.log("\n=== verifyCredential ===\n");
    const verificationResult = await verifyCredential(signedCredential);
    console.log(JSON.stringify(verificationResult));
}
