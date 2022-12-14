## Esay 组

没什么题是一个 any 解决不了的，如果有，那就再加上 `@ts-ignore`。

### Pick

> Implement the built-in `Pick<T, K>` generic without using it.
>
> Constructs a type by picking the set of properties `K` from `T`

```typescript
type MyPick<T, K> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Expected1, MyPick<Todo, 'title'>>>,
  Expect<Equal<Expected2, MyPick<Todo, 'title' | 'completed'>>>,
  // @ts-expect-error
  MyPick<Todo, 'title' | 'completed' | 'invalid'>,
]

interface Todo {
  title: string
  description: string
  completed: boolean
}

interface Expected1 {
  title: string
}

interface Expected2 {
  title: string
  completed: boolean
}
```

我们先看一下 cases 里面的 `//@ts-expect-error` 的注释，它的意思是，期望下面那一行代码是会报错，那么要怎么做呢？TypeScript 中的泛型是可以限制类型的，只要传入的类型与指定的类型不符合，那么就会报错。例如：

```typescript
type MyPick<T, K extends number> = any

// @ts-expect-error
type A = MyPick<{}, ''>
```

可以看到，我们给 K 指定了类型，它必须是一个 number 类型，而我们在使用时，传入了一个 `''`，它是一个 string 类型，所以就会报错。

我们再回到题里，其他两个 case 是传入的类型是合法的？三个 case 里面 K 的类型差异在于 `'invalid'`，而 `'title'`、`'completed'` 是合法的，它们之间的共同点就是， `'title'`、`'completed'`  都属于 Todo 里面的 key，而 `'invalid'` 不属性 Todo 的 key。所以我们可以通过以下代码让第三个 case 通过：

```js
type MyPick<T, K extends keyof T> = any
```

这样一来，我们就解决了第三个 case 的问题。接下来解决其它两个 case，内建的 Pick 是从接口中提取出来指定的键以及对应的类型组成的新的 Interface。

```typescript
type MyPick<T, K extends keyof T> = {}
```

那么这个 key 要怎么确定呢？首先，它一定是 T 里面的存在的 key：

```typescript
type MyPick<T, K extends keyof T> = {
  [P in keyof T]: T[P]
}
```

其次，它还必须是 K 里面指定的 key，我们可以通过 as 再进一步限制它的取值范围：

```typescript
type MyPick<T, K extends keyof T> = {
  [P in keyof T as P extends K ? P : never]: T[P]
}
```

这样一来，我们就完全解决了这道题。

### Readonly

> Implement the built-in `Readonly<T>` generic without using it.
>
> Constructs a type with all properties of T set to readonly, meaning the properties of the constructed type cannot be reassigned.

```typescript
type MyReadonly<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MyReadonly<Todo1>, Readonly<Todo1>>>,
]

interface Todo1 {
  title: string
  description: string
  completed: boolean
  meta: {
    author: string
  }
}
```

这题是比较简单的，我们可以直接通过 `readonly` 来修饰指定的键即可：

```typescript
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}
```

### Tuple to Object

> Give an array, transform into an object type and the key/value must in the given array.

```typescript
type TupleToObject<T extends readonly any[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
const tupleNumber = [1, 2, 3, 4] as const
const tupleMix = [1, '2', 3, '4'] as const

type cases = [
  Expect<Equal<TupleToObject<typeof tuple>, { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }>>,
  Expect<Equal<TupleToObject<typeof tupleNumber>, { 1: 1; 2: 2; 3: 3; 4: 4 }>>,
  Expect<Equal<TupleToObject<typeof tupleMix>, { 1: 1; '2': '2'; 3: 3; '4': '4' }>>,
]

// @ts-expect-error
type error = TupleToObject<[[1, 2], {}]>
```

同样的，我们先解决 `// @ts-expect-error` 这个 case，从其它 case 可以看到，泛型 T 应该是一个由 number 或 string 组成的数组，所以我们只需要给它加上这个限制即可：

```typescript
type TupleToObject<T extends readonly (number|string)[]> = any
```

解决完这个之后，我们继续处理其它的 case，我们知道，使用 `keyof { a: 1, b: 2 }` 可以得到一个由对象的 key 组成的联合类型：`'a' | 'b'`，同样的，在数组中，我们可以使用 `['a', 'b'][number]` 得到一个由数组中每一项组成的联合类型：`'a' | 'b'`，所以这题我们可以使用和 Pick 同样的思想来完成：

```typescript
type TupleToObject<T extends readonly (number|string)[]> = {
  [K in T[number]]: K
}
```

### First of Array

> Implement a generic `First<T>` that takes an Array `T` and returns it's first element's type.

