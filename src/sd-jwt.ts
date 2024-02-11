import { createHash, randomBytes, Hash, BinaryLike } from "crypto";
import jwt from "jsonwebtoken";
import base64url from "base64url";
import { pemSecretKey } from "./keyPair.js";

/**
 * Available hash algorithm for disclosures.
 */
export type SDHashAlg = "sha-256" | "sha-512";

/**
 * Properties for SD-JWT.
 */
export type SDProps = {
    _sd_alg?: SDHashAlg,
    _sd?: string[],
};

/**
 * Options for {@link propertySD}.
 */
export type DisclosureOpions = {
    hashAlg?: SDHashAlg,     // Default: sha-256
    bytesOfSalt?: number,  // Default: 16
}

/**
 * 5.2.4.2. Array Elements
 */
export type SDArrayElemDigest = { "...": string };

/**
 * An payload of a JWT with some selectively disclosable claims.
 */
export class SDObject<T> {
    private readonly _payload: SDProps & T;
    private readonly _disclosures: string[];

    constructor(payload: SDProps & T, disclosures: string[]) {
        this._payload = payload;
        this._disclosures = disclosures;
    }

    get payload(): SDProps & T {
        return this._payload;
    }

    get disclosures(): string[] {
        return this._disclosures;
    }

    static pure<T>(object: T): SDObject<T> {
        return new SDObject<T>({ ...object, _sd: [] }, []);
    }

    map<U>(f: (t: T & SDProps) => U): SDObject<U> {
        const { _sd_alg, _sd } = this._payload;
        return new SDObject<U>({ ...f(this._payload), _sd_alg, _sd }, this._disclosures);
    }

    flatMap<U>(f: (t: T & SDProps) => SDObject<U>): SDObject<U> {
        const { _sd_alg: pSdAlg, _sd: pSd } = this._payload;
        const newSdObj = f(this._payload);
        const { _sd_alg: nSdAlg, _sd: nSd } = newSdObj._payload;
        if ((pSdAlg ?? "sha-256") !== (nSdAlg ?? "sha-256")) {
            throw new Error("Inconsistent hashing algorithms.");
        }
        return new SDObject(
            { ...newSdObj._payload, _sd: [...pSd ?? [], ...nSd ?? []] },
            [...this._disclosures, ...newSdObj._disclosures]
        );
    }

    /**
     * Make specific claims selectively disclosable.
     */
    property<K extends keyof T & string>(claimNames: K[], options: DisclosureOpions = {}): SDObject<Omit<T, K>> {
        const { payload, disclosures } = this;
        const { hashAlg, bytesOfSalt } = resolveSDOptions(this.payload, options);
        const sdClaims = claimNames.map(claimName => {
            const salt = base64url(randomBytes(bytesOfSalt));
            const claimValue: T[K] = payload[claimName];
            return disclosureForObjectProps(salt, claimName, claimValue);
        }).map(disclosure => {
            const disclosureDigest = hash(disclosure, hashAlg);
            return [disclosureDigest, disclosure] as const;
        });
        const disclosureDigests = sdClaims.map(a => a[0]);
        const newPayload = { ...payload, _sd: [...(payload._sd ?? []), ...disclosureDigests], _sd_alg: hashAlg };
        for (const disclosureClaim of claimNames) {
            delete newPayload[disclosureClaim];
        }
        const newDisclosures = [...disclosures, ...sdClaims.map(a => a[1])];
        return new SDObject<Omit<T, K>>(newPayload, newDisclosures);
    }

