/*
  14188 - Run-length encoding
  -------
  by Hen Hedymdeith (@alfaproxima) #hard 
  
  ### Question
  
  Given a `string` sequence of a letters f.e. `AAABCCXXXXXXY`. Return run-length encoded string `3AB2C6XY`.
  Also make a decoder for that string.
  
  > View on GitHub: https://tsch.js.org/14188
*/


/* _____________ Your Code Here _____________ */
/**
 * ParseInt<'A'> // never
 * ParseInt<'1'> // 1
 */
type ParseInt<T extends string> = T extends `${infer R extends number}`
  ? R
  : never

/**
 * FillString<'A', 0> // ''
 * FillString<'A', 1> // 'A'
 * FillString<'A', 3> // 'AAA'
 */
type FillString<T extends string, L extends number, R extends T[] = [], To extends string = ''> = R['length'] extends L
  ? To
  : FillString<T, L, [T, ...R], `${To}${T}`>
namespace RLE {
  export type Encode<
    S extends string,
    Cache extends string[] = [],
    Result extends string = ''
  > = S extends `${infer F}${infer R}`
    ? Cache extends []
      ? Encode<R, [...Cache, F], Result>
      : Cache[0] extends F
        ? Encode<R, [...Cache, F], Result>
        : Encode<R, [F], `${Result}${Cache['length'] extends 1 ? '' : Cache['length']}${Cache[0]}`>
    : `${Result}${Cache[0]}`

  export type Decode<
    S extends string,
    N extends number = never,
    Result extends string = ''
  > = S extends `${infer F}${infer R}`
    ? [ParseInt<F>] extends [never]
      ? [N] extends [never]
        ? Decode<R, never, `${Result}${F}`>
        : Decode<R, never, `${Result}${FillString<F, N>}`>
      : Decode<R, ParseInt<F>, Result>
    : Result
}

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  // Raw string -> encoded string
  Expect<Equal<RLE.Encode<'AAABCCXXXXXXY'>, '3AB2C6XY'>>,

  // Encoded string -> decoded string
  Expect<Equal<RLE.Decode<'3AB2C6XY'>, 'AAABCCXXXXXXY'>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/14188/answer
  > View solutions: https://tsch.js.org/14188/solutions
  > More Challenges: https://tsch.js.org
*/
