## hard 组

地狱难度，触之即死！！！

### Get Readonly Keys

```typescript
Implement a generic `GetReadonlyKeys<T>` that returns a union of the readonly keys of an Object.
```

```typescript
type GetReadonlyKeys<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<'title', GetReadonlyKeys<Todo1>>>,
  Expect<Equal<'title' | 'description', GetReadonlyKeys<Todo2>>>,
]

interface Todo1 {
  readonly title: string
  description: string
  completed: boolean
}

interface Todo2 {
  readonly title: string
  readonly description: string
  completed?: boolean
}
```

这是开局陷阱吗？在困难题型出现过一题类似的：

```typescript
type GetReadonlyKeys<T> = keyof {
  [P in keyof T as Equal<{ [K in P]: T[K] }, Readonly<{ [K in P]: T[K] }>> extends false ? never: P]: T[P]
}
```

### Query String Parser

> You're required to implement a type-level parser to parse URL query string into a object literal type.
>
> Some detailed requirements:
>
>   - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
>   - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
>   - When a key has only one value, that value can't be wrapped into a tuple type.
>   - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.

```typescript
type ParseQueryString = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ParseQueryString<''>, {}>>,
  Expect<Equal<ParseQueryString<'k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k2'>, { k1: true; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1'>, { k1: 'v1' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v2'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2'>, { k1: 'v1'; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2'>, { k1: ['v1', 'v2']; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2'>, { k1: 'v1'; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v1'>, { k1: 'v1' }>>,
]
```

这题就是字符串分隔题，需要注意的是两个分隔符 `& | =`，还有就是默认值为 true：

```typescript
type Format<T extends string> = T extends `${infer F}=${infer R}`
  ? { [K in F]: R }
  : { [K in T]: true }

type SplitString<T extends string> = T extends `${infer F}&${infer R}`
  ? [Format<F>, ...SplitString<R>]
  : [Format<T>]

type Merge<T extends Record<string, unknown>[], Result extends Record<string, unknown> = {}> = T extends [infer F extends Record<string, unknown>, ...infer R extends Record<string, unknown>[]]
  ? Merge<R, {
    [K in keyof Result | keyof F]: K extends keyof Result
      ? K extends keyof F
        ? Result[K] extends F[K]
          ? F[K]
          : [Result[K], F[K]]
        : Result[K]
      : K extends keyof F
        ? F[K]
        : never
  }>
  : Result

type ParseQueryString<T extends string> = T extends '' ? {} :  Merge<SplitString<T>>
```

这题我决定给自己加一个 case：

```typescript
Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2&k1=v3'>, { k1: ['v1', 'v2', 'v3']; k2: 'v2' }>>,
```

这样子就需要我们对结果做进一步的判断：

```typescript
type Format<T extends string> = T extends `${infer F}=${infer R}`
  ? { [K in F]: R }
  : { [K in T]: true }

type SplitString<T extends string> = T extends `${infer F}&${infer R}`
  ? [Format<F>, ...SplitString<R>]
  : [Format<T>]

type Includes<T, D> = T extends [infer F, infer R]
  ? Equal<F, D> extends true
    ? true
    : Includes<R, D>
  : false

type MergeValue<T, D extends string> = T extends string[]
  ? Includes<T, D> extends true
    ? T
    : [...T, D]
      : [T, D]

type Merge<T extends Record<string, unknown>[], Result extends Record<string, unknown> = {}> = T extends [infer F extends Record<string, unknown>, ...infer R extends Record<string, unknown>[]]
  ? Merge<R, {
    [K in keyof Result | keyof F]: K extends keyof Result
      ? K extends keyof F
        ? Result[K] extends F[K]
          ? F[K]
          : MergeValue<Result[K], F[K] & string>
        : Result[K]
      : K extends keyof F
        ? F[K]
        : never
  }>
  : Result

type ParseQueryString<T extends string> = T extends '' ? {} :  Merge<SplitString<T>>
```

### Slice

> Implement the JavaScript `Array.slice` function in the type system. `Slice<Arr, Start, End>` takes the three argument. The output should be a subarray of `Arr` from index `Start` to `End`. Indexes with negative numbers should be counted from reversely.

```typescript
type Slice<Arr, Start, End> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Arr = [1, 2, 3, 4, 5]

type cases = [
  // basic
  Expect<Equal<Slice<Arr, 0, 1>, [1]>>,
  Expect<Equal<Slice<Arr, 0, 0>, []>>,
  Expect<Equal<Slice<Arr, 2, 4>, [3, 4]>>,

  // optional args
  Expect<Equal<Slice<[]>, []>>,
  Expect<Equal<Slice<Arr>, Arr>>,
  Expect<Equal<Slice<Arr, 0>, Arr>>,
  Expect<Equal<Slice<Arr, 2>, [3, 4, 5]>>,

  // negative index
  Expect<Equal<Slice<Arr, 0, -1>, [1, 2, 3, 4]>>,
  Expect<Equal<Slice<Arr, -3, -1>, [3, 4]>>,

  // invalid
  Expect<Equal<Slice<Arr, 10>, []>>,
  Expect<Equal<Slice<Arr, 1, 0>, []>>,
  Expect<Equal<Slice<Arr, 10, 20>, []>>,
]
```

可以看到，cases 中出现了负值的索引，我们先把索引矫正：

```typescript
type Index = ['+', number] | ['-', number]

type FormatIndex<T extends number> = `${T}` extends `-${infer R extends number}`
  ? ['-', R]
  : ['+', T]

type NumberToTuple<T extends number, Result extends 0[] = []> = Result['length'] extends T
  ? Result
  : NumberToTuple<T, [0, ...Result]>

type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

type Minus<L extends number, M extends number> = L extends M
  ? 0
  : M extends 0
    ? L
    : Minus<MinusOne<L>, MinusOne<M>>

/**
 * CorrectIndex<-1, 5> // 4
 * CorrectIndex<1, 5> // 1
 */
type CorrectIndex<T extends number, L extends number = 0, I extends Index = FormatIndex<T>> = I[0] extends '+'
  ? I[1]
  : Minus<L, I[1]>
```

