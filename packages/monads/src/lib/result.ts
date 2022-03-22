class Result<Err, Ok> {
  private constructor(private err?: Err, private ok?: Ok) { }

  static err<_Err, _Ok>(value: _Err): Result<_Err, _Ok> {
    return new Result(value);
  }

  static ok<_Err, _Ok>(value: _Ok): Result<_Err, _Ok> {
    return new Result(undefined as unknown as _Err, value);
  }

  static tryCatch<_Err, _Ok>(f: () => _Ok): Result<_Err, _Ok> {
    try {
      return Result.ok(f());
    } catch (e) {
      return Result.err(e as _Err);
    }
  }

  public static do<L, R>(
    f: () => Generator<Result<L, R> | R, Result<L, R> | R, R>
  ): Result<L, R> {
    const generator = f();

    try {
      let step = generator.next();

      while (!step.done) {
        const value = step.value;

        if (value instanceof Result) {
          const eitherLeft = value.match({
            Ok: (x) => {
              step = generator.next(x);
            },
            Err: (x) => {
              return Result.err<L, R>(x);
            },
          });

          if (eitherLeft) return eitherLeft;
        } else {
          step = generator.next(value as R);
        }
      }

      const { value } = step;

      if (value instanceof Result) {
        return value;
      }

      return Result.ok<L, R>(value as R);
    } catch (e) {
      return Result.err<L, R>(e as L);
    }
  }

  public static sequence<E, T>(list: Array<Result<E, T>>): Result<E, Array<T>> {
    return Result.do(function*() {
      const results: Array<T> = [];

      for (const _result of list) {
        const value = yield _result;

        results.push(value);
      }

      return Result.ok(results as any);
    });
  }

  map<R>(f: (right: Ok) => R): Result<Err, R> {
    if (this.err) {
      return Result.err(this.err as Err);
    } else {
      return Result.ok(f(this.ok as Ok));
    }
  }

  flatMap<R>(f: (right: Ok) => Result<Err, R>): Result<Err, R> {
    if (this.err) {
      return Result.err(this.err);
    } else {
      return f(this.ok as Ok);
    }
  }

  isErr() {
    return this.err !== null;
  }

  isOk() {
    return this.ok !== null;
  }

  match({ Err, Ok }: { Err: (err: Err) => any; Ok: (ok: Ok) => any }) {
    if (this.err) {
      return Err(this.err as Err);
    } else {
      return Ok(this.ok as Ok);
    }
  }
}

export default Result;
