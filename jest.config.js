const common = require('@unional/devpkg-node/simple/config/jest.common')
module.exports = Object.assign(common, {
  'watchPlugins': [
    [
      '<rootDir>/lib/index.js', { exec: 'npm run lint' }
    ],
    'jest-watch-suspend',
    [
      'jest-watch-toggle-config',
      {
        'setting': 'verbose'
      }
    ],
    [
      'jest-watch-toggle-config',
      {
        'setting': 'collectCoverage'
      }
    ]
  ]
})
