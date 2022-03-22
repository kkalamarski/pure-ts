type MaybeOrType<T> = T | Option<T> | null | undefined
type MatchFunction<T, U> = { Some: (value: T) => U; None: () => U }

export const None = Symbol('None')

export const Some = <T>(x: T) => Option.some<T>(x)

class Option<T> {
  private constructor(private value: T | typeof None) { }

  static of<T>(value: T): Option<T> {
    return Option.some<T>(value)
  }

  static some<T>(value: T): Option<T> {
    if (value === null || value === undefined) return Option.none<T>()

    return new Option<T>(value)
  }

  static none<T>(): Option<T> {
    return new Option<T>(None)
  }

  map<U>(f: (value: T) => U): Option<U> {
    if (this.value === None) return Option.none<U>()

    return Option.some<U>(f(this.value))
  }

  flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    if (this.value === None) return Option.none<U>()

    return f(this.value)
  }

  toString(): string {
    if (this.value === None) return `None()`

    return `Some(${this.value})`
  }

  isSome(): boolean {
    return this.value !== None
  }

  isNone(): boolean {
    return this.value === None
  }

  match<U>({ Some, None: NoneFn }: MatchFunction<T, U>): U {
    if (this.value === None) return NoneFn()

    return Some(this.value)
  }

  public static do<T>(
    f: () => Generator<MaybeOrType<T>, MaybeOrType<T>, T>
  ): Option<T> {
    const generator = f()

    let step = generator.next()

    while (!step.done) {
      const value = step.value

      if (value instanceof Option) {
        if (value.isNone()) return Option.none<T>()

        value.match({
          Some: x => {
            step = generator.next(x)
          },
          None: () => { }
        })
      } else {
        const maybe = Option.some(value as T)

        if (maybe.isNone()) return Option.none<T>()

        step = generator.next(value as T)
      }
    }

    const { value } = step

    if (value instanceof Option) {
      return value
    }

    return Option.some(value as T)
  }

  public static sequence<T>(list: Array<Option<T>>): Option<Array<T>> {
    return Option.do(function*() {
      const result: Array<T> = []

      for (const maybe of list) {
        const value = yield maybe

        result.push(value)
      }

      return Option.some(result as any)
    })
  }
}

export default Option
