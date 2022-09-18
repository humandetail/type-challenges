/*
  4182 - Fibonacci Sequence
  -------
  by windliang (@wind-liang) #medium 
  
  ### Question
  
  Implement a generic Fibonacci\<T\> takes an number T and returns it's corresponding [Fibonacci number](https://en.wikipedia.org/wiki/Fibonacci_number).
  
  The sequence starts:
  1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
  
  For example
  ```ts
  type Result1 = Fibonacci<3> // 2
  type Result2 = Fibonacci<8> // 21
  ```
  
  > View on GitHub: https://tsch.js.org/4182
*/


/* _____________ Your Code Here _____________ */
type NumberToTuple<T extends Number, R extends 0[] = []> = R['length'] extends T
  ? R
  : NumberToTuple<T, [...R, 0]>

type Plus<T extends number, N extends number> = [
  ...NumberToTuple<T>,
  ...NumberToTuple<N>
]['length'] & number

// 1, 1, 2, 3, 5, 8,  ...

type Fibonacci<
  T extends number,
  Start extends number = 2,
  Prev extends number = 0,
  Last extends number = 1
> = T extends 0 | 1
  ? 1
  : Start extends T
    ? Plus<Prev, Last>
    : Fibonacci<T, Plus<Start, 1>, Last, Plus<Prev, Last>>


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Fibonacci<3>, 2>>,
  Expect<Equal<Fibonacci<8>, 21>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/4182/answer
  > View solutions: https://tsch.js.org/4182/solutions
  > More Challenges: https://tsch.js.org
*/
