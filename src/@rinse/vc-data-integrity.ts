import jsonld from "jsonld";

/**
 * dateTimeStamp
 * 
 * {@link https://www.w3.org/TR/vc-data-integrity/#bib-xmlschema11-2}
 */
export type DateTimeStamp = string;

// Utility values
type OneOrMore<T> = T | T[]

// 1.4 Terminology 
// https://www.w3.org/TR/vc-data-integrity/#dfn-proof-options
type ProofOptions = {
    controller?: string,
    challenge?: string,
    domain?: string,
};

/**
 * 2.1 Proofs
 *
 * > When expressing a data integrity proof on an object, a proof property MUST be used.
 * > If present, its value MUST be either a single object, or an unordered set of objects,
 * > expressed using the properties below:
 *
 * {@link https://www.w3.org/TR/vc-data-integrity/#proofs}
 */
type Proof = {
    id?: string,                        // URL used in 2.1.2 Proof Chains
    type: string,
    proofPurpose: string,
    verificationMethod: string,
    created?: DateTimeStamp,
    expires?: DateTimeStamp,
    domain?: OneOrMore<string>,
    challenge?: string,                 // SHOULD be included if a domain is specified
    proofValue?: string,                // Multibase value to be utilized by verificationMethod
    previousProof?: OneOrMore<string>,  // used in 2.1.2 Proof Chains
    nonce?: string,
}

// cryptosuite

/**
 * 2.2 Proof Purposes
 * 
 * Commonly used proof purposes values.
 *
 * {@link https://www.w3.org/TR/vc-data-integrity/#proof-purposes}
 */
const ProofPurposes = {
    Authentication: "authentication",
    AssertionMethod: "assertionMethod",
    KeyAgreement: "keyAgreement",
    CapabilityDelegation: "capabilityDelegation",
    CapabilityInvocation: "capabilityInvocation",
} as const;

/**
 * 2.3 Controller Documents
 * 
 * {@link https://www.w3.org/TR/vc-data-integrity/#controller-documents}
 */
type ControllerDocument<VM extends VerificationMethod> = {
    verificationMethod?: VM[],
}

/**
 * 2.3.1 Verification Methods
 * 
 * {@link https://www.w3.org/TR/vc-data-integrity/#verification-methods}
 */
type VerificationMethod = {
    id: string,
    type: string,
    controller: string,
    expires?: DateTimeStamp,
    revoked?: DateTimeStamp,
}

/**
 * 2.3.1.2 Multikey
 *
 * {@link https://www.w3.org/TR/vc-data-integrity/#multikey}
 */
type VerificationMethodMultikey = VerificationMethod & {
    type: "Multikey",
    publicKeyMultibase?: string,
    secretKeyMultibase?: string,
}

/**
 * 2.3.1.3 JsonWebKey
 * 
 * {@link https://www.w3.org/TR/vc-data-integrity/#jsonwebkey}
 */
type VerificationMethodJsonWebKey = VerificationMethod & {
    type: "JsonWebKey",
    publicKeyJwk?: object,  // TODO
    secretKeyJwk?: object,  // TODO
}

/**
 * 2.3.2 Verification Relationships
 * 
 * > expresses the relationship between the controller and a verification method.  
 *
 * {@link https://www.w3.org/TR/vc-data-integrity/#verification-relationships}
 */
type VerificationRelationShip = {
};

// 2.3.2.1 Authentication

/**
 * 2.3.2.2 Assertion 
 *
 * {@link https://www.w3.org/TR/vc-data-integrity/#assertion}
 */
type VerificationRelationshipAssertion = {
    // > a set of one or more verification methods. Each verification method MAY be embedded or referenced.
    assertionMethod: (string | VerificationMethod)[],
}

// 2.3.2.3 Key Agreement
// 2.3.2.4 Capability Invocation
// 2.3.2.5 Capability Delegation

/**
 * 2.6 Resource Integrity
 *
 * https://www.w3.org/TR/vc-data-integrity/#resource-integrity
 */