    /**
     * Make a specific element selectively disclosable.
     * TODO: Remove @ts-ignore's
     */
    array<K extends keyof ArrayProps<T>>(
        claimName: K,
        indices: number[] = [],
        options: DisclosureOpions = {},
    ): SDObject<Omit<T, K> & SDArray<T, K>> {
        const { disclosures, payload } = this;
        const { hashAlg, bytesOfSalt } = resolveSDOptions(payload, options);
        const claimValueArray: (SDProps & T)[K] = payload[claimName];
        // @ts-ignore
        const [newDisclosures, newArray] = claimValueArray.reduce<[string[], unknown[]]>(([disclosures, accArray], e, index) => {
            if (indices.includes(index)) {
                const salt = base64url(randomBytes(bytesOfSalt));
                const disclosure = disclosureForArrayElement(salt, e);
                const disclosureDigest = hash(disclosure, hashAlg);
                const array = [...accArray, arrayElementDigest(disclosureDigest)] as const;
                return [[...disclosures, disclosure], array] as const;
            }
            return [disclosures, [...accArray, e]] as const;
        }, [[], []]);
        const b = { [claimName]: newArray } as const;
        const newPayload = { ...payload, ...b, _sd_alg: hashAlg } as const;
        // @ts-ignore
        return new SDObject<Omit<T, K> & SDArray<T, K>>(newPayload, [...disclosures, ...newDisclosures]);
    }

    /**
     * Make claims in a specific claim selectively disclosable.
     * 
     * claimName のプロパティの値を`f`を適用した結果で置き換える
     */
    nested<K extends keyof T, U>(
        claimName: K,
        _: EnableIf<Not<IsUnion<K>>>,
        f: (claimValue: T[K]) => SDObject<U>,
    ): SDObject<Omit<T, K> & { [k in K]: U }> {
        const { disclosures, payload } = this;
        const claimValue = payload[claimName];
        const { disclosures: newDisclosures, payload: newClaimValue } = f(claimValue);
        const newPayload = {
            ...payload,
            [claimName]: newClaimValue,
        };
        // @ts-ignore
        return new SDObject(newPayload, [...disclosures, ...newDisclosures]);
    }
}

// Fetch the last element of a union type
type LastOfUnion<U> = (
  (U extends any ? (k: U[]) => void : never) extends (k: infer I1) => void
    ? I1
    : never
) extends (infer I2)[]
  ? I2
  : never;

// Returns true if the given type is never.
type IsNever<T> = T[] extends never[] ? true : false;

// Returns true if the given type is a union type.
type IsUnion<T> = IsNever<Exclude<T, LastOfUnion<T>>> extends true
  ? false
  : true;

// Type level logical not
type Not<T extends boolean> = T extends true ? false : true;

// Enable T if B is true or an error.
type EnableIf<B extends boolean, T = void, Err extends string = never> = B extends true ? T : Err;

// A stub value for a placeholder of EnableIf
export const enableIf: undefined = undefined;

// Extract properties whose type is an array.
type ArrayProps<T> = {
    [
        P in {  // keyof T に対してフィルターをかけている
                // (keyof T).filter(k => T[k] extends Array<infer _>)
            [k in keyof T]: T[k] extends Array<infer _>
                ? k
                : never
        }[keyof T]
    ]: T[P]
}

// Extract a type of element of an array.
type ArrayElem<T> = T extends Array<infer U> ? U : never;

// Selectively disclosable array
// Kで指定された配列の要素の型を E | SDArrayElementDigest にする
type SDArray<T, K extends keyof ArrayProps<T>> = {
  [k in K]: T[k] extends Array<infer E>
    ? (E | SDArrayElemDigest)[]
    : never;
}

// Fill options with the given payload, options, or default values and verifies consistency.
function resolveSDOptions(payload?: SDProps, options?: DisclosureOpions): Required<DisclosureOpions> {
    const payloadHashAlg = payload?._sd_alg;
    const optionHashAlg = options?.hashAlg;
    const hashAlg: SDHashAlg = payloadHashAlg ?? optionHashAlg ?? "sha-256"; // 5.1.1. Hash Function Claim
    if (payloadHashAlg !== undefined && optionHashAlg !== undefined && payloadHashAlg !== optionHashAlg) {
        throw new Error(`Inconsistent hash algorithms. It is ${payload?._sd_alg} in the given payload but ${options?.hashAlg} is specified by the option.`)
    }
    const bytesOfSalt: number = validateSizeOfSalt(options?.bytesOfSalt ?? 16);
    return { hashAlg: hashAlg, bytesOfSalt: bytesOfSalt };
}


