# KappaSigmaMu App

This is a dedicated interface for Kusama Society.

## Dependencies

* [Node v18.15.0](#)
* [yarn](https://yarnpkg.com)

## Setup

- Clone this repository.

- Copy the development sample config file:
```bash
cp ./src/kusama/config/development.json.sample ./src/kusama/config/development.json
```

> Use `"PROVIDER_SOCKET": "wss://kusama-rpc.polkadot.io"` if you want to connect to production RPC

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

## Running a local fork of Kusama

### Using Chopsticks:

Use [Chopsticks](https://github.com/AcalaNetwork/chopsticks) and set `"PROVIDER_SOCKET": "ws://127.0.0.1:8000"` to run a local fork of Kusama with predetermined Society storage and a custom runtime (comment out the `wasm-override` parameter on the config file if you don't want a custom runtime):
```
yarn chopsticks
```

Private keys for development accounts. Change hard derivation key to switch from `Alice` to `Bob`, `Charlie`, etc. Use this private key to import these development accounts to a wallet of your choice.
```
bottom drive obey lake curtain smoke basket hold race lonely fit walk\\Alice
```


### Application:

```
yarn start
```

## Linter

```
yarn lint
```

You can automatically fix some issues with `yarn lint:fix`


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
