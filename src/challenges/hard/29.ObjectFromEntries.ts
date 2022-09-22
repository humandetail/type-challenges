/*
  2949 - ObjectFromEntries
  -------
  by jiangshan (@jiangshanmeta) #hard #object
  
  ### Question
  
  Implement the type version of ```Object.fromEntries```
  
  For example:
  
  ```typescript
  interface Model {
    name: string;
    age: number;
    locations: string[] | null;
  }
  
  type ModelEntries = ['name', string] | ['age', number] | ['locations', string[] | null];
  
  type result = ObjectFromEntries<ModelEntries> // expected to be Model
  ```
  
  > View on GitHub: https://tsch.js.org/2949
*/


/* _____________ Your Code Here _____________ */
/**
 * UnionToFunc<1 | 2> => ((arg: 1) => void | (arg: 2) => void)
 */
 type UnionToFunc<T> = T extends unknown ? (arg: T) => void : never

 /**
  * UnionToIntersection<1 | 2> = 1 & 2
  */
 type UnionToIntersection<U> = UnionToFunc<U> extends (arg: infer Arg) => void
   ? Arg
   : never
 
 /**
  * LastInUnion<1 | 2> = 2
  */
 type LastInUnion<U> = UnionToIntersection<UnionToFunc<U>> extends (x: infer L) => void
   ? L
   : never
 
 type UnionToTuple<T, L = LastInUnion<T>> = [L] extends [never]
   ? []
   : [...UnionToTuple<Exclude<T, L>>, L]

type ObjectFromEntries<T, D = UnionToTuple<T>, Result extends Record<PropertyKey, any> = {}> = D extends [infer F, ...infer R]
  ? F extends [infer FF extends string, infer FR]
    ? ObjectFromEntries<
        never,
        R,
        {
          [K in FF | keyof Result]: K extends FF
            ? FR
            : K extends keyof Result
              ? Result[K]
            : never
        }
      >
    : never
  : Result


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Model {
  name: string
  age: number
  locations: string[] | null
}

type ModelEntries = ['name', string] | ['age', number] | ['locations', string[] | null]

type cases = [
  Expect<Equal<ObjectFromEntries<ModelEntries>, Model>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/2949/answer
  > View solutions: https://tsch.js.org/2949/solutions
  > More Challenges: https://tsch.js.org
*/
