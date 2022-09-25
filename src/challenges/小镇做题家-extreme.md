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

