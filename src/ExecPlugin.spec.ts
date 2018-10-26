import t from 'assert';
import ExecPlugin from '.';
import { ConfigInput } from './ExecPlugin';

test(`no exec script will do nothing`, () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '', config: {} })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'not called')
})

test(`failed test will not run exec script`, () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

  const actual = invoke({ success: false, numTotalTests: 1 })

  t.strictEqual(actual, 'not called')
})

test('pass test with no test ran will not run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

  const actual = invoke({ success: true, numTotalTests: 0 })

  t.strictEqual(actual, 'not called')
})


test('pass test will run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '', config: { 'on-pass': 'some script' } })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'some script')
})

test('name filtered test will not run exec script', () => {
  const invoke = setup({ testNamePattern: 'x', testPathPattern: '', config: { 'on-pass': 'some script' } })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'not called')
})

test('path filtered test will not run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: 'x', config: { 'on-pass': 'some script' } })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'not called')
})

test('name filtered test with runWhileFiltered will run exec script', () => {
  const invoke = setup({ testNamePattern: 'x', testPathPattern: '', config: { 'on-pass': 'some script', 'exec-while-filtered': true } })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'some script')
})

test('path filtered test with runWhileFiltered will run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: 'x', config: { 'on-pass': 'some script', 'exec-while-filtered': true } })

  const actual = invoke({ success: true, numTotalTests: 1 })

  t.strictEqual(actual, 'some script')
})

function setup(context: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
  const subject = new ExecPlugin(context)

  let completeCallback
  const jestHooks = { onTestRunComplete: cb => completeCallback = cb }
  subject.apply(jestHooks)

  let actual = 'not called'
  subject.exec = cmd => actual = cmd

  return (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => {
    completeCallback(results)
    return actual
  }
}
