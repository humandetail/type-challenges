/*
  9775 - Capitalize Nest Object Keys
  -------
  by MayanDev (@Mayandev) #hard #object #array
  
  ### Question
  
  Capitalize the key of the object, and if the value is an array, iterate through the objects in the array.
  
  > View on GitHub: https://tsch.js.org/9775
*/


/* _____________ Your Code Here _____________ */
type EachCapitalize<T extends unknown[]> = T extends [infer F, ...infer R]
  ? [CapitalizeNestObjectKeys<F>, ...EachCapitalize<R>]
  : []

type CapitalizeNestObjectKeys<T> = {
  [K in keyof T as K extends string ? Capitalize<K> : never]: T[K] extends unknown[]
    ? EachCapitalize<T[K]>
    : T[K] extends Record<string, unknown>
      ? CapitalizeNestObjectKeys<T[K]>
      : T[K]
}


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'
import { ExpectFalse, NotEqual } from '@type-challenges/utils'

type foo = {
  foo: string
  bars: [{ foo: string }]
}

type Foo = {
  Foo: string
  Bars: [{
    Foo: string
  }]
}

type cases = [
  Expect<Equal<Foo, CapitalizeNestObjectKeys<foo>>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/9775/answer
  > View solutions: https://tsch.js.org/9775/solutions
  > More Challenges: https://tsch.js.org
*/
