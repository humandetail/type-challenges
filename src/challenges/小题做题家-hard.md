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

### Vue Basic Props

> **This challenge continues from [Simple Vue](#Simple Vue), you should finish that one first, and modify your code based on it to start this challenge**.
>
> In addition to the Simple Vue, we are now having a new `props` field in the options. This is a simplified version of Vue's `props` option. Here are some of the rules.
>
> `props` is an object containing each field as the key of the real props injected into `this`. The injected props will be accessible in all the context including `data`, `computed`, and `methods`.
>
> A prop will be defined either by a constructor or an object with a `type` field containing constructor(s).

```typescript
declare function VueBasicProps (options: any) : any

/* _____________ Test Cases _____________ */
import type { Debug, Equal, Expect, IsAny } from '@type-challenges/utils'

class ClassA {}

VueBasicProps({
  props: {
    propA: {},
    propB: { type: String },
    propC: { type: Boolean },
    propD: { type: ClassA },
    propE: { type: [String, Number] },
    propF: RegExp,
  },
  data(this) {
    type PropsType = Debug<typeof this>
    type cases = [
      Expect<IsAny<PropsType['propA']>>,
      Expect<Equal<PropsType['propB'], string>>,
      Expect<Equal<PropsType['propC'], boolean>>,
      Expect<Equal<PropsType['propD'], ClassA>>,
      Expect<Equal<PropsType['propE'], string | number>>,
      Expect<Equal<PropsType['propF'], RegExp>>,
    ]

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
      alert(this.fullname.toLowerCase())
      alert(this.getRandom())
    },
    test() {
      const fullname = this.fullname
      const propE = this.propE
      type cases = [
        Expect<Equal<typeof fullname, string>>,
        Expect<Equal<typeof propE, string | number>>,
      ]
    },
  },
})
```

首先我们把 Simple Vue 中的实现代码复制过来：

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

declare function VueBasicProps<Data, Computed, Methods>(options: OptionsType<Data, Computed, Methods>): any
```

然后需要处理 Props：

```typescript
class A {}
const props = {
  // {}
  propA: {},
  // { type: StringContructor }
  propB: { type: String },
  // { type: BooleanConstructor }
  propC: { type: Boolean },
  // { type: ClassA }
  propD: { type: ClassA },
  // { type: (StringConstructor | NumberConstructor)[] }
  propE: { type: [String, Number] },
  // RegExpConstructor
  propF: RegExp,
}
```

也就是说 Props 中的值有以下几种情况：

```typescript
type Constructor = new (...args: any) => any

type PropsValue = Constructor | { type?: Constructor | Constructor[] }

type OptionsType<Props extends Record<string, PropsValue>, Data, Computed, Methods> = {
  props?: Props;
  ...
}
```

接下来，我们需要一个可以通过构造器来获取类型的类型：

```typescript
type ConstructorMap<T> = T extends undefined
  ? any
  : T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends RegExpConstructor
        ? RegExp
        : T extends BooleanConstructor
          ? boolean
          : T extends Constructor[]
            ? ConstructorMap<T[number]>
            : T extends { prototype: infer P }
              ? P
              : any
```

然后再创建一个类型用于获取 Props 对象：

```typescript
type PropsContext<T> = {
  [K in keyof T]: T[K] extends { type: infer R }
    ? ConstructorMap<R>
    : ConstructorMap<T[K]>
}
```

最后，把 PropsContext 加入到指定位置即可：

```typescript
type Constructor = new (...args: any) => any

type PropsValue = Constructor | { type?: Constructor | Constructor[] }

type ConstructorMap<T> = T extends undefined
  ? any
  : T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends RegExpConstructor
        ? RegExp
        : T extends BooleanConstructor
          ? boolean
          : T extends Constructor[]
            ? ConstructorMap<T[number]>
            : T extends { prototype: infer P }
              ? P
              : any

type PropsContext<T> = {
  [K in keyof T]: T[K] extends { type: infer R }
    ? ConstructorMap<R>
    : ConstructorMap<T[K]>
}

type OptionsType<Props extends Record<string, PropsValue>, Data, Computed, Methods> = {
  props?: Props,
  data?: (this: PropsContext<Props>) => Data;
  computed?: Computed & ThisType<Data & {
    [P in keyof Computed]: Computed[P] extends (...args: any) => infer R
      ? R
      : never
  } & PropsContext<Props>>;
  methods?: Methods & ThisType<PropsContext<Props> & Data & {
    [P in keyof Computed]: Computed[P] extends (...args: any) => infer R
      ? R
      : never
  } & Methods>;
}

declare function VueBasicProps<Props extends Record<string, PropsValue>, Data, Computed, Methods>(options: OptionsType<Props, Data, Computed, Methods>): any
```

### IsAny

> Sometimes it's useful to detect if you have a value with `any` type. This is especially helpful while working with third-party Typescript modules, which can export `any` values in the module API. It's also good to know about `any` when you're suppressing implicitAny checks.
>
> So, let's write a utility type `IsAny<T>`, which takes input type `T`. If `T` is `any`, return `true`, otherwise, return `false`.

```typescript
type IsAny<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsAny<any>, true>>,

  Expect<Equal<IsAny<undefined>, false>>,
  Expect<Equal<IsAny<unknown>, false>>,
  Expect<Equal<IsAny<never>, false>>,
  Expect<Equal<IsAny<string>, false>>,
]
```

其实这个类型在 `@type-challenges/utils` 中就有。

```typescript
type IsAny<T> = (<A>() => A extends T ? 1 : 2) extends (<A>() => A extends any ? 1 : 2) ? true : false