然后我们还需要一个 GT 辅助类型来判断开始的长度是否大于源数组的长度：

```typescript
type GT<T extends number, D extends number, E extends boolean = T extends D ? true : false> = E extends true ? false : T extends D
  ? true
  : T extends 0
    ? false
    : GT<MinusOne<T>, D, false>
```

最后就是逐个取值即可：

```typescript
type Slice<
  Arr extends unknown[],
  Start extends number = 0,
  End extends number = Arr['length'],
  CorrectStart extends number = CorrectIndex<Start, Arr['length']>,
  CorrectEnd extends number = CorrectIndex<End, Arr['length']>,
  Result extends unknown[] = []
> = GT<CorrectStart, Arr['length']> extends true
  ? []
  : CorrectEnd extends 0
    ? Result
    : CorrectStart extends 0
      ? Arr extends [infer F, ...infer R]
        ? Slice<R, never, never, MinusOne<CorrectStart>, MinusOne<CorrectEnd>, [...Result, F]>
        : Result
      : Arr extends [infer F, ...infer R]
        ? Slice<R, never, never, MinusOne<CorrectStart>, MinusOne<CorrectEnd>, Result>
        : never
```

### Integers Comparator

> Implement a type-level integers comparator. We've provided an enum for indicating the comparison result, like this:
>
> - If `a` is greater than `b`, type should be `Comparison.Greater`.
>
> - If `a` and `b` are equal, type should be `Comparison.Equal`.
>
> - If `a` is lower than `b`, type should be `Comparison.Lower`.
>
> **Note that `a` and `b` can be positive integers or negative integers or zero, even one is positive while another one is negative.**

```typescript
enum Comparison {
  Greater,
  Equal,
  Lower,
}

type Comparator<A extends number, B extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Comparator<5, 5>, Comparison.Equal>>,
  Expect<Equal<Comparator<5, 6>, Comparison.Lower>>,
  Expect<Equal<Comparator<5, 8>, Comparison.Lower>>,
  Expect<Equal<Comparator<5, 0>, Comparison.Greater>>,
  Expect<Equal<Comparator<-5, 0>, Comparison.Lower>>,
  Expect<Equal<Comparator<0, 0>, Comparison.Equal>>,
  Expect<Equal<Comparator<0, -5>, Comparison.Greater>>,
  Expect<Equal<Comparator<5, -3>, Comparison.Greater>>,
  Expect<Equal<Comparator<5, -7>, Comparison.Greater>>,
  Expect<Equal<Comparator<-5, -7>, Comparison.Greater>>,
  Expect<Equal<Comparator<-5, -3>, Comparison.Lower>>,
  Expect<Equal<Comparator<-25, -30>, Comparison.Greater>>,
  Expect<Equal<Comparator<15, -23>, Comparison.Greater>>,
  Expect<Equal<Comparator<40, 37>, Comparison.Greater>>,
  Expect<Equal<Comparator<-36, 36>, Comparison.Lower>>,
  Expect<Equal<Comparator<27, 27>, Comparison.Equal>>,
  Expect<Equal<Comparator<-38, -38>, Comparison.Equal>>,
]
```

当两个值都为负值时，取绝对值然后交换位置比较即可：

```typescript
enum Comparison {
  Greater,
  Equal,
  Lower,
}

type NumberToTuple<T extends number, Result extends 0[] = []> = Result['length'] extends T
  ? Result
  : NumberToTuple<T, [0, ...Result]>

type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

type GT<T extends number, D extends number, E extends boolean = T extends D ? true : false> = E extends true ? false : T extends D
  ? true
  : T extends 0
    ? false
    : GT<MinusOne<T>, D, false>

type IsNegative<T extends number> = `${T}` extends `-${infer R extends number}`
  ? true
  : false

type ABS<T extends number> = `${T}` extends `-${infer R extends number}`
  ? R
  : T

type Comparator<A extends number, B extends number> = A extends B
  ? Comparison.Equal
  : IsNegative<A> extends true
    ? IsNegative<B> extends true
      ? Comparator<ABS<B>, ABS<A>>
      : Comparison.Lower
    : IsNegative<B> extends true
      ? Comparison.Greater
      : GT<A, B> extends true
        ? Comparison.Greater
        : Comparison.Lower
```

### Currying

