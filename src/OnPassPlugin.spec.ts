import t from 'assert'
import OnPassPlugin from '.';
import { Options } from './OnPassPlugin';

test(`no exec script will do nothing`, () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '' }, undefined)

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'not called')
})

test(`failed test will not run exec script`, () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '' }, { exec: 'some script' })

  const actual = invoke({ success: false })

  t.strictEqual(actual, 'not called')
})


test('pass test will run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: '' }, { exec: 'some script' })

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'some script')
})

test('name filtered test will not run exec script', () => {
  const invoke = setup({ testNamePattern: 'x', testPathPattern: '' }, { exec: 'some script' })

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'not called')
})

test('path filtered test will not run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: 'x' }, { exec: 'some script' })

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'not called')
})

test('name filtered test with runWhileFiltered will run exec script', () => {
  const invoke = setup({ testNamePattern: 'x', testPathPattern: '' }, { exec: 'some script', runWhileFiltered: true })

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'some script')
})

test('path filtered test with runWhileFiltered will run exec script', () => {
  const invoke = setup({ testNamePattern: '', testPathPattern: 'x' }, { exec: 'some script', runWhileFiltered: true })

  const actual = invoke({ success: true })

  t.strictEqual(actual, 'some script')
})

function setup(config: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'>, options?: Options) {
  const subject = new OnPassPlugin(config, options)

  let completeCallback
  const jestHooks = { onTestRunComplete: cb => completeCallback = cb }
  subject.apply(jestHooks)

  let actual = 'not called'
  subject.cp.exec = cmd => actual = cmd

  return (results: Pick<jest.AggregatedResult, 'success'>) => {
    completeCallback(results)
    return actual
  }
}
