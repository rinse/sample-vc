declare module "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite" {
    import { MultiKey, Verifier } from "commonTypes";
    import { canonize } from "jsonld";

    type RequiredAlgorithm = string[];

    type Cryptosuite = {
        canonize: typeof canonize,
        createVerifier(options: { verificationMethod: MultiKey }): Verifier,
        name: string,
        requiredAlgorithm: RequiredAlgorithm,
    };
    const cryptosuite: Cryptosuite;
}
