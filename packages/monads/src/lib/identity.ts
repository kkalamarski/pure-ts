type IdentityOrType<T> = T | Identity<T>;

class Identity<T> {
  private constructor(protected value: T) { }

  public static of<T>(x: T): Identity<T> {
    return new Identity(x);
  }

  flatMap<U>(f: (x: T) => Identity<U>): Identity<U> {
    return f(this.value);
  }

  map<U>(f: (x: T) => U): Identity<U> {
    return new Identity(f(this.value));
  }

  public static do<T>(
    f: () => Generator<IdentityOrType<T>, IdentityOrType<T>, T>
  ): Identity<T> {
    const generator = f();

    let step = generator.next();

    while (!step.done) {
      const value = step.value;

      if (value instanceof Identity) {
        value.flatMap((val) => {
          step = generator.next(val);

          return Identity.of(val);
        });
      } else {
        step = generator.next(step.value as T);
      }
    }

    return step.value instanceof Identity
      ? step.value
      : Identity.of(step.value);
  }

  unwrap() {
    return this.value;
  }

  toString(): string {
    return `Identity(${this.value})`;
  }
}

export default Identity;
