class IO<T> {
  private constructor(private effect: () => T) { }

  public static of<T>(effect: () => T) {
    return new IO<T>(effect)
  }

  public static from<T>(value: T) {
    return IO.of<T>(() => value)
  }

  map<U>(f: (x: T) => U) {
    return IO.of<U>(() => f(this.exec()))
  }

  flatMap<U>(f: (x: T) => IO<U>) {
    return IO.of<U>(() => f(this.exec()).exec())
  }

  exec() {
    return this.effect()
  }

  public static do<T, R = T>(f: () => Generator<IO<T>, IO<R>, T>): IO<R> {
    const generator = f()

    return IO.of<R>(() => {
      let next = generator.next()

      while (!next.done) {
        next = generator.next(next.value.exec())
      }

      return next.value.exec()
    })
  }

  public static sequence<T>(effects: IO<T>[]): IO<T[]> {
    return IO.do<T, T[]>(function*() {
      const result: T[] = []

      for (const io of effects) {
        result.push(yield io)
      }

      return IO.from(result)
    })
  }
}

export default IO