type IsAny2<T> = Equal<T, any>
```

### Typed Get

> The [`get` function in lodash](https://lodash.com/docs/4.17.15#get) is a quite convenient helper for accessing nested values in JavaScript. However, when we come to TypeScript, using functions like this will make you lose the type information. With TS 4.1's upcoming [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types) feature, properly typing `get` becomes possible. Can you implement it?

```typescript
type Get<T, K> = string

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Get<Data, 'hello'>, 'world'>>,
  Expect<Equal<Get<Data, 'foo.bar.count'>, 6>>,
  Expect<Equal<Get<Data, 'foo.bar'>, { value: 'foobar'; count: 6 }>>,

  Expect<Equal<Get<Data, 'no.existed'>, never>>,
]

type Data = {
  foo: {
    bar: {
      value: 'foobar'
      count: 6
    }
    included: true
  }
  hello: 'world'
}
```

简单的字符串操作：

```typescript
type Get<T, K extends string> = K extends `${infer Key}.${infer R}`
  ? Key extends keyof T
    ? Get<T[Key], R>
    : never
  : K extends keyof T
    ? T[K]
    : never
```

### String to Number

> Convert a string literal to a number, which behaves like `Number.parseInt`.

```typescript
type ToNumber<S extends string> = string

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ToNumber<'0'>, 0>>,
  Expect<Equal<ToNumber<'5'>, 5>>,
  Expect<Equal<ToNumber<'12'>, 12>>,
  Expect<Equal<ToNumber<'27'>, 27>>,
  Expect<Equal<ToNumber<'18@7_$%'>, never>>,
]
```

我的想法是，先获取一个由字符串里面的每一个经过转换后的数字数组：

```typescript
type NumberMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type GetResult<S extends string, Result extends number[] = []> = S extends `${infer F}${infer R}`
  ? F extends keyof NumberMap
    ? GetResult<R, [...Result, NumberMap[F] & number]>
    : never
  : Result
```

如果字符串里面出现了无法匹配数字的字符，那么就是 never。

```typescript
type E = [
  Expect<Equal<GetResult<'12'>, [1, 2]>>,
  Expect<Equal<GetResult<'0'>, [0]>>,
  Expect<Equal<GetResult<'123@abc'>, never>>
]
```

然后将得到的数组递归操作再次生成另外一个数组，最后获取它的 Length：

```typescript
type NumberToTuple<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToTuple<N, [...Result, 0]>

type GetTenTimes<T extends any[] = []> = [
  ...T, ...T, ...T, ...T, ...T,
  ...T, ...T, ...T, ...T, ...T
]

type GetLength<T extends number[], Result extends unknown[] = []> = T extends [infer F extends number, ...infer R extends number[]]
  ? GetLength<R, [...GetTenTimes<Result>, ...NumberToTuple<F>]>
  : Result['length']
```

最后得出结果：

```typescript
type NumberMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type GetResult<S extends string, Result extends number[] = []> = S extends `${infer F}${infer R}`
  ? F extends keyof NumberMap
    ? GetResult<R, [...Result, NumberMap[F] & number]>
    : never
  : Result

type NumberToTuple<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToTuple<N, [...Result, 0]>

type GetTenTimes<T extends any[] = []> = [
  ...T, ...T, ...T, ...T, ...T,
  ...T, ...T, ...T, ...T, ...T
]

type GetLength<T extends number[], Result extends unknown[] = []> = T extends [infer F extends number, ...infer R extends number[]]
  ? GetLength<R, [...GetTenTimes<Result>, ...NumberToTuple<F>]>
  : Result['length']

type ToNumber<S extends string, R extends number[] = GetResult<S>> = [R] extends [never]
  ? never
  : GetLength<R>
```

然后在社区还有更简单的答案：

```typescript
type ToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;
```

### Tuple Filter

> Implement a type `FilterOut<T, F>` that filters out items of the given type `F` from the tuple `T`.

```typescript
type FilterOut<T extends any[], F> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<FilterOut<[], never>, []>>,
  Expect<Equal<FilterOut<[never], never>, []>>,
  Expect<Equal<FilterOut<['a', never], never>, ['a']>>,
  Expect<Equal<FilterOut<[1, never, 'a'], never>, [1, 'a']>>,
  Expect<Equal<FilterOut<[never, 1, 'a', undefined, false, null], never | null | undefined>, [1, 'a', false]>>,
  Expect<Equal<FilterOut<[number | null | undefined, never], never | null | undefined>, [number | null | undefined]>>,
]
```

逐一排除即可：

```typescript
type FilterOut<T extends any[], F, Result extends any[] = []> = T extends [infer J, ...infer R]
  ? Equal<J, F> extends true
    ? FilterOut<R, F, Result>
    : [J] extends [F]
      ? FilterOut<R, F, Result>
      : FilterOut<R, F, [...Result, J]>
  : Result
