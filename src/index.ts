import jsonld from "jsonld";
// @ts-ignore
import jsigs from "jsonld-signatures";
// @ts-ignore
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
// @ts-ignore
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey"
// @ts-ignore
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
import { unsignedCredential } from "./unsignedCredential.js";

const { purposes: { AssertionProofPurpose } } = jsigs;

// 1. Which key type and suite to use?
// 2. What is your Private Key Storage strategy? (KMS, file system, secure wallet)
// 3. Where will you publish your Public Key? (What is your key resolving strategy)
//    This will influence what you'll use for Key IDs
// 4. What is your Controller document strategy? (DID, embedded, web, ...)

// Illustrates how to generate a key pair
async function generateKeyPair() {
    // parameters
    const controller = "https://example.com/issuer";    // matches to the issuer
    const keyId = `${controller}#key-1`

    // generates
    const keyPair = EcdsaMultikey.generate({
        // curve: "P-256" | "P-384" | "P-521"
        curve: "P-384",
        id: keyId,
        controller,
    });

    // {
    //   '@context': 'https://w3id.org/security/multikey/v1',
    //   id: 'https://example.com/issuer#key-1',
    //   type: 'Multikey',
    //   controller: 'https://example.com/issuer',
    //   publicKeyMultibase: 'z82LkzRb12sc6sKUPn7B1FYLMiXY67HBF8EJJYJpiMAtt6hMscxRKUiviC9u9MX6tNsNTen'
    //   zで始まっているのでbase-58-btc
    // }
    const publicKey = await keyPair.export({ publicKey: true });
    console.log(publicKey);

    // {
    //   '@context': 'https://w3id.org/security/multikey/v1',
    //   id: 'https://example.com/issuer#key-1',
    //   type: 'Multikey',
    //   controller: 'https://example.com/issuer',
    //   publicKeyMultibase: 'z82LkzRb12sc6sKUPn7B1FYLMiXY67HBF8EJJYJpiMAtt6hMscxRKUiviC9u9MX6tNsNTen',
    //   secretKeyMultibase: 'z2faqFHcxyq5SJXXd5epLzozTrDFrFiWRCzN6BKQorjzrwa4RdqCWrD5UtsPzvvkbcxMnn'
    // }
    const fullKeyPair = await keyPair.export({ publicKey: true, secretKey: true });
    console.log(fullKeyPair);
    return keyPair;
}

async function importKeyPair(exportedKeyPair: object) {
    return EcdsaMultikey.from(exportedKeyPair);
}

async function sign(data: Uint8Array, keyPair: any): Promise<Uint8Array> {
    const { sign } = keyPair.signer();
    return sign({ data });
}

async function verify(data: Uint8Array, publicKey: any, signature: Uint8Array): Promise<boolean> {
    const { verify } = publicKey.verifier();
    return await verify({ data, signature });
}

async function signAndVerify() {
    const testData = (new TextEncoder()).encode("Test data");
    // Signing data
    const FULL_KEY_PAIR = {
        '@context': 'https://w3id.org/security/multikey/v1',
        id: 'https://example.com/issuer#key-1',
        type: 'Multikey',
        controller: 'https://example.com/issuer',
        publicKeyMultibase: 'z82LkzRb12sc6sKUPn7B1FYLMiXY67HBF8EJJYJpiMAtt6hMscxRKUiviC9u9MX6tNsNTen',
        secretKeyMultibase: 'z2faqFHcxyq5SJXXd5epLzozTrDFrFiWRCzN6BKQorjzrwa4RdqCWrD5UtsPzvvkbcxMnn'
    };
    const fullKeyPair = await EcdsaMultikey.from(FULL_KEY_PAIR);
    const signature: Uint8Array = await sign(testData, fullKeyPair);
    // Verifying data
    const PUBLIC_KEY = {
        '@context': 'https://w3id.org/security/multikey/v1',
        id: 'https://example.com/issuer#key-1',
        type: 'Multikey',
        controller: 'https://example.com/issuer',
        publicKeyMultibase: 'z82LkzRb12sc6sKUPn7B1FYLMiXY67HBF8EJJYJpiMAtt6hMscxRKUiviC9u9MX6tNsNTen',
    };
    const publicKey = await EcdsaMultikey.from(PUBLIC_KEY);
    const varidity = await verify(testData, publicKey, signature);
    console.log("varidity", varidity);
}

async function main() {
    const FULL_KEY_PAIR = {
        '@context': 'https://w3id.org/security/multikey/v1',
        id: 'https://keyids.com/keyids#key-1',
        type: 'Multikey',
        controller: 'https://controller.com/controller',
        publicKeyMultibase: 'z82LkzRb12sc6sKUPn7B1FYLMiXY67HBF8EJJYJpiMAtt6hMscxRKUiviC9u9MX6tNsNTen',
        secretKeyMultibase: 'z2faqFHcxyq5SJXXd5epLzozTrDFrFiWRCzN6BKQorjzrwa4RdqCWrD5UtsPzvvkbcxMnn'
    };
    const fullKeyPair = await EcdsaMultikey.from(FULL_KEY_PAIR);
    const signer = fullKeyPair.signer();
    const suite = new DataIntegrityProof({
        signer,
        cryptosuite: ecdsaRdfc2019Cryptosuite,
    });
    const signedCredential = await jsigs.sign(unsignedCredential, {
        suite,
        purpose: new AssertionProofPurpose(),
        // @ts-ignore
        documentLoader: jsonld.documentLoader,
    });
    console.log(JSON.stringify(signedCredential));
}

main();