// Hash data with the given algorithm and returns a base64-url-safe encoded string of the digest.
function hash(data: BinaryLike, hashAlg: SDHashAlg): string {
    const hash: Hash = createHash(mapHashAlgs(hashAlg));    // Note that you can't reuse the Hash instance.
    return hash.update(data).digest("base64url");
}

// 5.2.1. Disclosures for Object Properties 
function disclosureForObjectProps(salt: string, claimName: string, claimValue: any): string {
    const array = [salt, claimName, claimValue];
    const jsonEncodedArray = JSON.stringify(array);
    return base64url.encode(jsonEncodedArray);
}

// 5.2.2. Disclosures for Array Elements
function disclosureForArrayElement(salt: string, element: any): string {
    const array = [salt, element];
    const jsonEncodedArray = JSON.stringify(array);
    return base64url.encode(jsonEncodedArray);
}

// 5.2.4.2. Array Elements 
function arrayElementDigest(digest: string): SDArrayElemDigest {
    return { "...": digest };
}

// 11.4. Minimum length of the salt
function validateSizeOfSalt(bytesSalt: number): number {
    if (bytesSalt < 16) {
        throw new Error("Salt MUST be 16 bytes at minimum.");
    }
    return bytesSalt;
}

// Maps a name of a hash algorithm in SD-JWT to the one in crypto.
function mapHashAlgs(hashAlg: SDHashAlg): string {
    switch (hashAlg) {
        case "sha-256": return "sha256";
        case "sha-512": return "sha512";
    }
}

export async function main() {
    const person = {
        id: 12,
        name: "John Doe",
        affiliation: {
            id: 3,
            name: "ABC Inc.",
            location: {
                address: "Tokyo, Japan",
                zipcode: "134-123"
            },
        },
        "nationalities": ["DE", "FR"],
        "phoneNumbers": [8012345678, 9087654321],
    };

    const sdObject = SDObject.pure(person)
        .property(["name"])
        .array("nationalities", [1])
        .array("phoneNumbers", [0])
        // .array("nationalities" as "nationalities" | "phoneNumbers" )
        .nested("affiliation", enableIf, affiliation =>
            SDObject.pure(affiliation)
                .property(["name"])
                .nested("location", enableIf, location =>
                    SDObject.pure(location).property(["address"])
                )
        )
        ;
    const jwtPayload: {
        id: number,
        affiliation: {
            id: number,
            location: {
                zipcode: string,
                _sd?: string[],
                _sd_alg?: SDHashAlg,
            },
            _sd?: string[],
            _sd_alg?: SDHashAlg,
        },
        nationalities: (string | SDArrayElemDigest)[],
        phoneNumbers: (number | SDArrayElemDigest)[],
        _sd?: string[],
        _sd_alg?: SDHashAlg,
    } = sdObject.payload;
    const { disclosures } = sdObject;
    console.log("Payload: " + JSON.stringify(jwtPayload, null, 2));
    console.log("Disclosures: " + JSON.stringify(disclosures));

    // Wrap the payload in a JWT.
    // const issuer = "https://sample-public-keys.s3.ap-northeast-1.amazonaws.com";
    // const jwtString = jwt.sign(jwtPayload, await pemSecretKey, {
    //     algorithm: "ES384",
    //     issuer: issuer,
    //     header: {
    //         alg: "ES384",
    //         typ: "vc+ld+json+sd-jwt",
    //         kid: "key1",
    //     },
    // });
    // const sdJwtString = [jwtString, ...disclosures, ""].join("~");
    // console.log(sdJwtString);
}