```

### Tuple to Enum Object

> The enum is an original syntax of TypeScript (it does not exist in JavaScript). So it is converted to like the following form as a result of transpilation:
>   ```js
>   let OperatingSystem;
>   (function (OperatingSystem) {
>       OperatingSystem[OperatingSystem["MacOS"] = 0] = "MacOS";
>       OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
>       OperatingSystem[OperatingSystem["Linux"] = 2] = "Linux";
>   })(OperatingSystem || (OperatingSystem = {}));
>   ```
> In this question, the type should convert a given string tuple to an object that behaves like an enum.
> Moreover, the property of an enum is preferably a pascal case.
>
>   ```ts
>   Enum<["macOS", "Windows", "Linux"]>
>   // -> { readonly MacOS: "macOS", readonly Windows: "Windows", readonly Linux: "Linux" }
>   ```
> If `true` is given in the second argument, the value should be a number literal.
>   ```ts
>   Enum<["macOS", "Windows", "Linux"], true>
>   // -> { readonly MacOS: 0, readonly Windows: 1, readonly Linux: 2 }
>   ```

```typescript
type Enum<T extends readonly string[], N extends boolean = false> = any


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const OperatingSystem = ['macOS', 'Windows', 'Linux'] as const
const Command = ['echo', 'grep', 'sed', 'awk', 'cut', 'uniq', 'head', 'tail', 'xargs', 'shift'] as const

type cases = [
  Expect<Equal<Enum<[]>, {}>>,
  Expect<Equal<
  Enum<typeof OperatingSystem>,
  {
    readonly MacOS: 'macOS'
    readonly Windows: 'Windows'
    readonly Linux: 'Linux'
  }
  >>,
  Expect<Equal<
  Enum<typeof OperatingSystem, true>,
  {
    readonly MacOS: 0
    readonly Windows: 1
    readonly Linux: 2
  }
  >>,
  Expect<Equal<
  Enum<typeof Command>,
  {
    readonly Echo: 'echo'
    readonly Grep: 'grep'
    readonly Sed: 'sed'
    readonly Awk: 'awk'
    readonly Cut: 'cut'
    readonly Uniq: 'uniq'
    readonly Head: 'head'
    readonly Tail: 'tail'
    readonly Xargs: 'xargs'
    readonly Shift: 'shift'
  }
  >>,
  Expect<Equal<
  Enum<typeof Command, true>,
  {
    readonly Echo: 0
    readonly Grep: 1
    readonly Sed: 2
    readonly Awk: 3
    readonly Cut: 4
    readonly Uniq: 5
    readonly Head: 6
    readonly Tail: 7
    readonly Xargs: 8
    readonly Shift: 9
  }
  >>,
]
```

这题也是比较容易处理的，只需要根据不同的 N 来决定是使用数组中的值或是索引即可：

```typescript
type PlusOne<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? [...Result, 0]['length']
  : PlusOne<N, [...Result, 0]>

type Enum<
  T extends readonly string[],
  N extends boolean = false,
  Result extends Record<string, any> = {},
  Index extends number = 0
> = T extends readonly [infer F extends string, ...infer R extends readonly string[]]
  ? Enum<
      R,
      N,
      {
        readonly [K in F | keyof Result as K extends string ? Capitalize<K> : never]: K extends keyof Result
          ? Result[K]
          : K extends string
            ? N extends false
              ? `${K}`
              : Index
            : never
      },
      PlusOne<Index>
    >
  : Result
```

### Printf

> Implement `Format<T extends string>` generic.

```typescript
type Format<T extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Format<'abc'>, string>>,
  Expect<Equal<Format<'a%sbc'>, (s1: string) => string>>,
  Expect<Equal<Format<'a%dbc'>, (d1: number) => string>>,
  Expect<Equal<Format<'a%%dbc'>, string>>,
  Expect<Equal<Format<'a%%%dbc'>, (d1: number) => string>>,
  Expect<Equal<Format<'a%dbc%s'>, (d1: number) => (s1: string) => string>>,
]
```

这和之前做的 [C-printf Parser](#C-printf Parser) 类似：

```typescript
type M = {
  d: number;
  s: string;
}

type Format<T extends string, Prev extends string = ''> = T extends `${infer F}${infer R}`
  ? Prev extends '%'
    ? F extends '%'
      ? Format<R, ''>
      : F extends keyof M
        ? (arg: M[F]) => Format<R, ''>
        : Format<R, F>
      : Format<R, F>
  : string
```

### Deep object to unique

> TypeScript has structural type system, but sometimes you want a function to accept only some previously well-defined unique objects (as in the nominal type system), and not any objects that have the required fields.
>
> Create a type that takes an object and makes it and all deeply nested objects in it unique, while preserving the string and numeric keys of all objects, and the values of all properties on these keys.
>
> The original type and the resulting unique type must be mutually assignable, but not identical. 

```typescript
type DeepObjectToUniq<O extends object> = any

/* _____________ Test Cases _____________ */
import type { Equal, IsFalse, IsTrue } from '@type-challenges/utils'

type Quz = { quz: 4 }

type Foo = { foo: 2; baz: Quz; bar: Quz }
type Bar = { foo: 2; baz: Quz; bar: Quz & { quzz?: 0 } }

type UniqQuz = DeepObjectToUniq<Quz>
type UniqFoo = DeepObjectToUniq<Foo>
type UniqBar = DeepObjectToUniq<Bar>

declare let foo: Foo
declare let uniqFoo: UniqFoo

uniqFoo = foo
foo = uniqFoo

