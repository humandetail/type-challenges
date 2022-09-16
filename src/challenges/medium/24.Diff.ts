/*
  645 - Diff
  -------
  by ZYSzys (@ZYSzys) #medium #object
  
  ### Question
  
  Get an `Object` that is the difference between `O` & `O1`
  
  > View on GitHub: https://tsch.js.org/645
*/


/* _____________ Your Code Here _____________ */

// type Diff<O, O1> = {
//   [P in keyof O | keyof O1 as (
//     P extends keyof O
//       ? P extends keyof O1
//         ? never
//         : P
//       : P extends keyof O1
//         ? P extends keyof O
//           ? never
//           : P
//         : never
//   )]: P extends keyof O
//     ? O[P]
//     : P extends keyof O1
//       ? O1[P]
//       : never
// }

type Diff<O, O1> = {
  [P in Exclude<keyof O, keyof O1> | Exclude<keyof O1, keyof O>]: P extends keyof O
    ? O[P]
    : P extends keyof O1
      ? O1[P]
      : never
}

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Foo = {
  name: string
  age: string
}
type Bar = {
  name: string
  age: string
  gender: number
}
type Coo = {
  name: string
  gender: number
}

type cases = [
  Expect<Equal<Diff<Foo, Bar>, { gender: number }>>,
  Expect<Equal<Diff<Bar, Foo>, { gender: number }>>,
  Expect<Equal<Diff<Foo, Coo>, { age: string; gender: number }>>,
  Expect<Equal<Diff<Coo, Foo>, { age: string; gender: number }>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/645/answer
  > View solutions: https://tsch.js.org/645/solutions
  > More Challenges: https://tsch.js.org
*/
