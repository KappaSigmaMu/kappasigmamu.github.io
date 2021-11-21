# KappaSigmaMu App

This is a dedicated interface for Kusama Society.

## Dependencies

* [Node v16.13.0](#)
* [yarn](https://yarnpkg.com)

## Setup

- Clone this repository.

- Download [this binary](https://gateway.pinata.cloud/ipfs/QmPbk5Xx3kHdWw4gDBiNTp6dSnzW8d2PAofE1TAh2Tpc9J), rename it to `substrate` and place it on the root folder. This binary has a initial state with some members and short rotation times.

## Installation

```bash
yarn install
```

## Running with Docker

```bash
docker-compose up
```

- Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The container share the sources files with your machine. The application compiles automatically after editing.

- You can also access [Polkadotjs pointing to your development node](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/society) to interact with it.

## Running locally

### Society node:
```
./substrate --tmp --dev
```

### Application:
```
yarn start
```

## Linter

```
yarn eslint
```
## Tests

```
yarn test
```

Launches the test runner in the interactive watch mode.

## Production bundle

```
yarn build
```

Builds the app for production to the `build` folder.

## Documentation

* [Substrate Developer Hub](https://substrate.dev)
* [Create React App](https://github.com/facebook/create-react-app)
* [Polkadot js API](https://polkadot.js.org/api)
