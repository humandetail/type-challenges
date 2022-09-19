## Medium 组

### Get Return Type

> Implement the built-in `ReturnType<T>` generic without using it.

```typescript
type MyReturnType<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<string, MyReturnType<() => string>>>,
  Expect<Equal<123, MyReturnType<() => 123>>>,
  Expect<Equal<ComplexObject, MyReturnType<() => ComplexObject>>>,
  Expect<Equal<Promise<boolean>, MyReturnType<() => Promise<boolean>>>>,
  Expect<Equal<() => 'foo', MyReturnType<() => () => 'foo'>>>,
  Expect<Equal<1 | 2, MyReturnType<typeof fn>>>,
  Expect<Equal<1 | 2, MyReturnType<typeof fn1>>>,
]

type ComplexObject = {
  a: [12, 'foo']
  bar: 'hello'
  prev(): number
}

const fn = (v: boolean) => v ? 1 : 2
const fn1 = (v: boolean, w: any) => v ? 1 : 2
```

啊哈，我们刚完成了对函数数据的提取，取返回值的思路与之类似：

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R
  ? R
  : never
```

### Omit

> Implement the built-in `Omit<T, K>` generic without using it.

```typescript
type MyOmit<T, K> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Expected1, MyOmit<Todo, 'description'>>>,
  Expect<Equal<Expected2, MyOmit<Todo, 'description' | 'completed'>>>,
]

// @ts-expect-error
type error = MyOmit<Todo, 'description' | 'invalid'>

interface Todo {
  title: string
  description: string
  completed: boolean
}

interface Expected1 {
  title: string
  completed: boolean
}

interface Expected2 {
  title: string
}
```

Omit 是一个内置的工具类型，它的官方解释是：通过从 Type 中选择所有属性然后删除 Keys（字符串或字符串组成的联合类型）来构造一个类型。

我们先看 `// @ts-expect-error`，很显然，K 必须是 T 里面的键才符合要求：

```typescript
type MyOmit<T, K extends keyof T> = any
```

根据我们之前解决 Pick 的思路解决即可：

```typescript
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never: P]: T[P]
}
```

### Readonly

> Implement a generic `MyReadonly2<T, K>` which takes two type argument `T` and `K`.
>
> `K` specify the set of properties of `T` that should set to Readonly. When `K` is not provided, it should make all properties readonly just like the normal `Readonly<T>`.

```typescript
type MyReadonly2<T, K> = any

/* _____________ Test Cases _____________ */
import type { Alike, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Alike<MyReadonly2<Todo1>, Readonly<Todo1>>>,
  Expect<Alike<MyReadonly2<Todo1, 'title' | 'description'>, Expected>>,
  Expect<Alike<MyReadonly2<Todo2, 'title' | 'description'>, Expected>>,
]

// @ts-expect-error
type error = MyReadonly2<Todo1, 'title' | 'invalid'>

interface Todo1 {
  title: string
  description?: string
  completed: boolean
}

interface Todo2 {
  readonly title: string
  description?: string
  completed: boolean
}

interface Expected {
  readonly title: string
  readonly description?: string
  completed: boolean
}
```

这题和 Pick 的解题思路差不多，但需要注意的是区分 readonly 项和普通项，所以这里我们采用交叉类型来完成这两个部分：

```typescript
type MyReadonly2<T, K extends keyof T = keyof T> = {
  readonly [P in keyof T as P extends K ? P : never]: T[P]
} & {
  [P in keyof T as P extends K ? never : P]: T[P]
}
```

### Deep Readonly

> Implement a generic `DeepReadonly<T>` which make every parameter of an object - and its sub-objects recursively - readonly.
>
> You can assume that we are only dealing with Objects in this challenge. Arrays, Functions, Classes and so on do not need to be taken into consideration. However, you can still challenge yourself by covering as many different cases as possible.

```typescript
type DeepReadonly<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<DeepReadonly<X>, Expected>>,
]

type X = {
  a: () => 22
  b: string
  c: {
    d: boolean
    e: {
      g: {
        h: {
          i: true
          j: 'string'
        }
        k: 'hello'
      }
      l: [
        'hi',
        {
          m: ['hey']
        },
      ]
    }
  }
}

type Expected = {
  readonly a: () => 22
  readonly b: string
  readonly c: {
    readonly d: boolean
    readonly e: {
      readonly g: {
        readonly h: {
          readonly i: true
          readonly j: 'string'
        }
        readonly k: 'hello'
      }
      readonly l: readonly [
        'hi',
        {
          readonly m: readonly ['hey']
        },
      ]
    }
  }
}
```

一看到 Deep，我们就知道应该使用递归了，这里递归的条件是：非函数类型的对象类型：

```typescript
type IsObject<T> = T extends Record<string, any>
  ? T extends Function
    ? false
    : true
  : false

// 或者
type IsObject<T> = T extends object
  ? T extends Function
    ? false
    : true
  : false
```

然后我们就可以递归操作了：

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: IsObject<T[P]> extends true
    ? DeepReadonly<T[P]>
    : T[P]
}
```

### Tuple To Union

> Implement a generic `TupleToUnion<T>` which covers the values of a tuple to its values union.

```typescript
type TupleToUnion<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TupleToUnion<[123, '456', true]>, 123 | '456' | true>>,
  Expect<Equal<TupleToUnion<[123]>, 123>>,
]
```

这个我们在解 Exclude 时就了解了分布式条件类型，我们只需要把 T 限制为 Array 类型，通过 `T[number]` 即可解决：

```typescript
type TupleToUnion<T extends unknown[]> = T[number]
```

### ChainableOptions

> Chainable options are commonly used in Javascript. But when we switch to TypeScript, can you properly type it?
>
> In this challenge, you need to type an object or a class - whatever you like - to provide two function `option(key, value)` and `get()`. In `option`, you can extend the current config type by the given key and value. We should about to access the final result via `get`.

```typescript
type Chainable = {
  option(key: string, value: any): any
  get(): any
}


/* _____________ Test Cases _____________ */
import type { Alike, Expect } from '@type-challenges/utils'

declare const a: Chainable

const result1 = a
  .option('foo', 123)
  .option('bar', { value: 'Hello World' })
  .option('name', 'type-challenges')
  .get()

const result2 = a
  .option('name', 'another name')
  // @ts-expect-error
  .option('name', 'last name')
  .get()

const result3 = a
  .option('name', 'another name')
  .option('name', 123)
  .get()

type cases = [
  Expect<Alike<typeof result1, Expected1>>,
  Expect<Alike<typeof result2, Expected2>>,
  Expect<Alike<typeof result3, Expected3>>,
]

type Expected1 = {
  foo: number
  bar: {
    value: string
  }
  name: string
}

type Expected2 = {
  name: string
}

type Expected3 = {
  name: number
}
```

在解题之前，我们先看看 JavaScript 中的链式调用是怎么设计的：

```js
const a = {
  options (name, value) {
    this[name] = value
    return this
  },
  
  get (name) {
    return this[name]
  }
}

const b = a
	.options('foo', 'bar')
	.get('foo')

const c = a
	.options('foo', 'bar')
	.options('foo', 'baz')
	.get('foo')

console.log(b) // 'bar'
console.log(c) // 'baz'
```

起到链式调用的关键是在 `options()` 中返回了当前对象 `this`。

首先，我们需要一个地方来保存结果，这样我们才能在 `get()` 被调用时取得对应的结果：

```typescript
type Chainable<R = {}> = {
  option(key: string, value: any): any
  get(): R
}
```

然后，再让 `options()` 被调用时，把对应的 key 和 value 存储到结果 R 中：

```typescript
type Chainable<R = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<{ [P in K]: V }>
  get(): R
}
```

当然，我们需要保证结果 R 中不存在本次传进来的 K，还记得我们之前实现的 Omit 吗？通过 Omit 在结果 R 中排除掉可能存在的 K 即可：

```typescript
type Chainable<R = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<Omit<R, K> & { [P in K]: V }>
  get(): R
}
```

最后，我们需要解决掉 `// @ts-expect-error` 那个 case，可以看到，两次调用 `options()` 传入了相同的 key 和相同类型的 value，并且该注释是在 `options()` 上的，所以要在 `options()` 这里来处理：

```typescript
type Chainable<R = {}> = {
  option<K extends string, V>(key: number, value: V): Chainable<Omit<R, K> & { [P in K]: V }>
  get(): R
}
```

当我们尝试把 key 的类型改为一个非 string 类型时发现，`// @ts-expect-error` 这条注释取得了预想中的效果，后面只需要确保在 R 中不存在相同的 key 和同类型的 value 这一条件即可，所以我们可以再加一个类型，用于检测，并返回 key 最终的类型：

```typescript
type GetKeyType<T, K extends string, V> = K extends keyof T
  ? T[K] extends V
    ? [] // 只要不是 string 类型即可
    : K
  : K
```

然后再在把 GetKeyType 赋予 key 即可：

```typescript
type GetKeyType<T, K extends string, V> = K extends keyof T
  ? T[K] extends V
    ? number // 只要不是 string 类型即可
    : K
  : K

type Chainable<R = {}> = {
  option<K extends string, V>(key: GetKeyType<R, K, V>, value: V): Chainable<Omit<R, K> & { [P in K]: V }>
  get(): R
}
```

### Last of Array

> TypeScript 4.0 is recommended in this challenge
>
> Implement a generic `Last<T>` that takes an Array `T` and returns its last element.

```typescript
type Last<T extends any[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Last<[3, 2, 1]>, 1>>,
  Expect<Equal<Last<[() => 123, { a: string }]>, { a: string }>>,
]
```

这题比较简单，就不细说了：

```typescript
type Last<T extends any[]> = T extends [...infer R, infer L]
  ? L
  : never
```

### Pop

> TypeScript 4.0 is recommended in this challenge
>
> Implement a generic `Pop<T>` that takes an Array `T` and returns an Array without it's last element.

```typescript
type Pop<T extends any[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Pop<[3, 2, 1]>, [3, 2]>>,
  Expect<Equal<Pop<['a', 'b', 'c', 'd']>, ['a', 'b', 'c']>>,
]
```

这个和上面的 Last 是一样的：

```typescript
type Pop<T extends any[]> = T extends [...infer R, infer L]
  ? R
  : never
```

### Promise.all

> Type the function `PromiseAll` that accepts an array of PromiseLike objects, the returning value should be `Promise<T>` where `T` is the resolved result array.

```typescript
declare function PromiseAll(values: any): any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const promiseAllTest1 = PromiseAll([1, 2, 3] as const)
const promiseAllTest2 = PromiseAll([1, 2, Promise.resolve(3)] as const)
const promiseAllTest3 = PromiseAll([1, 2, Promise.resolve(3)])

type cases = [
  Expect<Equal<typeof promiseAllTest1, Promise<[1, 2, 3]>>>,
  Expect<Equal<typeof promiseAllTest2, Promise<[1, 2, number]>>>,
  Expect<Equal<typeof promiseAllTest3, Promise<[number, number, number]>>>,
]
```

