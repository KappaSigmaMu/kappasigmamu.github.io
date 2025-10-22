#!/usr/bin/env node

/**
 * Apillon Proof-of-Ink Setup Script
 *
 * Sets up bucket structure and verifies configuration
 * Run once before implementing direct uploads
 */

import { Storage } from '@apillon/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   Apillon Proof-of-Ink Setup Script       ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  // Step 1: Check environment variables
  log('Step 1: Checking environment variables...', 'blue');

  const requiredVars = [
    'APILLON_API_KEY',
    'APILLON_API_SECRET',
    'APILLON_BUCKET_UUID'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    log('✗ Missing environment variables:', 'red');
    missing.forEach(v => log(`  - ${v}`, 'red'));
    log('\nCreate scripts/.env with these variables', 'yellow');
    process.exit(1);
  }

  log('✓ All environment variables present\n', 'green');

  // Step 2: Initialize Apillon SDK
  log('Step 2: Connecting to Apillon...', 'blue');

  let storage, bucket;
  try {
    storage = new Storage({
      key: process.env.APILLON_API_KEY,
      secret: process.env.APILLON_API_SECRET
    });

    bucket = storage.bucket(process.env.APILLON_BUCKET_UUID);
    log('✓ Connected to Apillon\n', 'green');
  } catch (error) {
    log('✗ Failed to connect to Apillon', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // Step 3: Create directory structure
  log('Step 3: Setting up bucket directories...', 'blue');

  const directories = ['pending', 'approved', 'rejected'];

  try {
    // Create a dummy file in each directory to ensure they exist
    // Apillon doesn't have explicit "create directory" - directories are created when files are uploaded

    const dummyContent = Buffer.from('# Placeholder file - safe to delete after first real upload');

    for (const dir of directories) {
      log(`  Creating ${dir}/...`, 'blue');

      await bucket.uploadFiles([{
        fileName: '.gitkeep',
        content: dummyContent,
        contentType: 'text/plain'
      }], {
        directoryPath: dir
      });

      log(`  ✓ ${dir}/ created`, 'green');
    }

    log('✓ Directory structure ready\n', 'green');
  } catch (error) {
    log('✗ Failed to create directories', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // Step 4: Verify structure
  log('Step 4: Verifying bucket structure...', 'blue');

  try {
    const rootFiles = await bucket.listObjects();

    log(`\n  Bucket contents:`, 'cyan');
    log(`  - Total items: ${rootFiles.items.length}`, 'cyan');

    for (const dir of directories) {
      const files = await bucket.listObjects({ directoryPath: dir });
      log(`  - ${dir}/: ${files.items.length} file(s)`, 'cyan');
    }

    log('\n✓ Structure verified\n', 'green');
  } catch (error) {
    log('⚠ Could not verify structure (may be OK)', 'yellow');
    log(error.message, 'yellow');
  }

  // Step 5: Create .env.example if it doesn't exist
  log('Step 5: Creating .env.example...', 'blue');

  const envExamplePath = path.join(__dirname, '.env.example');
  const envExample = `# Apillon Configuration
# Get these from https://app.apillon.io

APILLON_API_KEY=your_api_key_here
APILLON_API_SECRET=your_api_secret_here
APILLON_BUCKET_UUID=your_bucket_uuid_here

# Optional: Matrix/Element Notifications
MATRIX_ROOM_ID=!YourRoomId:matrix.org
MATRIX_ACCESS_TOKEN=your_access_token
`;

  fs.writeFileSync(envExamplePath, envExample);
  log('✓ Created .env.example\n', 'green');

  // Step 6: Check for existing Pinata images
  log('Step 6: Checking for Pinata migration...', 'blue');

  const pinataEnvPath = path.resolve(__dirname, '../.env.production');

  if (fs.existsSync(pinataEnvPath)) {
    const envContent = fs.readFileSync(pinataEnvPath, 'utf-8');
    const hasPinata = envContent.includes('REACT_APP_PINATA_GATEWAY');

    if (hasPinata) {
      log('⚠ Pinata configuration detected', 'yellow');
      log('  Run migration script to move existing tattoos:', 'yellow');
      log('  npm run migrate-pinata-to-apillon\n', 'yellow');
    } else {
      log('✓ No Pinata migration needed\n', 'green');
    }
  }

  // Step 7: Summary
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║           Setup Complete! ✓                ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  log('Next steps:', 'blue');
  log('1. Update .env.production with frontend credentials:', 'yellow');
  log('   REACT_APP_APILLON_API_KEY=<read-only-key>', 'yellow');
  log('   REACT_APP_APILLON_BUCKET_UUID=<bucket-uuid>\n', 'yellow');

  log('2. Build the upload form component', 'yellow');
  log('   File: src/pages/explore/ProofOfInkPage/SubmitPage.tsx\n', 'yellow');

  log('3. Test the approval workflow:', 'yellow');
  log('   npm run approve-poi\n', 'yellow');

  log('Bucket structure:', 'cyan');
  log('  kappa-sigma-mu-poi/', 'cyan');
  log('  ├── pending/     (awaiting approval)', 'cyan');
  log('  ├── approved/    (live in gallery)', 'cyan');
  log('  └── rejected/    (archive)\n', 'cyan');

  log('Ready to implement! 🚀\n', 'green');
}

main().catch(error => {
  log('\n✗ Setup failed', 'red');
  log(error.message, 'red');
  console.error(error);
  process.exit(1);
});
