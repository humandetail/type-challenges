/*
  476 - Sum
  -------
  by null (@uid11) #extreme #math #template-literal
  
  ### Question
  
  Implement a type `Sum<A, B>` that summing two non-negative integers and returns the sum as a string. Numbers can be specified as a string, number, or bigint.
  
  For example,
  
  ```ts
  type T0 = Sum<2, 3> // '5'
  type T1 = Sum<'13', '21'> // '34'
  type T2 = Sum<'328', 7> // '335'
  type T3 = Sum<1_000_000_000_000n, '123'> // '1000000000123'
  ```
  
  > View on GitHub: https://tsch.js.org/476
*/


/* _____________ Your Code Here _____________ */
type ParamType = string | number | bigint

type NumberToTuple<T extends number, R extends 0[] = []> = R['length'] extends T
  ? R
  : NumberToTuple<T, [0, ...R]>

/**
 * Split<12> // [1, 2]
 * Split<'1'> // [1]
 */
type Split<S extends ParamType, Result extends number[] = []> = `${S}` extends `${infer F extends number}${infer R}`
  ? Split<R, [...Result, F]>
  : Result

/**
 * SingleSum<1, 2> // 3
 * SingleSum<4, 8> // 12
 */
type SingleSum<T extends number, D extends number> = [...NumberToTuple<T>, ...NumberToTuple<D>]['length'] & number

/**
 * GetRest<[1, 2, 3]> // [1, 2]
 * GetRest<[1]> // []
 */
type GetRest<T> = T extends [...infer R, infer L extends number]
  ? R
  : []

type Pop<T> = T extends [...infer R, infer L extends number]
  ? L
  : 0

/**
 * GetDigit<12> // 2
 * GetDigit<1> // 1
 */
type GetDigit<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? R
  : T

/**
 * GetTens<12> // 1
 * GetTens<1> // 0
 */
type GetTens<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? F
  : 0

type ArraySum<
  A extends number[] = [],
  B extends number[] = [],
  C extends number = 0, // 4 + 8 => 12 => 1
  Result extends string = '', // 4 + 8 => 12 => 2 + Result
  AL extends number = Pop<A>,
  BL extends number = Pop<B>
> = A extends []
  ? B extends []
    ? C extends 0 ? Result : `${C}${Result}`
    : ArraySum<[], GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
  : B extends []
    ? ArraySum<GetRest<A>, [], GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    : ArraySum<GetRest<A>, GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    

type Sum<
  A extends ParamType,
  B extends ParamType,
> = ArraySum<Split<A>, Split<B>>

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Sum<2, 3>, '5'>>,
  Expect<Equal<Sum<'13', '21'>, '34'>>,
  Expect<Equal<Sum<'328', 7>, '335'>>,
  Expect<Equal<Sum<1_000_000_000_000n, '123'>, '1000000000123'>>,
  Expect<Equal<Sum<9999, 1>, '10000'>>,
  Expect<Equal<Sum<4325234, '39532'>, '4364766'>>,
  Expect<Equal<Sum<728, 0>, '728'>>,
  Expect<Equal<Sum<'0', 213>, '213'>>,
  Expect<Equal<Sum<0, '0'>, '0'>>,
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/476/answer
  > View solutions: https://tsch.js.org/476/solutions
  > More Challenges: https://tsch.js.org
*/
