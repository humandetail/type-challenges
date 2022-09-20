## Hard 组

困难级别的题，能做两道都算我赢！

### Simple Vue

> Implement a simpiled version of a Vue-like typing support.
>
>  By providing a function name `SimpleVue` (similar to `Vue.extend` or `defineComponent`), it should properly infer the `this` type inside computed and methods.
>
> In this challenge, we assume that SimpleVue take an Object with `data`, `computed` and `methods` fields as it's only argument,
>
> - `data` is a simple function that returns an object that exposes the context `this`, but you won't be accessible to other computed values or methods.
> -  `computed` is an Object of functions that take the context as `this`, doing some calculation and returns the result. The computed results should be exposed to the context as the plain return values instead of functions.
> -  `methods` is an Object of functions that take the context as `this` as well. Methods can access the fields exposed by `data`, `computed` as well as other `methods`. The different between `computed` is that `methods` exposed as functions as-is.
>
>   The type of `SimpleVue`'s return value can be arbitrary.

```typescript
declare function SimpleVue(options: any): any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

SimpleVue({
  data() {
    // @ts-expect-error
    this.firstname
    // @ts-expect-error
    this.getRandom()
    // @ts-expect-error
    this.data()

    return {
      firstname: 'Type',
      lastname: 'Challenges',
      amount: 10,
    }
  },
  computed: {
    fullname() {
      return `${this.firstname} ${this.lastname}`
    },
  },
  methods: {
    getRandom() {
      return Math.random()
    },
    hi() {
      alert(this.amount)
      alert(this.fullname.toLowerCase())
      alert(this.getRandom())
    },
    test() {
      const fullname = this.fullname
      const cases: [Expect<Equal<typeof fullname, string>>] = [] as any
    },
  },
})
```

这道题考验的是 [ThisType](https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype) 的应用：

```typescript
type OptionsType<Data, Computed, Methods> = {
  data?: () => Data;
  computed?: Computed & ThisType<Data & {
    [P in keyof Computed]: Computed[P] extends (...args: any) => infer R
      ? R
      : never
  }>;
  methods?: Methods & ThisType<Data & {
    [P in keyof Computed]: Computed[P] extends (...args: any) => infer R
      ? R
      : never
  } & Methods>;
}

declare function SimpleVue<Data, Computed, Methods>(options: OptionsType<Data, Computed, Methods>): any
```

### Currying

