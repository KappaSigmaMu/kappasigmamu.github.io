import { defineConfig } from 'cypress';
import { execFileSync, execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const CHOPSTICKS_RPC = 'http://localhost:8000';

let forkBlockHash: string | null = null;

async function chopsticksRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(CHOPSTICKS_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  return payload.result as T;
}

const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

function getPidsListeningOnPort(port: number): number[] {
  try {
    return execFileSync('lsof', [`-ti:${port}`], { encoding: 'utf8' })
      .split('\n')
      .map((pid) => Number(pid.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    return [];
  }
}

async function stopChopsticks() {
  const pids = getPidsListeningOnPort(8000);
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // process already exited
    }
  }

  if (pids.length > 0) await sleep(1000);

  for (const pid of pids) {
    try {
      process.kill(pid, 0);
      process.kill(pid, 'SIGKILL');
    } catch {
      // process already exited
    }
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@cypress/grep/src/plugin')(config)

      on('task', {
        async rememberForkPoint() {
          try {
            forkBlockHash = await chopsticksRpc<string>('chain_getBlockHash');
          } catch (e) {
            console.log('Chopsticks fork point capture skipped:', (e as Error).message);
          }
          return null;
        },
        async resetChopsticks() {
          try {
            await chopsticksRpc('dev_newBlock');
          } catch (e) {
            console.log('Chopsticks reset skipped:', (e as Error).message);
          }
          return null;
        },
        async resetChopsticksToFork() {
          try {
            const hash =
              forkBlockHash ??
              (process.env.KUSAMA_BLOCK_NUMBER
                ? await chopsticksRpc<string>('chain_getBlockHash', [Number(process.env.KUSAMA_BLOCK_NUMBER)])
                : null);
            if (hash) await chopsticksRpc('dev_setHead', [hash]);
          } catch (e) {
            console.log('Chopsticks fork reset skipped:', (e as Error).message);
          }
          return null;
        },
        async restartChopsticksAtBlock(blockNumber: number) {
          await stopChopsticks();
          await sleep(2000);

          const configPath = resolve('config/kusama.yml');
          const tmpConfig = resolve('config/kusama-tmp.yml');
          const config = readFileSync(configPath, 'utf8');
          writeFileSync(tmpConfig, config.replace(/^block:\s*.+$/m, `block: ${blockNumber}`));

          execSync('rm -f db.sqlite db.sqlite-shm db.sqlite-wal', { stdio: 'ignore' });

          const child = spawn('npx', ['@acala-network/chopsticks@1.4.2', `--config=${tmpConfig}`], {
            detached: true,
            stdio: 'ignore',
          });
          child.unref();

          for (let i = 0; i < 60; i++) {
            try {
              const header = await chopsticksRpc('chain_getHeader');
              if (header) return null;
            } catch {
              // not ready yet
            }
            await sleep(2000);
          }
          throw new Error(`Chopsticks failed to start at block ${blockNumber}`);
        },
      });
      return config;
    },
    specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    viewportWidth: 1280,
    viewportHeight: 720,

    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    retries: {
      runMode: 1,
      openMode: 0,
    },

    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,

    env: {
      chopsticks_url: 'ws://localhost:8000',
      app_name: '[TEST] Kusama Society',
    },
  },
});
