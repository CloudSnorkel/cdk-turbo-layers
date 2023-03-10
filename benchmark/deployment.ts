import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { execa } from 'execa'; /* eslint-disable-line import/no-extraneous-dependencies */
import { beforeEach, afterEach, before, perfContext, RuntimeCase } from 'xterm-benchmark'; /* eslint-disable-line import/no-extraneous-dependencies */

const VANILLA_APP_PATH = path.join(__dirname, 'vanilla-app');
const TURBO_APP_PATH = path.join(__dirname, 'turbo-app');
const VANILLA_5_APP_PATH = path.join(__dirname, 'vanilla-5-app');
const TURBO_5_APP_PATH = path.join(__dirname, 'turbo-5-app');
const FUNCTIONS = ['function1', 'function2', 'function3', 'function4', 'function5'];
const FUNCTION_PY_PATHS = FUNCTIONS.map(f => path.join('benchmark', f, 'index.py'));
const FUNCTION_REQS_PATHS = FUNCTIONS.map(f => path.join('benchmark', f, 'requirements.txt'));

before(async () => {
  await new Promise((resolve, reject) => {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.question('   WARNING: this will delete all Docker images, stopped containers, volumes, and networks on the system. Are you SURE you want to continue? [yN] ', answer => {
      if (answer != 'y' && answer != 'Y' && answer != 'YES' && answer != 'yes') {
        reject('Aborting...');
      } else {
        resolve(0);
      }
      rl.close();
    });
  });
});

beforeEach(async () => {
  // clear docker cache to simulate fresh deploy
  console.log('      Clearing Docker cache...');
  await execa('docker', ['system', 'prune', '-a', '-f']);
  // clear cdk.out cache to simulate fresh deploy
  console.log('      Deleting cdk.out...');
  await fs.promises.rm(path.join(VANILLA_APP_PATH, 'cdk.out'), { recursive: true, force: true, maxRetries: 10, retryDelay: 1 });
  await fs.promises.rm(path.join(TURBO_APP_PATH, 'cdk.out'), { recursive: true, force: true, maxRetries: 10, retryDelay: 1 });
});

afterEach(async () => {
  // clear cdk.out cache to simulate fresh deploy
  console.log('      Deleting cdk.out...');
  await fs.promises.rm(path.join(VANILLA_APP_PATH, 'cdk.out'), { recursive: true, force: true, maxRetries: 10, retryDelay: 1 });
  await fs.promises.rm(path.join(TURBO_APP_PATH, 'cdk.out'), { recursive: true, force: true, maxRetries: 10, retryDelay: 1 });
  // restore index.py to unmodified version
  console.log('      Resetting function...');
  await execa('git', ['checkout', '--', ...FUNCTION_PY_PATHS, ...FUNCTION_REQS_PATHS]);
});

async function randomizeFunction() {
  for (const py of FUNCTION_PY_PATHS) {
    const code = await fs.promises.readFile(py, { encoding: 'utf-8' });
    await fs.promises.writeFile(py, code.replace(/'RANDOM.*'/, `'RANDOM ${Date.now()}'`));
  }
}

async function addRequirement() {
  for (const req of FUNCTION_REQS_PATHS) {
    const code = await fs.promises.readFile(req, { encoding: 'utf-8' });
    await fs.promises.writeFile(req, code + '\nPillow');
  }
}

function generateCases(appDir: string) {
  // we synth in a separate stage to make it clear how much of the deployment time is due to bundling (packaging dependencies locally)
  // we deploy using --method direct to isolate the relevant deployment part (change sets seem to have very random timing)

  return () => {
    new RuntimeCase('Synth', async () => {
      await randomizeFunction();
      await execa('cdk', ['synth', '-q'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Deploy', async () => {
      await execa('cdk', ['deploy', '--app', 'cdk.out', '--method', 'direct', '--all', '--require-approval=never'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Synth (no change)', async () => {
      await execa('cdk', ['synth', '-q'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Deploy (no change)', async () => {
      await execa('cdk', ['deploy', '--app', 'cdk.out', '--method', 'direct', '--all', '--require-approval=never'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Synth (code change)', async () => {
      await randomizeFunction();
      await execa('cdk', ['synth', '-q'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Deploy (code change)', async () => {
      await execa('cdk', ['deploy', '--app', 'cdk.out', '--method', 'direct', '--all', '--require-approval=never'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Synth (new requirement)', async () => {
      await addRequirement();
      await execa('cdk', ['synth', '-q'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Deploy (new requirement)', async () => {
      await execa('cdk', ['deploy', '--app', 'cdk.out', '--method', 'direct', '--all', '--require-approval=never'], { cwd: appDir });
    }).showRuntime();
    new RuntimeCase('Destroy', async () => {
      await execa('cdk', ['destroy', '--all', '--force'], { cwd: appDir });
    }).showRuntime();
  };
}

perfContext('Vanilla (PythonFunction)', generateCases(VANILLA_APP_PATH));
perfContext('Turbo Layers', generateCases(TURBO_APP_PATH));
perfContext('Vanilla (5x PythonFunction)', generateCases(VANILLA_5_APP_PATH));
perfContext('Turbo Layers (5x Function w/ shared layer)', generateCases(TURBO_5_APP_PATH));