```typescript
type First<T extends any[]> = any


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<First<[3, 2, 1]>, 3>>,
  Expect<Equal<First<[() => 123, { a: string }]>, () => 123>>,
  Expect<Equal<First<[]>, never>>,
  Expect<Equal<First<[undefined]>, undefined>>,
]

type errors = [
  // @ts-expect-error
  First<'notArray'>,
  // @ts-expect-error
  First<{ 0: 'arrayLike' }>,
]
```

这题的 errors case 可以不看了，给出的初始模板就已经做了类型限制，所以我们直接处理即可，这题也非常简单，我们可以直接使用数组的索引取值即可，但是需要注意一下空数组期望得到的是 never：

```typescript
type First<T extends any[]> = T extends []
  ? never
  : T[0]
```

### Length of Tuple

> For given a tuple, you need create a generic `Length`, pick the length of the tuple

```typescript
type Length<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const tesla = ['tesla', 'model 3', 'model X', 'model Y'] as const
const spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT'] as const

type cases = [
  Expect<Equal<Length<typeof tesla>, 4>>,
  Expect<Equal<Length<typeof spaceX>, 5>>,
  // @ts-expect-error
  Length<5>,
  // @ts-expect-error
  Length<'hello world'>,
]
```

Error case 只需要限制为数组即可，需要注意的是，它的测试用例都把数组转成了只读的：

```typescript
type Length<T extends readonly unknown[]> = any
```

然后，我们可以通过数组的 `length` 属性来取出数组长度：

```typescript
type Length<T extends readonly unknown[]> = T['length']
```

### Exclude

> Implement the built-in Exclude<T, U>

```typescript
type MyExclude<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a' | 'b'>, 'c'>>,
  Expect<Equal<MyExclude<string | number | (() => void), Function>, string | number>>,
]
```

在解这个题之前，我们需要先了解一下**分布式条件类型（Distributive Conditional Types）**，这对于我们之后的解题也非常重要。

#### 分布式条件类型

当条件类型作用于泛型类型时，它们在给定联合类型时会变成可分配的。例如：

```typescript
type ToArray<Type> = Type extends any ? Type[] : never;
```

如果我们将联合类型插入 ToArray，则条件类型将会应用于该联合类型的每个成员：

```typescript
type StrArrOrNumArr = ToArray<string | number>;
// string[] | number[]
```

这里发生的是 StrArrOrNumArr 分布在：`string | number`，并将联合的每个成员类型映射到有效的内容：`ToArray<string> | ToArray<number>`，所以我们会得到：

```typescript
string[] | number[];
```

通常，分配性是期望的行为， 为了避免这种行为，您可以用方括号将 extends 关键字的每一侧括起来：

```typescript
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
 
// 'StrArrOrNumArr' 不再是一个联合类型
type StrArrOrNumArr = ToArrayNonDist<string | number>;
```

#### 解题

理解了什么是分布式条件类型之后，这一题的解决方案也就随之而来了：

```typescript
type MyExclude<T, U> = T extends U ? never : T
```

只要 T 中的任意项在 U 上能找到，那么就将它忽略，否则就保留。

### Awaited

> If we have a type which is wrapped type like Promise. How we can get a type which is inside the wrapped type?

```typescript
type MyAwaited<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>

type cases = [
  Expect<Equal<MyAwaited<X>, string>>,
  Expect<Equal<MyAwaited<Y>, { field: number }>>,
  Expect<Equal<MyAwaited<Z>, string | number>>,
  Expect<Equal<MyAwaited<Z1>, string | boolean>>,
]

// @ts-expect-error
type error = MyAwaited<number>
```

很明显，这里的 T 应该是一个 Promise 类型：

```typescript
type MyAwaited<T extends Promise<any>> = any
```

这里我们需要先了解一下 `infer` 这个关键字的作用：[https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)

```typescript
type MyAwaited<T extends Promise<any>> = T extends Promise<infer R>
  ? R
  : never
```

使用 infer 推断出传递给 Promise 的类型，这样我们就可以轻松地把 cases 中的第一、二两个 case 给解决掉。而后面两个 case 出现了嵌套 Promise 的情况，所以我们需要再次递归调用 MyAwaited 来处理：

```typescript
type MyAwaited<T extends Promise<any>> = T extends Promise<infer R>
  ? R extends Promise<any>
    ? MyAwaited<R>
    : R
  : never
```

如此一来，我们就完成了所有的 cases。

### If

> Implement the util type `If<C, T, F>` which accepts condition `C`, a truthy value `T`, and a falsy value `F`. `C` is expected to be either `true` or `false` while `T` and `F` can be any type.

