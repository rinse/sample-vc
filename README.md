# Verifiable credentials

General-purpose verifiable credentials for everywhere.

## Overview

[Verifiable credential](https://www.w3.org/TR/vc-data-model-2.0/) has a quite general deta model,
so many variety of systems can use of it. There are implementations of VC but they are made for each
specific backend and not quite general:

- [AnonCreds](https://hyperledger.github.io/anoncreds-spec/) for Hyperledger Indy
- [Blockcerts](https://www.blockcerts.org/) for Ethereum

This is a general-purpose implementation of the verifiable credentials data model,
which can be used for a reference implementation or a sample VC generator.
Note that this is **not** a production-ready application.

## Credentials (日本語)

資格証明(credential)とは、ある単一の主体(entity)によって作成された、1つ以上の資格(claim)の集まりである。
その他にも資格証明は、その資格に関連する識別子(identifier)やメタ情報を含む場合がある。
例えば発行者(issuer)や有効期限、アイコン、検証のための公開鍵、資格取り消しの仕組みなどである。
またメタデータは発行者によって署名される場合がある。
検証可能な資格証明とは、改竄に耐性のある資格と、発行者を暗号的に証明するメタデータを合わせたものである。

- Verifiable Credential
    - Credential Metadata
    - Claim(s)
    - Proof(s)

## Presentation (日本語)

検証可能な提示(Verifiable presentation)は、複数の検証可能な資格証明と、任意の追加のデータをJSON-LDでエンコードしたものを表現できる。
これは保持者が資格を検証者に対して提示するときに利用される。また検証可能な資格証明をそのまま提示することも可能である。
提示に含まれる資格はしばしば単一の主体(subject)についてのものであるが、複数の発行者による場合がある。

- Verifiable Presentation
    - Presentation Metadata
    - Verifiable Credential(s)
    - Proof(s)

## JSON-LD キーワード

- `@id`
    - その構造の識別子を表す
    - 識別子の形式はURLでなければならないが、必ずしもdereferenceできる必要はない
        - なおJSON-LDでは識別子の形式はIRIと規定されているが、IRIはURLを包含する概念である (URL ⊆ URI ⊆ IRI)
        - URLは様々なスキームを含む点に注意する
            - http, ftp, file, did, etc.
    - `id`を `@id`のエイリアスとして利用できる
- `@type`
    - その構造が何を表すのかを表す
    - 型の形式は一つ以上のURLである
        - 複数のURLが与えられたとき、各URLに順序はないことに注意する
        - 言い換えれば、そのJSON配列は順序なしの集合として解釈される
    - 型にはContextによって分かりやすい名前が与えられることが望ましい
    - 識別子の形式はURLでなければならないが、必ずしもdereferenceできる必要はない
    - `type`を `@type`のエイリアスとして利用できる
    - 以下の型を想定したオブジェクトは、typeで型を指定しなければならない(MUST):
        - VC (VerifiableCredential)
        - VP (VerifiablePresentation)
        - [credentialStatus](https://www.w3.org/TR/vc-data-model-2.0/#status) (BitstringStatusListEntry)
        - [termsOfUse](https://www.w3.org/TR/vc-data-model-2.0/#terms-of-use)
        - [evidence](https://www.w3.org/TR/vc-data-model-2.0/#evidence)

