import Result from './result'

describe('Result Monad', () => {
  test('Result Monad', () => {
    const either = Result.ok<string, number>(5)
      .map(x => x + 1)
      .flatMap(_ => Result.err('wrong value'))

    expect(either).toBeInstanceOf(Result)
    expect(either.isErr()).toBe(true)
  })

  test('tryCatch method', () => {
    const result: Result<Error, number> = Result.tryCatch<Error, number>(() => {
      // not throwing anything
      return 1 + 1
    })

    expect(result.isOk()).toBe(true)

    const result2: Result<Error, number> = Result.tryCatch<Error, number>(
      () => {
        // throwing an error
        throw new Error('error')
      }
    )

    expect(result2.isErr()).toBe(true)
  })

  test('flatMap method', () => {
    const okFn = jest.fn()
    const errFn = jest.fn()

    const result: Result<Error, number> = Result.ok<Error, number>(5)
      .flatMap(x => Result.ok<Error, number>(x + 1))
      .map(x => {
        okFn(x)
        return x + 4
      })
      .flatMap(_x => Result.err<Error, number>(new Error('error')))
      .map(x => {
        errFn(x)
        return x
      })

    expect(result.isErr()).toBe(true)
    expect(okFn).toHaveBeenCalledWith(6)
    expect(errFn).not.toHaveBeenCalled()
  })

  test('do notation - handle errors', () => {
    const either = Result.do<Error, string>(function*() {
      const content = '/not valid json - thould throw/'

      const parsed = JSON.parse(content) // should throw an error

      return parsed
    })

    const result = either.match({ Err: x => x, Ok: x => x })

    expect(result).toBeInstanceOf(Error)
  })

  test('do notation - happy path', () => {
    const age = 25

    const either = Result.do<string, string>(function*() {
      if (age < 18) yield Result.err('You are too young!')

      return "You're an adult!"
    })

    expect(either.isOk()).toBe(true)
  })

  test('sequence method', () => {
    const okResults = [Result.ok(1), Result.ok(2), Result.ok(3)]
    const seqResults = Result.sequence(okResults)

    expect(seqResults.isOk()).toBe(true)

    const errResults = [Result.ok(1), Result.ok(2), Result.err("Error!")]
    const seqErrResults = Result.sequence(errResults)

    expect(seqErrResults.isErr()).toBe(true)

  })
})
