/*
  9155 - ValidDate
  -------
  by ch3cknull (@ch3cknull) #hard 
  
  ### Question
  
  Implement a type `ValidDate`, which takes an input type T and returns whether T is a valid date.
  
  **Leap year is not considered**
  
  Good Luck!
  
  ```ts
  ValidDate<'0102'> // true
  ValidDate<'0131'> // true
  ValidDate<'1231'> // true
  ValidDate<'0229'> // false
  ValidDate<'0100'> // false
  ValidDate<'0132'> // false
  ValidDate<'1301'> // false
  ```
  
  > View on GitHub: https://tsch.js.org/9155
*/


/* _____________ Your Code Here _____________ */
/**
 * StringToNumber<'01'> // 1
 * StringToNumber<'1'> // 1
 * SttringToNumber<''> // 0
 */
type StringToNumber<T extends string> = T extends `0${infer R extends number}`
  ? R
  : T extends `${infer R extends number}`
    ? R
    : 0

type PlusOne<T extends number, R extends 0[] = []> = R['length'] extends T
  ? [0, ...R]['length']
  : PlusOne<T, [0, ...R]>

/**
 * GetDateAndMonth<'0'> // [0, 0]
 * GetDateAndMonth<'0123'> // [1, 23]
 * GetDateAndMonth<'01234'> // [1, 234]
 */
type GetDateAndMonth<T extends string, C extends number = 0, Date extends string = '', Month extends string = ''> = C extends 2
  ? [StringToNumber<Date>, StringToNumber<T>]
  : T extends `${infer F}${infer R}`
    ? GetDateAndMonth<R, PlusOne<C>, `${Date}${F}`>
    : [StringToNumber<Date>, StringToNumber<Month>]

type NumberToTuple<T extends number, Res extends 0[] = []> = Res['length'] extends T
  ? Res
  : NumberToTuple<T, [...Res, 0]>
  
type MinusOne<T extends number, Res extends 0[] = NumberToTuple<T>> = Res extends [infer F, ...infer R]
  ? R['length']
  : never
  
type GT<T extends number, U extends number> = T extends U
  ? true
  : T extends 0
    ? false
    : GT<MinusOne<T>, U>

/**
 * GreaterThan<1, 2> // false
 * GreaterThan<2, 2> // false
 * GreaterThan<3, 2> // true
 */
type GreaterThan<T extends number, U extends number> = Equal<T, U> extends true
  ? false
  : GT<T, U>

/**
 * InRange<2, 1, 2> // false
 * InRange<2, 1, 3> // true
 */
type InRange<A extends number, F extends number, R extends number> = GreaterThan<A, F> extends true
  ? GreaterThan<R, A> extends true
    ? true
    : false
  : false

type ValidDate<T extends string, A extends [number, number] = GetDateAndMonth<T>> = InRange<A[0], 0, 13> extends true
  ? A[0] extends 2
    ? InRange<A[1], 0, 29> extends true
      ? true
      : false
    : InRange<A[1], 0, 32> extends true
      ? true
      : false
  : false


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ValidDate<'0102'>, true>>,
  Expect<Equal<ValidDate<'0131'>, true>>,
  Expect<Equal<ValidDate<'1231'>, true>>,
  Expect<Equal<ValidDate<'0229'>, false>>,
  Expect<Equal<ValidDate<'0100'>, false>>,
  Expect<Equal<ValidDate<'0132'>, false>>,
  Expect<Equal<ValidDate<'1301'>, false>>,
  Expect<Equal<ValidDate<'0123'>, true>>,
  Expect<Equal<ValidDate<'01234'>, false>>,
  Expect<Equal<ValidDate<''>, false>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/9155/answer
  > View solutions: https://tsch.js.org/9155/solutions
  > More Challenges: https://tsch.js.org
*/
