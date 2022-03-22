import Option from './option'

describe('Maybe Monad', () => {
  test('Maybe monad', () => {
    const just = Option.some(1)
    expect(just.isSome()).toBe(true)
    expect(just.isNone()).toBe(false)

    const nothing = Option.none()
    expect(nothing.isSome()).toBe(false)
    expect(nothing.isNone()).toBe(true)
  })

  test('map function', () => {
    const just = Option.some(1)
    const just2 = just.map(x => x + 1)
    expect(just2.isSome()).toBe(true)
    expect(just2.isNone()).toBe(false)

    const nothing = Option.none<number>()
    const nothing2 = nothing.map(x => x + 1)
    expect(nothing2.isSome()).toBe(false)
    expect(nothing2.isNone()).toBe(true)
  })

  test('bind method', () => {
    const just = Option.some(1)
    const just2 = just.flatMap(x => Option.some(x + 1))
    expect(just2.isSome()).toBe(true)

    const nothing = Option.none<number>()
    const nothing2 = nothing.flatMap(x => Option.some(x + 1))
    expect(nothing2.isNone()).toBe(true)

    const just3 = just.flatMap(_x => Option.none())
    expect(just3.isNone()).toBe(true)
  })

  test('match function', () => {
    const just = Option.some(1)
    const justResult = just.match({
      Some: x => x + 1,
      None: () => 0
    })
    expect(justResult).toBe(2)

    const nothing = Option.none<number>()
    const nothingResult = nothing.match({
      Some: x => x + 1,
      None: () => 0
    })
    expect(nothingResult).toBe(0)
  })

  test('toString function', () => {
    const just = Option.some(1)
    expect(just.toString()).toBe('Some(1)')

    const nothing = Option.none()
    expect(nothing.toString()).toBe('None()')
  })

  test('an example', () => {
    const getUserInput = (input?: string) =>
      input ? Option.some(input) : Option.none<string>()

    const justResult = getUserInput('hello')
      .map(x => x.toUpperCase())
      .map(x => x.split('').reverse().join(''))
      .match({
        Some: x => x,
        None: () => 'Nothing'
      })

    expect(justResult).toBe('OLLEH')

    const nothingResult = getUserInput()
      .map(x => x.toUpperCase())
      .map(x => x.split('').reverse().join(''))
      .match({
        Some: x => x,
        None: () => 'Nothing'
      })

    expect(nothingResult).toBe('Nothing')
  })

  test('an example 2', () => {
    const search = (text: string, search: RegExp) => {
      const result = text.match(search)

      return result ? Option.some<string[]>(result) : Option.none<string[]>()
    }

    const justResult = search('hello', /hello/).match({
      Some: x => x[0],
      None: () => 'Nothing'
    })

    expect(justResult).toBe('hello')

    const nothingResult = search('hello', /world/).match({
      Some: x => x[0],
      None: () => 'Nothing'
    })

    expect(nothingResult).toBe('Nothing')
  })

  test('do notation - Just', () => {
    const maybe = Option.do<string>(function*() {
      const x = 'ala ma kota'

      const result = yield x.includes('ala') ? 'ala' : Option.none()

      return result
    })

    const result = maybe.match({ Some: x => x, None: () => 'Nothing' })

    expect(result).toBe('ala')
  })

  test('do notation - Nothing', () => {
    const maybe = Option.do<string>(function*() {
      const x = 'ala ma kota'

      const result = yield x.includes('hello monad')
        ? 'hello monad'
        : Option.none()

      console.log('not reachcable')

      return result
    })

    const result = maybe.match({ Some: x => x, None: () => 'Nothing' })

    expect(result).toBe('Nothing')
  })

  test('do notation - handle nulls', () => {
    const user = { firstName: 'John', lastName: null }

    const maybe = Option.do<string>(function*() {
      const lastName = yield user.lastName

      return lastName
    })

    expect(maybe.isNone()).toBe(true)
  })

  test('do notation - handle undefined', () => {
    const userTelephoneNumber = Option.do<string>(function*() {
      const user: any = {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          city: 'New York',
          postalCode: '123 mm 123'
        }
      }

      // yielding undefined value will produce Maybe.Nothing type and abort code execution
      const telephone = yield user?.contact?.telephone

      return telephone.replace(/-/g, '')
    })

    expect(userTelephoneNumber.isNone()).toBe(true)
  })

  test('Maybe#sequence', () => {
    const maybe = Option.sequence([Option.some(1), Option.some(2)])

    expect(maybe.isSome()).toBe(true)

    maybe.match({
      Some: ([x, y]) => {
        expect(x).toBe(1)
        expect(y).toBe(2)
      },
      None: () => {
        fail('should not be Nothing')
      }
    })
  })
})
