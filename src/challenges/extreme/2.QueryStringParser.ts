/*
  151 - Query String Parser
  -------
  by Pig Fang (@g-plane) #extreme #template-literal
  
  ### Question
  
  You're required to implement a type-level parser to parse URL query string into a object literal type.
  
  Some detailed requirements:
  
  - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
  - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
  - When a key has only one value, that value can't be wrapped into a tuple type.
  - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.
  
  > View on GitHub: https://tsch.js.org/151
*/


// /* _____________ Your Code Here _____________ */
// type Format<T extends string> = T extends `${infer F}=${infer R}`
//   ? { [K in F]: R }
//   : { [K in T]: true }

// type SplitString<T extends string> = T extends `${infer F}&${infer R}`
//   ? [Format<F>, ...SplitString<R>]
//   : [Format<T>]

// type Merge<T extends Record<string, unknown>[], Result extends Record<string, unknown> = {}> = T extends [infer F extends Record<string, unknown>, ...infer R extends Record<string, unknown>[]]
//   ? Merge<R, {
//     [K in keyof Result | keyof F]: K extends keyof Result
//       ? K extends keyof F
//         ? Result[K] extends F[K]
//           ? F[K]
//           : [Result[K], F[K]]
//         : Result[K]
//       : K extends keyof F
//         ? F[K]
//         : never
//   }>
//   : Result

// type ParseQueryString<T extends string> = T extends '' ? {} :  Merge<SplitString<T>>


// /* _____________ Test Cases _____________ */
// import type { Equal, Expect } from '@type-challenges/utils'

// type cases = [
//   Expect<Equal<ParseQueryString<''>, {}>>,
//   Expect<Equal<ParseQueryString<'k1'>, { k1: true }>>,
//   Expect<Equal<ParseQueryString<'k1&k1'>, { k1: true }>>,
//   Expect<Equal<ParseQueryString<'k1&k2'>, { k1: true; k2: true }>>,
//   Expect<Equal<ParseQueryString<'k1=v1'>, { k1: 'v1' }>>,
//   Expect<Equal<ParseQueryString<'k1=v1&k1=v2'>, { k1: ['v1', 'v2'] }>>,
//   Expect<Equal<ParseQueryString<'k1=v1&k2=v2'>, { k1: 'v1'; k2: 'v2' }>>,
//   Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2'>, { k1: ['v1', 'v2']; k2: 'v2' }>>,
//   Expect<Equal<ParseQueryString<'k1=v1&k2'>, { k1: 'v1'; k2: true }>>,
//   Expect<Equal<ParseQueryString<'k1=v1&k1=v1'>, { k1: 'v1' }>>,
// ]



// /* _____________ Further Steps _____________ */
// /*
//   > Share your solutions: https://tsch.js.org/151/answer
//   > View solutions: https://tsch.js.org/151/solutions
//   > More Challenges: https://tsch.js.org
// */

/* _____________ Your Code Here _____________ */
type Format<T extends string> = T extends `${infer F}=${infer R}`
  ? { [K in F]: R }
  : { [K in T]: true }

type SplitString<T extends string> = T extends `${infer F}&${infer R}`
  ? [Format<F>, ...SplitString<R>]
  : [Format<T>]

type Includes<T, D> = T extends [infer F, infer R]
  ? Equal<F, D> extends true
    ? true
    : Includes<R, D>
  : false

type MergeValue<T, D extends string> = T extends string[]
  ? Includes<T, D> extends true
    ? T
    : [...T, D]
      : [T, D]

type Merge<T extends Record<string, unknown>[], Result extends Record<string, unknown> = {}> = T extends [infer F extends Record<string, unknown>, ...infer R extends Record<string, unknown>[]]
  ? Merge<R, {
    [K in keyof Result | keyof F]: K extends keyof Result
      ? K extends keyof F
        ? Result[K] extends F[K]
          ? F[K]
          : MergeValue<Result[K], F[K] & string>
        : Result[K]
      : K extends keyof F
        ? F[K]
        : never
  }>
  : Result

type ParseQueryString<T extends string> = T extends '' ? {} :  Merge<SplitString<T>>


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ParseQueryString<''>, {}>>,
  Expect<Equal<ParseQueryString<'k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k2'>, { k1: true; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1'>, { k1: 'v1' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v2'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2'>, { k1: 'v1'; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2'>, { k1: ['v1', 'v2']; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2&k1=v3'>, { k1: ['v1', 'v2', 'v3']; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2'>, { k1: 'v1'; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v1'>, { k1: 'v1' }>>,
]