```typescript
type If<C, T, F> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<If<true, 'a', 'b'>, 'a'>>,
  Expect<Equal<If<false, 'a', 2>, 2>>,
]

// @ts-expect-error
type error = If<null, 'a', 'b'>
```

这题里面很明显，C 是一个 boolean 类型，当 C 为 true 时，返回 T，否则返回 F：

```typescript
type If<C extends boolean, T, F> = C extends true
  ? T
  : F
```

### Concat

> Implement the JavaScript `Array.concat` function in the type system. A type takes the two arguments. The output should be a new array that includes inputs in ltr order

```typescript
type Concat<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Concat<[], []>, []>>,
  Expect<Equal<Concat<[], [1]>, [1]>>,
  Expect<Equal<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<Concat<['1', 2, '3'], [false, boolean, '4']>, ['1', 2, '3', false, boolean, '4']>>,
]
```

这里就和 JavaScript 中的数组合并是一样的，不过我们还是需要给传入的类型做一下限制：

```typescript
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U]
```

### Includes

> Implement the JavaScript `Array.includes` function in the type system. A type takes the two arguments. The output should be a boolean `true` or `false`.

```typescript
type Includes<T extends readonly any[], U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Kars'>, true>>,
  Expect<Equal<Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'>, false>>,
  Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 7>, true>>,
  Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 4>, false>>,
  Expect<Equal<Includes<[1, 2, 3], 2>, true>>,
  Expect<Equal<Includes<[1, 2, 3], 1>, true>>,
  Expect<Equal<Includes<[{}], { a: 'A' }>, false>>,
  Expect<Equal<Includes<[boolean, 2, 3, 5, 6, 7], false>, false>>,
  Expect<Equal<Includes<[true, 2, 3, 5, 6, 7], boolean>, false>>,
  Expect<Equal<Includes<[false, 2, 3, 5, 6, 7], false>, true>>,
  Expect<Equal<Includes<[{ a: 'A' }], { readonly a: 'A' }>, false>>,
  Expect<Equal<Includes<[{ readonly a: 'A' }], { a: 'A' }>, false>>,
  Expect<Equal<Includes<[1], 1 | 2>, false>>,
  Expect<Equal<Includes<[1 | 2], 1>, false>>,
  Expect<Equal<Includes<[null], undefined>, false>>,
  Expect<Equal<Includes<[undefined], null>, false>>,
]
```

Includes，顾名思义，它是判断传进来的 T 是否存在和 U 相等的项，这里我们可以借助测试工具里面引入的 Equal 来对数组中的每一项和 U 做相等判断：

```typescript
type Includes<T extends readonly any[], U> = T extends [infer F, ...infer R]
  ? Equal<U, F> extends true
    ? true
    : Includes<R, U>
  : false
```

通过 `T extends [infer F, ...infer R]` 可以将数组的每一项逐一取出来比对，如果为 false 则递归调用 Includes，把数组剩余的 R 和 U 传进去再次比对，直至数组所有项都比对完毕。

### Push

> Implement the generic version of `Array.push`

```typescript
type Push<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Push<[], 1>, [1]>>,
  Expect<Equal<Push<[1, 2], '3'>, [1, 2, '3']>>,
  Expect<Equal<Push<['1', 2, '3'], boolean>, ['1', 2, '3', boolean]>>,
]
```

这题和我们之前实现的 Concat 一样，只不过是 U 是一个任意的类型：

```typescript
type Push<T extends unknown[], U> = [...T, U]
```

### Unshift

> Implement the type version of `Array.unshift`

```typescript
type Unshift<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Unshift<[], 1>, [1]>>,
  Expect<Equal<Unshift<[1, 2], 0>, [0, 1, 2]>>,
  Expect<Equal<Unshift<['1', 2, '3'], boolean>, [boolean, '1', 2, '3']>>,
]
```

和 Push 实现一致：

```typescript
type Unshift<T extends unknown[], U> = [U, ...T]
```

### Parameters

> Implement the built-in Parameters<T> generic without using it.

```typescript
type MyParameters<T extends (...args: any[]) => any> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const foo = (arg1: string, arg2: number): void => {}
const bar = (arg1: boolean, arg2: { a: 'A' }): void => {}
const baz = (): void => {}

type cases = [
  Expect<Equal<MyParameters<typeof foo>, [string, number]>>,
  Expect<Equal<MyParameters<typeof bar>, [boolean, { a: 'A' }]>>,
  Expect<Equal<MyParameters<typeof baz>, []>>,
]
```

这题利用 infer 即可：

```typescript
type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer R) => any
  ? R
  : never
```
