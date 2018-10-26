import cp from 'child_process';

export interface Config {
  onpass?: string
  execWhileFiltered?: boolean
}

export class OnPassPlugin {
  exec: any = cp.exec.bind(cp)
  filtered: boolean
  config: Config
  constructor({ testNamePattern, testPathPattern, config }: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: Config }) {
    this.filtered = !!(testNamePattern || testPathPattern)
    this.config = config
  }

  apply(jestHooks: { onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => void) => void }) {
    jestHooks.onTestRunComplete((results) => {
      if (this.config && this.config.onpass && results.success && results.numTotalTests > 0 && (!this.filtered || this.config.execWhileFiltered)) {
        // istanbul ignore next
        // ignore coverage below as the command is execute as fire and forget.
        this.exec(this.config.onpass, (error, stdout, stderr) => {
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
