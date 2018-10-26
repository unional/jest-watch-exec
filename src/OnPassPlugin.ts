import cp from 'child_process';

export interface Config {
  exec?: string
  runWhileFiltered?: boolean
}

export class OnPassPlugin {
  exec: any = cp.exec.bind(cp)
  filtered: boolean
  config
  constructor({ testNamePattern, testPathPattern, config }: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: Config }) {
    this.filtered = !!(testNamePattern || testPathPattern)
    this.config = config
  }

  apply(jestHooks: { onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => void) => void }) {
    jestHooks.onTestRunComplete((results) => {
      if (this.config && this.config.exec && results.success && results.numTotalTests > 0 && (!this.filtered || this.config.runWhileFiltered)) {
        this.exec(this.config.exec, (error, stdout, stderr) => {
          if (error) {
            console.error(error);
            return;
          }
          if (stdout) console.info(stdout)
          if (stderr) console.info(stderr)
        })
      }
    })
  }
}
