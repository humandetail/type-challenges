/*
  8804 - Two Sum
  -------
  by PsiloLau (@Psilocine) #hard #array #math
  
  ### Question
  
  Given an array of integers `nums` and an integer `target`, return true if two numbers such that they add up to `target`.
  
  > View on GitHub: https://tsch.js.org/8804
*/


/* _____________ Your Code Here _____________ */
/**
 * NumberToArray<1> // [0]
 * NumberToArray<2> // [0, 0]
 */
type NumberToArray<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToArray<N, [0, ...Result]>

/**
 * Sum<1, 2> // 3
 */
type Sum<A extends number, B extends number> = [...NumberToArray<A>, ...NumberToArray<B>]['length']

/**
 * EachSum<[1, 2], 3> // [4, 5]
 */
type EachSum<T extends number[], N extends number, Result extends number[] = []> = T extends [infer F extends number, ...infer R extends number[]]
  ? EachSum<R, N, [...Result, Sum<F, N> & number]>
  : Result

/**
 * GetResult<[1, 2, 3]> // [3, 4, 5]
 */
type GetResult<T extends number[], Result extends number[] = []> = T extends [infer F extends number, ...infer R extends number[]]
  ? GetResult<R, [...Result, ...EachSum<R, F>]>
  : Result

type TwoSum<T extends number[], U extends number> = U extends GetResult<T>[number] ? true : false

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TwoSum<[3, 3], 6>, true>>,
  Expect<Equal<TwoSum<[3, 2, 4], 6>, true>>,
  Expect<Equal<TwoSum<[2, 7, 11, 15], 15>, false>>,
  Expect<Equal<TwoSum<[2, 7, 11, 15], 9>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 0>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 1>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 2>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 3>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 4>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 5>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 6>, false>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/8804/answer
  > View solutions: https://tsch.js.org/8804/solutions
  > More Challenges: https://tsch.js.org
*/