type ResourceIntegrity = {
    id: string,
    digestMultibase: OneOrMore<string>,    // Multibase-encoded Multihash value
}

/**
 * 3.1 DataIntegrityProof
 * 
 * Cryptographic suite type called a DataIntegrityProof.
 * 
 * {@link https://www.w3.org/TR/vc-data-integrity/#dataintegrityproof}
 */
type DataIntegrityProof = Proof & {
    type: "DataIntegrityProof",
    cryptosuite: string,
    proofValue: string,
};

type ProofConfiguration = {
}

type DataIntegrityTriple = {
    transform(unsecuredDocument: jsonld.JsonLdDocument, options: ProofOptions): Promise<string>
    hash(transformedDocument: string, canonicalProofConfig: ProofConfiguration): Uint8Array
    generateProofConfiguration(options: DataIntegrityProofOptions): ProofConfiguration
    proofSerialization(hashData: Uint8Array, options: ProofOptions & { type: DataIntegrityProof["type"] }): Uint8Array
}

const EcdsaRdfc2019: DataIntegrityTriple = {
    transform(unsecuredDocument: jsonld.JsonLdDocument, options: DataIntegrityProofOptions): Promise<string> {
        if (options.type !== "DataIntegrityProof") {
            throw new Error("PROOF_TRANSFORMATION_ERROR: type MUST be DataIntegrityProof");
        }
        if (options.cryptosuite !== "ecdsa-rdfc-2019") {
            throw new Error("PROOF_TRANSFORMATION_ERROR: cryptosuite MUST be ecdsa-rdfc-2019");
        }
        return jsonld.canonize(unsecuredDocument);
    },

    hash(transformedDocument: string, canonicalProofConfig: ProofConfiguration): Uint8Array {
        throw new Error("Method not implemented.");
    },

    generateProofConfiguration(options: DataIntegrityProofOptions): ProofConfiguration {
        throw new Error("Method not implemented.");
    },

    proofSerialization(hashData: Uint8Array, options: ProofOptions & { type: "DataIntegrityProof"; }): Uint8Array {
        throw new Error("Method not implemented.");
    },
}

/**
 * 4.1 Base Encode
 */
function baseEncode(bytes: Uint8Array, targetBase: number, baseAlphabet: string): string {
    // https://www.w3.org/TR/vc-data-integrity/#example-an-implementation-of-the-general-base-encoding-algorithm-above-in-javascript
    throw new Error("Unimplemented");
}

/**
 * 4.2 Base Decode
 */
function baseDecode(sourceEncoding: Uint8Array, sourceBase: number, baseAlphabet: string): string {
    // https://www.w3.org/TR/vc-data-integrity/#example-an-implementation-of-the-general-base-decoding-algorithm-above-in-javascript 
    throw new Error("Unimplemented");
}

type AddProofOptions = ProofOptions & {
    type: string,   // cryptographic suite
    // any other properties needed by the cryptographic suite type;
    // an identifier for the verification method (verificationMethod) that can be used to verify the authenticity of the proof;
    // an dateTimeStamp string (created) containing the current date and time, accurate to at least one second, in Universal Time Code format.
}

type DataIntegrityProofOptions = ProofOptions & {
    type: DataIntegrityProof["type"],
    cryptosuite: string,                // cryptosuite identifier
}

type SecuredDataDocument<D> = D & {
    proof: OneOrMore<Proof>,
}

function transform(obj: object) {
}

/**
 * 4.3 Add Proof
 */
function addProof<D extends object, P extends AddProofOptions>(unsecuredDocument: D, options: P) {
    const transformedData = transform(unsecuredDocument);
}

/**
 * 4.7 Retrieve Verification Method
 */
function retrieveVerificationMethod() {
}


type DereferenceOptions = {
};

async function dereferenceURL(url: string, options: DereferenceOptions) {
}

function dereferenceFragment(document: string, fragment: string, docMediaType: string) {
}
