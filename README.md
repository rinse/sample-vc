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
