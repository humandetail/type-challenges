/*
  7561 - Subtract
  -------
  by Lo (@LoTwT) #extreme #tuple
  
  ### Question
  
  Implement the type Subtraction that is ` - ` in Javascript by using BuildTuple.
  
  If the minuend is less than the subtrahend, it should be `never`.
  
  It's a simple version.
  
  For example
  
  ```ts
  Subtract<2, 1> // expect to be 1
  Subtract<1, 2> // expect to be never
  ```
  
  > View on GitHub: https://tsch.js.org/7561
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

type PlusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = [...Result, 0]['length'] & number

type Minus<M extends number, N extends number, Result extends number = 0> = M extends N
  ? Result
  : Minus<M, PlusOne<N>, PlusOne<Result>>

// M => minuend, S => subtrahend
type Subtract<M extends number, S extends number> = GT<S, M> extends true
  ? never
  : Minus<M, S>

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Subtract<1, 1>, 0>>,
  Expect<Equal<Subtract<2, 1>, 1>>,
  Expect<Equal<Subtract<1, 2>, never>>,
  // @ts-expect-error
  Expect<Equal<Subtract<1000, 999>, 1>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/7561/answer
  > View solutions: https://tsch.js.org/7561/solutions
  > More Challenges: https://tsch.js.org
*/
