import cp from 'child_process';

export interface ConfigInput {
  'on-pass'?: string
  'on-start'?: string
  'exec-while-filtered'?: boolean
}

export interface Config {
  onPass?: string
  onStart?: string
  execWhileFiltered?: boolean
}

export type JestHooks = {
  shouldRunTestSuite: (cb: (testPath: string) => boolean | Promise<boolean>) => void
  onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => void) => void
}

export class ExecPlugin {
  exec: any = cp.exec.bind(cp)
  filtered: boolean
  config: Config
  private startScriptExecuted = false
  constructor({ testNamePattern, testPathPattern, config }: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
    this.filtered = !!(testNamePattern || testPathPattern)
    this.config = toConfig(config)
  }

  apply(jestHooks: JestHooks) {
    if (this.config.onStart) {
      jestHooks.shouldRunTestSuite(() => {
        return new Promise(a => {
          if (this.startScriptExecuted) {
            a(true)
            return
          }
          this.startScriptExecuted = true
          this.exec(this.config.onStart, (error: any, stdout: any, stderr: any) => {
            if (error) {
              console.error(error);
              a(false)
              return
            }
            if (stdout) console.info(stdout)
            if (stderr) console.info(stderr)
            a(true)
          })
        })
      })
    }
    jestHooks.onTestRunComplete((results) => {
      if (this.config && this.config.onPass && results.success && results.numTotalTests > 0 && (!this.filtered || this.config.execWhileFiltered)) {
        console.info(`jest-watch-exec executes on-pass: ${this.config.onPass}`)
        // istanbul ignore next
        // ignore coverage below as the command is execute as fire and forget.
        this.exec(this.config.onPass, (error: any, stdout: any, stderr: any) => {
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
    onStart: config['on-start'],
    onPass: config['on-pass'],
    execWhileFiltered: config['exec-while-filtered']
  }
}
