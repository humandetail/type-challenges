/*
  517 - Multiply
  -------
  by null (@uid11) #extreme #math #template-literal
  
  ### Question
  
  **This challenge continues from [476 - Sum](https://tsch.js.org/476), it is recommended that you finish that one first, and modify your code based on it to start this challenge.**
  
  Implement a type `Multiply<A, B>` that multiplies two non-negative integers and returns their product as a string. Numbers can be specified as string, number, or bigint.
  
  For example,
  
  ```ts
  type T0 = Multiply<2, 3> // '6'
  type T1 = Multiply<3, '5'> // '15'
  type T2 = Multiply<'4', 10> // '40'
  type T3 = Multiply<0, 16> // '0'
  type T4 = Multiply<'13', '21'> // '273'
  type T5 = Multiply<'43423', 321543n> // '13962361689'
  ```
  
  > View on GitHub: https://tsch.js.org/517
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


type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

/**
 * SingleMultiply<1, 2> // 2
 * SingleMultiply<4, 8> // 32
 * SingleMultiply<0, 1> // 0
 */
 type SingleMultiply<
  T extends number,
  D extends number,
  C extends number = D,
  Result extends unknown[] = []
> = D extends 0
 ? 0
 : C extends 0
   ? Result['length'] & number
   : SingleMultiply<T, D, MinusOne<C>, [
     ...NumberToTuple<T>,
     ...Result
   ]>

/**
 * ArrayMul<[3, 2, 1], 1> // '321'
 * ArrayMul<[1, 2], 2> // '24'
 */
type ArrayMul<
  A extends number[],
  B extends number,
  C extends number = 0,
  Result extends string = '',
  AL extends number = Pop<A>
> = A extends []
  ? C extends 0 ? Result : `${C}${Result}`
  : ArrayMul<GetRest<A>, B, GetTens<SingleSum<C, SingleMultiply<AL, B>>>, `${GetDigit<SingleSum<C, SingleMultiply<AL, B>>>}${Result}`>

type EachSum<T, Result extends string = ''> = T extends [infer F extends string, ...infer R]
   ? EachSum<R, Sum<F, Result>>
   : Result

type Multiply<
  A extends ParamType,
  B extends ParamType,
  SA extends number[] = Split<A>,
  SB extends number[] = Split<B>,
  Result extends string[] = [],
  Default extends string = '',
  SBL extends number = Pop<SB>
> = Equal<`${A}`, '0'> extends true
  ? '0'
  : Equal<`${B}`, '0'> extends true
    ? '0'
    : SB extends []
      ? EachSum<Result>
      : Multiply<never, never, SA, GetRest<SB>, [ArrayMul<SA, SBL, 0, Default>, ...Result], `0${Default}`>

// 123 * 321
// 123 * 1 => 123
// 123 * 2 * 10 => 2460
// 123 * 3 * 100 => 36900
// => 123 + 2460 + 36900

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Multiply<2, 3>, '6'>>,
  Expect<Equal<Multiply<3, '5'>, '15'>>,
  Expect<Equal<Multiply<'4', 10>, '40'>>,
  Expect<Equal<Multiply<0, 16>, '0'>>,
  Expect<Equal<Multiply<'13', '21'>, '273'>>,
  Expect<Equal<Multiply<'43423', 321543n>, '13962361689'>>,
  Expect<Equal<Multiply<9999, 1>, '9999'>>,
  Expect<Equal<Multiply<4325234, '39532'>, '170985150488'>>,
  Expect<Equal<Multiply<100_000n, '1'>, '100000'>>,
  Expect<Equal<Multiply<259, 9125385>, '2363474715'>>,
  Expect<Equal<Multiply<9, 99>, '891'>>,
  Expect<Equal<Multiply<315, '100'>, '31500'>>,
  Expect<Equal<Multiply<11n, 13n>, '143'>>,
  Expect<Equal<Multiply<728, 0>, '0'>>,
  Expect<Equal<Multiply<'0', 213>, '0'>>,
  Expect<Equal<Multiply<0, '0'>, '0'>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/517/answer
  > View solutions: https://tsch.js.org/517/solutions
  > More Challenges: https://tsch.js.org
*/