type cases = [
  IsFalse<Equal<UniqQuz, Quz>>,
  IsFalse<Equal<UniqFoo, Foo>>,
  IsTrue<Equal<UniqFoo['foo'], Foo['foo']>>,
  IsTrue<Equal<UniqFoo['bar']['quz'], Foo['bar']['quz']>>,
  IsFalse<Equal<UniqQuz, UniqFoo['baz']>>,
  IsFalse<Equal<UniqFoo['bar'], UniqFoo['baz']>>,
  IsFalse<Equal<UniqBar['baz'], UniqFoo['baz']>>,
  IsTrue<Equal<keyof UniqBar['baz'], keyof UniqFoo['baz']>>,
  IsTrue<Equal<keyof Foo, keyof UniqFoo & string>>,
]
```

这题我是抄答案的：

```typescript
type DeepObjectToUniq<O extends object, U extends readonly any[] = [O]> = {
  [K in keyof O]: O[K] extends object
    ? DeepObjectToUniq<O[K], [...U, K]>
    : O[K]
} & { [K in symbol]: U }
```

在对象中，它可以有 Symbol 属性，值可以为任意值：

```typescript
const a: { foo: 1 } = {
  foo: 1,
  [Symbol()]: '' // 任意值都可以
}
```

那么如何在嵌套的对象里面保证所有的对象都具有唯一性呢，在解题中的做法是把原对象和当前 Key 组成的数组作为值。如果我们单纯地使用当前 Key 作为值是不行的，因为它们的值可能不一样。

### Length of String

> Implement a type `LengthOfString<S>` that calculates the length of the template string (as in [298 - Length of String](https://tsch.js.org/298)):

```typescript
type LengthOfString<S extends string> = number

/* _____________ Test Cases _____________ */
import type { Equal, IsTrue } from '@type-challenges/utils'

type cases = [
  IsTrue<Equal<LengthOfString<''>, 0>>,
  IsTrue<Equal<LengthOfString<'1'>, 1>>,
  IsTrue<Equal<LengthOfString<'12'>, 2>>,
  IsTrue<Equal<LengthOfString<'123'>, 3>>,
  IsTrue<Equal<LengthOfString<'1234'>, 4>>,
  IsTrue<Equal<LengthOfString<'12345'>, 5>>,
  IsTrue<Equal<LengthOfString<'123456'>, 6>>,
  IsTrue<Equal<LengthOfString<'1234567'>, 7>>,
  IsTrue<Equal<LengthOfString<'12345678'>, 8>>,
  IsTrue<Equal<LengthOfString<'123456789'>, 9>>,
  IsTrue<Equal<LengthOfString<'1234567890'>, 10>>,
  IsTrue<Equal<LengthOfString<'12345678901'>, 11>>,
  IsTrue<Equal<LengthOfString<'123456789012'>, 12>>,
  IsTrue<Equal<LengthOfString<'1234567890123'>, 13>>,
  IsTrue<Equal<LengthOfString<'12345678901234'>, 14>>,
  IsTrue<Equal<LengthOfString<'123456789012345'>, 15>>,
  IsTrue<Equal<LengthOfString<'1234567890123456'>, 16>>,
  IsTrue<Equal<LengthOfString<'12345678901234567'>, 17>>,
  IsTrue<Equal<LengthOfString<'123456789012345678'>, 18>>,
  IsTrue<Equal<LengthOfString<'1234567890123456789'>, 19>>,
  IsTrue<Equal<LengthOfString<'12345678901234567890'>, 20>>,
  IsTrue<Equal<LengthOfString<'123456789012345678901'>, 21>>,
  IsTrue<Equal<LengthOfString<'1234567890123456789012'>, 22>>,
  IsTrue<Equal<LengthOfString<'12345678901234567890123'>, 23>>,
  IsTrue<Equal<LengthOfString<'aaaaaaaaaaaaggggggggggggggggggggkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>, 272>>,
]
```

获取字符串的长度，这题还是比较简单的，但我不知道它为什么作为困难题出现在这里：

```typescript
type LengthOfString<S extends string, Result extends 0[] = []> = S extends `${infer F}${infer R}`
  ? LengthOfString<R, [...Result, 0]>
  : Result['length']
```

### Union to Tuple

> Implement a type, `UnionToTuple`, that converts a union to a tuple.
>
> As we know, union is an unordered structure, but tuple is an ordered, which implies that we are not supposed to preassume any order will be preserved between terms of one union, when unions are created or transformed. 
>
> Hence in this challenge, **any permutation of the elements in the output tuple is acceptable**.
>
> Your type should resolve to one of the following two types, but ***NOT*** a union of them!
>   ```ts
>   UnionToTuple<1>           // [1], and correct
>   UnionToTuple<'any' | 'a'> // ['any','a'], and correct
>   ```
> or 
>   ```ts
>   UnionToTuple<'any' | 'a'> // ['a','any'], and correct
>   ```
> It shouldn't be a union of all acceptable tuples...
>   ```ts
>   UnionToTuple<'any' | 'a'> // ['a','any'] | ['any','a'], which is incorrect
>   ```
>
>
> And a union could collapes, which means some types could absorb (or be absorbed by) others and there is no way to prevent this absorption. See the following examples:
>   ```ts
>   Equal<UnionToTuple<any | 'a'>,       UnionToTuple<any>>         // will always be a true
>   Equal<UnionToTuple<unknown | 'a'>,   UnionToTuple<unknown>>     // will always be a true
>   Equal<UnionToTuple<never | 'a'>,     UnionToTuple<'a'>>         // will always be a true
>   Equal<UnionToTuple<'a' | 'a' | 'a'>, UnionToTuple<'a'>>         // will always be a true
>   ```

```typescript
type UnionToTuple<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type ExtractValuesOfTuple<T extends any[]> = T[keyof T & number]

