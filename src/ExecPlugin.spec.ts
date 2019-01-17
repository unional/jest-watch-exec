import t from 'assert';
import bb from 'bluebird';
import ExecPlugin from '.';
import { ConfigInput, JestHooks } from './ExecPlugin';

test(`no exec script will do nothing`, async () => {
  const invoke = setupOnPass({ testNamePattern: '', testPathPattern: '', config: {} })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'not called')
})

describe('on-pass', () => {
  test(`will not execute on failed test run`, () => {
    const invoke = setupOnPass({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

    const actual = invoke({ success: false, numTotalTests: 1 })

    t.strictEqual(actual, 'not called')
  })

  test('will not execute when no test in the "passed" test run', () => {
    const invoke = setupOnPass({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

    const actual = invoke({ success: true, numTotalTests: 0 })

    t.strictEqual(actual, 'not called')
  })


  test('will execute on passed test run', () => {
    const invoke = setupOnPass({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

    const actual = invoke({ success: true, numTotalTests: 1 })

    t.strictEqual(actual, 'some script')
  })

  test('will not execute on name filtered test run', () => {
    const invoke = setupOnPass({ testNamePattern: 'x', testPathPattern: '', config: { 'on-pass': 'some script' } })

    const actual = invoke({ success: true, numTotalTests: 1 })

    t.strictEqual(actual, 'not called')
  })

  test('will not execute on path filtered test run', () => {
    const invoke = setupOnPass({ testNamePattern: '', testPathPattern: 'x', config: { 'on-pass': 'some script' } })

    const actual = invoke({ success: true, numTotalTests: 1 })

    t.strictEqual(actual, 'not called')
  })

  test('will execute on name filtered test when runWhileFiltered is true', () => {
    const invoke = setupOnPass({ testNamePattern: 'x', testPathPattern: '', config: { 'on-pass': 'some script', 'exec-while-filtered': true } })

    const actual = invoke({ success: true, numTotalTests: 1 })

    t.strictEqual(actual, 'some script')
  })

  test('will execute on path filtered test when runWhileFiltered is true', () => {
    const invoke = setupOnPass({ testNamePattern: '', testPathPattern: 'x', config: { 'on-pass': 'some script', 'exec-while-filtered': true } })

    const actual = invoke({ success: true, numTotalTests: 1 })

    t.strictEqual(actual, 'some script')
  })
})

describe('on-start', () => {
  test('will be executed', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script' } })

    await invoke()

    t.strictEqual(invoke.actual, 'start script')
  })
  test('will be executed only once', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script' } })

    await invoke(['a', 'b'])

    t.strictEqual(invoke.actual, 'start script')
  })

  test('will return false to shouldRun if the script causes an error', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script' } })
    invoke.subject.exec = (_, cb) => cb(new Error('expected bad call'))
    t.strictEqual(await invoke(), false)
  })

  test('with on-start-ignore-error, will run test even if the script causes error', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script', 'on-start-ignore-error': true } })
    invoke.subject.exec = (_, cb) => cb(new Error('expected bad call'))
    const actual = await invoke(['a'])

    t.strictEqual(actual, true)
  })
  test('will be executed again on second run', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script' } })

    await invoke()
    await invoke()

    t.strictEqual(invoke.actual, 'start scriptstart script')
  })
})

describe('on-start-script', () => {
  test('will execute a script file', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-script': 'somescript.js' } })

    let actual = ''
    invoke.subject.execFile = (file, _, cb) => {
      actual = file
      cb(null)
    }
    await invoke()

    t.strictEqual(actual, 'somescript.js')
  })
  test('will return false to shouldRun if the script causes an error', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-script': 'somescript.js' } })
    invoke.subject.execFile = (_, _args, cb) => cb(new Error('expected bad call'))
    t.strictEqual(await invoke(), false)
  })

  test('with on-start-ignore-error, will run test even if the script causes error', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-script': 'somescript.js', 'on-start-ignore-error': true } })
    invoke.subject.execFile = (_, _args, cb) => cb(new Error('expected bad call'))
    t.strictEqual(await invoke(), true)
  })
  test('will be executed again on second run', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-script': 'somescript.js' } })

    await invoke()
    await invoke()

    t.strictEqual(invoke.actual, 'somescript.jssomescript.js')
  })
})


describe('on-start-module', () => {
  test(`will run tests if the module.run() returns true`, async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/return-true.js' } })

    t.strictEqual(await invoke(), true)
  })

  test(`will not run tests if the module.run() returns false`, async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/return-false.js' } })

    t.strictEqual(await invoke(), false)
  })


  test(`will run tests if the module.run() returns a promise that resolves to true`, async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/resolve-true.js' } })

    t.strictEqual(await invoke(), true)
  })

  test('will print a message and return false if the module does not contain a run() method', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/norun.js' } })

    t.strictEqual(await invoke(), false)
  })
  test('will print a message and return false if the module does not exist', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/notexist.js' } })
    try {
      await invoke()
      t.fail('Should not reach')
    }
    catch (e) {
      t.strictEqual(e.code, 'MODULE_NOT_FOUND')
    }
  })

  test('will return false to shouldRun if the run() method a promise that resolves to false', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/resolve-false.js' } })

    t.strictEqual(await invoke(), false)
  })

  test('will return false to shouldRun if the run() method returns a rejected promise', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/reject.js' } })

    t.strictEqual(await invoke(), false)
  })

  test('with on-start-ignore-error, will run test even if the script causes error', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/reject.js', 'on-start-ignore-error': true } })

    t.strictEqual(await invoke(), true)
  })
  test('will keey the module and execute run() in each test run', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start-module': 'fixture/alternate.js' } })

    t.strictEqual(await invoke(), true)
    t.strictEqual(await invoke(), false)
    t.strictEqual(await invoke(), true)
  })
})


function setupOnPass(context: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
  const subject = new ExecPlugin(context)

  let completeCallback: any
  const jestHooks: JestHooks = {
    shouldRunTestSuite: () => { return },
    onTestRunComplete: cb => completeCallback = cb
  }
  subject.apply(jestHooks)

  let actual = 'not called'
  subject.exec = (cmd: string) => actual = cmd

  return (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => {
    if (completeCallback)
      completeCallback(results)
    return actual
  }
}

function setupOnStart(context: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
  const subject = new ExecPlugin(context)

  let shouldRunCallback: any
  let onTestComplete: any
  subject.apply({
    shouldRunTestSuite: cb => shouldRunCallback = cb,
    onTestRunComplete: cb => onTestComplete = cb
  })

  const tester = Object.assign(
    async (testPaths: string[] = ['dummy']) => {
      const result = new Promise((a, r) => {
        bb.reduce(testPaths, async (passing, testPath) => {
          if (!passing) return false
          return shouldRunCallback(testPath)
        }, true).then(a, r)
      })
      if (result && onTestComplete) {
        onTestComplete({})
      }
      return result
    },
    {
      subject,
      actual: ''
    })

  subject.exec = (cmd: string, cb: any) => {
    tester.actual += cmd
    cb(null)
  }
  subject.execFile = (cmd: string, args: any[], cb: any) => {
    tester.actual += cmd
    cb(null)
  }

  return tester
}
