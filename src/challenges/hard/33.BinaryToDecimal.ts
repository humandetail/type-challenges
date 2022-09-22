/*
  6141 - Binary to Decimal
  -------
  by wotsushi (@wotsushi) #hard #math
  
  ### Question
  
  Implement `BinaryToDecimal<S>` which takes an exact string type `S` consisting 0 and 1 and returns an exact number type corresponding with `S` when `S` is regarded as a binary.
  You can assume that the length of `S` is equal to or less than 8 and `S` is not empty.
  
  ```ts
  type Res1 = BinaryToDecimal<'10'>; // expected to be 2
  type Res2 = BinaryToDecimal<'0011'>; // expected to be 3
  ```
  
  > View on GitHub: https://tsch.js.org/6141
*/


/* _____________ Your Code Here _____________ */
type NumberToArray<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToArray<N, [...Result, 0]>

type GetTwice<T extends unknown[]> = [
  ...T, ...T
]

type BinaryToDecimal<S extends string, Result extends unknown[] = []> = S extends `${infer F extends number}${infer R}`
  ? BinaryToDecimal<R, [...GetTwice<Result>, ...NumberToArray<F>]>
  : Result['length']


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<BinaryToDecimal<'10'>, 2>>,
  Expect<Equal<BinaryToDecimal<'0011'>, 3>>,
  Expect<Equal<BinaryToDecimal<'00000000'>, 0>>,
  Expect<Equal<BinaryToDecimal<'11111111'>, 255>>,
  Expect<Equal<BinaryToDecimal<'10101010'>, 170>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/6141/answer
  > View solutions: https://tsch.js.org/6141/solutions
  > More Challenges: https://tsch.js.org
*/
