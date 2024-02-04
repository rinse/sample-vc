declare module "jsonld-signatures" {
    import jsonld from "jsonld";
    import { DocumentLoader } from "commonTypes";

    class ProofPurpose {}
    class ControllerProofPurpose extends ProofPurpose {}
    class AssertionProofPurpose extends ControllerProofPurpose {}
    class AuthenticationProofPurpose extends ControllerProofPurpose {}

    function sign(document: jsonld.JsonLdDocument, option: {
        suite: LinkedDataSignature,
        purpose: ProofPurpose,
        documentLoader: DocumentLoader,
    }): jsonld.JsonLdDocument;

    type VerificationResult = {
        verified: boolean,
        results: Array,
        error: Error,
    };

    function verify(document: jsonld.JsonLdDocument, option: {
        suite: LinkedDataSignature,
        purpose: ProofPurpose,
        documentLoader: DocumentLoader,
    }): Promise<VerificationResult>;

    class LinkedDataProof {}
    class LinkedDataSignature extends LinkedDataProof {}

    type Suite = {
        LinkedDataProof: typeof LinkedDataProof,
        LinkedDataSignature: typeof LinkedDataSignature,
    };
    const suites: Suite;

    type Purpose = {
        AssertionProofPurpose: typeof AssertionProofPurpose,
        AuthenticationProofPurpose: typeof AuthenticationProofPurpose,
        ControllerProofPurpose: typeof ControllerProofPurpose,
        ProofPurpose: typeof ProofPurpose,
    };
    const purposes: Purpose;
}
