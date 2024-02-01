import { URL } from "url";

type VerifiableCredential<Claim, Iss> = {
    "@context": URL | NonEmpty<URL>,    // First item MUST be https://www.w3.org/ns/credentials/v2.
    type: URL | NonEmpty<URL>,          // Alias for @type. Must be a URL.
    id?: URL,                           // Alias for @id. Must be a URL.
    name?: string | LanguageValue,
    description?: string | LanguageValue,
    credentialSubject: CredentialSubject<Claim> | NonEmpty<CredentialSubject<Claim>>,
    issuer: URL | Issuer<Iss>,  // It also can be a JWK or a DID
    validFrom?: string,         // MUST be a dateTimeStamp in https://www.w3.org/TR/xmlschema11-2/#dateTimeStamp
    validUntil?: string,
    credentialStatus: CredentialStatus,
};

type VerifiablePresentation<Claim, Iss> = {
    "@context": URL | NonEmpty<URL>,
    type: URL | NonEmpty<URL>,
    id?: URL,
    // Enveloped verifiable credential objects are also allowed. The objects MUST be secured.
    // https://www.w3.org/TR/vc-data-model-2.0/#enveloped-verifiable-credentials
    verifiableCredential?: VerifiableCredential<Claim, Iss> | NonEmpty<VerifiableCredential<Claim, Iss>>,
    // もしissuerとholderが同じ場合、holderの値はverifiableCredential.issuerと同じでなければならない (MUST)
    holder?: URL | Holder,
};

type EnvelopedVerifiableCredential = {
    "@context": URL | NonEmpty<URL>,    // MUST include https://www.w3.org/ns/credentials/v2.
    id: URL,                            // MUST be a data URL: https://www.rfc-editor.org/rfc/rfc2397
    type: "EnvelopedVerifiableCredential",
};

// One or more
type NonEmpty<T> = {
    head: T,
    body: [string],
};

// Predefined types.
const Types = {
    VerifiableCredential: "VerifiableCredential",
    VerifiablePresentation: "VerifiablePresentation",
    EnvelopedVerifiableCredential: "EnvelopedVerifiableCredential",
};

type LanguageValue = {
    "@value": string,                   // REQUIRED
    "@language"?: LanguageTag,          // SHOULD
    "@direction"?: LanguageDirection,   // MAY
};

type LanguageTag = string;
type LanguageDirection = "ltr" | "rtl";

type CredentialSubject<Claim> = { id?: URL } & Claim;

type Issuer<Iss> = { id: URL } & Iss;

type CredentialStatus = {
    id?: URL,   // OPTIONAL
    type: URL,  // REQUIRED
};

type Holder = {
    id: string,
}