> TypeScript 4.0 is recommended in this challenge
>
> [Currying](https://en.wikipedia.org/wiki/Currying) is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument. 

```typescript
declare function Currying(fn: any): any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const curried1 = Currying((a: string, b: number, c: boolean) => true)
const curried2 = Currying((a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) => true)

type cases = [
  Expect<Equal<
    typeof curried1, (a: string) => (b: number) => (c: boolean) => true
  >>,
  Expect<Equal<
    typeof curried2, (a: string) => (b: number) => (c: boolean) => (d: boolean) => (e: boolean) => (f: string) => (g: boolean) => true
  >>,
]
```

首先，我们可以确认的是最终的返回值：

```typescript
declare function Currying<T>(fn: T): T extends (...args: any) => infer Return
  ? () => Return
  : never
```

并且，可以看到，最后一个函数的参数是我们给 `Currying()` 传入的回调函数中的最后一个参数：

```typescript
declare function Last<T>(fn: T): T extends (...args: [...infer R, infer L]) => infer Return
  ? (arg: L) => Return
  : never

const a = Last((a: number, b: string) => true) // (arg: string) => true
```

之后我们就需要做一些递归操作，直到把参数使用完毕：

```typescript
type GetLast<ArgsArry, T extends (arg: any) => any> = ArgsArry extends [...infer R, infer L]
  ? GetLast<R, (arg: L) => T>
  : T
```

所以最终的结果是：

```typescript
type CurryingReturnType<D, T extends (arg: any) => any> = D extends [...infer R, infer L]
  ? CurryingReturnType<R, (arg: L) => T>
  : T

declare function Currying<T>(fn: T): T extends (...args: [...infer R, infer L]) => infer Return
  ? CurryingReturnType<R, (arg: L) => Return>
  : never
```

### Union to Intersection

> Implement the advanced util type `UnionToIntersection<U>`

```typescript
type UnionToIntersection<U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<UnionToIntersection<'foo' | 42 | true>, 'foo' & 42 & true>>,
  Expect<Equal<UnionToIntersection<(() => 'foo') | ((i: 42) => true)>, (() => 'foo') & ((i: 42) => true)>>,
]
```

这一题，我们需要利用到以下的知识点，来源于 [https://github.com/Microsoft/TypeScript/pull/21496](https://github.com/Microsoft/TypeScript/pull/21496) ：

```typescript
// Conditional types can be nested to form a sequence of pattern matches that are evaluated in order:
type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

type T0 = Unpacked<string>;  // string
type T1 = Unpacked<string[]>;  // string
type T2 = Unpacked<() => string>;  // string
type T3 = Unpacked<Promise<string>>;  // string
type T4 = Unpacked<Promise<string>[]>;  // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string

// Note that is not possible for a conditional type to recursively reference itself, as might be desired in the Unpacked<T> case above. We're still considering ways in which to implement this.

// The following example demonstrates how multiple candidates for the same type variable in co-variant positions causes a union type to be inferred:

type Foo<T> = T extends { a: infer U, b: infer U } ? U : never;
type T10 = Foo<{ a: string, b: string }>;  // string
type T11 = Foo<{ a: string, b: number }>;  // string | number

// Likewise, multiple candidates for the same type variable in contra-variant positions causes an intersection type to be inferred:

type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
```

我们首要做的是，将联合类型转成函数形式的联合类型：

```typescript
type ToFunc<T> = T extends any
  ? (arg: T) => void
  : never

type F = ToFunc<'foo' | 42 | true>
// F = (arg: 'foo') => void | (arg: 42) => void | (arg: true) => void
```

然后再利用：在逆变位置的同一类型变量中的多个候选会被推断成交叉类型。【函数参数是逆变的，而对象属性是协变的。】这个特性来把参数变成交叉类型：

```typescript
type UnionToIntersection<U> = ToFunc<U> extends (arg: infer Arg) => void
  ? Arg
  : never
```

### Get Required

> Implement the advanced util type `GetRequired<T>`, which remains all the required fields

```typescript
type GetRequired<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<GetRequired<{ foo: number; bar?: string }>, { foo: number }>>,
  Expect<Equal<GetRequired<{ foo: undefined; bar?: undefined }>, { foo: undefined }>>,
]
```

我们先做个试验：

```typescript
type A = { foo: number; bar?: string }
type AE = Expect<Equal<A, Required<A>>> // false

type B = { foo: number; bar: string }
type BE = Expect<Equal<B, Required<B>>> // true

type C = { foo: number }
type CE = Expect<Equal<C, Required<C>>> // true

type D = { bar?: string }
type DE = Expect<Equal<D, Required<D>>> // false
```

也就是说，当 T 中所有键都是必需的键时，才会和通过 `Required<T>` 包装后的对象相等，所以我们可以用这个方式来逐一排除掉非必需的键：

```typescript
type GetRequired<T> = {
  [P in keyof T as { [K in P]: T[K] } extends Required<{ [K in P]: T[K] }> ? P : never]: T[P]
}
```

### Get Optional

> Implement the advanced util type `GetOptional<T>`, which remains all the optional fields

```typescript
type GetOptional<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<GetOptional<{ foo: number; bar?: string }>, { bar?: string }>>,
  Expect<Equal<GetOptional<{ foo: undefined; bar?: undefined }>, { bar?: undefined }>>,
]
```

这题的取值和 [Get Required](#Get Required) 反过来即可：

```typescript
type GetOptional<T> = {
  [P in keyof T as { [K in P]: T[K] } extends Required<{ [K in P]: T[K] }> ? never : P]: T[P]
}
```

### Required Keys

> Implement the advanced util type `RequiredKeys<T>`, which picks all the required keys into a union.

```typescript
type RequiredKeys<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<RequiredKeys<{ a: number; b?: string }>, 'a'>>,
  Expect<Equal<RequiredKeys<{ a: undefined; b?: undefined }>, 'a'>>,
  Expect<Equal<RequiredKeys<{ a: undefined; b?: undefined; c: string; d: null }>, 'a' | 'c' | 'd'>>,
  Expect<Equal<RequiredKeys<{}>, never>>,
]
```

这个解题只需要在 [Get Required](#Get Required) 的返回值前面加上 keyof 即可：

```typescript
type RequiredKeys<T> = keyof {
  [P in keyof T as Omit<T, P> extends T ? never : P]: T[P]
}
```

### Optional Keys

> Implement the advanced util type `OptionalKeys<T>`, which picks all the optional keys into a union.

```typescript
type OptionalKeys<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<OptionalKeys<{ a: number; b?: string }>, 'b'>>,
  Expect<Equal<OptionalKeys<{ a: undefined; b?: undefined }>, 'b'>>,
  Expect<Equal<OptionalKeys<{ a: undefined; b?: undefined; c?: string; d?: null }>, 'b' | 'c' | 'd'>>,
  Expect<Equal<OptionalKeys<{}>, never>>,
]
```

keyof [Get Optional](#Get Optional) 即可：

```typescript
type OptionalKeys<T> = keyof {
  [P in keyof T as Omit<T, P> extends T ? P : never]: T[P]
}
```

### Capitalize Words

> Implement `CapitalizeWords<T>` which converts the first letter of **each word of a string** to uppercase and leaves the rest as-is.

```typescript
type CapitalizeWords<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<CapitalizeWords<'foobar'>, 'Foobar'>>,
  Expect<Equal<CapitalizeWords<'FOOBAR'>, 'FOOBAR'>>,
  Expect<Equal<CapitalizeWords<'foo bar'>, 'Foo Bar'>>,
  Expect<Equal<CapitalizeWords<'foo bar hello world'>, 'Foo Bar Hello World'>>,
  Expect<Equal<CapitalizeWords<'foo bar.hello,world'>, 'Foo Bar.Hello,World'>>,
  Expect<Equal<CapitalizeWords<'aa!bb@cc#dd$ee%ff^gg&hh*ii(jj)kk_ll+mm{nn}oo|pp🤣qq'>, 'Aa!Bb@Cc#Dd$Ee%Ff^Gg&Hh*Ii(Jj)Kk_Ll+Mm{Nn}Oo|Pp🤣Qq'>>,
  Expect<Equal<CapitalizeWords<''>, ''>>,
]
```

从题意可知，只要前一个字符不是字母，那么它就得转成大写：

```typescript
type Alphabet = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P'
  | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'

type CapitalizeWords<
  S extends string,
  Prev extends string = '',
  Result extends string = ''
> = S extends `${infer F}${infer R}`
  ? Uppercase<Prev> extends Alphabet
    ? CapitalizeWords<R, F, `${Result}${F}`>
    : CapitalizeWords<R, F, `${Result}${Uppercase<F>}`>
  : Result

// type True = Expect<Equal<Lowercase<'.'> extends Uppercase<'.'> ? true : false, true>>
// type False = Expect<Equal<Lowercase<'a'> extends Uppercase<'A'> ? true : false, false>>
```

### CamelCase

> Implement `CamelCase<T>` which converts `snake_case` string to `camelCase`.

```typescript
type CamelCase<S extends string> = any

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
```

暴力解题法：

```typescript
type NoAphabet<T> = T extends `${infer F}${infer R}`
  ? Lowercase<F> extends Uppercase<F>
    ? NoAphabet<R>
    : false
  : true

type ToCamelCase<
  S extends string,
  Bool extends boolean = false,
  Result extends string = ''
> = S extends `${infer F}${infer R}`
  ? Lowercase<F> extends Uppercase<F>
    ? ToCamelCase<R, true, Result>
    : Bool extends true
      ? ToCamelCase<R, false, `${Result}${Uppercase<F>}`>
      : ToCamelCase<R, false, `${Result}${Lowercase<F>}`>
  : Result

type CamelCase<
  S extends string
> = NoAphabet<S> extends true ? S : ToCamelCase<S>
```

利用工具类解题法，`Uncapitalize` 把首字母变成小写，`Capitalize` 把首字母变成大写：

```typescript
type CamelCase<S extends string, Result extends string = '', IsFirst extends boolean = true> = S extends `${infer F}${infer R}`
  ? IsFirst extends true
    ? CamelCase<Uncapitalize<S>, Result, false>
    : F extends '_'
      ? CamelCase<Capitalize<R>, Result, false>
      : CamelCase<Uncapitalize<R>, `${Result}${F}`, false>
  : Result
```

### C-printf Parser

> There is a function in C language: `printf`. This function allows us to print something with formatting. Like this:
>
>   ```c
>   printf("The result is %d.", 42);
>   ```
>
> This challenge requires you to parse the input string and extract the format placeholders like `%d` and `%f`. For example, if the input string is `"The result is %d."`, the parsed result is a tuple `['dec']`.
>
> Here is the mapping:
>
>   ```typescript
>   type ControlsMap = {
>     c: 'char',
>     s: 'string',
>     d: 'dec',
>     o: 'oct',
>     h: 'hex',
>     f: 'float',
>     p: 'pointer',
>   }
>   ```

```typescript
type ControlsMap = {
  c: 'char'
  s: 'string'
  d: 'dec'
  o: 'oct'
  h: 'hex'
  f: 'float'
  p: 'pointer'
}

type ParsePrintFormat = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ParsePrintFormat<''>, []>>,
  Expect<Equal<ParsePrintFormat<'Any string.'>, []>>,
  Expect<Equal<ParsePrintFormat<'The result is %d.'>, ['dec']>>,
  Expect<Equal<ParsePrintFormat<'The result is %%d.'>, []>>,
  Expect<Equal<ParsePrintFormat<'The result is %%%d.'>, ['dec']>>,
  Expect<Equal<ParsePrintFormat<'The result is %f.'>, ['float']>>,
  Expect<Equal<ParsePrintFormat<'The result is %h.'>, ['hex']>>,
  Expect<Equal<ParsePrintFormat<'The result is %q.'>, []>>,
  Expect<Equal<ParsePrintFormat<'Hello %s: score is %d.'>, ['string', 'dec']>>,
  Expect<Equal<ParsePrintFormat<'The result is %'>, []>>,
]
```

这题还是比较简单的，只需要逐个对比，遇到 `%` 时就记录起来即可：

```typescript
type ParsePrintFormat<S extends string, Result extends string[] = [], Prev = ''> = S extends `${infer F}${infer R}`
  ? Prev extends '%'
    ? F extends keyof ControlsMap
      ? ParsePrintFormat<R, [...Result, ControlsMap[F]], ''>
      : ParsePrintFormat<R, Result, ''>
    : F extends '%'
      ? ParsePrintFormat<R, Result, F>
      : ParsePrintFormat<R, Result, ''>
  : Result
```

