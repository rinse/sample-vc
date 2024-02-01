declare module "@digitalbazaar/ecdsa-multikey" {
    import { JsonWebKey } from "crypto";
    import { ECDSACurve, KeyPairInterface, MultiKey } from "commonTypes";

    function generate(option: {
        curve: ECDSACurve,
        id?: string,
        controller?: string,
        keyAgreement?: boolean,
    }): Promise<KeyPairInterface>;

    function from(
        key: MultiKey,
        option?: {
            keyAgreement?: boolean,
        },
    ): Promise<KeyPairInterface>;

    function fromJwk(options: {
        jwk:  JsonWebKey,
        secretKey?: boolean,
    }): Promise<KeyPairInterface>;

    function toJwk(options: {
        keyPair: KeyPairInterface,
        secretKey?: boolean,
    }): Promise<JsonWebKey>;

    function fromRaw(options: {
        curve: string,
        secretKey?: Uint8Array,
        publicKey: Uint8Array,
        keyAgreement?: boolean,
    }): Promise<KeyPairInterface>;
}
