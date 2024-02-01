declare module "jsonld-signatures" {
    import jsonld from "jsonld";
    import { Signer, Verifier } from "commonTypes";

    class ProofPurpose {}
    class ControllerProofPurpose extends ProofPurpose {}
    class AssertionProofPurpose extends ControllerProofPurpose {}
    class AuthenticationProofPurpose extends ControllerProofPurpose {}

    function sign(document: jsonld.JsonLdDocument, option: {
        suite: LinkedDataSignature,
        purpose: ProofPurpose,
        documentLoader(url: URL, options: {}): any,
    }): Signer;

    function verify(document: jsonld.JsonLdDocument, option: {
        suite: LinkedDataSignature,
        purpose: ProofPurpose,
        documentLoader(url: URL, optoins: {}): any,
    }): Verifier;

    class LinkedDataProof {}
    class LinkedDataSignature extends LinkedDataProof {}

    type Suite = {
        LinkedDataProof: typeof LinkedDataProof,
        LinkedDataSignature: typeof LinkedDataSignature,
    };
    const suite: Suite;

    type Purpose = {
        AssertionProofPurpose: typeof AssertionProofPurpose,
        AuthenticationProofPurpose: typeof AuthenticationProofPurpose,
        ControllerProofPurpose: typeof ControllerProofPurpose,
        ProofPurpose: typeof ProofPurpose,
    };
    const purposes: Purpose;
}