type cases = [
  Expect<Equal<UnionToTuple<'a' | 'b'>['length'], 2>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<'a' | 'b'>>, 'a' | 'b'>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<'a'>>, 'a'>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<any>>, any>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<undefined | void | 1>>, void | 1>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<any | 1>>, any | 1>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<any | 1>>, any>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<'d' | 'f' | 1 | never>>, 'f' | 'd' | 1>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<[{ a: 1 }] | 1>>, [{ a: 1 }] | 1>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<never>>, never>>,
  Expect<Equal<ExtractValuesOfTuple<UnionToTuple<'a' | 'b' | 'c' | 1 | 2 | 'd' | 'e' | 'f' | 'g'>>, 'f' | 'e' | 1 | 2 | 'g' | 'c' | 'd' | 'a' | 'b'>>,
]
```

首先，我们需要明确在联合类型中直接取值是做不到的，所以我们需要对联合类型做一些处理，将其转为交叉类型。

为什么要转为交叉类型呢？我们看下面的例子：

```typescript
type A = 'a' & 1

type E1 = A extends 1 ? true : false // true
type E2 = A extends 'a' ? true : false // true

type B = ((arg: 'a') => void) & ((arg: 1) => void)
type E3 = B extends (arg: 'a') => void ? true : false // true
type E4 = B extends (arg: 1) => void ? true : false // true

type C = B extends (arg: infer R) => void ? R : never // 1
```

我们可以发现，在交叉类型中，我们可以把该类型中最后一个值给取出来。单独值都可以提取出来了，那么组成数组也就不是什么困难的事情了。

首先要做的是转成交叉类型，这个我们之前在 [Union to Intersection](# Union to Intersection) 就已经实现了：

```typescript
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
```

然后就是取最后一个值：

```typescript
/**
 * LastInUnion<1 | 2> = 2
 */
type LastInUnion<U> = UnionToIntersection<UnionToFunc<U>> extends (x: infer L) => void
  ? L
  : never
```

最后就是组成所需要的数组：

```typescript
type UnionToTuple<T, L = LastInUnion<T>> = [L] extends [never]
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L]
```

### String Join

> Create a type-safe string join utility which can be used like so:
>
>   ```ts
>   const hyphenJoiner = join('-')
>   const result = hyphenJoiner('a', 'b', 'c'); // = 'a-b-c'
>   ```
>
> Or alternatively:
>   ```ts
>   join('#')('a', 'b', 'c') // = 'a#b#c'
>   ```
>
> When we pass an empty delimiter (i.e '') to join, we should concat the strings as they are, i.e: 
>   ```ts
>   join('')('a', 'b', 'c') // = 'abc'
>   ```
>
> When only one item is passed, we should get back the original item (without any delimiter added):
>   ```ts
>   join('-')('a') // = 'a'
>   ```

```typescript
declare function join(delimiter: any): (...parts: any[]) => any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

// Edge cases
const noCharsOutput = join('-')()
const oneCharOutput = join('-')('a')
const noDelimiterOutput = join('')('a', 'b', 'c')

// Regular cases
const hyphenOutput = join('-')('a', 'b', 'c')
const hashOutput = join('#')('a', 'b', 'c')
const twoCharOutput = join('-')('a', 'b')
const longOutput = join('-')('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h')

type cases = [
  Expect<Equal<typeof noCharsOutput, ''>>,
  Expect<Equal<typeof oneCharOutput, 'a'>>,
  Expect<Equal<typeof noDelimiterOutput, 'abc'>>,
  Expect<Equal<typeof twoCharOutput, 'a-b'>>,
  Expect<Equal<typeof hyphenOutput, 'a-b-c'>>,
  Expect<Equal<typeof hashOutput, 'a#b#c'>>,
  Expect<Equal<typeof longOutput, 'a-b-c-d-e-f-g-h'>>,
]
```

首先，把 Join 里面的类型约束处理好：

```typescript
declare function join<T extends string>(delimiter: T): <A extends string[] = []>(...parts: A) => JoinString<T, A>
```

然后就变成了简单的数组拼接了：

```typescript
type JoinString<
  A extends string[],
  T extends string,
  Result extends string = ''
> = A extends [infer F extends string, ...infer R extends string[]]
  ? Result extends ''
    ? JoinString<R, T, F>
    : JoinString<R, T, `${Result}${T}${F}`>
  : Result
```

### DeepPick

> Implement a type DeepPick, that extends Utility types `Pick`. A type takes two arguments.

```typescript
type DeepPick = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Obj = {
  a: number
  b: string
  c: boolean
  obj: {
    d: number
    e: string
    f: boolean
    obj2: {
      g: number
      h: string
      i: boolean
    }
  }
  obj3: {
    j: number
    k: string
    l: boolean
  }
}

type cases = [
  Expect<Equal<DeepPick<Obj, ''>, unknown>>,
  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,
  Expect<Equal<DeepPick<Obj, 'a' | ''>, { a: number } & unknown>>,
  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e'>, { a: number } & { obj: { e: string } }>>,
  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e' | 'obj.obj2.i'>, { a: number } & { obj: { e: string } } & { obj: { obj2: { i: boolean } } }>>,
]
```

我们可以看到题目中出现了 `obj.e` 、`obj.obj2.i` ，很明显，这需要通过 [Typed Get](#Typed Get) 来取值：

```typescript
type Get<T, K extends string> = K extends `${infer Key}.${infer R}`
  ? Key extends keyof T
    ? Get<T[Key], R>
    : never
  : K extends keyof T
    ? T[K]
    : never