可以看到，题目给出的初始代码比较简单，所以我们需要按照 case  的要求加上泛型和参数限制：

```typescript
declare function PromiseAll<T extends unknown[]>(values: readonly [...T]): any
```

它的返回值应该是一个 `Promise<any []>` 类型：

```typescript
declare function PromiseAll<T extends unknown[]>(values: readonly [...T]): Promise<unknown []>
```

众所周知，在 JavaScript 中 Array 也是一个对象，这一点在 TypeScript 中也是一样的：

```typescript
type Arr1 = string[]
type Arr2 = {
  [K: number]: string
}

type E = Expect<Equal<true, Arr1 extends Arr2 ? true : false>>
```

所以第一个 case 就很简单了：

```typescript
declare function PromiseAll<T extends unknown[]>(values: readonly [...T]): Promise<{
  [K in keyof T]: T[K]
}>
```

而在第二、第三个 case 的参数数组里面存在着 Promise，所以我们要对 T[K] 作进一步的判断：

```typescript
declare function PromiseAll<T extends unknown[]>(values: readonly [...T]): Promise<{
  [K in keyof T]: T[K] extends Promise<infer D>
    ? D
    : T[K]
}>
```

如此一来，所有的 cases 就解决了。

### Type Lookup

> Sometimes, you may want to lookup for a type in a union to by their attributes. 
>
> In this challenge, we would like to get the corresponding type by searching for the common `type` field in the union `Cat | Dog`. In other words, we will expect to get `Dog` for `LookUp<Dog | Cat, 'dog'>` and `Cat` for `LookUp<Dog | Cat, 'cat'>` in the following example.

```typescript
type LookUp<U, T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
  color: 'brown' | 'white' | 'black'
}

type Animal = Cat | Dog

type cases = [
  Expect<Equal<LookUp<Animal, 'dog'>, Dog>>,
  Expect<Equal<LookUp<Animal, 'cat'>, Cat>>,
]
```

同样，我们还是根据需求把类型限制给加上：

```typescript
type LookUp<U extends Animal, T extends U['type']> = any
```

从题中可知，无论是 Cat 还是 Dog，都是继承于 `{ type: string }` 这个接口的，我们可以用下面的代码来测试一下：

```typescript
interface Base {
  type: string
}

type A = Expect<Equal<Cat extends Base ? true : false, true>>
type B = Expect<Equal<Dog extends Base ? true : false, true>>
```

如果我们再把 Base 里面的 type 作一下限制，那么这题就很容易解开了：

```typescript
interface Base<T> {
  type: T
}

type A = Expect<Equal<Cat extends Base<'cat'> ? true : false, true>>
type B = Expect<Equal<Dog extends Base<'dog'> ? true : false, true>>
```

所以最终我们可以得出这样的答案：

```typescript
interface Base<T> {
  type: T
}

type LookUp<U extends Animal, T extends U['type']> = U extends Base<T>
  ? U
  : never
```

### TrimLeft

> Implement `TrimLeft<T>` which takes an exact string type and returns a new string with the whitespace beginning removed.

```typescript
type TrimLeft<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TrimLeft<'str'>, 'str'>>,
  Expect<Equal<TrimLeft<' str'>, 'str'>>,
  Expect<Equal<TrimLeft<'     str'>, 'str'>>,
  Expect<Equal<TrimLeft<'     str     '>, 'str     '>>,
  Expect<Equal<TrimLeft<'   \n\t foo bar '>, 'foo bar '>>,
  Expect<Equal<TrimLeft<''>, ''>>,
  Expect<Equal<TrimLeft<' \n\t'>, ''>>,
]
```

这题考验的是字符串操作，和数组中的 Shift 很相似，我们可以使用如下代码从字符串中取值：

```typescript
type A<S extends string> = S extends `${infer F}${infer R}`
  ? F
  : never

type B = Expect<Equal<A<'Hello'>, 'H'>>
```

题目中的要求是：只要前面的字符是 `''`、`\n` 或者 `\t` 都不要，那么我们可以递归来完成：

```typescript
type TrimLeft<S extends string> = S extends `${infer F}${infer R}`
  ? F extends IgnoreString
    ? TrimLeft<R>
    : S
  : ''
```

当然，我们也可以把判断放在 infer 里面：

```typescript
type TrimLeft<S extends string> = S extends `${infer F extends IgnoreString}${infer R}`
  ? TrimLeft<R>
  : S
```

### Capitalize

> Implement `Capitalize<T>` which converts the first letter of a string to uppercase and leave the rest as-is.

```typescript
type MyCapitalize<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MyCapitalize<'foobar'>, 'Foobar'>>,
  Expect<Equal<MyCapitalize<'FOOBAR'>, 'FOOBAR'>>,
  Expect<Equal<MyCapitalize<'foo bar'>, 'Foo bar'>>,
  Expect<Equal<MyCapitalize<''>, ''>>,
  Expect<Equal<MyCapitalize<'a'>, 'A'>>,
  Expect<Equal<MyCapitalize<'b'>, 'B'>>,
  Expect<Equal<MyCapitalize<'c'>, 'C'>>,
  Expect<Equal<MyCapitalize<'d'>, 'D'>>,
  Expect<Equal<MyCapitalize<'e'>, 'E'>>,
  Expect<Equal<MyCapitalize<'f'>, 'F'>>,
  Expect<Equal<MyCapitalize<'g'>, 'G'>>,
  Expect<Equal<MyCapitalize<'h'>, 'H'>>,
  Expect<Equal<MyCapitalize<'i'>, 'I'>>,
  Expect<Equal<MyCapitalize<'j'>, 'J'>>,
  Expect<Equal<MyCapitalize<'k'>, 'K'>>,
  Expect<Equal<MyCapitalize<'l'>, 'L'>>,
  Expect<Equal<MyCapitalize<'m'>, 'M'>>,
  Expect<Equal<MyCapitalize<'n'>, 'N'>>,
  Expect<Equal<MyCapitalize<'o'>, 'O'>>,
  Expect<Equal<MyCapitalize<'p'>, 'P'>>,
  Expect<Equal<MyCapitalize<'q'>, 'Q'>>,
  Expect<Equal<MyCapitalize<'r'>, 'R'>>,
  Expect<Equal<MyCapitalize<'s'>, 'S'>>,
  Expect<Equal<MyCapitalize<'t'>, 'T'>>,
  Expect<Equal<MyCapitalize<'u'>, 'U'>>,
  Expect<Equal<MyCapitalize<'v'>, 'V'>>,
  Expect<Equal<MyCapitalize<'w'>, 'W'>>,
  Expect<Equal<MyCapitalize<'x'>, 'X'>>,
  Expect<Equal<MyCapitalize<'y'>, 'Y'>>,
  Expect<Equal<MyCapitalize<'z'>, 'Z'>>,
]
```

Cases 有点多啊，不过这题也很简单，它只需要把第一个字母转成大写即可，在 TypeScript 中有个 Uppercase 的工具类可以把字母转成大写：

```typescript
type A = Expect<Equal<'A', Uppercase<'a'>>>
type B = Expect<Equal<'BC', Uppercase<'bc'>>>
```

所以，我们只需要把首字母拿出来转成大写即可：

```typescript
type MyCapitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S
```

### Replace

> Implement `Replace<S, From, To>` which replace the string `From` with `To` once in the given string `S`

```typescript
type Replace<S extends string, From extends string, To extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Replace<'foobar', 'bar', 'foo'>, 'foofoo'>>,
  Expect<Equal<Replace<'foobarbar', 'bar', 'foo'>, 'foofoobar'>>,
  Expect<Equal<Replace<'foobarbar', '', 'foo'>, 'foobarbar'>>,
  Expect<Equal<Replace<'foobarbar', 'bar', ''>, 'foobar'>>,
  Expect<Equal<Replace<'foobarbar', 'bra', 'foo'>, 'foobarbar'>>,
  Expect<Equal<Replace<'', '', ''>, ''>>,
]
```

这题同样是字符串操作，需要注意的是，如果 From 为空字符串，那就原样输出 S：

```typescript
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer F}${From}${infer R}`
    ? `${F}${To}${R}`
    : S
```

### ReplaceAll

> Implement `ReplaceAll<S, From, To>` which replace the all the substring `From` with `To` in the given string `S`

```typescript
type ReplaceAll<S extends string, From extends string, To extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ReplaceAll<'foobar', 'bar', 'foo'>, 'foofoo'>>,
  Expect<Equal<ReplaceAll<'foobar', 'bag', 'foo'>, 'foobar'>>,
  Expect<Equal<ReplaceAll<'foobarbar', 'bar', 'foo'>, 'foofoofoo'>>,
  Expect<Equal<ReplaceAll<'t y p e s', ' ', ''>, 'types'>>,
  Expect<Equal<ReplaceAll<'foobarbar', '', 'foo'>, 'foobarbar'>>,
  Expect<Equal<ReplaceAll<'barfoo', 'bar', 'foo'>, 'foofoo'>>,
  Expect<Equal<ReplaceAll<'foobarfoobar', 'ob', 'b'>, 'fobarfobar'>>,
  Expect<Equal<ReplaceAll<'foboorfoboar', 'bo', 'b'>, 'foborfobar'>>,
  Expect<Equal<ReplaceAll<'', '', ''>, ''>>,
]
```

按照 Replace 的思路递归即可：

```typescript
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer F}${From}${infer R}`
    ? ReplaceAll<`${F}${To}${R}`, From, To>
    : S
```

一气呵成，不愧是你，但是我们会发现，有两个 cases 并没有被解决掉：

```typescript
Expect<Equal<ReplaceAll<'foobarfoobar', 'ob', 'b'>, 'fobarfobar'>>
Expect<Equal<ReplaceAll<'foboorfoboar', 'bo', 'b'>, 'foborfobar'>>
```

我们拿 `ReplaceAll<'foobarfoobar', 'ob', 'b'>` 这个来说，在第一次执行替换时：

```typescript
F 为 'fo'
From 为 'ob'
R 为 'arfoobar'
```

所以我们在给第二次执行 ReplaceAll 拼接的是：`${F}${To}${R}` 即 `fobarfoobar`，此时：

```typescript
F 为 'f'
From 为 'ob'
R 为 'arfoobar'
```

在第三次执行 ReplaceAll 拼接的是：`${F}${To}${R}` 即 `fbarfoobar`。

