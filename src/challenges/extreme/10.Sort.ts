/*
  741 - Sort
  -------
  by Sg (@suica) #extreme #infer #array
  
  ### Question
  
  In this challenge, you are required to sort natural number arrays in either ascend order or descent order.
  
  Ascend order examples:
  ```ts
  Sort<[]> // []
  Sort<[1]> // [1]
  Sort<[2, 4, 7, 6, 6, 6, 5, 8, 9]> //  [2, 4, 5, 6, 6, 6, 7, 8, 9]
  ```
  
  The `Sort` type should also accept a boolean type. When it is `true`, the sorted result should be in descent order. Some examples:
  
  ```ts
  Sort<[3, 2, 1], true> // [3, 2, 1]
  Sort<[3, 2, 0, 1, 0, 0, 0], true> // [3, 2, 1, 0, 0, 0, 0]
  ```
  
  Extra challenges:
  1. Support natural numbers with 15+ digits.
  2. Support float numbers.
  
  > View on GitHub: https://tsch.js.org/741
*/


/* _____________ Your Code Here _____________ */
type NumberToTuple<T extends number, Result extends 0[] = []> = Result['length'] extends T
  ? Result
  : NumberToTuple<T, [0, ...Result]>

type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

type GT<A extends number, B extends number> = A extends B
  ? false
  : A extends 0
    ? false
    : B extends 0
      ? true
      : GT<MinusOne<A>, MinusOne<B>>

type SingleSort<
  T extends number,
  Source extends unknown[] = [],
  Desc extends boolean = false,
  Result extends number[] = []
> = Source extends [infer F extends number, ...infer R]
  ? Equal<T, F> extends true
    ? [...Result, T, F, ...R]
    : GT<T, F> extends true
      ? Desc extends true
        ? [...Result, T, F, ...R]
        : SingleSort<T, R, Desc, [...Result, F]>
      : Desc extends true
        ? SingleSort<T, R, Desc, [...Result, F]>
        : [...Result, T, F, ...R]
  : [...Result, T]

type Sort<
  T extends unknown[],
  Desc extends boolean = false,
  Result extends number[] = []
> = T extends [infer F extends number, ...infer R]
  ? Sort<R, Desc, SingleSort<F, Result, Desc>>
  : Result


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Sort<[]>, []>>,
  Expect<Equal<Sort<[1]>, [1]>>,
  Expect<Equal<Sort<[2, 1]>, [1, 2]>>,
  Expect<Equal<Sort<[0, 0, 0]>, [0, 0, 0]>>,
  Expect<Equal<Sort<[1, 2, 3]>, [1, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 1]>, [1, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 1, 2]>, [1, 2, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 0, 1, 0, 0, 0]>, [0, 0, 0, 0, 1, 2, 3]>>,
  Expect<Equal<Sort<[2, 4, 7, 6, 6, 6, 5, 8, 9]>, [2, 4, 5, 6, 6, 6, 7, 8, 9]>>,
  Expect<Equal<Sort<[1, 1, 2, 1, 1, 1, 1, 1, 1]>, [1, 1, 1, 1, 1, 1, 1, 1, 2]>>,
  Expect<Equal<Sort<[], true>, []>>,
  Expect<Equal<Sort<[1], true>, [1]>>,
  Expect<Equal<Sort<[2, 1], true>, [2, 1]>>,
  Expect<Equal<Sort<[0, 0, 0], true>, [0, 0, 0]>>,
  Expect<Equal<Sort<[1, 2, 3], true>, [3, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 1], true>, [3, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 1, 2], true>, [3, 2, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 0, 1, 0, 0, 0], true>, [3, 2, 1, 0, 0, 0, 0]>>,
  Expect<Equal<Sort<[2, 4, 7, 6, 6, 6, 5, 8, 9], true>, [9, 8, 7, 6, 6, 6, 5, 4, 2]>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/741/answer
  > View solutions: https://tsch.js.org/741/solutions
  > More Challenges: https://tsch.js.org
*/