```

当然，我们需要对 Get 作一些调整，因为题中是需要一些新的对象作为值：

```typescript
type Get<T, K extends string> = K extends `${infer Key}.${infer R}`
  ? Key extends keyof T
    ? { [P in keyof T as P extends Key ? P : never]: Get<T[Key], R> }
    : never
  : K extends keyof T
    ? { [P in keyof T as P extends K ? P : never ]: T[K] }
    : never
```

然后就是结果需要转成交叉类型：

```typescript
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
```

最终组合起来即可：

```typescript
type DeepPick<T, K extends string> = UnionToIntersection<Get<T, K>>
```

### Pinia

> Create a type-level function whose types is similar to [Pinia](https://github.com/posva/pinia) library. You don't need to implement function actually, just adding types.

```typescript
declare function defineStore(store: unknown): unknown

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const store = defineStore({
  id: '',
  state: () => ({
    num: 0,
    str: '',
  }),
  getters: {
    stringifiedNum() {
      // @ts-expect-error
      this.num += 1

      return this.num.toString()
    },
    parsedNum() {
      return parseInt(this.stringifiedNum)
    },
  },
  actions: {
    init() {
      this.reset()
      this.increment()
    },
    increment(step = 1) {
      this.num += step
    },
    reset() {
      this.num = 0

      // @ts-expect-error
      this.parsedNum = 0

      return true
    },
    setNum(value: number) {
      this.num = value
    },
  },
})

// @ts-expect-error
store.nopeStateProp
// @ts-expect-error
store.nopeGetter
// @ts-expect-error
store.stringifiedNum()
store.init()
// @ts-expect-error
store.init(0)
store.increment()
store.increment(2)
// @ts-expect-error
store.setNum()
// @ts-expect-error
store.setNum('3')
store.setNum(3)
const r = store.reset()

type _tests = [
  Expect<Equal<typeof store.num, number>>,
  Expect<Equal<typeof store.str, string>>,
  Expect<Equal<typeof store.stringifiedNum, string>>,
  Expect<Equal<typeof store.parsedNum, number>>,
  Expect<Equal<typeof r, true>>,
]
```

这题需要注意的是，getters 是只读的，同时在 getters 中的 state 也是只读的：

```typescript
type StoreOptions<State, Getters, Actions> = {
  id?: string;
  state?: () => State;
  getters?: Getters & ThisType<Readonly<State> & {
    readonly [P in keyof Getters]: Getters[P] extends (...args: any) => infer R
      ? R
      : never 
  }>;
  actions?: Actions & ThisType<State & {
    readonly [P in keyof Getters]: Getters[P] extends (...args: any) => infer R
      ? R
      : never 
  } & Actions>;
}

declare function defineStore<State, Getters, Actions>(store: StoreOptions<State, Getters, Actions>): Readonly<State> & {
  readonly [P in keyof Getters]: Getters[P] extends (...args: any) => infer R
    ? R
    : never 
} & Actions
```

### Camelize

> Implement Camelize which converts object from snake_case to to camelCase

```typescript
type Camelize<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<
    Camelize<{
      some_prop: string
      prop: { another_prop: string }
      array: [
        { snake_case: string },
        { another_element: { yet_another_prop: string } },
        { yet_another_element: string },
      ]
    }>,
    {
      someProp: string
      prop: { anotherProp: string }
      array: [
        { snakeCase: string },
        { anotherElement: { yetAnotherProp: string } },
        { yetAnotherElement: string },
      ]
    }
  >>,
]
```

首先需要实现一个将字符串转小陀峰的辅助类：

```typescript
type CamelizeKey<K> = K extends `${infer F}_${infer R}`
  ? `${F}${CamelizeKey<Capitalize<R>>}`
  : K
```

然后区分 Tuple 和 Interface，逐一处理即可：

```typescript
type Camelize<T> = T extends unknown[]
  ? T extends [infer F, ...infer R]
    ? [Camelize<F>, ...Camelize<R>]
    : []
  : {
    [P in keyof T as CamelizeKey<P>]: T[P] extends object
      ? Camelize<T[P]>
      : T[P]
  }
```

### Drop String

> Drop the specified chars from a string.

```typescript
type DropString<S, R> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<DropString<'butter fly!', ''>, 'butter fly!'>>,
  Expect<Equal<DropString<'butter fly!', ' '>, 'butterfly!'>>,
  Expect<Equal<DropString<'butter fly!', 'but'>, 'er fly!'>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', 'but'>, '     e r f l y ! '>>,
  Expect<Equal<DropString<'    butter fly!        ', ' '>, 'butterfly!'>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', ' '>, 'butterfly!'>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', 'but'>, '     e r f l y ! '>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', 'tub'>, '     e r f l y ! '>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', 'b'>, '  u t t e r f l y ! '>>,
  Expect<Equal<DropString<' b u t t e r f l y ! ', 't'>, ' b u   e r f l y ! '>>,
]
```

需要一个 StringToUnion 的辅助类型：

```typescript
type StringToUnion<S extends string> = S extends `${infer F}${infer R}`
  ? F | StringToUnion<R>
  : never