经过一次又一次的递归，最终得到的是 `fbarfbar`。这显然不符合要求中的：`fobarfobar`。为什么会出现这个问题？是因为我们把已经替换过后的字符再次放进了下一次递归的参数 T 中，这显然是不合理的。所以我们需要把每一次替换的结果给存储起来，增加一个泛型 Result，它的初始值为空字符串：

```typescript
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string,
  Result extends string = ''
> = From extends ''
  ? S
  : S extends `${infer F}${From}${infer R}`
    ? ReplaceAll<`${F}${To}${R}`, From, To>
    : S
```

在每一次执行替换时，把结果收集起来，在下一次递归传递给 S 的值是剩余字符，最后返回 Result 和最后一次递归传入的 S 拼接起来的字符串即可：

```typescript
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string,
  Result extends string = ''
> = From extends ''
  ? S
  : S extends `${infer F}${From}${infer R}`
    ? ReplaceAll<R, From, To, `${Result}${F}${To}`>
    : `${Result}${S}`
```

### Append Argument

> For given function type `Fn`, and any type `A` (any in this context means we don't restrict the type, and I don't have in mind any type 😉) create a generic type which will take `Fn` as the first argument, `A` as the second, and will produce function type `G` which will be the same as `Fn` but with appended argument `A` as a last one.

```typescript
type AppendArgument<Fn, A> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Case1 = AppendArgument<(a: number, b: string) => number, boolean>
type Result1 = (a: number, b: string, x: boolean) => number

type Case2 = AppendArgument<() => void, undefined>
type Result2 = (x: undefined) => void

type cases = [
  Expect<Equal<Case1, Result1>>,
  Expect<Equal<Case2, Result2>>,
]
```

我们知道函数的参数可以用 `...` 来收集剩余参数，它是一个数组，而在 TypeScript 中也是如此：

```typescript
type GetArgs<Fn> = Fn extends (...args: infer Args) => any
  ? Args
  : never

type A = Expect<Equal<GetArgs<(a: number, b: string, c: boolean) => 1>, [number, string, boolean]>>
```

所以这题和 Push 是非常相似了，只不过它操作的地方是函数的参数而已：

```typescript
type AppendArgument<
  Fn,
  A
> = Fn extends (...args: infer Args) => infer R
  ? (...args: [...Args, A]) => R
  : never
```

### Permutation

> Implement permutation type that transforms union types into the array that includes permutations of unions.

```typescript
type Permutation<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Permutation<'A'>, ['A']>>,
  Expect<Equal<Permutation<'A' | 'B' | 'C'>, ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']>>,
  Expect<Equal<Permutation<'B' | 'A' | 'C'>, ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']>>,
  Expect<Equal<Permutation<boolean>, [false, true] | [true, false]>>,
  Expect<Equal<Permutation<never>, []>>,
]
```

很典型的分布式条件类型，需要注意的是，在下一次递归时要排除掉本次的值：

```typescript
type Permutation<T, A = T> = [T] extends [never]
  ? []
  : T extends A
    ? [T, ...Permutation<Exclude<A, T>>]
    : never
```

### Length of String

> Compute the length of a string literal, which behaves like `String#length`.

```typescript
type LengthOfString<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<LengthOfString<''>, 0>>,
  Expect<Equal<LengthOfString<'kumiko'>, 6>>,
  Expect<Equal<LengthOfString<'reina'>, 5>>,
  Expect<Equal<LengthOfString<'Sound! Euphonium'>, 16>>,
]
```

So easy，`S['length']` 收工：

```typescript
type LengthOfString<S extends string> = S['length']
```

很遗憾，并没有取得预想中的效果，字符串没有 length，那只能采取迂回战术，既然字符串没有，那么我们就使用 Array：

```typescript
type LengthOfString<S extends string, Arr extends number[] = []> = S extends `${infer F}${infer R}`
  ? LengthOfString<R, [...Arr, 0]>
  : Arr['length']
```

### Flatten

> In this challenge, you would need to write a type that takes an array and emitted the flatten array type.

```typescript
type Flatten = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Flatten<[]>, []>>,
  Expect<Equal<Flatten<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<Flatten<[1, [2]]>, [1, 2]>>,
  Expect<Equal<Flatten<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, 5]>>,
  Expect<Equal<Flatten<[{ foo: 'bar'; 2: 10 }, 'foobar']>, [{ foo: 'bar'; 2: 10 }, 'foobar']>>,
]
```

同样是递归处理数组中的每一项，如果还是数组就继续递归：

```typescript
type Flatten<T extends unknown[], Result extends unknown[] = []> = T extends [infer F, ...infer R]
  ? F extends unknown[]
    ? Flatten<R, [...Result, ...Flatten<F>]>
    : Flatten<R, [...Result, F]>
  : Result
```

### Append to object

> Implement a type that adds a new field to the interface. The type takes the three arguments. The output should be an object with the new field.

```typescript
type AppendToObject<T, U, V> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type test1 = {
  key: 'cat'
  value: 'green'
}

type testExpect1 = {
  key: 'cat'
  value: 'green'
  home: boolean
}

type test2 = {
  key: 'dog' | undefined
  value: 'white'
  sun: true
}

type testExpect2 = {
  key: 'dog' | undefined
  value: 'white'
  sun: true
  home: 1
}

type test3 = {
  key: 'cow'
  value: 'yellow'
  sun: false
}

type testExpect3 = {
  key: 'cow'
  value: 'yellow'
  sun: false
  isMotherRussia: false | undefined
}

type cases = [
  Expect<Equal<AppendToObject<test1, 'home', boolean>, testExpect1>>,
  Expect<Equal<AppendToObject<test2, 'home', 1>, testExpect2>>,
  Expect<Equal<AppendToObject<test3, 'isMotherRussia', false | undefined>, testExpect3>>,
]
```

这题我们需要注意的是，U 是一个字符串，它将作为返回类型的键。

我们知道，keyof 会返回一个由对象的键组成的联合类型，此时，再把 U 给加到这个联合类型组成新的对象的键，即可解题：

```typescript
type AppendToObject<T, U extends string, V> = {
  [P in keyof T | U]: P extends keyof T ? T[P] : V
}
```

### Absolute

> Implement the `Absolute` type. A type that take string, number or bigint. The output should be a positive number string

```typescript
type Absolute<T extends number | string | bigint> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Absolute<0>, '0'>>,
  Expect<Equal<Absolute<-0>, '0'>>,
  Expect<Equal<Absolute<10>, '10'>>,
  Expect<Equal<Absolute<-5>, '5'>>,
  Expect<Equal<Absolute<'0'>, '0'>>,
  Expect<Equal<Absolute<'-0'>, '0'>>,
  Expect<Equal<Absolute<'10'>, '10'>>,
  Expect<Equal<Absolute<'-5'>, '5'>>,
  Expect<Equal<Absolute<-1_000_000n>, '1000000'>>,
  Expect<Equal<Absolute<9_999n>, '9999'>>,
]
```

在 JavaScript 中取绝对值时可以使用 `Math.abs()`，但在 TypeScript 中就得需要一些其他操作了：

```typescript
type Absolute<T extends number | string | bigint> = `${T}` extends `-${infer R}`
  ? R
  : `${T}`
```

同样是字符串操作，把 `-` 号移除即可。

### String to Union

> Implement the String to Union type. Type take string argument. The output should be a union of input letters

```typescript
type StringToUnion<T extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<StringToUnion<''>, never>>,
  Expect<Equal<StringToUnion<'t'>, 't'>>,
  Expect<Equal<StringToUnion<'hello'>, 'h' | 'e' | 'l' | 'l' | 'o'>>,
  Expect<Equal<StringToUnion<'coronavirus'>, 'c' | 'o' | 'r' | 'o' | 'n' | 'a' | 'v' | 'i' | 'r' | 'u' | 's'>>,
]
```

字符串递归即可，提供一个 Result 来收集每次递归的结果，初始值为 never：

```typescript
type StringToUnion<T extends string, Result = never> = T extends `${infer F}${infer R}`
  ? StringToUnion<R, Result | F>
  : Result
```

### Merge

> Merge two types into a new type. Keys of the second type overrides keys of the first type.

```typescript
type Merge<F, S> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Foo = {
  a: number
  b: string
}
type Bar = {
  b: number
  c: boolean
}

type cases = [
  Expect<Equal<Merge<Foo, Bar>, {
    a: number
    b: number
    c: boolean
  }>>,
]
```

