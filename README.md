# KappaSigmaMu App

This is a dedicated interface for Kusama Society.

## Dependencies

- [Node v18.15.0](#)
- [yarn](https://yarnpkg.com)

## Setup

- Clone this repository.

- Copy the development sample config file on the root folder:

```bash
cp .env.development.sample .env.development
```

> Use `"PROVIDER_SOCKET": "wss://kusama-rpc.polkadot.io"` (or one of the other options available on the sample config file) if you want to connect to production RPC

## Installation

```bash
yarn install
```

## Running with Docker

- Run:

```bash
docker-compose up
```

- Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The container share the sources files with your machine. The application compiles automatically after editing.

## Running a development node of Kusama

### Using Chopsticks:

- Copy the development sample config file on the config folder:

```bash
cp config/kusama.yml.sample config/kusama.yml
```

- Use [Chopsticks](https://github.com/AcalaNetwork/chopsticks) and set `"PROVIDER_SOCKET": "ws://127.0.0.1:8000"` on your `.env.development` to run a local fork of Kusama with predetermined Society storage and a custom runtime (uncomment the `wasm-override` parameter on the config file if you want a custom runtime):

```
yarn chopsticks
```

- Private keys for development accounts. Change hard derivation key to switch from `Alice` to `Bob`, `Charlie`, etc. Use this private key to import these development accounts to a wallet of your choice.

```
bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice
```

### Building and running your own custom runtime

Chopsticks allows for custom runtimes to be used. You can build a custom runtime using our fork of the runtimes repository, this version changes the rotation periods from days to seconds, in order to facilitate tests and development.

- Follow [this guide](https://docs.substrate.io/install/) to install Rust and the necessary dependencies to build Substrate
- Clone the [forked repository](https://github.com/KappaSigmaMu/custom-kusama-runtime) and checkout to this branch:

```
git checkout customized-society-pallet
```

- Change the code (if you need, if not you can skip this step and use our customized version)
- In the root folder of the forked repository, browse to Kusama's runtime directory

```
cd relay/kusama
```

- Inside the directory, run:

```
cargo build --release
```

- After finishing the build, browse back to the root directory and copy the wasm blob to this repository, renaming it to `custom-kusama-runtime.wasm`:

```
cp target/release/wbuild/staging-kusama-runtime/staging_kusama_runtime.wasm ../kappasigmamu.github.io/custom-kusama-runtime.wasm
```

- Uncomment the `wasm-override` parameter on `config/kusama.yml` and run Chopsticks:

```
yarn chopsticks
```

- You can also access [Polkadotjs pointing to your development node](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A8000#/society) to interact with it.

### Submitting Proof-of-Ink

Society members can submit their Kappa Sigma Mu tattoo images directly through the web interface at:

```
https://kappasigmamu.github.io/explore/poi/submit
```

#### Submission Process:

1. Navigate to the submit page
2. Upload your tattoo image (JPG, PNG, HEIC supported)
3. Submit for approval

#### Automated Workflow:

- **Society Members**: Automatically approved and uploaded to Apillon storage
- **Non-Members**: Submitted for manual review before approval
- Images are stored permanently on Apillon's decentralized storage
- Approval is handled by a Cloudflare Worker (`workers/poi-upload-worker`)

## Application:

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

- [Substrate Developer Hub](https://substrate.dev)
- [Create React App](https://github.com/facebook/create-react-app)
- [Polkadot js API](https://polkadot.js.org/api)
- [Chopsticks](https://github.com/AcalaNetwork/chopsticks)