```

然后就是字符串操作：

```typescript
type DropString<S, R extends string, U = StringToUnion<R>> = S extends `${infer F}${infer Rest}`
  ? F extends U
    ? DropString<Rest, R, U>
    : `${F}${DropString<Rest, R, U>}`
  : S
```

### Split

> The well known `split()` method splits a string into an array of substrings by looking for a separator, and returns the new array. The goal of this challenge is to split a string, by using a separator, but in the type system!

```typescript
type Split<S extends string, SEP extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Split<'Hi! How are you?', 'z'>, ['Hi! How are you?']>>,
  Expect<Equal<Split<'Hi! How are you?', ' '>, ['Hi!', 'How', 'are', 'you?']>>,
  Expect<Equal<Split<'Hi! How are you?', ''>, ['H', 'i', '!', ' ', 'H', 'o', 'w', ' ', 'a', 'r', 'e', ' ', 'y', 'o', 'u', '?']>>,
  Expect<Equal<Split<'', ''>, []>>,
  Expect<Equal<Split<'', 'z'>, ['']>>,
  Expect<Equal<Split<string, 'whatever'>, string[]>>,
]
```

字符串分隔，也是比较简单的操作：

```typescript
type Split<S extends string, SEP extends string> = SEP extends ''
  ? S extends `${infer F}${infer R}`
    ? [F, ...Split<R, SEP>]
    : []
  : SEP extends S
    ? S[]
    : S extends `${infer F}${SEP}${infer R}`
      ? [F, ...Split<R, SEP>]
      : [S]
```

### ClassPublicKeys

> Implement the generic `ClassPublicKeys<T>` which returns all public keys of a class.

```typescript
type ClassPublicKeys = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

class A {
  public str: string
  protected num: number
  private bool: boolean
  constructor() {
    this.str = 'naive'
    this.num = 19260917
    this.bool = true
  }

  getNum() {
    return Math.random()
  }
}

type cases = [
  Expect<Equal<ClassPublicKeys<A>, 'str' | 'getNum'>>,
]
```

只需要 keyof 即可：

```typescript
type ClassPublicKeys<T> = keyof T
```

### IsRequiredKey

> Implement a generic ```IsRequiredKey<T, K>```  that return whether ```K``` are required keys of ```T``` .

```typescript
type IsRequiredKey<T, K extends keyof T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, 'a'>, true>>,
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, 'b'>, false>>,
  Expect<Equal<IsRequiredKey<{ a: number; b?: string }, 'b' | 'a'>, false>>,
]
```

只需要利用 [Required Keys](#Required Keys) 的知识即可：

```typescript
type RequiredKeys<T> = keyof {
  [P in keyof T as Omit<T, P> extends T ? never : P]: T[P]
}

type IsRequiredKey<T, K extends keyof T> = Equal<RequiredKeys<T>, K>
```

### ObjectFromEntries

> Implement the type version of ```Object.fromEntries```

```typescript
type ObjectFromEntries<T> = any

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
```

我的想法很简单，先把联合类型转成二维数组，然后就是普通的数组操作收集结果即可：

```typescript
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
```

### IsPalindrome

> Implement type ```IsPalindrome<T>``` to check whether  a string or number is palindrome.

```typescript
type IsPalindrome<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsPalindrome<'abc'>, false>>,
  Expect<Equal<IsPalindrome<'b'>, true>>,
  Expect<Equal<IsPalindrome<'abca'>, false>>,
  Expect<Equal<IsPalindrome<'abcba'>, true>>,
  Expect<Equal<IsPalindrome<121>, true>>,
  Expect<Equal<IsPalindrome<19260817>, false>>,
]
```

首先我们需要把数字转成字符串：

```typescript
type NumberToString<N extends number | string> = `${N}` extends `${infer S}`
  ? S
  : N
```

然后就是头尾对比即可：

```typescript
type IsPalindrome<T extends number | string, S = NumberToString<T>> = S extends `${infer F}${infer R}`
  ? F extends S
    ? true
    : R extends `${infer RR}${F}`
      ? IsPalindrome<never, RR>
      : false
  : false
```

### Mutable Keys

> Implement the advanced util type MutableKeys<T>, which picks all the mutable (not readonly) keys into a union.

```typescript
type MutableKeys<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MutableKeys<{ a: number; readonly b: string }>, 'a'>>,
  Expect<Equal<MutableKeys<{ a: undefined; readonly b: undefined }>, 'a'>>,
  Expect<Equal<MutableKeys<{ a: undefined; readonly b?: undefined; c: string; d: null }>, 'a' | 'c' | 'd'>>,
  Expect<Equal<MutableKeys<{}>, never>>,
]
```

只需要在取键时拿 Readonly 包裹后的值对比即可：

```typescript
type MutableKeys<T> = keyof {
  [P in keyof T as Equal<{ [K in P]: T[K] }, Readonly<{ [K in P]: T[K] }>> extends false ? P: never]: T[P]
}
```

### Intersection

> Implement the type version of Lodash.intersection with a little difference. Intersection<T> takes an Array T containing several arrays or any type element including the union type, and returns a new union containing all intersection elements.

```typescript
type Intersection<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Intersection<[[1, 2], [2, 3], [2, 2]]>, 2>>,
  Expect<Equal<Intersection<[[1, 2, 3], [2, 3, 4], [2, 2, 3]]>, 2 | 3>>,
  Expect<Equal<Intersection<[[1, 2], [3, 4], [5, 6]]>, never>>,
  Expect<Equal<Intersection<[[1, 2, 3], [2, 3, 4], 3]>, 3>>,
  Expect<Equal<Intersection<[[1, 2, 3], 2 | 3 | 4, 2 | 3]>, 2 | 3>>,
  Expect<Equal<Intersection<[[1, 2, 3], 2, 3]>, never>>,
]
```

这题可以利用 Extract 来获取交集，不过需要注意的一点是：

```typescript
type A = Extract<1 | 2, unknown> // 1 | 2
type B = Extract<1 | 2, never> // never
type C = Extract<unknown, 1 | 2> // never
```

答案如下：

```typescript
type Intersection<T> = T extends [infer F, ...infer R]
  ? F extends unknown[]
    ? Extract<F[number], Intersection<R>>
    : Extract<F, Intersection<R>>
  : unknown