这一题和前面做的 [Append to object](#Append to object) 很相似：

```typescript
type Merge<F, S> = {
  [P in keyof F | keyof S]: P extends keyof S ? S[P] : P extends keyof F ? F[P] : never
}
```

### KebabCase

> Replace the `camelCase` or `PascalCase` string with `kebab-case`.

```typescript
type KebabCase<S> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<KebabCase<'FooBarBaz'>, 'foo-bar-baz'>>,
  Expect<Equal<KebabCase<'fooBarBaz'>, 'foo-bar-baz'>>,
  Expect<Equal<KebabCase<'foo-bar'>, 'foo-bar'>>,
  Expect<Equal<KebabCase<'foo_bar'>, 'foo_bar'>>,
  Expect<Equal<KebabCase<'Foo-Bar'>, 'foo--bar'>>,
  Expect<Equal<KebabCase<'ABC'>, 'a-b-c'>>,
  Expect<Equal<KebabCase<'-'>, '-'>>,
  Expect<Equal<KebabCase<''>, ''>>,
  Expect<Equal<KebabCase<'😎'>, '😎'>>,
]
```

在 TypeScript 的工具类中，有一个工具是可以把首字母转成小写，它就是 `Uncapitalize`：

```typescript
type A = 'HELLO WORLD'
type E = Expect<Equal<Uncapitalize<A>, 'hELLO WORLD'>>
```

因为这一题里面首字母是大写时，只需要把它转成小写即可，而不需要再加上 `-`，所以我们需要对剩余字符进行判断：

```typescript
type KebabCase<S> = S extends `${infer F}${infer R}`
  ? R extends Uncapitalize<R>
    ? `${Lowercase<F>}${KebabCase<R>}`
    : `${Lowercase<F>}-${KebabCase<R>}`
  : S
```

### Diff

> Get an `Object` that is the difference between `O` & `O1`

```typescript
type Diff<O, O1> = any

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
```

取差集，基操，只需要去除交集即可：

```typescript
type Diff<O, O1> = {
  [P in Exclude<keyof O, keyof O1> | Exclude<keyof O1, keyof O>]: P extends keyof O
    ? O[P]
    : P extends keyof O1
      ? O1[P]
      : never
}
```

### AnyOf

> Implement Python liked `any` function in the type system. A type takes the Array and returns `true` if any element of the Array is true. If the Array is empty, return `false`.

```typescript
type AnyOf<T extends readonly any[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<AnyOf<[1, 'test', true, [1], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[1, '', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, 'test', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', true, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [1], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], {}]>, false>>,
  Expect<Equal<AnyOf<[]>, false>>,
]
```

只要传入的数组中有一项为 true，则结果为 true。首先我们需要知道哪些值是 falsy 值，从 cases 中可以得知：

```typescript
type Falsy = 0 | '' | [] | false | Record<PropertyKey, never>
```

需要注意的是，空对象类型得采用 `Record<PropertyKey, never>` 来表示。如此一来，解题也变得非常简单了：

```typescript
type Falsy = 0 | '' | [] | false | Record<PropertyKey, never>

type AnyOf<T extends readonly any[]> = T[number] extends Falsy
  ? false
  : true
```

### IsNever

> Implement a type IsNever, which takes input type `T`.
>
> If the type of resolves to `never`, return `true`, otherwise `false`.

```typescript
type IsNever<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsNever<never>, true>>,
  Expect<Equal<IsNever<never | string>, false>>,
  Expect<Equal<IsNever<''>, false>>,
  Expect<Equal<IsNever<undefined>, false>>,
  Expect<Equal<IsNever<null>, false>>,
  Expect<Equal<IsNever<[]>, false>>,
  Expect<Equal<IsNever<{}>, false>>,
]
```

我总感觉这题不应该出现在这个栏目：

```typescript
type IsNever<T> = [T] extends [never] ? true : false
```

### IsUnion

> Implement a type `IsUnion`, which takes an input type `T` and returns whether `T` resolves to a union type.

```typescript
type IsUnion<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsUnion<string>, false>>,
  Expect<Equal<IsUnion<string | number>, true>>,
  Expect<Equal<IsUnion<'a' | 'b' | 'c' | 'd'>, true>>,
  Expect<Equal<IsUnion<undefined | null | void | ''>, true>>,
  Expect<Equal<IsUnion<{ a: string } | { a: number }>, true>>,
  Expect<Equal<IsUnion<{ a: string | number }>, false>>,
  Expect<Equal<IsUnion<[string | number]>, false>>,
  // Cases where T resolves to a non-union type.
  Expect<Equal<IsUnion<string | never>, false>>,
  Expect<Equal<IsUnion<string | unknown>, false>>,
  Expect<Equal<IsUnion<string | any>, false>>,
  Expect<Equal<IsUnion<string | 'a'>, false>>,
  Expect<Equal<IsUnion<never>, false>>,
]
```

首先，我们先要把 never 排除掉：

```typescript
type IsUnion<T, A = T> = [T] extends [never]
  ? false
	: // ...
```

如果传入的是联合类型，那么就拿第一项和整个联合类型进行对比：

```typescript
type IsUnion<T, A = T> = [T] extends [never]
  ? false
  : T extends A
		? // ...
    : // ...
```

如果 T 是一个非联合类型，那么 `T extends A` 这条语句永远都会是 true，所以我们还需要进一步判断，通过一个小技巧：

```typescript
type IsUnion<T, A = T> = [T] extends [never]
  ? false
  : T extends A
    ? Equal<[T], [A]> extends true
      ? false
      : true
    : false
```

如果 T 是一个联合类型，假设是：`string | number`，那么 `[T]` 就是 `[string]`，而 `[A]` 就是 `[string | number]` ，它们两者必不相等；如果 T 是一个非联合类型，假设是：`string`，那么 `[T]` 和 `[A]` 都是 `[string]`，两者相等。所以以此来判断它是否为一个联合类型。

### ReplaceKeys

> Implement a type ReplaceKeys, that replace keys in union types, if some type has not this key, just skip replacing,
>
>  A type takes three arguments.

```typescript
type ReplaceKeys<U, T, Y> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type NodeA = {
  type: 'A'
  name: string
  flag: number
}

type NodeB = {
  type: 'B'
  id: number
  flag: number
}

type NodeC = {
  type: 'C'
  name: string
  flag: number
}

type ReplacedNodeA = {
  type: 'A'
  name: number
  flag: string
}

type ReplacedNodeB = {
  type: 'B'
  id: number
  flag: string
}

type ReplacedNodeC = {
  type: 'C'
  name: number
  flag: string
}

type NoNameNodeA = {
  type: 'A'
  flag: number
  name: never
}

type NoNameNodeC = {
  type: 'C'
  flag: number
  name: never
}

type Nodes = NodeA | NodeB | NodeC
type ReplacedNodes = ReplacedNodeA | ReplacedNodeB | ReplacedNodeC
type NodesNoName = NoNameNodeA | NoNameNodeC | NodeB

type cases = [
  Expect<Equal<ReplaceKeys<Nodes, 'name' | 'flag', { name: number; flag: string }>, ReplacedNodes>>,
  Expect<Equal<ReplaceKeys<Nodes, 'name', { aa: number }>, NodesNoName>>,
]
```

题目中指出需要三个泛型参数，分别是：源类型（U）、需要的键（T）以及替换键组成的接口（Y），而我们要做的是，把 U 中所有符合 T 的键都替换成 Y 里面的类型。

所以解题的方法也很简单了，把需要匹配的条件都列出来即可：

```typescript
type ReplaceKeys<U, T, Y> = {
  [P in keyof U]: P extends T
    ? P extends keyof Y
      ? Y[P]
      : never
    : U[P]
}
```

### Remove Index Signature

> Implement `RemoveIndexSignature<T>` , exclude the index signature from object types.

```typescript
type RemoveIndexSignature<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Foo = {
  [key: string]: any
  foo(): void
}

type Bar = {
  [key: number]: any
  bar(): void
  0: string
}

const foobar = Symbol('foobar')
type FooBar = {
  [key: symbol]: any
  [foobar](): void
}

type Baz = {
  bar(): void
  baz: string
}

type cases = [
  Expect<Equal<RemoveIndexSignature<Foo>, { foo(): void }>>,
  Expect<Equal<RemoveIndexSignature<Bar>, { bar(): void; 0: string }>>,
  Expect<Equal<RemoveIndexSignature<FooBar>, { [foobar](): void }>>,
  Expect<Equal<RemoveIndexSignature<Baz>, { bar(): void; baz: string }>>,
]
```

从对象中移除索引类型，那么我们先需要判断哪些才是索引类型：

```typescript
type IsSignature<T> = string extends T
  ? true
  : number extends T
    ? true
    : symbol extends T
      ? true
      : false
```

从对象中删除一个键，将该键置为 never 即可：

```typescript
type Obj = {
  a: string;
  b: number;
}
type DeleteKeys<T> = {
  [K in keyof T as never]: T[K]
}
type EmptyObj = DeleteKeys<Obj> // {}
```

所以最终答案如下代码所示：

```typescript
type IsSignature<T> = string extends T
  ? true
  : number extends T
    ? true
    : symbol extends T
      ? true
      : false

type RemoveIndexSignature<T> = {
  [P in keyof T as IsSignature<P> extends true ? never : P]: T[P]
}
```

### Percentage Parser

> Implement PercentageParser<T extends string>.
>
>  According to the `/^(\+|\-)?(\d*)?(\%)?$/` regularity to match T and get three matches.

```typescript
type PercentageParser<A extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type Case0 = ['', '', '']
type Case1 = ['+', '', '']
type Case2 = ['+', '1', '']
type Case3 = ['+', '100', '']
type Case4 = ['+', '100', '%']
type Case5 = ['', '100', '%']
type Case6 = ['-', '100', '%']
type Case7 = ['-', '100', '']
type Case8 = ['-', '1', '']
type Case9 = ['', '', '%']
type Case10 = ['', '1', '']
type Case11 = ['', '100', '']

type cases = [
  Expect<Equal<PercentageParser<''>, Case0>>,
  Expect<Equal<PercentageParser<'+'>, Case1>>,
  Expect<Equal<PercentageParser<'+1'>, Case2>>,
  Expect<Equal<PercentageParser<'+100'>, Case3>>,
  Expect<Equal<PercentageParser<'+100%'>, Case4>>,
  Expect<Equal<PercentageParser<'100%'>, Case5>>,
  Expect<Equal<PercentageParser<'-100%'>, Case6>>,
  Expect<Equal<PercentageParser<'-100'>, Case7>>,
  Expect<Equal<PercentageParser<'-1'>, Case8>>,
  Expect<Equal<PercentageParser<'%'>, Case9>>,
  Expect<Equal<PercentageParser<'1'>, Case10>>,
  Expect<Equal<PercentageParser<'100'>, Case11>>,
]
```

这题可以分两步来判断，一个是以 `'+' | '-'` 开头，另一个是以 `'%'` 结束：

```typescript
type PercentageParser<A extends string> = A extends `${infer S extends '+' | '-'}${infer R}`
  ? R extends `${infer F}%`
    ? [S, F, '%']
    : [S, R, '']
  : A extends `${infer F}%`
    ? ['', F, '%']
    : ['', A, '']
```

### Drop Char

> Drop a specified char from a string.

```typescript
type DropChar<S, C> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  // @ts-expect-error
  Expect<Equal<DropChar<'butter fly!', ''>, 'butterfly!'>>,
  Expect<Equal<DropChar<'butter fly!', ' '>, 'butterfly!'>>,
  Expect<Equal<DropChar<'butter fly!', '!'>, 'butter fly'>>,
  Expect<Equal<DropChar<'    butter fly!        ', ' '>, 'butterfly!'>>,
  Expect<Equal<DropChar<' b u t t e r f l y ! ', ' '>, 'butterfly!'>>,
  Expect<Equal<DropChar<' b u t t e r f l y ! ', 'b'>, '  u t t e r f l y ! '>>,
  Expect<Equal<DropChar<' b u t t e r f l y ! ', 't'>, ' b u   e r f l y ! '>>,
]
```

又是一道字符串操作题，递归处理即可：

```typescript
type DropChar<S, C, Result extends string = ''> = S extends `${infer F}${infer R}`
  ? F extends C
    ? DropChar<R, C, Result>
    : DropChar<R, C, `${Result}${F}`>
  : Result
```

或者：

```typescript
type DropChar<S extends string, C extends string> = S extends `${infer F}${infer R}`
  ? `${F extends C ? '' : F}${DropChar<R, C>}`
  : S
```

这题的 `// @ts-expect-error` 有点谜，就不处理了。

### MinusOne

> Given a number (always positive) as a type. Your type should return the number decreased by one.

```typescript
type MinusOne<T extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MinusOne<1>, 0>>,
  Expect<Equal<MinusOne<55>, 54>>,
  Expect<Equal<MinusOne<3>, 2>>,
  Expect<Equal<MinusOne<100>, 99>>,
  Expect<Equal<MinusOne<1101>, 1100>>,
]
```

数组它承受了它不该承受的东西，只因为它有个 `length`，所以在做这种加减法的类型体操，我们只需要给个数组，最终拿到它的 Length 即可：

```typescript
type Fill<N extends number, R extends number[] = []> = R['length'] extends N
  ? R
  : Fill<N, [...R, 0]>

type MinusOne<T extends number, A extends number[] = []> = Fill<T> extends [infer F, ...infer R]
  ? R['length']
  : never
```

但这一题，需要注意一下递归溢出问题，所以我们需要用其他办法来创建一个符合题目要求的数组：

```typescript
type Dict = {
  '0': [];
  '1': [0];
  '2': [0, 0];
  '3': [0, 0, 0];
  '4': [0, 0, 0, 0];
  '5': [0, 0, 0, 0, 0];
  '6': [0, 0, 0, 0, 0, 0];
  '7': [0, 0, 0, 0, 0, 0, 0];
  '8': [0, 0, 0, 0, 0, 0, 0, 0];
  '9': [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

type FillTenTimes<A extends 0[] = []> = [
  ...A, ...A, ...A, ...A, ...A,
  ...A, ...A, ...A, ...A, ...A
]

type Fill<N extends string, Result extends 0[] = []> = N extends `${infer F extends keyof Dict}${infer R}`
  ? Fill<R, [...FillTenTimes<Result>, ...Dict[F]]>
  : Result

type MinusOne<T extends number> = Fill<`${T}`> extends [infer F, ...infer R]
  ? R['length']
  : T

```

这里解释一下这个数组是怎么被创建出来的，以最后一个 case 的 1101 为例：

1. 交给 `Fill` 来填充的是字符串 `1101`，此时 `F === '1'`，`R === '101'`，初始的 `Result` 为 `[]`，它经过 `FillTenTimes` 处理后还是 `[]`，`Dict[F]` 为 `[0]`，所以交给第二次递归的是 `Fill<'101', [0]>`；
2. 第二次递归时：`F === '1'`，`R === '01'`，`Result === [0]`，然后 Result 经过 `FillTenTimes` 处理后变成 `[10 * 0]`，`Dict[F]` 为 `[0]`，所以交给第三次递归的是 `Fill<'01', [10 * 0, 0]>`；
3. 第三次递归时：`F === '0'`，`R === '1'`，`Result === [11 * 0]`， 然后 Result 经过 `FillTenTimes` 处理后变成 `[110 * 0]`，`Dict[F]` 为 `[]`，所以交给第四次递归的是 `Fill<'1', [110 * 0]>`；
4. 第四次递归时：`F === '1'`，`R === ''`，`Result === [110 * 0]`，然后 Result 经过 `FillTenTimes` 处理后变成 `[1100 * 0]`，`Dict[f]` 为 `[0]`，所以交给第五次递归的是 `Fill<'', [1100 * 0, 0]>`；
5. 第五次递归时，由于传入的是一个空字符串，所以条件不满足，此时返回 Result，也就是 `[1101 * 1]`。

### PickByType

> From `T`, pick a set of properties whose type are assignable to `U`.

```typescript
type PickByType<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Model {
  name: string
  count: number
  isReadonly: boolean
  isEnable: boolean
}

type cases = [
  Expect<Equal<PickByType<Model, boolean>, { isReadonly: boolean; isEnable: boolean }>>,
  Expect<Equal<PickByType<Model, string>, { name: string }>>,
  Expect<Equal<PickByType<Model, number>, { count: number }>>,
]
```

和 Pick 很类似，只不过是需要判断的是值：

```typescript
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}
```

### StartsWith

> Implement `StartsWith<T, U>` which takes two exact string types and returns whether `T` starts with `U`

```typescript
type StartsWith<T extends string, U extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<StartsWith<'abc', 'ac'>, false>>,
  Expect<Equal<StartsWith<'abc', 'ab'>, true>>,
  Expect<Equal<StartsWith<'abc', 'abcd'>, false>>,
  Expect<Equal<StartsWith<'abc', ''>, true>>,
  Expect<Equal<StartsWith<'abc', ' '>, false>>,
]
```

又是一道考验字符串操作的题：

```typescript
type StartsWith<T extends string, U extends string> = T extends `${U}${infer R}`
  ? true
  : false
```

### EndsWith

> Implement `EndsWith<T, U>` which takes two exact string types and returns whether `T` ends with `U`

```typescript
type EndsWith<T extends string, U extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<EndsWith<'abc', 'bc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'abc'>, true>>,
  Expect<Equal<EndsWith<'abc', 'd'>, false>>,
]
```

和 StartsWith 一样，只需要变换一下位置：

```typescript
type EndsWith<T extends string, U extends string> = T extends `${infer R}${U}`
  ? true
  : false
```

### PartialByKeys

> Implement a generic `PartialByKeys<T, K>` which takes two type argument `T` and `K`.

```typescript
type PartialByKeys<T, K> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface User {
  name: string
  age: number
  address: string
}

interface UserPartialName {
  name?: string
  age: number
  address: string
}

interface UserPartialNameAndAge {
  name?: string
  age?: number
  address: string
}

type cases = [
  Expect<Equal<PartialByKeys<User, 'name'>, UserPartialName>>,
  Expect<Equal<PartialByKeys<User, 'name' | 'unknown'>, UserPartialName>>,
  Expect<Equal<PartialByKeys<User, 'name' | 'age'>, UserPartialNameAndAge>>,
  Expect<Equal<PartialByKeys<User>, Partial<User>>>,
]
```

将符合指定的 Key 的那些项转成可选项，我们可以分成两步来做：一是从源对象中移除指定的 Key（[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)）；二是从源对象中取出指定的 Key （[Extract](https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union)）并将它们转成可选的：

```typescript
// 1. 通过 Omit 移除指定的 Key
type RequiredObject<T, K extends PropertyKey = keyof T> = Omit<T, K>
// 2. 通过 Extract 过滤指定的 Key
type PatrialObject<T, K extends PropertyKey = keyof T> = {
  [P in Extract<K, keyof T>]?: T[P]
}
```

然后再将两者合并即可：

```typescript
type Merge<T> = Omit<T, never>

type PartialByKeys<T, K extends PropertyKey = keyof T> = Merge<Omit<T, K> & {
  [P in Extract<K, keyof T>]?: T[P]
}>
```

### RequiredByKeys

> Implement a generic `RequiredByKeys<T,  K>` which takes two type argument `T` and `K`.
>
> `K` specify the set of properties of `T` that should set to be required. When `K` is not provided, it should make all properties required just like the normal `Required<T>`.

```typescript
type RequiredByKeys<T, K> = any


/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface User {
  name?: string
  age?: number
  address?: string
}

interface UserRequiredName {
  name: string
  age?: number
  address?: string
}

interface UserRequiredNameAndAge {
  name: string
  age: number
  address?: string
}

type cases = [
  Expect<Equal<RequiredByKeys<User, 'name'>, UserRequiredName>>,
  Expect<Equal<RequiredByKeys<User, 'name' | 'unknown'>, UserRequiredName>>,
  Expect<Equal<RequiredByKeys<User, 'name' | 'age'>, UserRequiredNameAndAge>>,
  Expect<Equal<RequiredByKeys<User>, Required<User>>>,
]
```

这题的思路和 [PartialByKeys](#PartialByKeys) 一样，但有点小区别：

```typescript
type Merge<T> = Omit<T, never>

type RequiredByKeys<T, K = keyof T> = Merge<{
  [P in keyof T as P extends K ? P : never]-?: T[P]
} & {
  [P in keyof T as P extends K ? never : P]: T[P]
}>
```

### Mutable

> Implement the generic ```Mutable<T>``` which makes all properties in ```T``` mutable (not readonly).

```typescript
type Mutable<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Todo1 {
  title: string
  description: string
  completed: boolean
  meta: {
    author: string
  }
}

type List = [1, 2, 3]

type cases = [
  Expect<Equal<Mutable<Readonly<Todo1>>, Todo1>>,
  Expect<Equal<Mutable<Readonly<List>>, List>>,
]

type errors = [
  // @ts-expect-error
  Mutable<'string'>,
  // @ts-expect-error
  Mutable<0>,
]
```

通过 `-` 号操作可以把 readonly 标识给移除，同时别忘了给泛型加约束处理掉 errors：

```typescript
type Mutable<T extends Record<PropertyKey, any>> = {
  -readonly [P in keyof T]: T[P]
}
```

### OmitByType

> From ```T```, pick a set of properties whose type are not assignable to ```U```.

```typescript
type OmitByType<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Model {
  name: string
  count: number
  isReadonly: boolean
  isEnable: boolean
}

type cases = [
  Expect<Equal<OmitByType<Model, boolean>, { name: string; count: number }>>,
  Expect<Equal<OmitByType<Model, string>, { count: number; isReadonly: boolean; isEnable: boolean }>>,
  Expect<Equal<OmitByType<Model, number>, { name: string; isReadonly: boolean; isEnable: boolean }>>,
]
```

只需要把值的类型做一次对比即可：

```typescript
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}
```

### ObjectEntries

> Implement the type version of ```Object.entries```

```typescript
type ObjectEntries<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

interface Model {
  name: string
  age: number
  locations: string[] | null
}

type ModelEntries = ['name', string] | ['age', number] | ['locations', string[] | null]

type cases = [
  Expect<Equal<ObjectEntries<Model>, ModelEntries>>,
  Expect<Equal<ObjectEntries<Partial<Model>>, ModelEntries>>,
  Expect<Equal<ObjectEntries<{ key?: undefined }>, ['key', undefined]>>,
  Expect<Equal<ObjectEntries<{ key: undefined }>, ['key', undefined]>>,
]
```

这题需要注意两点，一个是把 T 转成 Required，另一个就是 undefined 的处理：

```typescript
type ObjectEntries<T, R = Required<T>, K extends keyof R = keyof R> = K extends keyof R
  ? [K, R[K] extends undefined ? undefined : R[K]]
  : never
```

### Shift

> Implement the type version of ```Array.shift```

```typescript
type Shift<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Shift<[3, 2, 1]>, [2, 1]>>,
  Expect<Equal<Shift<['a', 'b', 'c', 'd']>, ['b', 'c', 'd']>>,
]
```

这题是比较简单的：

```typescript
type Shift<T> = T extends [infer F, ...infer R]
  ? R
  : never
```

### Tuple to Nested Object

> Given a tuple type ```T``` that only contains string type, and a type ```U```, build an object recursively.

```typescript
type TupleToNestedObject<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TupleToNestedObject<['a'], string>, { a: string }>>,
  Expect<Equal<TupleToNestedObject<['a', 'b'], number>, { a: { b: number } }>>,
  Expect<Equal<TupleToNestedObject<['a', 'b', 'c'], boolean>, { a: { b: { c: boolean } } }>>,
  Expect<Equal<TupleToNestedObject<[], boolean>, boolean>>,
]
```

常规的数组递归操作即可：

```typescript
type TupleToNestedObject<T, U> = T extends [infer F extends string, ...infer R]
  ? {
    [P in F]: TupleToNestedObject<R, U>
  }
  : U
```

### Reverse

> Implement the type version of ```Array.reverse```

```typescript
type Reverse<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Reverse<[]>, []>>,
  Expect<Equal<Reverse<['a', 'b']>, ['b', 'a']>>,
  Expect<Equal<Reverse<['a', 'b', 'c']>, ['c', 'b', 'a']>>,
]
```

反转数组，这个也很简单：

```typescript
type Reverse<T> = T extends [...infer R, infer L]
  ? [L, ...Reverse<R>]
  : T
```

### Flip Arguments

> Implement the type version of lodash's ```_.flip```.
>
>  Type ```FlipArguments<T>``` requires function type ```T``` and returns a new function type which has the same return type of T but reversed parameters.

```typescript
type FlipArguments<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<FlipArguments<() => boolean>, () => boolean>>,
  Expect<Equal<FlipArguments<(foo: string) => number>, (foo: string) => number>>,
  Expect<Equal<FlipArguments<(arg0: string, arg1: number, arg2: boolean) => void>, (arg0: boolean, arg1: number, arg2: string) => void>>,
]

type errors = [
  // @ts-expect-error
  FlipArguments<'string'>,
  // @ts-expect-error
  FlipArguments<{ key: 'value' }>,
  // @ts-expect-error
  FlipArguments<['apple', 'banana', 100, { a: 1 }]>,
  // @ts-expect-error
  FlipArguments<null | undefined>,
]
```

首先需要对泛型加上约束解决 error cases：

```typescript
type FlipArguments<T extends (...args: any[]) => any> = any
```

反转参数，这就和反转数组是一致的了：

```typescript
type Reverse<T> = T extends [...infer R, infer L]
  ? [L, ...Reverse<R>]
  : T

type FlipArguments<T extends (...args: any[]) => any> = T extends (...args: infer Args) => infer R
  ? (...args: Reverse<Args>) => R
  : never
```

### FlattenDepth

> Recursively flatten array up to depth times.

```typescript
type FlattenDepth = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<FlattenDepth<[]>, []>>,
  Expect<Equal<FlattenDepth<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<FlattenDepth<[1, [2]]>, [1, 2]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, [[5]]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 3>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>, [1, 2, 3, 4, 5]>>,
]
```

这题给的初始内容有点少得可怜，所以泛型这一块就需要我们自己补充上去了：

```typescript
type FlattenDepth<T extends unknown[], D extends number = 1> = any
```

需要注意的是这里的 case 有一个比较大的层级数，所以我们不能够采用减法的形式来计算，再借助一个初始值做加法比对：

```typescript
type FlattenDepth<T extends unknown[], D extends number = 1, S extends number = 0>
```

解题思路就比较简单了：

```typescript
type Plus<T extends number, R extends 0[] = []> = R['length'] extends T
  ? [...R, 0]['length']
  : Plus<T, [0, ...R]>

type FlattenDepth<T extends unknown[], D extends number = 1, S extends number = 0> = S extends D
  ? T
  : T extends [infer F, ...infer R]
    ? [
      ...(F extends any[]
        ? FlattenDepth<F, D, Plus<S>>
        : [F]
      ),
      ...FlattenDepth<R, D, S>
    ]
    : T
```

### BEM style string

> The Block, Element, Modifier methodology (BEM) is a popular naming convention for classes in CSS. 
>
> For example, the block component would be represented as `btn`, element that depends upon the block would be represented as `btn__price`, modifier that changes the style of the block would be represented as `btn--big` or `btn__price--warning`.
>
>  Implement `BEM<B, E, M>` which generate string union from these three parameters. Where `B` is a string literal, `E` and `M` are string arrays (can be empty).

```typescript
type BEM<B extends string, E extends string[], M extends string[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<BEM<'btn', ['price'], []>, 'btn__price'>>,
  Expect<Equal<BEM<'btn', ['price'], ['warning', 'success']>, 'btn__price--warning' | 'btn__price--success' >>,
  Expect<Equal<BEM<'btn', [], ['small', 'medium', 'large']>, 'btn--small' | 'btn--medium' | 'btn--large' >>,
]
```

这题我们需要利用 `T[number]` 将数组转成 Union：

```typescript
type BEM<B extends string, E extends string[], M extends string[]> = `${B}${E[number] extends '' ? '' : `__${E[number]}`}${M[number] extends '' ? '' : `--${M[number]}`}`
```

### InorderTraversal

> Implement the type version of binary tree inorder traversal.

```typescript
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}
type InorderTraversal<T extends TreeNode | null> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

const tree1 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: {
      val: 3,
      left: null,
      right: null,
    },
    right: null,
  },
} as const

const tree2 = {
  val: 1,
  left: null,
  right: null,
} as const

const tree3 = {
  val: 1,
  left: {
    val: 2,
    left: null,
    right: null,
  },
  right: null,
} as const

const tree4 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: null,
    right: null,
  },
} as const

type cases = [
  Expect<Equal<InorderTraversal<null>, []>>,
  Expect<Equal<InorderTraversal<typeof tree1>, [1, 3, 2]>>,
  Expect<Equal<InorderTraversal<typeof tree2>, [1]>>,
  Expect<Equal<InorderTraversal<typeof tree3>, [2, 1]>>,
  Expect<Equal<InorderTraversal<typeof tree4>, [1, 2]>>,
]
```

这题我们需要注意的是它的取值顺序是 `left.val` 、`val`、`right.val`：

```typescript
type InorderTraversal<T extends TreeNode | null> = T extends TreeNode
  ? [
      ...T['left'] extends TreeNode ? InorderTraversal<T['left']> : [],
      T['val'],
      ...T['right'] extends TreeNode ? InorderTraversal<T['right']> : []
    ]
  : []
```

### Flip

> Implement the type of `just-flip-object`.

```typescript
type Flip<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect, NotEqual } from '@type-challenges/utils'

type cases = [
  Expect<Equal<{ a: 'pi' }, Flip<{ pi: 'a' }>>>,
  Expect<NotEqual<{ b: 'pi' }, Flip<{ pi: 'a' }>>>,
  Expect<Equal<{ 3.14: 'pi'; true: 'bool' }, Flip<{ pi: 3.14; bool: true }>>>,
  Expect<Equal<{ val2: 'prop2'; val: 'prop' }, Flip<{ prop: 'val'; prop2: 'val2' }>>>,
]
```

这题是把键值交换，需要注意的是，对象的键也就是 `PropertyKey` 他只能是 `string | number | symbol` ，如果不符合 `PropertyKey` 的约束，我们需要把它转成字符串：

```typescript
type Flip<T extends Record<PropertyKey, any>> = {
  [P in keyof T as T[P] extends PropertyKey ? T[P] : `${T[P]}`]: P
}
```

### Fibonacci Sequence

> Implement a generic Fibonacci\<T\> takes an number T and returns it's corresponding [Fibonacci number](https://en.wikipedia.org/wiki/Fibonacci_number).

```typescript
type Fibonacci<T extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Fibonacci<3>, 2>>,
  Expect<Equal<Fibonacci<8>, 21>>,
]
```

我们需要了解什么是斐波那契数列：`1, 1, 2, 3, 5, 8, 13, ...`

然后从中取出指定索引的值，所以我们需要一些辅助类型来存储上一个值和当前值，并且让计算从第 2 项才开始：

```typescript
type NumberToTuple<T extends Number, R extends 0[] = []> = R['length'] extends T
  ? R
  : NumberToTuple<T, [...R, 0]>

type Plus<T extends number, N extends number> = [
  ...NumberToTuple<T>,
  ...NumberToTuple<N>
]['length'] & number

// 1, 1, 2, 3, 5, 8,  ...

type Fibonacci<
  T extends number,
  Start extends number = 2,
  Prev extends number = 0,
  Last extends number = 1
> = T extends 0 | 1
  ? 1
  : Start extends T
    ? Plus<Prev, Last>
    : Fibonacci<T, Plus<Start, 1>, Last, Plus<Prev, Last>>
```

### AllCombinations

> Implement type ```AllCombinations<S>``` that return all combinations of strings which use characters from ```S``` at most once.

```typescript
type AllCombinations<S> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<AllCombinations<''>, ''>>,
  Expect<Equal<AllCombinations<'A'>, '' | 'A'>>,
  Expect<Equal<AllCombinations<'AB'>, '' | 'A' | 'B' | 'AB' | 'BA'>>,
  Expect<Equal<AllCombinations<'ABC'>, '' | 'A' | 'B' | 'C' | 'AB' | 'AC' | 'BA' | 'BC' | 'CA' | 'CB' | 'ABC' | 'ACB' | 'BAC' | 'BCA' | 'CAB' | 'CBA'>>,
  Expect<Equal<AllCombinations<'ABCD'>, '' | 'A' | 'B' | 'C' | 'D' | 'AB' | 'AC' | 'AD' | 'BA' | 'BC' | 'BD' | 'CA' | 'CB' | 'CD' | 'DA' | 'DB' | 'DC' | 'ABC' | 'ABD' | 'ACB' | 'ACD' | 'ADB' | 'ADC' | 'BAC' | 'BAD' | 'BCA' | 'BCD' | 'BDA' | 'BDC' | 'CAB' | 'CAD' | 'CBA' | 'CBD' | 'CDA' | 'CDB' | 'DAB' | 'DAC' | 'DBA' | 'DBC' | 'DCA' | 'DCB' | 'ABCD' | 'ABDC' | 'ACBD' | 'ACDB' | 'ADBC' | 'ADCB' | 'BACD' | 'BADC' | 'BCAD' | 'BCDA' | 'BDAC' | 'BDCA' | 'CABD' | 'CADB' | 'CBAD' | 'CBDA' | 'CDAB' | 'CDBA' | 'DABC' | 'DACB' | 'DBAC' | 'DBCA' | 'DCAB' | 'DCBA'>>,
]
```

首先要做的就是把字符串给转成联合类型：

```typescript
type StringToUnion<S extends string = ''> = S extends `${infer F}${infer R}` 
  ? F | StringToUnion<R>
  : never
```

然后利用分布式条件类型自动生成结果：

```typescript
type StringToUnion<S extends string = ''> = S extends `${infer F}${infer R}`
  ? F | StringToUnion<R>
  : never

type Combinations<T extends string> = [T] extends [never]
  ? ''
  : '' | { [K in T]: `${K}${Combinations<Exclude<T, K>>}` }[T]

type AllCombinations<S extends string> = Combinations<StringToUnion<S>>
```

分析结果可以看这里：[https://www.yuque.com/liaojie3/yuiou5/ogyeiz#giVmO](https://www.yuque.com/liaojie3/yuiou5/ogyeiz#giVmO)

### Greater Than

> In This Challenge, You should implement a type `GreaterThan<T, U>` like `T > U`
>
> Negative numbers do not need to be considered.

```typescript
type GreaterThan<T extends number, U extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<GreaterThan<1, 0>, true>>,
  Expect<Equal<GreaterThan<5, 4>, true>>,
  Expect<Equal<GreaterThan<4, 5>, false>>,
  Expect<Equal<GreaterThan<0, 0>, false>>,
  Expect<Equal<GreaterThan<20, 20>, false>>,
  Expect<Equal<GreaterThan<10, 100>, false>>,
  Expect<Equal<GreaterThan<111, 11>, true>>,
]
```

这里的解题思路是：

1. 先过滤相等项；

   ```typescript
   type GT<T extends number, U extends number> = any
   
   type GreaterThan<T extends number, U extends number> = Equal<T, U> extends true
     ? false
     : GT<T, U>
   ```

2. 然后递归地把第一项做 “减一” 操作，直到它和第二项相等，或者变为 0 为止。

   ```typescript
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
   
   type GreaterThan<T extends number, U extends number> = Equal<T, U> extends true
     ? false
     : GT<T, U>
   ```

### Zip

> In This Challenge, You should implement a type `Zip<T, U>`, T and U must be `Tuple`

```typescript
type Zip = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Zip<[], []>, []>>,
  Expect<Equal<Zip<[1, 2], [true, false]>, [[1, true], [2, false]]>>,
  Expect<Equal<Zip<[1, 2, 3], ['1', '2']>, [[1, '1'], [2, '2']]>>,
  Expect<Equal<Zip<[], [1, 2, 3]>, []>>,
  Expect<Equal<Zip<[[1, 2]], [3]>, [[[1, 2], 3]]>>,
]
```

根据题目要求，它需要两个泛型参数，并且都得是一个数组：

```typescript
type Zip<T extends unknown[], U extends unknown[]> = any
```

之后就是简单的数组操作了：

```typescript
type Zip<T extends unknown[], U extends unknown[]> = T extends []
  ? []
  : T extends [infer TF, ...infer TR]
    ? U extends [infer UF, ...infer UR]
      ? [[TF, UF], ...Zip<TR, UR>]
      : []
    : []
```

### IsTuple

> Implement a type ```IsTuple```, which takes an input type ```T``` and returns whether ```T``` is tuple type.

```typescript
type IsTuple<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IsTuple<[]>, true>>,
  Expect<Equal<IsTuple<[number]>, true>>,
  Expect<Equal<IsTuple<readonly [1]>, true>>,
  Expect<Equal<IsTuple<{ length: 1 }>, false>>,
  Expect<Equal<IsTuple<number[]>, false>>,
  Expect<Equal<IsTuple<never>, false>>,
]
```

这题是比较简单的，我们可以使用 `[any?]` 来表示一个数组。当然，我们需要先排除掉 never：

```typescript
type IsTuple<T> = [T] extends [never]
  ? false
  : T extends readonly [any?]
    ? true
    : false
```

### Chunk

> Do you know `lodash`? `Chunk` is a very useful function in it, now let's implement it.
>
>  `Chunk<T, N>` accepts two required type parameters, the `T` must be a `tuple`, and the `N` must be an `integer >=1`

```typescript
type Chunk = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Chunk<[], 1>, []>>,
  Expect<Equal<Chunk<[1, 2, 3], 1>, [[1], [2], [3]]>>,
  Expect<Equal<Chunk<[1, 2, 3], 2>, [[1, 2], [3]]>>,
  Expect<Equal<Chunk<[1, 2, 3, 4], 2>, [[1, 2], [3, 4]]>>,
  Expect<Equal<Chunk<[1, 2, 3, 4], 5>, [[1, 2, 3, 4]]>>,
  Expect<Equal<Chunk<[1, true, 2, false], 2>, [[1, true], [2, false]]>>,
]
```

首先，根据题目要求把泛型以及约束加上：

```typescript
type Chunk<T extends unknown[], N extends number = 1> = any
```

先实现一个用于取值的 Slice 类型，它会从指定的数组中取出指定长度的项：

```typescript
type GetItem<T extends unknown[], N extends number = 1, Res extends unknown[] = []> = Res['length'] extends N
  ? Res
  : T extends [infer F, ...infer R]
    ? GetItem<R, N, [...Res, F]>
    : Res
```

然后就是常规的数组操作了：

```typescript
type Slice<T extends unknown[], N extends number = 1, Res extends unknown[] = []> = Res['length'] extends N
  ? Res
  : T extends [infer F, ...infer R]
    ? Slice<R, N, [...Res, F]>
    : Res

type Chunk<T extends unknown[], N extends number = 1, Res extends unknown[] = []> = T extends []
  ? []
  : T extends [...Slice<T, N>, ...infer R]
    ? R extends []
      ? [...Res, Slice<T, N>]
      : Chunk<R, N, [...Res, Slice<T, N>]>
    : never	
```

### Fill

> `Fill`, a common JavaScript function, now let us implement it with types.
>
>  `Fill<T, N, Start?, End?>`, as you can see,`Fill` accepts four types of parameters, of which `T` and `N` are required parameters, and `Start` and `End` are optional parameters.
>
>  The requirements for these parameters are: `T` must be a `tuple`, `N` can be any type of value, `Start` and `End` must be integers greater than or equal to 0.

```typescript
type Fill<
  T extends unknown[],
  N,
  Start extends number = 0,
  End extends number = T['length'],
> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Fill<[], 0>, []>>,
  Expect<Equal<Fill<[], 0, 0, 3>, []>>,
  Expect<Equal<Fill<[1, 2, 3], 0, 0, 0>, [1, 2, 3]>>,
  Expect<Equal<Fill<[1, 2, 3], 0, 2, 2>, [1, 2, 3]>>,
  Expect<Equal<Fill<[1, 2, 3], 0>, [0, 0, 0]>>,
  Expect<Equal<Fill<[1, 2, 3], true>, [true, true, true]>>,
  Expect<Equal<Fill<[1, 2, 3], true, 0, 1>, [true, 2, 3]>>,
  Expect<Equal<Fill<[1, 2, 3], true, 1, 3>, [1, true, true]>>,
  Expect<Equal<Fill<[1, 2, 3], true, 10, 0>, [1, 2, 3]>>,
  Expect<Equal<Fill<[1, 2, 3], true, 0, 10>, [true, true, true]>>,
]
```

我们先排除 Start 和 End 相同，或者 End 为 0 的 case，然后再处理其它的：

```typescript
type Fill<
  T extends unknown[],
  N,
  Start extends number = 0,
  End extends number = T['length']
> = Start extends End ? T : End extends 0 ? T : FillRest<T, N, Start, End>
```

`FillReset` 利用一个计数器 Count 来决定什么时候开始对值进行替换：

```typescript
type PlusOne<T extends number, Res extends 0[] = []> = Res['length'] extends T
  ? [...Res, 0]['length']
  : PlusOne<T, [...Res, 0]>

type FillRest<
  T extends unknown[],
  N,
  Start extends number = 0,
  End extends number = T['length'],
  Count extends number = 0,
  Res extends unknown[] = []
> = Start extends End
  ? [...Res, ...T]
  : T extends [infer F, ... infer R]
    ? Count extends Start
      ? FillRest<R, N, PlusOne<Start>, End, PlusOne<Count>, [...Res, N]>
      : FillRest<R, N, Start, End, PlusOne<Count>, [...Res, F]>
    : Res
```

### Trim Right

> Implement `TrimRight<T>` which takes an exact string type and returns a new string with the whitespace ending removed.

```typescript
type TrimRight<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TrimRight<'str'>, 'str'>>,
  Expect<Equal<TrimRight<'str '>, 'str'>>,
  Expect<Equal<TrimRight<'str     '>, 'str'>>,
  Expect<Equal<TrimRight<'     str     '>, '     str'>>,
  Expect<Equal<TrimRight<'   foo bar  \n\t '>, '   foo bar'>>,
  Expect<Equal<TrimRight<''>, ''>>,
  Expect<Equal<TrimRight<'\n\t '>, ''>>,
]
```

这和之前的 [TrimLeft](#TrimLeft) 一样的处理方式：

```typescript
type TrimRight<S extends string> = S extends `${infer R}${' ' | '\n' | '\t'}`
  ? TrimRight<R>
  : S
```

### Without

> Implement the type version of Lodash.without, Without<T, U> takes an Array T, number or array U and returns an Array without the elements of U.

```typescript
type Without<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Without<[1, 2], 1>, [2]>>,
  Expect<Equal<Without<[1, 2, 4, 1, 5], [1, 2]>, [4, 5]>>,
  Expect<Equal<Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>, []>>,
]
```

就是过滤操作，首先我们把 U 转成联合类型：

```typescript
type ToUnion<T extends number | unknown[]> = T extends number
  ? T
  : T extends any[]
    ? T[number]
    : never
```

然后就是常规的对比操作了：

```typescript
type ToUnion<T extends number | unknown[]> = T extends number
  ? T
  : T extends any[]
    ? T[number]
    : never

type Without<
  T,
  U extends number | unknown[],
  D = ToUnion<U>,
  Result extends unknown[] = []
> = T extends [infer F, ...infer R]
  ? F extends D
    ? Without<R, U, D, Result>
    : Without<R, U, D, [...Result, F]>
  : Result
```

### Trunc

> Implement the type version of ```Math.trunc```, which takes string or number and returns the integer part of a number by removing any fractional digits.

```typescript
type Trunc = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Trunc<0.1>, '0'>>,
  Expect<Equal<Trunc<1.234>, '1'>>,
  Expect<Equal<Trunc<12.345>, '12'>>,
  Expect<Equal<Trunc<-5.1>, '-5'>>,
  Expect<Equal<Trunc<'1.234'>, '1'>>,
  Expect<Equal<Trunc<'-10.234'>, '-10'>>,
  Expect<Equal<Trunc<10>, '10'>>,
]
```

移除小数位，直接字符串操作即可：

```typescript
type Trunc<T extends number | string> = `${T}` extends `${infer F}.${infer R}`
  ? `${F}`
  : `${T}`
```

### IndexOf

> Implement the type version of Array.indexOf, indexOf<T, U> takes an Array T, any U and returns the index of the first U in Array T.

```typescript
type IndexOf<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<IndexOf<[1, 2, 3], 2>, 1>>,
  Expect<Equal<IndexOf<[2, 6, 3, 8, 4, 1, 7, 3, 9], 3>, 2>>,
  Expect<Equal<IndexOf<[0, 0, 0], 2>, -1>>,
  Expect<Equal<IndexOf<[string, 1, number, 'a'], number>, 2>>,
  Expect<Equal<IndexOf<[string, 1, number, 'a', any], any>, 4>>,
]
```

递归比对即可：

```typescript
type PlusOne<T extends number, Res extends 0[] = []> = Res['length'] extends T
  ? [...Res, 0]['length']
  : PlusOne<T, [...Res, 0]>

type IndexOf<T, U, I extends number = 0> = T extends [infer F, ...infer R]
  ? Equal<F, U> extends true
    ? I
    : IndexOf<R, U, PlusOne<I>>
  : -1
```

### Join

> Implement the type version of Array.join, Join<T, U> takes an Array T, string or number U and returns the Array T with U stitching up.

```typescript
type Join<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Join<['a', 'p', 'p', 'l', 'e'], '-'>, 'a-p-p-l-e'>>,
  Expect<Equal<Join<['Hello', 'World'], ' '>, 'Hello World'>>,
  Expect<Equal<Join<['2', '2', '2'], 1>, '21212'>>,
  Expect<Equal<Join<['o'], 'u'>, 'o'>>,
]
```

我能想到的是先将 T 中所有项都和 U 拼接起来，然后再去除最后一个 U 便可以解开这道题：

```typescript
type RemoveLast<T extends string, U extends string> = T extends `${infer R}${U}`
  ? R
  : T

type FullJoin<T extends string[], U extends string, Result extends string = ''> = T extends [infer F extends string, ...infer R extends string[]]
  ? FullJoin<R, U, `${Result}${F}${U}`>
  : Result

type Join<T extends string[], U extends string | number> = RemoveLast<FullJoin<T, `${U}`>, `${U}`>
```

### LastIndexOf

> Implement the type version of ```Array.lastIndexOf```, ```LastIndexOf<T, U>```  takes an Array ```T```, any ```U``` and returns the index of the last ```U``` in Array ```T```

```typescript
type LastIndexOf<T, U> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<LastIndexOf<[1, 2, 3, 2, 1], 2>, 3>>,
  Expect<Equal<LastIndexOf<[2, 6, 3, 8, 4, 1, 7, 3, 9], 3>, 7>>,
  Expect<Equal<LastIndexOf<[0, 0, 0], 2>, -1>>,
  Expect<Equal<LastIndexOf<[string, 2, number, 'a', number, 1], number>, 4>>,
  Expect<Equal<LastIndexOf<[string, any, 1, number, 'a', any, 1], any>, 5>>,
]
```

这题相对于 IndexOf 会更加简单，每一次取数组中最后一位作比对操作，如果相同，则数组中剩余项的个数即为 LastIndex：

```typescript
type LastIndexOf<T extends unknown[], U> = T extends [...infer R, infer L]
  ? Equal<U, L> extends true
    ? R['length']
    : LastIndexOf<R, U>
  : -1
```

### Unique

> Implement the type version of Lodash.uniq, Unique<T> takes an Array T, returns the Array T without repeated values.

```typescript
type Unique<T> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Unique<[1, 1, 2, 2, 3, 3]>, [1, 2, 3]>>,
  Expect<Equal<Unique<[1, 2, 3, 4, 4, 5, 6, 7]>, [1, 2, 3, 4, 5, 6, 7]>>,
  Expect<Equal<Unique<[1, 'a', 2, 'b', 2, 'a']>, [1, 'a', 2, 'b']>>,
  Expect<Equal<Unique<[string, number, 1, 'a', 1, string, 2, 'b', 2, number]>, [string, number, 1, 'a', 2, 'b']>>,
  Expect<Equal<Unique<[unknown, unknown, any, any, never, never]>, [unknown, any, never]>>,
]
```

通过 Includes 来判断是否已经取过该值即可：

```typescript
type Includes<T extends unknown[], U> = T extends [infer F, ...infer R]
  ? Equal<U, F> extends true
    ? true
    : Includes<R, U>
  : false

type Unique<T extends unknown[], Res extends unknown[] = []> = T extends [infer F, ...infer R]
  ? Includes<Res, F> extends true
    ? Unique<R, Res>
    : Unique<R, [...Res, F]>
  : Res
```

### MapTypes

> Implement `MapTypes<T, R>` which will transform types in object T to different types defined by type R which has the following structure

```typescript
type MapTypes<T, R> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MapTypes<{ stringToArray: string }, { mapFrom: string; mapTo: [] }>, { stringToArray: [] }>>,
  Expect<Equal<MapTypes<{ stringToNumber: string }, { mapFrom: string; mapTo: number }>, { stringToNumber: number }>>,
  Expect<Equal<MapTypes<{ stringToNumber: string; skipParsingMe: boolean }, { mapFrom: string; mapTo: number }>, { stringToNumber: number; skipParsingMe: boolean }>>,
  Expect<Equal<MapTypes<{ date: string }, { mapFrom: string; mapTo: Date } | { mapFrom: string; mapTo: null }>, { date: null | Date }>>,
  Expect<Equal<MapTypes<{ date: string }, { mapFrom: string; mapTo: Date | null }>, { date: null | Date }>>,
  Expect<Equal<MapTypes<{ fields: Record<string, boolean> }, { mapFrom: Record<string, boolean>; mapTo: string[] }>, { fields: string[] }>>,
  Expect<Equal<MapTypes<{ name: string }, { mapFrom: boolean; mapTo: never }>, { name: string }>>,
  Expect<Equal<MapTypes<{ name: string; date: Date }, { mapFrom: string; mapTo: boolean } | { mapFrom: Date; mapTo: string }>, { name: boolean; date: string }>>,
]
```

这题需要注意的是 U 有可能是一个联合类型，所以需要进一步判断：

```typescript
type Includes<T extends Record<'mapFrom' | 'mapTo', any>, U> = T extends {}
  ? T['mapFrom'] extends U
    ? T['mapTo']
    : never
  : T['mapTo']

type MapTypes<T, R extends Record<'mapFrom' | 'mapTo', any>> = {
  [P in keyof T]: T[P] extends R['mapFrom']
    ? Includes<R, T[P]>
    : T[P]
}
```

### Construct Tuple

> Construct a tuple with a given length.

```typescript
type ConstructTuple<L extends number> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ConstructTuple<0>, []>>,
  Expect<Equal<ConstructTuple<2>, [unknown, unknown]>>,
  Expect<Equal<ConstructTuple<999>['length'], 999>>,
  // @ts-expect-error
  Expect<Equal<ConstructTuple<1000>['length'], 1000>>,
]
```

生成一个指定长度的数组，这点在之前的挑战中已经多次实现过了，最后一个 case 是因为递归上限会导致出错：

```typescript
type ConstructTuple<L extends number, Res extends unknown[] = []> = Res['length'] extends L
  ? Res
  : ConstructTuple<L, [...Res, unknown]>
```

### Number Range

> Sometimes we want to limit the range of numbers...

```typescript
import type { Equal, Expect } from '@type-challenges/utils'
type Result1 = | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Result2 = | 0 | 1 | 2
type Result3 =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
  | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60
  | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70
  | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80
  | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90
  | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100
  | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110
  | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120
  | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130
  | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140
type cases = [
  Expect<Equal<NumberRange<2, 9>, Result1>>,
  Expect<Equal<NumberRange<0, 2>, Result2>>,
  Expect<Equal<NumberRange<0, 140>, Result3>>,
]
```

加一递归即可：

```typescript
type PlusOne<T extends Number, Res extends 0[] = []> = Res['length'] extends T
  ? [...Res, 0]['length']
  : PlusOne<T, [...Res, 0]>

type NumberRange<L extends number, H extends number, Res = H> = L extends H
  ? Res
  : NumberRange<PlusOne<L>, H, L | Res>
```

### Combination

> Given an array of strings, do Permutation & Combination.
>
>   It's also useful for the prop types like video [controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList)

```typescript
type Combination<T extends string[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Combination<['foo', 'bar', 'baz']>,
  'foo' | 'bar' | 'baz' | 'foo bar' | 'foo bar baz' | 'foo baz' | 'foo baz bar' | 'bar foo' | 'bar foo baz' | 'bar baz' | 'bar baz foo' | 'baz foo' | 'baz foo bar' | 'baz bar' | 'baz bar foo'>>,
]
```

这题类似于 [AllCombinations](#AllCombinations)，但比那题要简单一点：

```typescript
type Combination<T extends string[], U = T[number], D = U> = D extends string
  ? `${D}` | `${D} ${Combination<[], Exclude<U, D>>}`
  : never
```

### Subsequence

> Given an array of unique elements, return all possible subsequences.
>
> A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.

```typescript
type Subsequence<T extends any[]> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Subsequence<[1, 2]>, [] | [1] | [2] | [1, 2]>>,
  Expect<Equal<Subsequence<[1, 2, 3]>, [] | [1] | [2] | [1, 2] | [3] | [1, 3] | [2, 3] | [1, 2, 3] >>,
]
```

数组操作：

```typescript
type Subsequence<T extends any[], Result extends any[] = []> = T extends [infer F, ...infer R]
  ? Result | Subsequence<R, [...Result, F]> | Subsequence<R, Result>
  : Result
```

以 `[1, 2]` 为例：

```typescript
// 1.
type Subsequence<[1, 2], []> = [1, 2] extends [1, ...[2]]
  ? [] | Subsequence<[2], [...[], 1]> | Subsequence<[2], []>
  : []

// 2.1
type Subsequence<[2], [1]> = [2] extends [2, ...[]]
  ? [] | Subsequence<[], [...[1], 2]> | Subsequence<[], [1]>
  : [1]
// => [] | [1, 2] | [1]

// 2.2
type Subsequence<[2], []> = [2] extends [2, ...[]]
  ? [] | Subsequence<[], [...[], 2]> | Subsequence<[], []>
  : []
// => [2] | []

// 3. 最终返回
= [1, 2] | [] | [2] | [1]
```

### Trim

> Implement `Trim<T>` which takes an exact string type and returns a new string with the whitespace from both ends removed.

```typescript
type Trim<S extends string> = any

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Trim<'str'>, 'str'>>,
  Expect<Equal<Trim<' str'>, 'str'>>,
  Expect<Equal<Trim<'     str'>, 'str'>>,
  Expect<Equal<Trim<'str   '>, 'str'>>,
  Expect<Equal<Trim<'     str     '>, 'str'>>,
  Expect<Equal<Trim<'   \n\t foo bar \t'>, 'foo bar'>>,
  Expect<Equal<Trim<''>, ''>>,
  Expect<Equal<Trim<' \n\t '>, ''>>,
]
```

字符串操作：

```typescript
type Removable = ' ' | '\n' | '\t'

type Trim<S extends string> = S extends `${Removable}${infer R}`
  ? R extends `${infer L}${Removable}`
    ? Trim<L>
    : Trim<R>
  : S extends `${infer L}${Removable}`
    ? Trim<L>
    : S
```

