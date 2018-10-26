module.exports = {
  "preset": "ts-jest",
  "globals": {
    "ts-jest": {
      "diagnostics": false
    }
  },
  "reporters": [
    "default",
    ["jest-audio-reporter", { volume: 0.5 }],
    "jest-progress-tracker",
  ],
  "roots": [
    "<rootDir>/src"
  ],
  "testEnvironment": "node",
  "watchPlugins": [
    [
      "<rootDir>/dist/index.js", { exec: 'npm run lint' }
    ],
    "jest-watch-suspend",
    [
      "jest-watch-toggle-config",
      {
        "setting": "verbose"
      }
    ],
    [
      "jest-watch-toggle-config",
      {
        "setting": "collectCoverage"
      }
    ]
  ]
}
