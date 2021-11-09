# KappaSigmaMu App

## Dependencies

* [Node v14.13.1](#)
* [yarn](https://yarnpkg.com)

## Installation

```bash
git clone https://github.com/KappaSigmaMu/ksm-app.git
cd ksm-app
yarn install
```

## Society node
To run a local node, download [this binary on IPFS](https://gateway.pinata.cloud/ipfs/QmPbk5Xx3kHdWw4gDBiNTp6dSnzW8d2PAofE1TAh2Tpc9J), and run as:

`./substrate --tmp --dev`

This binary has a initial state with some members and short rotation times.


## Development

`yarn start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits. You will also see any lint errors in the console.

## Tests

`yarn test`

Launches the test runner in the interactive watch mode.

## Production bundle

`yarn build`

Builds the app for production to the `build` folder.

## Documentation

* [Substrate Developer Hub](https://substrate.dev)
* [Create React App](https://github.com/facebook/create-react-app)
* [Polkadot js API](https://polkadot.js.org/api)
