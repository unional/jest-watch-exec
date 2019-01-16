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

    const actual = await invoke()

    t.strictEqual(actual, 'start script')
  })
  test.only('will be executed only once', async () => {
    const invoke = setupOnStart({ testNamePattern: '', testPathPattern: '', config: { 'on-start': 'start script' } })

    const actual = await invoke(['a', 'b'])

    t.strictEqual(actual, 'start script')
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
    completeCallback(results)
    return actual
  }
}

function setupOnStart(context: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
  const subject = new ExecPlugin(context)

  let shouldRunCallback: any

  subject.apply({
    shouldRunTestSuite: cb => shouldRunCallback = cb,
    onTestRunComplete: () => { return }
  })

  let actual = ''
  subject.exec = (cmd: string, cb: any) => {
    actual += cmd
    cb(null)
  }

  return async (testPaths: string[] = ['dummy']) => {
    await new Promise(a => {
      bb.reduce(testPaths, async (passing, testPath) => {
        if (!passing) return false
        return shouldRunCallback(testPath)
      }, true).then(a)
    })
    return actual
  }
}
