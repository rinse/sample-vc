declare module "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite" {
    import { Multikey, Verifier } from "commonTypes";
    import { canonize } from "jsonld";

    type RequiredAlgorithm = string[];

    type Cryptosuite = {
        canonize: typeof canonize,
        createVerifier(options: { verificationMethod: Multikey }): Verifier,
        name: string,
        requiredAlgorithm: RequiredAlgorithm,
    };
    const cryptosuite: Cryptosuite;
}
