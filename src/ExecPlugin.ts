import cp from 'child_process';
import path from 'path';

export type ConfigInput = {
  'on-pass'?: string
  'on-start'?: string
  'on-start-script'?: string
  'on-start-module'?: string
  'module-timeout'?: number
  'exec-while-filtered'?: boolean
  'on-start-ignore-error'?: boolean
}

export type Config = {
  onPass?: string
  onStart?: string
  onStartScript?: string
  onStartModule?: string
  moduleTimeout: number
  onStartIgnoreError?: boolean
  execWhileFiltered?: boolean
}

export type JestHooks = {
  shouldRunTestSuite: (cb: (testPath: string) => boolean | Promise<boolean>) => void
  onTestRunComplete: (cb: (results: Pick<jest.AggregatedResult, 'success' | 'numTotalTests'>) => void) => void
}

export type Exec = (command: string, cb: (err: any, stdout?: any, stderror?: any) => void) => any
export type ExecFile = (file: string, args: any[], cb: (err: any, stdout?: any, stderror?: any) => void) => any

export class ExecPlugin {
  exec: Exec = cp.exec.bind(cp) as any
  execFile: ExecFile = cp.execFile.bind(cp) as any
  filtered: boolean
  config: Config
  m: any
  private startScriptExecuted = false
  constructor({ testNamePattern, testPathPattern, config }: Pick<jest.GlobalConfig, 'testNamePattern' | 'testPathPattern'> & { config: ConfigInput }) {
    this.filtered = !!(testNamePattern || testPathPattern)
    this.config = toConfig(config)
  }

  apply(jestHooks: JestHooks) {
    if (this.config.onStart || this.config.onStartScript || this.config.onStartModule) {
      jestHooks.shouldRunTestSuite(() => {
        return new Promise((a, r) => {
          if (this.startScriptExecuted) {
            a(true)
            return
          }
          this.startScriptExecuted = true

          if (this.config.onStartModule) {
            try {
              if (!this.m) {
                this.m = require(path.resolve(process.cwd(), this.config.onStartModule))

                if (typeof this.m.run !== 'function') {
                  console.error(`jest-watch-exec: there are no 'run()' method in the module '${this.config.onStartModule}'`)
                  a(false)
                  return
                }
              }

              const result = this.m.run()
              if (result && typeof result.then === 'function') {
                setTimeout(() => {
                  a(this.config.onStartIgnoreError ? true : false)
                }, this.config.moduleTimeout)

                result.then(a, (result: any) => {
                  if (result !== undefined) console.warn(`jest-watch-exec: ${this.config.onStartModule}.run() rejected with ${result}`)
                  a(this.config.onStartIgnoreError ? true : false)
                })
              }
              else {
                a(this.config.onStartIgnoreError ? true : result)
              }
            }
            catch (e) {
              r(e)
            }
          }
          else if (this.config.onStartScript) {
            console.info(`jest-watch-exec: executes on-start-script: ${this.config.onStartScript}${this.config.onStartIgnoreError ? ' (ignoring errors)' : ''}`)
            this.execFile(this.config.onStartScript, [], (error, stdout, stderr) => {
              if (error) {
                console.error(`jest-watch.exec: ${error}`);
                a(this.config.onStartIgnoreError ? true : false)
                return
              }
              // istanbul ignore next
              if (stdout) console.info(stdout)
              // istanbul ignore next
              if (stderr) console.info(stderr)
              a(true)
            })
          }
          else {
            console.info(`jest-watch-exec: executes on-start: ${this.config.onStart}${this.config.onStartIgnoreError ? ' (ignoring errors)' : ''}`)
            this.exec(this.config.onStart!, (error, stdout, stderr) => {
              if (error) {
                console.error(error);
                a(this.config.onStartIgnoreError ? true : false)
                return
              }
              // istanbul ignore next
              if (stdout) console.info(stdout)
              // istanbul ignore next
              if (stderr) console.info(stderr)

              a(true)
            })
          }
        })
      })
    }
    if (this.config.onStart || this.config.onStartScript || this.config.onStartModule || this.config.onPass) {
      jestHooks.onTestRunComplete((results) => {
        this.startScriptExecuted = false
        if (this.config && this.config.onPass && results.success && results.numTotalTests > 0 && (!this.filtered || this.config.execWhileFiltered)) {
          console.info(`jest-watch-exec: executes on-pass: ${this.config.onPass}`)
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
}

function toConfig(config: ConfigInput) {
  return {
    onStart: config['on-start'],
    onStartScript: config['on-start-script'],
    onStartModule: config['on-start-module'],
    moduleTimeout: config['module-timeout'] || 1000,
    onStartIgnoreError: config['on-start-ignore-error'],
    onPass: config['on-pass'],
    execWhileFiltered: config['exec-while-filtered']
  }
}
