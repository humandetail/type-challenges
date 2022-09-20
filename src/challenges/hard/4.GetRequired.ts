/*
  57 - Get Required
  -------
  by Zheeeng (@zheeeng) #hard #utils #infer
  
  ### Question
  
  Implement the advanced util type `GetRequired<T>`, which remains all the required fields
  
  For example
  
  ```ts
  type I = GetRequired<{ foo: number, bar?: string }> // expected to be { foo: number }
  ```
  
  > View on GitHub: https://tsch.js.org/57
*/


/* _____________ Your Code Here _____________ */
type GetRequired<T> = {
  [P in keyof T as { [K in P]: T[K] } extends Required<{ [K in P]: T[K] }> ? P : never]: T[P]
}

// type A = { foo: number; bar?: string }
// type AE = Expect<Equal<A, Required<A>>> // false

// type B = { foo: number; bar: string }
// type BE = Expect<Equal<B, Required<B>>> // true

// type C = { foo: number }
// type CE = Expect<Equal<C, Required<C>>> // true

// type D = { bar?: string }
// type DE = Expect<Equal<D, Required<D>>> // false


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<GetRequired<{ foo: number; bar?: string }>, { foo: number }>>,
  Expect<Equal<GetRequired<{ foo: undefined; bar?: undefined }>, { foo: undefined }>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/57/answer
  > View solutions: https://tsch.js.org/57/solutions
  > More Challenges: https://tsch.js.org
*/
