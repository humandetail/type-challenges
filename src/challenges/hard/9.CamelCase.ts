/*
  114 - CamelCase
  -------
  by Anthony Fu (@antfu) #hard #template-literal
  
  ### Question
  
  Implement `CamelCase<T>` which converts `snake_case` string to `camelCase`.
  
  For example
  
  ```ts
  type camelCase1 = CamelCase<'hello_world_with_types'> // expected to be 'helloWorldWithTypes'
  type camelCase2 = CamelCase<'HELLO_WORLD_WITH_TYPES'> // expected to be same as previous one
  ```
  
  > View on GitHub: https://tsch.js.org/114
*/


/* _____________ Your Code Here _____________ */
// type NoAphabet<T> = T extends `${infer F}${infer R}`
//   ? Lowercase<F> extends Uppercase<F>
//     ? NoAphabet<R>
//     : false
//   : true

// type ToCamelCase<
//   S extends string,
//   Bool extends boolean = false,
//   Result extends string = ''
// > = S extends `${infer F}${infer R}`
//   ? Lowercase<F> extends Uppercase<F>
//     ? ToCamelCase<R, true, Result>
//     : Bool extends true
//       ? ToCamelCase<R, false, `${Result}${Uppercase<F>}`>
//       : ToCamelCase<R, false, `${Result}${Lowercase<F>}`>
//   : Result

// type CamelCase<
//   S extends string
// > = NoAphabet<S> extends true ? S : ToCamelCase<S>


type CamelCase<S extends string, Result extends string = '', IsFirst extends boolean = true> = S extends `${infer F}${infer R}`
  ? IsFirst extends true
    ? CamelCase<Uncapitalize<S>, Result, false>
    : F extends '_'
      ? CamelCase<Capitalize<R>, Result, false>
      : CamelCase<Uncapitalize<R>, `${Result}${F}`, false>
  : Result


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<CamelCase<'foobar'>, 'foobar'>>,
  Expect<Equal<CamelCase<'FOOBAR'>, 'foobar'>>,
  Expect<Equal<CamelCase<'foo_bar'>, 'fooBar'>>,
  Expect<Equal<CamelCase<'foo_bar_hello_world'>, 'fooBarHelloWorld'>>,
  Expect<Equal<CamelCase<'HELLO_WORLD_WITH_TYPES'>, 'helloWorldWithTypes'>>,
  Expect<Equal<CamelCase<'-'>, '-'>>,
  Expect<Equal<CamelCase<''>, ''>>,
  Expect<Equal<CamelCase<'😎'>, '😎'>>,
]



/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/114/answer
  > View solutions: https://tsch.js.org/114/solutions
  > More Challenges: https://tsch.js.org
*/
