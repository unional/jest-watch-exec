# jest-watch-exec

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

[![Circle CI][circleci-image]][circleci-url]
[![Travis CI][travis-image]][travis-url]
[![Codecov][codecov-image]][codecov-url]
[![Coveralls Status][coveralls-image]][coveralls-url]

[![Greenkeeper][greenkeeper-image]][greenkeeper-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]

[![Visual Studio Code][vscode-image]][vscode-url]
[![Wallaby.js][wallaby-image]][wallaby-url]

Execute commands on start or when the all tests pass.

Requires `jest@23+`.

## Usage

To use `jest-watch-exec`,
add it to the `watchPlugins` section of the Jest configuration:

```js
{
  "jest": {
    "watchPlugins": [
      ["jest-watch-exec", { "on-start": "npm run build" }],
      // Will run test even if the script fails.
      ["jest-watch-exec", { "on-start": "npm run build", "on-start-ignore-error": true }],
      ["jest-watch-exec", { "on-start-script": "somescript.js" }],
      ["jest-watch-exec", { "on-start-script": "somescript.js", "on-start-ignore-error": true }],
      // Will run the `run(): boolean | Promise<boolean>` method exposed by the module
      ["jest-watch-exec", { "on-start-module": "modulescript.js" }],
      ["jest-watch-exec", { "on-start-module": "modulescript.js", "on-start-ignore-error": true }],
      // execute script when there are passing tests.
      // will not execute if the tests are filtered.
      ["jest-watch-exec", { "on-pass": "npm run build" }],
      // 'exec-while-filtered' applies to 'on-pass'
      ["jest-watch-exec", { "on-pass": "npm run build", "exec-while-filtered": true }]
    ]
  }
}
```

- `on-start-ignore-error`: The script is considered failed if it:
  - returns a falsy value,
  - throws an error,
  - returns a promise resolves to false, or
  - returns a rejected promise.

## Contribute

```sh
# after fork and clone
npm install

# begin making changes
git checkout -b <branch>
npm run watch

# after making change(s)
git commit -m "<commit message>"
git push

# create PR
```

[circleci-image]: https://circleci.com/gh/unional/jest-watch-exec/tree/master.svg?style=shield
[circleci-url]: https://circleci.com/gh/unional/jest-watch-exec/tree/master
[codecov-image]: https://codecov.io/gh/unional/jest-watch-exec/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/jest-watch-exec
[coveralls-image]: https://coveralls.io/repos/github/unional/jest-watch-exec/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/unional/jest-watch-exec?branch=master
[downloads-image]: https://img.shields.io/npm/dm/jest-watch-exec.svg?style=flat
[downloads-url]: https://npmjs.org/package/jest-watch-exec
[greenkeeper-image]: https://badges.greenkeeper.io/unional/jest-watch-exec.svg
[greenkeeper-url]: https://greenkeeper.io/
[npm-image]: https://img.shields.io/npm/v/jest-watch-exec.svg?style=flat
[npm-url]: https://npmjs.org/package/jest-watch-exec
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[travis-image]: https://img.shields.io/travis/unional/jest-watch-exec/master.svg?style=flat
[travis-url]: https://travis-ci.org/unional/jest-watch-exec?branch=master
[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
[wallaby-image]: https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]: https://wallabyjs.com
