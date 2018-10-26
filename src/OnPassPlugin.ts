import cp from 'child_process';

export interface Options {
  exec?: string
  runWhileFiltered?: boolean
}

export class OnPassPlugin {
  cp: { exec: (command: string) => void } = cp
  filtered: boolean
  constructor(config: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'>, private options?: Options) {
    this.filtered = !!(config.testNamePattern || config.testPathPattern)
  }

  apply(jestHooks: { onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success'>) => void) => void }) {
    jestHooks.onTestRunComplete((results) => {
      if (this.options && this.options.exec && results.success && (!this.filtered || this.options.runWhileFiltered)) {
        this.cp.exec(this.options.exec)
      }
    })
  }
}
