import cp from 'child_process';

export interface ConfigInput {
  'on-pass'?: string
  'exec-while-filtered'?: boolean
}

export interface Config {
  onPass?: string
  execWhileFiltered?: boolean
}

export class ExecPlugin {
  exec: any = cp.exec.bind(cp)
  filtered: boolean
  config: Config
  constructor({ testNamePattern, testPathPattern, config }: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
    this.filtered = !!(testNamePattern || testPathPattern)
    this.config = toConfig(config)
  }

  apply(jestHooks: { onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => void) => void }) {
    jestHooks.onTestRunComplete((results) => {
      if (this.config && this.config.onPass && results.success && results.numTotalTests > 0 && (!this.filtered || this.config.execWhileFiltered)) {
        // istanbul ignore next
        // ignore coverage below as the command is execute as fire and forget.
        this.exec(this.config.onPass, (error, stdout, stderr) => {
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

function toConfig(config: ConfigInput) {
  return {
    onPass: config['on-pass'],
    execWhileFiltered: config['exec-while-filtered']
  }
}
