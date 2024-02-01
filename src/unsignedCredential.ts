import jsonld from "jsonld";

export const unsignedCredential: jsonld.JsonLdDocument = {
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        {
            "EmployeeCredential": "https://schema.example.co.jp/EmployeeCredential",
            "Employee": {
                "@id": "https://schema.example.co.jp/Employee",
                "@context": {
                    "@protected": true,
                    "id": "@id",
                    "type": "@type",
                    "email": {
                        "@id": "https://schema.org/email"
                    },
                    "affiliation": "https://schema.org/affiliation"
                }
            }
        }
    ],
    "type": ["VerifiableCredential", "EmployeeCredential"],
    "issuer": "https://example.com/issuer",
    "credentialSubject": [{
        "type": "Employee",
        "id": "did:example:employees/6921",
        "email": "subject@example.co.jp",
        "name": [{
            "@language": "ja",
            "@value": "従業員 氏名"
        }],
        "affiliation": {
            "name": "Verifiable Credential Div. Sample Dept. JavaScript Grp."
        }
    }]
}
