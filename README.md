# jest-watch-on-pass

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][circleci-image]][circleci-url]
[![Codecov][codecov-image]][codecov-url]

[![Greenkeeper badge][green-keeper-image]][green-keeper-url]
[![semantic-release][semantic-release-image]][semantic-release-url]

Execute command after test run passes.

Requires `jest@23+`.

## Usage

To use `jest-watch-on-pass`,
add it to the `watchPlugins` section of the Jest configuration:

```js
{
  "jest": {
    "watchPlugins": [
      ["jest-watch-on-pass", { "exec": "npm run build" }], // or
      ["jest-watch-on-pass", { "exec": "npm run build", "runWhileFiltered": true }]
    ]
  }
}
```

[npm-image]: https://img.shields.io/npm/v/jest-watch-on-pass.svg?style=flat
[npm-url]: https://npmjs.org/package/jest-watch-on-pass
[downloads-image]: https://img.shields.io/npm/dm/jest-watch-on-pass.svg?style=flat
[downloads-url]: https://npmjs.org/package/jest-watch-on-pass
[circleci-image]: https://circleci.com/gh/unional/jest-watch-on-pass/tree/master.svg?style=shield
[circleci-url]: https://circleci.com/gh/unional/jest-watch-on-pass/tree/master
[codecov-image]: https://codecov.io/gh/unional/jest-watch-on-pass/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/jest-watch-on-pass
[green-keeper-image]:https://badges.greenkeeper.io/unional/jest-watch-on-pass.svg
[green-keeper-url]:https://greenkeeper.io/
[semantic-release-image]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