> [Currying](https://en.wikipedia.org/wiki/Currying) is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument.
>
> But in our daily life, currying dynamic arguments is also commonly used, for example, the `Function.bind(this, [...params])` API.

```typescript
declare function DynamicParamsCurrying(fn: any): any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const curried1 = DynamicParamsCurrying((a: string, b: number, c: boolean) => true)
const curried2 = DynamicParamsCurrying((a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) => true)

const curried1Return1 = curried1('123')(123)(true)
const curried1Return2 = curried1('123', 123)(false)
const curried1Return3 = curried1('123', 123, true)

const curried2Return1 = curried2('123')(123)(true)(false)(true)('123')(false)
const curried2Return2 = curried2('123', 123)(true, false)(true, '123')(false)
const curried2Return3 = curried2('123', 123)(true)(false)(true, '123', false)
const curried2Return4 = curried2('123', 123, true)(false, true, '123')(false)
const curried2Return5 = curried2('123', 123, true)(false)(true)('123')(false)
const curried2Return6 = curried2('123', 123, true, false)(true, '123', false)
const curried2Return7 = curried2('123', 123, true, false, true)('123', false)
const curried2Return8 = curried2('123', 123, true, false, true)('123')(false)
const curried2Return9 = curried2('123', 123, true, false, true, '123')(false)
const curried2Return10 = curried2('123', 123, true, false, true, '123', false)

type cases = [
  Expect<Equal< typeof curried1Return1, boolean>>,
  Expect<Equal< typeof curried1Return2, boolean>>,
  Expect<Equal< typeof curried1Return3, boolean>>,

  Expect<Equal< typeof curried2Return1, boolean>>,
  Expect<Equal< typeof curried2Return2, boolean>>,
  Expect<Equal< typeof curried2Return3, boolean>>,
  Expect<Equal< typeof curried2Return4, boolean>>,
  Expect<Equal< typeof curried2Return5, boolean>>,
  Expect<Equal< typeof curried2Return6, boolean>>,
  Expect<Equal< typeof curried2Return7, boolean>>,
  Expect<Equal< typeof curried2Return8, boolean>>,
  Expect<Equal< typeof curried2Return9, boolean>>,
  Expect<Equal< typeof curried2Return10, boolean>>,
]
```

进阶版的柯里化，每一个函数允许的传参数目不同，这比之前定参的柯里化实现要难一点：

```typescript
declare function DynamicParamsCurrying<
  T extends unknown[],
  R
>(fn: (...args: T) => R): T extends []
  ? R
  : <D extends unknown[]>(...args: D) => T extends [...D, ...infer Rest]
    ? ReturnType<typeof DynamicParamsCurrying<Rest, R>>
    : never
```

### Sum

>  Implement a type `Sum<A, B>` that summing two non-negative integers and returns the sum as a string. Numbers can be specified as a string, number, or bigint.

```typescript
type Sum<A extends string | number | bigint, B extends string | number | bigint> = string

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Sum<2, 3>, '5'>>,
  Expect<Equal<Sum<'13', '21'>, '34'>>,
  Expect<Equal<Sum<'328', 7>, '335'>>,
  Expect<Equal<Sum<1_000_000_000_000n, '123'>, '1000000000123'>>,
  Expect<Equal<Sum<9999, 1>, '10000'>>,
  Expect<Equal<Sum<4325234, '39532'>, '4364766'>>,
  Expect<Equal<Sum<728, 0>, '728'>>,
  Expect<Equal<Sum<'0', 213>, '213'>>,
  Expect<Equal<Sum<0, '0'>, '0'>>,
]
```

众知周知，加法运算计算过程如下：

```markdown
  12345
 +67890
 ------
 =80235
```

所以，我们这题的运算也是如此处理：

```typescript
type ParamType = string | number | bigint

type NumberToTuple<T extends number, R extends 0[] = []> = R['length'] extends T
  ? R
  : NumberToTuple<T, [0, ...R]>

/**
 * Split<12> // [1, 2]
 * Split<'1'> // [1]
 */
type Split<S extends ParamType, Result extends number[] = []> = `${S}` extends `${infer F extends number}${infer R}`
  ? Split<R, [...Result, F]>
  : Result

/**
 * SingleSum<1, 2> // 3
 * SingleSum<4, 8> // 12
 */
type SingleSum<T extends number, D extends number> = [...NumberToTuple<T>, ...NumberToTuple<D>]['length'] & number

/**
 * GetRest<[1, 2, 3]> // [1, 2]
 * GetRest<[1]> // []
 */
type GetRest<T> = T extends [...infer R, infer L extends number]
  ? R
  : []

type Pop<T> = T extends [...infer R, infer L extends number]
  ? L
  : 0

/**
 * GetDigit<12> // 2
 * GetDigit<1> // 1
 */
type GetDigit<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? R
  : T

/**
 * GetTens<12> // 1
 * GetTens<1> // 0
 */
type GetTens<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? F
  : 0

type ArraySum<
  A extends number[] = [],
  B extends number[] = [],
  C extends number = 0, // 进位
  Result extends string = '',
  AL extends number = Pop<A>,
  BL extends number = Pop<B>
> = A extends []
  ? B extends []
    ? C extends 0 ? Result : `${C}${Result}`
    : ArraySum<[], GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
  : B extends []
    ? ArraySum<GetRest<A>, [], GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    : ArraySum<GetRest<A>, GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    

type Sum<
  A extends ParamType,
  B extends ParamType,
> = ArraySum<Split<A>, Split<B>>
```

### Multiply

> **This challenge continues from [476 - Sum](https://tsch.js.org/476), it is recommended that you finish that one first, and modify your code based on it to start this challenge.**
>
>  Implement a type `Multiply<A, B>` that multiplies two non-negative integers and returns their product as a string. Numbers can be specified as string, number, or bigint.

```typescript
type Multiply<A extends string | number | bigint, B extends string | number | bigint> = string

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Multiply<2, 3>, '6'>>,
  Expect<Equal<Multiply<3, '5'>, '15'>>,
  Expect<Equal<Multiply<'4', 10>, '40'>>,
  Expect<Equal<Multiply<0, 16>, '0'>>,
  Expect<Equal<Multiply<'13', '21'>, '273'>>,
  Expect<Equal<Multiply<'43423', 321543n>, '13962361689'>>,
  Expect<Equal<Multiply<9999, 1>, '9999'>>,
  Expect<Equal<Multiply<4325234, '39532'>, '170985150488'>>,
  Expect<Equal<Multiply<100_000n, '1'>, '100000'>>,
  Expect<Equal<Multiply<259, 9125385>, '2363474715'>>,
  Expect<Equal<Multiply<9, 99>, '891'>>,
  Expect<Equal<Multiply<315, '100'>, '31500'>>,
  Expect<Equal<Multiply<11n, 13n>, '143'>>,
  Expect<Equal<Multiply<728, 0>, '0'>>,
  Expect<Equal<Multiply<'0', 213>, '0'>>,
  Expect<Equal<Multiply<0, '0'>, '0'>>,
]
```

这一题是乘法运算：

```typescript
type ParamType = string | number | bigint

type NumberToTuple<T extends number, R extends 0[] = []> = R['length'] extends T
  ? R
  : NumberToTuple<T, [0, ...R]>

/**
 * Split<12> // [1, 2]
 * Split<'1'> // [1]
 */
type Split<S extends ParamType, Result extends number[] = []> = `${S}` extends `${infer F extends number}${infer R}`
  ? Split<R, [...Result, F]>
  : Result

/**
 * SingleSum<1, 2> // 3
 * SingleSum<4, 8> // 12
 */
type SingleSum<T extends number, D extends number> = [...NumberToTuple<T>, ...NumberToTuple<D>]['length'] & number

/**
 * GetRest<[1, 2, 3]> // [1, 2]
 * GetRest<[1]> // []
 */
type GetRest<T> = T extends [...infer R, infer L extends number]
  ? R
  : []

type Pop<T> = T extends [...infer R, infer L extends number]
  ? L
  : 0

/**
 * GetDigit<12> // 2
 * GetDigit<1> // 1
 */
type GetDigit<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? R
  : T

/**
 * GetTens<12> // 1
 * GetTens<1> // 0
 */
type GetTens<T extends number> = `${T}` extends `${infer F extends number}${infer R extends number}`
  ? F
  : 0

type ArraySum<
  A extends number[] = [],
  B extends number[] = [],
  C extends number = 0, // 4 + 8 => 12 => 1
  Result extends string = '', // 4 + 8 => 12 => 2 + Result
  AL extends number = Pop<A>,
  BL extends number = Pop<B>
> = A extends []
  ? B extends []
    ? C extends 0 ? Result : `${C}${Result}`
    : ArraySum<[], GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
  : B extends []
    ? ArraySum<GetRest<A>, [], GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    : ArraySum<GetRest<A>, GetRest<B>, GetTens<SingleSum<SingleSum<AL, BL>, C>>, `${GetDigit<SingleSum<SingleSum<AL, BL>, C>>}${Result}`>
    

type Sum<
  A extends ParamType,
  B extends ParamType,
> = ArraySum<Split<A>, Split<B>>


type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

/**
 * SingleMultiply<1, 2> // 2
 * SingleMultiply<4, 8> // 32
 * SingleMultiply<0, 1> // 0
 */
 type SingleMultiply<
  T extends number,
  D extends number,
  C extends number = D,
  Result extends unknown[] = []
> = D extends 0
 ? 0
 : C extends 0
   ? Result['length'] & number
   : SingleMultiply<T, D, MinusOne<C>, [
     ...NumberToTuple<T>,
     ...Result
   ]>

/**
 * ArrayMul<[3, 2, 1], 1> // '321'
 * ArrayMul<[1, 2], 2> // '24'
 */
type ArrayMul<
  A extends number[],
  B extends number,
  C extends number = 0,
  Result extends string = '',
  AL extends number = Pop<A>
> = A extends []
  ? C extends 0 ? Result : `${C}${Result}`
  : ArrayMul<GetRest<A>, B, GetTens<SingleSum<C, SingleMultiply<AL, B>>>, `${GetDigit<SingleSum<C, SingleMultiply<AL, B>>>}${Result}`>

type EachSum<T, Result extends string = ''> = T extends [infer F extends string, ...infer R]
   ? EachSum<R, Sum<F, Result>>
   : Result

type Multiply<
  A extends ParamType,
  B extends ParamType,
  SA extends number[] = Split<A>,
  SB extends number[] = Split<B>,
  Result extends string[] = [],
  Default extends string = '',
  SBL extends number = Pop<SB>
> = Equal<`${A}`, '0'> extends true
  ? '0'
  : Equal<`${B}`, '0'> extends true
    ? '0'
    : SB extends []
      ? EachSum<Result>
      : Multiply<never, never, SA, GetRest<SB>, [ArrayMul<SA, SBL, 0, Default>, ...Result], `0${Default}`>

// 123 * 321
// 123 * 1 => 123
// 123 * 2 * 10 => 2460
// 123 * 3 * 100 => 36900
// => 123 + 2460 + 36900
```

### Tag（未解决）

> Despite the structural typing system in TypeScript, it is sometimes convenient to mark some types with tags, and so that these tags do not interfere with the ability to assign values  of these types to each other.

```typescript
type GetTags<B> = any

type Tag<B, T extends string> = any

type UnTag<B> = any

type HasTag<B, T extends string> = any
type HasTags<B, T extends readonly string[]> = any
type HasExactTags<B, T extends readonly string[]> = any


/* _____________ Test Cases _____________ */
import type { Equal, Expect, IsTrue } from '@type-challenges/utils'

/**
 * Tests of assignable of tagged variables.
 */
interface I {
  foo: string
}

declare let x0: I
declare let x1: Tag<I, 'a'>
declare let x2: Tag<I, 'b'>
declare let x3: Tag<Tag<I, 'a'>, 'b'>
declare let x4: Tag<Tag<I, 'b'>, 'a'>
declare let x5: Tag<Tag<I, 'c'>, 'a'>
declare let x6: Tag<Tag<I, 'c'>, 'b'>
declare let x7: UnTag<Tag<Tag<I, 'c'>, 'b'>>

x0 = x1 = x0 = x2 = x0 = x3 = x0 = x4 = x0 = x5 = x0 = x6 = x0 = x7 = x0
x1 = x2 = x1 = x3 = x1 = x4 = x1 = x5 = x1 = x6 = x1 = x7 = x1
x2 = x3 = x2 = x4 = x2 = x5 = x2 = x6 = x2 = x6 = x2
x3 = x4 = x4 = x5 = x3 = x6 = x3 = x7 = x3
x4 = x5 = x5 = x6 = x4 = x7 = x4
x5 = x6 = x5 = x7 = x5
x6 = x7 = x6

declare let y0: string
declare let y1: Tag<string, 'a'>
declare let y2: Tag<string, 'b'>
declare let y3: Tag<Tag<string, 'a'>, 'b'>
declare let y4: Tag<Tag<string, 'b'>, 'a'>
declare let y5: Tag<Tag<string, 'c'>, 'a'>
declare let y6: Tag<Tag<string, 'c'>, 'b'>
declare let y7: UnTag<Tag<Tag<string, 'c'>, 'b'>>

y0 = y1 = y0 = y2 = y0 = y3 = y0 = y4 = y0 = y5 = y0 = y6 = y0 = y7 = y0
y1 = y2 = y1 = y3 = y1 = y4 = y1 = y5 = y1 = y6 = y1 = y7 = y1
y2 = y3 = y2 = y4 = y2 = y5 = y2 = y6 = y2 = y7 = y2
y3 = y4 = y4 = y5 = y3 = y6 = y3 = y7 = y3
y4 = y5 = y5 = y6 = y4 = y7 = y4
y5 = y6 = y5 = y7 = y5
y6 = y7 = y6

// @ts-expect-error
x0 = y0
// @ts-expect-error
x1 = y1
// @ts-expect-error
x2 = y2
// @ts-expect-error
x3 = y3
// @ts-expect-error
x4 = y4
// @ts-expect-error
x5 = y5
// @ts-expect-error
x6 = y6
// @ts-expect-error
x7 = y7

declare const UNIQUE_SYMBOL: unique symbol
type US = typeof UNIQUE_SYMBOL

/**
 * Tests of API (Tag, GetTags, Untag, HasTag, HasTags, HasExactTags).
 */
type cases = [
  /**
   * Tag.
   */
  IsTrue<Equal<Tag<null, 'foo'>, null>>,
  IsTrue<Equal<Tag<undefined, 'foo'>, undefined>>,
  IsTrue<Equal<'x', keyof Tag<{ x: 0 }, 'foo'> & string>>,

  /**
   * GetTags.
   */
  IsTrue<Equal<GetTags<null>, []>>,
  IsTrue<Equal<GetTags<any>, []>>,
  IsTrue<Equal<GetTags<undefined>, []>>,
  IsTrue<Equal<GetTags<Tag<any, 'foo'>>, ['foo']>>,
  IsTrue<Equal<GetTags<Tag<null | 1, 'foo'>>, ['foo']>>,
  IsTrue<Equal<GetTags<Tag<0, 'foo'> | 1>, []>>,
  IsTrue<Equal<GetTags<Tag<{}, 'foo'> | Tag<1, 'foo'>>, ['foo']>>,
  IsTrue<Equal<GetTags<Tag<string, 'foo'>>, ['foo']>>,
  IsTrue<Equal<GetTags<Tag<never, 'foo'>>, ['foo']>>,
  IsTrue<Equal<GetTags<Tag<Tag<string, 'foo'>, 'bar'>>, ['foo', 'bar']>>,
  IsTrue<
  Equal<
  GetTags<Tag<Tag<Tag<{}, 'foo'>, 'bar'>, 'baz'>>,
  ['foo', 'bar', 'baz']
  >
  >,

  /**
   * UnTag.
   */
  IsTrue<Equal<UnTag<null>, null>>,
  IsTrue<Equal<UnTag<undefined>, undefined>>,
  IsTrue<Equal<UnTag<Tag<{}, 'foo'>>, {}>>,
  IsTrue<Equal<UnTag<Tag<Tag<{ x: 0 }, 'foo'>, 'bar'>>, { x: 0 }>>,
  IsTrue<Equal<keyof UnTag<Tag<Tag<number, 'foo'>, 'bar'>>, keyof number>>,

  /**
   * HasTag.
   */
  Expect<Equal<HasTag<null, 'foo'>, false>>,
  Expect<Equal<HasTag<undefined, 'foo'>, false>>,
  Expect<Equal<HasTag<Tag<any, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<1, 'foo'> | {}, 'foo'>, false>>,
  Expect<Equal<HasTag<Tag<{}, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<0, 'foo'> | Tag<1, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<0, 'foo'> | Tag<1, 'bar'>, 'foo'>, false>>,
  Expect<Equal<HasTag<Tag<Tag<{}, 'foo'>, 'bar'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<Tag<symbol, 'bar'>, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<Tag<{}, 'bar'>, 'baz'>, 'foo'>, false>>,
  Expect<Equal<HasTag<Tag<true, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<null, 'foo'>, 'foo'>, false>>,
  Expect<Equal<HasTag<Tag<Tag<undefined, 'foo'>, 'bar'>, 'bar'>, false>>,
  Expect<Equal<HasTag<Tag<Tag<false, 'foo'>, 'bar'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<Tag<never, 'bar'>, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<{}, 'foo'>, 'foo'>, true>>,
  Expect<Equal<HasTag<Tag<{}, 'foo'>, 'bar'>, false>>,
  Expect<Equal<HasTag<{}, 'foo'>, false>>,

  /**
   * HasTags.
   */
  Expect<Equal<HasTags<null, ['foo']>, false>>,
  Expect<Equal<HasTags<undefined, ['foo']>, false>>,
  Expect<Equal<HasTags<Tag<any, 'bar'>, ['foo']>, false>>,
  Expect<Equal<HasTags<Tag<{}, 'bar'>, ['foo']>, false>>,
  Expect<Equal<HasTags<Tag<{}, 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasTags<Tag<any, 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasTags<Tag<{} | undefined, 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<string, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<3n, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<{}, 'bar'>, 'foo'>, ['foo', 'bar']>, false>>,
  Expect<Equal<HasTags<Tag<Tag<Tag<{}, 'baz'>, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<Tag<symbol, 'baz'>, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<Tag<{}, 'foo'>, 'bar'>, 'baz'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<Tag<0, 'foo'>, 'bar'>, 'baz'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasTags<Tag<Tag<Tag<{}, 'foo'>, 'baz'>, 'bar'>, ['foo', 'bar']>, false>>,
  Expect<Equal<HasTags<Tag<Tag<unknown, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,

  /**
   * HasExactTags.
   */
  Expect<Equal<HasExactTags<0, []>, true>>,
  Expect<Equal<HasExactTags<null, []>, true>>,
  Expect<Equal<HasExactTags<undefined, []>, true>>,
  Expect<Equal<HasExactTags<Tag<number, 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasExactTags<Tag<any, 'foo'>, ['bar']>, false>>,
  Expect<Equal<HasExactTags<Tag<Tag<any, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
  Expect<Equal<HasExactTags<Tag<'', 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasExactTags<Tag<US, 'foo'>, ['foo']>, true>>,
  Expect<Equal<HasExactTags<Tag<{}, 'foo'>, ['bar']>, false>>,
  Expect<Equal<HasExactTags<Tag<Tag<Tag<{}, 'foo'>, 'bar'>, 'baz'>, ['foo', 'bar']>, false>>,
  Expect<Equal<HasExactTags<Tag<Tag<Tag<{}, 'foo'>, 'bar'>, 'baz'>, ['foo', 'bar', 'baz']>, true>>,
  Expect<Equal<HasExactTags<Tag<Tag<void, 'foo'>, 'bar'>, ['foo', 'bar']>, true>>,
]
```

### Inclusive Range

> Recursion depth in type system is one of the limitations of TypeScript, the number is around 45. 
>
> *We need to go deeper*. And we could go deeper.
>
> In this challenge, you are given one lower boundary and one higher boundary, by which a range of natural numbers is inclusively sliced. You should develop a technique that enables you to do recursion deeper than the limitation, since both boundary vary from 0 to 200. 
>
> Note that when `Lower > Higher`, output an empty tuple.

```typescript
type InclusiveRange<Lower extends number, Higher extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<InclusiveRange<200, 1>, []>>,
  Expect<Equal<InclusiveRange<10, 5>, []>>,
  Expect<Equal<InclusiveRange<5, 5>, [5]>>,
  Expect<Equal<InclusiveRange<0, 10>, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]>>,
  Expect<Equal<InclusiveRange<1, 200>, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200]>>,
  Expect<Equal<InclusiveRange<22, 146>, [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146]>>,
]
```

这题，应该是之前就已经做过了：

```typescript
type NumberToTuple<T extends number, Result extends 0[] = []> = Result['length'] extends T
  ? Result
  : NumberToTuple<T, [0, ...Result]>

type MinusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = Result extends [infer F, ...infer R]
  ? R['length']
  : 0

type PlusOne<T extends number, Result extends 0[] = NumberToTuple<T>> = [...Result, 0]['length'] & number

type GT<A extends number, B extends number> = A extends B
  ? false
  : A extends 0
    ? false
    : B extends 0
      ? true
      : GT<MinusOne<A>, MinusOne<B>>

type InclusiveRange<
  Lower extends number,
  Higher extends number,
  Result extends number[] = []
> = GT<Lower, Higher> extends true
  ? Result
  : InclusiveRange<PlusOne<Lower>, Higher, [...Result, Lower]>
```

### Sort

> In this challenge, you are required to sort natural number arrays in either ascend order or descent order.

```typescript
type Sort = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Sort<[]>, []>>,
  Expect<Equal<Sort<[1]>, [1]>>,
  Expect<Equal<Sort<[2, 1]>, [1, 2]>>,
  Expect<Equal<Sort<[0, 0, 0]>, [0, 0, 0]>>,
  Expect<Equal<Sort<[1, 2, 3]>, [1, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 1]>, [1, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 1, 2]>, [1, 2, 2, 3]>>,
  Expect<Equal<Sort<[3, 2, 0, 1, 0, 0, 0]>, [0, 0, 0, 0, 1, 2, 3]>>,
  Expect<Equal<Sort<[2, 4, 7, 6, 6, 6, 5, 8, 9]>, [2, 4, 5, 6, 6, 6, 7, 8, 9]>>,
  Expect<Equal<Sort<[1, 1, 2, 1, 1, 1, 1, 1, 1]>, [1, 1, 1, 1, 1, 1, 1, 1, 2]>>,
  Expect<Equal<Sort<[], true>, []>>,
  Expect<Equal<Sort<[1], true>, [1]>>,
  Expect<Equal<Sort<[2, 1], true>, [2, 1]>>,
  Expect<Equal<Sort<[0, 0, 0], true>, [0, 0, 0]>>,
  Expect<Equal<Sort<[1, 2, 3], true>, [3, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 1], true>, [3, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 1, 2], true>, [3, 2, 2, 1]>>,
  Expect<Equal<Sort<[3, 2, 0, 1, 0, 0, 0], true>, [3, 2, 1, 0, 0, 0, 0]>>,
  Expect<Equal<Sort<[2, 4, 7, 6, 6, 6, 5, 8, 9], true>, [9, 8, 7, 6, 6, 6, 5, 4, 2]>>,
```

逐个取值排列即可：

```typescript
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

type SingleSort<
  T extends number,
  Source extends unknown[] = [],
  Desc extends boolean = false,
  Result extends number[] = []
> = Source extends [infer F extends number, ...infer R]
  ? Equal<T, F> extends true
    ? [...Result, T, F, ...R]
    : GT<T, F> extends true
      ? Desc extends true
        ? [...Result, T, F, ...R]
        : SingleSort<T, R, Desc, [...Result, F]>
      : Desc extends true
        ? SingleSort<T, R, Desc, [...Result, F]>
        : [...Result, T, F, ...R]
  : [...Result, T]

type Sort<
  T extends unknown[],
  Desc extends boolean = false,
  Result extends number[] = []
> = T extends [infer F extends number, ...infer R]
  ? Sort<R, Desc, SingleSort<F, Result, Desc>>
  : Result
```

### DistributeUnions（未解决）

> Implement a type `Distribute Unions`, that turns a type of data structure containing union types into a union of
>
> all possible types of permitted data structures that don't contain any union. The data structure can be any
>
> combination of objects and tuples on any level of nesting.

```typescript
type DistributeUnions<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  // Already distributed unions should stay the same:
  Expect<Equal<DistributeUnions<1>, 1>>,
  Expect<Equal<DistributeUnions<string>, string>>,
  Expect<Equal<DistributeUnions<1 | 2>, 1 | 2>>,
  Expect<Equal<DistributeUnions<'b' | { type: 'a' } | [1]>, 'b' | { type: 'a' } | [1]>>,
  // tuples:
  Expect<Equal<DistributeUnions<[1 | 2, 3]>, [1, 3] | [2, 3]>>,
  Expect<Equal<DistributeUnions<[1 | 2, 'a' | 'b']>, [1, 'a'] | [1, 'b'] | [2, 'a'] | [2, 'b']>>,
  Expect<
  Equal<
  DistributeUnions<[1 | 2, 'a' | 'b', false | true]>,
  | [1, 'a', false]
  | [1, 'a', true]
  | [1, 'b', false]
  | [1, 'b', true]
  | [2, 'a', false]
  | [2, 'a', true]
  | [2, 'b', false]
  | [2, 'b', true]
  >
  >,
  // objects
  Expect<
  Equal<
  DistributeUnions<{ x: 'a' | 'b'; y: 'c' | 'd' }>,
  { x: 'a'; y: 'c' } | { x: 'a'; y: 'd' } | { x: 'b'; y: 'c' } | { x: 'b'; y: 'd' }
  >
  >,
  Expect<
  Equal<
  DistributeUnions<{ type: 'a'; value: number | string } | { type: 'b'; value: boolean }>,
  | { type: 'a'; value: string }
  | { type: 'a'; value: number }
  | { type: 'b'; value: false }
  | { type: 'b'; value: true }
  >
  >,
  Expect<
  Equal<
  DistributeUnions<
  | {
    type: 'a'
    option: { kind: 'none' } | { kind: 'some'; value: 'x' | 'y' }
  }
  | { type: 'b'; msg: string }
  >,
  | { type: 'b'; msg: string }
  | { type: 'a'; option: { kind: 'none' } }
  | { type: 'a'; option: { kind: 'some'; value: 'x' } }
  | { type: 'a'; option: { kind: 'some'; value: 'y' } }
  >
  >,
  // mixed structures:
  Expect<
  Equal<
  DistributeUnions<[false | true, { value: 'a' | 'b' }, { x: { y: 2 | 3 } }]>,
  | [false, { value: 'a' }, { x: { y: 2 } }]
  | [false, { value: 'a' }, { x: { y: 3 } }]
  | [false, { value: 'b' }, { x: { y: 2 } }]
  | [false, { value: 'b' }, { x: { y: 3 } }]
  | [true, { value: 'a' }, { x: { y: 2 } }]
  | [true, { value: 'a' }, { x: { y: 3 } }]
  | [true, { value: 'b' }, { x: { y: 2 } }]
  | [true, { value: 'b' }, { x: { y: 3 } }]
  >
  >,
  Expect<
  Equal<
  DistributeUnions<17 | [10 | { value: 'a' | 'b' }, { x: { y: 2 | 3 } }]>,
  | 17
  | [10, { x: { y: 2 } }]
  | [10, { x: { y: 3 } }]
  | [{ value: 'a' }, { x: { y: 2 } }]
  | [{ value: 'a' }, { x: { y: 3 } }]
  | [{ value: 'b' }, { x: { y: 2 } }]
  | [{ value: 'b' }, { x: { y: 3 } }]
  >
  >,
]
```

### Assert Array Index（未解决）

> Sometimes we want to use the good old `for`-loop with an index to traverse the array, but in this case TypeScript does not check in any way that we are accessing the elements of the array at its real index (not exceeding the length of the array), and that we are not using an arbitrary number as an index, or index from another array (for nested loops, for traversing matrices or graphs):
>   ```ts
>   const matrix = [
>       [3, 4],
>       [5, 6],
>       [7, 8],
>   ];
>   
>   // This example contains no type errors when the noUncheckedIndexedAccess option is off.
>   for (let i = 0; i < matrix.length; i += 1) {
>       const columns: number[] = matrix[i];
>   
>       for (let j = 0; j < columns.length; j += 1) {
>           const current: number = columns[i]; // oops! i instead of j
>   
>           console.log(
>               current.toFixed(), // TypeError: Cannot read property 'toFixed' of undefined
>           );
>       }
>   }
>   ```
>
> You can enable the [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess) option (in `tsconfig.json`), but then each time you access an array element, you will need to check that this element exists, which is somewhat verbose and inconvenient, especially since in the case of such a `for`-traversal, we are sure that the index does not exceed the length of the array:
>   ```ts
>   const numbers = [5, 7];
>   
>   for (let i = 0; i < numbers.length; i += 1) {
>       const current = numbers[i];
>   
>       if (current !== undefined) {
>           console.log(current.toFixed());
>       }
>   }
>   ```
>
> Write an `assert`-function `assertArrayIndex(array, key)` that can be applied to any `array` (with an arbitrary unique string `key`, which is needed to distinguish arrays at the type level) to allow access to the elements of this array only by the index obtained from array by the special generic type `Index<typeof array>` (this functionality requires enabling the [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess) option in `tsconfig.json`):
>   ```ts
>   const numbers = [5, 7];
>   
>   assertArrayIndex(numbers, 'numbers');
>   
>   for (let i = 0 as Index<typeof numbers>; i < numbers.length; i += 1) {
>       console.log(numbers[i].toFixed());
>   }
>   ```
>
> When accessing by such an index, it must be guaranteed that an element in the array exists, and when accessing an array by any other indices, there is no such guarantee (the element may not exist):
>   ```ts
>   const matrix = [
>       [3, 4],
>       [5, 6],
>       [7, 8],
>   ];
>   
>   assertArrayIndex(matrix, 'rows');
>   
>   let sum = 0;
>   
>   for (let i = 0 as Index<typeof matrix>; i < matrix.length; i += 1) {
>       const columns: number[] = matrix[i];
>   
>       // @ts-expect-error: number | undefined in not assignable to number
>       const x: number[] = matrix[0];
>   
>       assertArrayIndex(columns, 'columns');
>   
>       for (let j = 0 as Index<typeof columns>; j < columns.length; j += 1) {
>           sum += columns[j];
>   
>           // @ts-expect-error: number | undefined in not assignable to number
>           const y: number = columns[i];
>   
>           // @ts-expect-error: number | undefined in not assignable to number
>           const z: number = columns[0];
>   
>           // @ts-expect-error: number[] | undefined in not assignable to number[]
>           const u: number[] = matrix[j];
>       }
>   }
>   ```
>
> The `assertArrayIndex` function cannot be called on tuples (since the accessing the elements is already well typed in them):
>   ```ts
>   const tuple = [5, 7] as const;
>   
>   // @ts-expect-error
>   assertArrayIndex(tuple, 'tuple');
>   ```
>
> (Additional design considerations for the proposed API: [#925](https://github.com/type-challenges/type-challenges/issues/925#issuecomment-780889329).)

```typescript
function assertArrayIndex(array: readonly unknown[], key: string) {}

type Index<Array> = any


/* _____________ Test Cases _____________ */
const matrix = [
  [3, 4],
  [5, 6],
  [7, 8],
]

assertArrayIndex(matrix, 'rows')

let sum = 0

for (let i = 0 as Index<typeof matrix>; i < matrix.length; i += 1) {
  const columns: number[] = matrix[i]

  // @ts-expect-error: number | undefined in not assignable to number
  const x: number[] = matrix[0]

  assertArrayIndex(columns, 'columns')

  for (let j = 0 as Index<typeof columns>; j < columns.length; j += 1) {
    sum += columns[j]

    // @ts-expect-error: number | undefined in not assignable to number
    const y: number = columns[i]

    // @ts-expect-error: number | undefined in not assignable to number
    const z: number = columns[0]

    // @ts-expect-error: number[] | undefined in not assignable to number[]
    const u: number[] = matrix[j]
  }
}

const a: string[] = []

assertArrayIndex(a, 'a')

for (let p = 0 as Index<typeof a>; p < a.length; p += 1) {
  const value: string = a[p]

  // @ts-expect-error: string | undefined is not assignable to string
  const z: string = a[2]
}

a.push('qux')
// @ts-expect-error: number is not assignable to string
a.push(3)

for (const value of a) {
  const other: string = value
}

const b: number[] = []

assertArrayIndex(b, 'b')

for (let p = 0 as Index<typeof a>; p < b.length; p += 1) {
  // @ts-expect-error: number | undefined is not assignable to string
  const value: string = b[p]
}

const c: string[] = []

assertArrayIndex(c, 'c')

for (let p = 0; p < c.length; p += 1) {
  // @ts-expect-error: string | undefined is not assignable to string
  let value: string = c[p]

  // @ts-expect-error: string | undefined is not assignable to string
  value = c[0 as Index<typeof a>]
}

const d: readonly number[] = []

assertArrayIndex(d, 'd')

for (let p = 0 as Index<typeof d>; p < d.length; p += 1) {
  const value: number = d[p]

  // @ts-expect-error: only permits reading
  d[2] = 3
}

// @ts-expect-error: push does not exist on readonly
d.push(3)

const e: [number] = [0]

// @ts-expect-error: [number] is not assignable to never
assertArrayIndex(e, 'e')

const f: readonly [boolean] = [false]

// @ts-expect-error: [boolean] is not assignable to never
assertArrayIndex(f, 'f')

const tuple = [5, 7] as const

// @ts-expect-error: readonly [5, 7] is not assignable to never
assertArrayIndex(tuple, 'tuple')
```

### JSON Parser（未解决）

> You're required to implement a type-level partly parser to parse JSON string into a object literal type.
>
> Requirements:
>
> + `Numbers` and `Unicode escape (\uxxxx)` in JSON can be ignored. You needn't to parse them.

```typescript
type Pure<T> = {
  [P in keyof T]: T[P] extends object ? Pure<T[P]> : T[P]
}

type SetProperty<T, K extends PropertyKey, V> = {
  [P in (keyof T) | K]: P extends K ? V : P extends keyof T ? T[P] : never
}

type Token = any
type ParseResult<T, K extends Token[]> = [T, K]
type Tokenize<T extends string, S extends Token[] = []> = Token[]
type ParseLiteral<T extends Token[]> = ParseResult<any, T>

type Parse<T extends string> = Pure<ParseLiteral<Tokenize<T>>[0]>

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<(
    Parse<`
      {
        "a": "b", 
        "b": false, 
        "c": [true, false, "hello", {
          "a": "b", 
          "b": false
        }], 
        "nil": null
      }
    `>
  ), (
    {
      nil: null
      c: [true, false, 'hello', {
        a: 'b'
        b: false
      }]
      b: false
      a: 'b'
    }

  )>>,
  Expect<Equal<Parse<'{}'>, {}>>,

  Expect<Equal<Parse<'[]'>, []>>,

  Expect<Equal<Parse<'[1]'>, never>>,

  Expect<Equal<Parse<'true'>, true>>,

  Expect<Equal<
  Parse<'["Hello", true, false, null]'>,
  ['Hello', true, false, null]
  >>,

  Expect<Equal<
  (
    Parse<`
      {
        "hello\\r\\n\\b\\f": "world"
      }`>
  ), (
    {
      'hello\r\n\b\f': 'world'
    }
  )
  >>,

  Expect<Equal<Parse<'{ 1: "world" }'>, never>>,

  Expect<Equal<Parse<`{ "hello
  
  world": 123 }`>, never>>,
]
```

### Subtract

> Implement the type Subtraction that is ` - ` in Javascript by using BuildTuple.
>
> If the minuend is less than the subtrahend, it should be `never`.
>
> It's a simple version.

```typescript
// M => minuend, S => subtrahend
type Subtract<M extends number, S extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Subtract<1, 1>, 0>>,
  Expect<Equal<Subtract<2, 1>, 1>>,
  Expect<Equal<Subtract<1, 2>, never>>,
  // @ts-expect-error
  Expect<Equal<Subtract<1000, 999>, 1>>,
]
```

简单的减法：

```typescript
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
```

