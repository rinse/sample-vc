
declare module "@digitalbazaar/data-integrity" {
    import { LinkedDataProof } from "jsonld-signatures";
    import { Cryptosuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
    import { Signer } from "commonTypes";

    class DataIntegrityProof extends LinkedDataProof {
        constructor(options: {
            signer: Signer,
            date?: Date | number,
            cryptosuite: Cryptosuite,
            legacyContext?: boolean,
        });
    }
}
