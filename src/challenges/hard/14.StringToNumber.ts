/*
  300 - String to Number
  -------
  by Pig Fang (@g-plane) #hard #template-literal
  
  ### Question
  
  Convert a string literal to a number, which behaves like `Number.parseInt`.
  
  > View on GitHub: https://tsch.js.org/300
*/


/* _____________ Your Code Here _____________ */
type NumberMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type GetResult<S extends string, Result extends number[] = []> = S extends `${infer F}${infer R}`
  ? F extends keyof NumberMap
    ? GetResult<R, [...Result, NumberMap[F] & number]>
    : never
  : Result

type NumberToTuple<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToTuple<N, [...Result, 0]>

type GetTenTimes<T extends any[] = []> = [
  ...T, ...T, ...T, ...T, ...T,
  ...T, ...T, ...T, ...T, ...T
]

type GetLength<T extends number[], Result extends unknown[] = []> = T extends [infer F extends number, ...infer R extends number[]]
  ? GetLength<R, [...GetTenTimes<Result>, ...NumberToTuple<F>]>
  : Result['length']

type ToNumber<S extends string, R extends number[] = GetResult<S>> = [R] extends [never]
  ? never
  : GetLength<R>

// type E = [
//   Expect<Equal<GetResult<'12'>, [1, 2]>>,
//   Expect<Equal<GetResult<'0'>, [0]>>,
//   Expect<Equal<GetResult<'123@abc'>, never>>
// ]

// type ToNumber<
//      S extends string> = 
//      S extends `${infer N extends number}` ? N : never  ;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ToNumber<'0'>, 0>>,
  Expect<Equal<ToNumber<'5'>, 5>>,
  Expect<Equal<ToNumber<'12'>, 12>>,
  Expect<Equal<ToNumber<'27'>, 27>>,
  Expect<Equal<ToNumber<'18@7_$%'>, never>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/300/answer
  > View solutions: https://tsch.js.org/300/solutions
  > More Challenges: https://tsch.js.org
*/
