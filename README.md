# Verifiable Credentials

[Verifiable Credential](https://www.w3.org/TR/vc-data-model-2.0/) の発行と検証を試すプロジェクト。

## 詳細

- [Securing Mechanisms](https://www.w3.org/TR/vc-data-model-2.0/#securing-mechanisms) : [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity)
    - embedded proof
- [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) . [proof type](https://www.w3.org/TR/vc-data-integrity/#dfn-proof-type) : [data integrity proof](https://www.w3.org/TR/vc-data-integrity/#dfn-data-integrity-proof)
- [Verification method](https://www.w3.org/TR/vc-data-integrity/#dfn-verification-method): [Multikey](https://www.w3.org/TR/vc-data-integrity/#multikey)
- [data integrity proof](https://www.w3.org/TR/vc-data-integrity/#dfn-data-integrity-proof) . [cryptographic suite](https://www.w3.org/TR/vc-data-integrity/#dfn-cryptosuite) : [ecdsa-rdfc-2019](https://www.w3.org/TR/vc-di-ecdsa/#ecdsa-rdfc-2019)

## 注意するべき点

特に VC において注意するべき点を挙げる。

1. [Controller document](https://www.w3.org/TR/vc-data-integrity/#controller-documents) は内容によって複数の種類の事柄を表す
    * W3C文書中でも内容が整理されておらず、今後 did-core や vc-jose-cose の内容と統廃合される可能性がある
        * https://www.w3.org/TR/vc-data-integrity/#:~:text=Potential%20for%20stand-alone%20Controller%20Document%20specification 
    * [Verification Method](https://www.w3.org/TR/vc-data-integrity/#verification-methods)
        * 主に[Verification Material](https://www.w3.org/TR/vc-data-integrity/#verification-material)を表す
        * [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) では以下の2つが定義されている
            1. [Multikey](https://www.w3.org/TR/vc-data-integrity/#multikey)
            1. [JsonWebKey](https://www.w3.org/TR/vc-data-integrity/#jsonwebkey)
    * [Verifiable Relationship](https://www.w3.org/TR/vc-data-integrity/#verification-relationships)
        * Controller と verification method の間の関係を表す
        * [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) では以下の5つが定義されている
            * Authentication, Assertion, Key Aggreement, Capability Invocation, Capability Delegation
        * VC で利用するのは主に [Assertion](https://www.w3.org/TR/vc-data-integrity/#assertion)
            * これは特定の Verification method が VC の検証に使われることを表す
2. VC の [Issuer](https://www.w3.org/TR/vc-data-model-2.0/#defn-issuer) は解決すると [controller document](https://www.w3.org/TR/vc-data-integrity/#controller-documents) になるとよい (RECOMMENDED)
    * [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) の [Relationship to Verifiable Credentials](https://www.w3.org/TR/vc-data-integrity/#relationship-to-verifiable-credentials) には以下の記載があるため、Verifiable relationship に解決されるURLが良さそう。
        > to ensure that the value of the controller property of a proof's verification method matches the URL value used to identify the issuer
3. [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) の [proof.verificationMethod](https://www.w3.org/TR/vc-data-integrity/#:~:text=verificationMethod,-The%20means%20and%20information%20needed%20to%20verify%20the%20proof) プロパティ は、解決すると [verification method](https://www.w3.org/TR/vc-data-integrity/#ref-for-dfn-verification-method-5) になる
    * [Verification method](https://www.w3.org/TR/vc-data-integrity/#ref-for-dfn-verification-method-5) は有効な [controller document](https://www.w3.org/TR/vc-data-integrity/#controller-documents) でなければならない
    * https://www.w3.org/TR/vc-data-integrity/#retrieve-verification-method
4. [Verification method](https://www.w3.org/TR/vc-data-integrity/#dfn-verificationmethod) の [controller](https://www.w3.org/TR/vc-data-integrity/#defn-controller) プロパティは、解決すると [verification relationship](https://www.w3.org/TR/vc-data-integrity/#verification-relationships) になる
    * [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity) の [Relationship to Verifiable Credentials](https://www.w3.org/TR/vc-data-integrity/#relationship-to-verifiable-credentials) には以下の記載があるため、この値は VC の [Issuer](https://www.w3.org/TR/vc-data-model-2.0/#defn-issuer) プロパティと一致すると良い（はず）。
        > to ensure that the value of the controller property of a proof's verification method matches the URL value used to identify the issuer

## 関連規格

- [VC Data Model](https://www.w3.org/TR/vc-data-model-2.0/)
- [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity)
- [VC Specification Dirirectory - Securing Mechanisms](https://w3c.github.io/vc-specs-dir/#securing-mechanisms)
- [VC Data Integrity ECDSA Cryptosuites v1.0](https://www.w3.org/TR/vc-di-ecdsa/)
