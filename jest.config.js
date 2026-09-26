module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts"
  ],
  setupFiles: [
    "<rootDir>/config/env.js"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
  ],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "<rootDir>/config/jest/babelTransform.js",
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!@kappasigmamu|@babel|@polkadot|polkadot-api|@polkadot-api|scale-ts|@noble|@scure|react-router|cookie-es)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  moduleFileExtensions: [
    "js",
    "ts",
    "tsx",
    "json",
    "jsx",
    "node"
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ],
  resetMocks: true
}