```

### Binary to Decimal

> Implement `BinaryToDecimal<S>` which takes an exact string type `S` consisting 0 and 1 and returns an exact number type corresponding with `S` when `S` is regarded as a binary.
>
> You can assume that the length of `S` is equal to or less than 8 and `S` is not empty.

```typescript
type BinaryToDecimal<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<BinaryToDecimal<'10'>, 2>>,
  Expect<Equal<BinaryToDecimal<'0011'>, 3>>,
  Expect<Equal<BinaryToDecimal<'00000000'>, 0>>,
  Expect<Equal<BinaryToDecimal<'11111111'>, 255>>,
  Expect<Equal<BinaryToDecimal<'10101010'>, 170>>,
]
```

这题还是比较简单的，我们之前实现过快速生成指定长度数组的方法：

```typescript
type NumberToArray<N extends number, Result extends 0[] = []> = Result['length'] extends N
  ? Result
  : NumberToArray<N, [...Result, 0]>

type GetTwice<T extends unknown[]> = [
  ...T, ...T
]

type BinaryToDecimal<S extends string, Result extends unknown[] = []> = S extends `${infer F extends number}${infer R}`
  ? BinaryToDecimal<R, [...GetTwice<Result>, ...NumberToArray<F>]>
  : Result['length']
```

### Object Key Paths

> Get all possible paths that could be called by [_.get](https://lodash.com/docs/4.17.15#get) (a lodash function) to get the value of an object

```typescript
type ObjectKeyPaths<T extends object> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect, ExpectExtends } from '@type-challenges/utils'

const ref = {
  count: 1,
  person: {
    name: 'cattchen',
    age: 22,
    books: ['book1', 'book2'],
    pets: [
      {
        type: 'cat',
      },
    ],
  },
}

type cases = [
  Expect<Equal<ObjectKeyPaths<{ name: string; age: number }>, 'name' | 'age'>>,
  Expect<
  Equal<
  ObjectKeyPaths<{
    refCount: number
    person: { name: string; age: number }
  }>,
  'refCount' | 'person' | 'person.name' | 'person.age'
  >
  >,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'count'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.name'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.age'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.books'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.pets'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.books.0'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.books.1'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.books[0]'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.books.[0]'>>,
  Expect<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.pets.0.type'>>,
  Expect<Equal<ExpectExtends<ObjectKeyPaths<typeof ref>, 'notExist'>, false>>,
  Expect<Equal<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.notExist'>, false>>,
  Expect<Equal<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.name.'>, false>>,
  Expect<Equal<ExpectExtends<ObjectKeyPaths<typeof ref>, '.person.name'>, false>>,
  Expect<Equal<ExpectExtends<ObjectKeyPaths<typeof ref>, 'person.pets.[0]type'>, false>>,
]
```

首先需要一个辅助类型来实现路径拼接，需要注意的是路径有 `a.b` 、`a.[0]`、`a[0]` 这几种款式：

```typescript
type GetPath<K extends PropertyKey & (string | number), Prefix extends string = ''> = [Prefix] extends [never]
  ? `${K}`
  : K extends number
    ? `${Prefix}.${K}` | `${Prefix}[${K}]` | `${Prefix}.[${K}]`
    : `${Prefix}.${K}`
```

接下来是对对象进行深度递归并取出它们的 key 作为最终结果：

```typescript
type ObjectKeyPaths<T extends object, Result extends string = never> = Result | {
  [P in keyof T & (string | number)]: T[P] extends object
    ? ObjectKeyPaths<T[P], GetPath<P, Result>>
    : GetPath<P, Result>
}[keyof T & (string | number)]
```

### Two Sum

> Given an array of integers `nums` and an integer `target`, return true if two numbers such that they add up to `target`.

```typescript
type TwoSum<T extends number[], U extends number> = any

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
```

这题需要一些辅助函数：

```typescript
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
```

然后就是调用即可：

```typescript
type TwoSum<T extends number[], U extends number> = U extends GetResult<T>[number] ? true : false
```

### ValidDate

> Implement a type `ValidDate`, which takes an input type T and returns whether T is a valid date.

```typescript
type ValidDate<T extends string> = any

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
```

这题我用了一车的辅助类型来完成：

```typescript
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
```

最终：

```typescript
type ValidDate<T extends string, A extends [number, number] = GetDateAndMonth<T>> = InRange<A[0], 0, 13> extends true
  ? A[0] extends 2
    ? InRange<A[1], 0, 29> extends true
      ? true
      : false
    : InRange<A[1], 0, 32> extends true
      ? true
      : false
  : false
```

