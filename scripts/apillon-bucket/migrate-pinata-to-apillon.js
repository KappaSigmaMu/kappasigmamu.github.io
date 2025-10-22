#!/usr/bin/env node

/**
 * Migrate existing Pinata tattoos to Apillon
 *
 * Downloads all images from Pinata folder and uploads to Apillon approved/
 */

import { Storage } from '@apillon/sdk';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function getPinataFolderContents(folderHash) {
  log('  Fetching folder contents using IPFS API...', 'blue');

  // Try Pinata's own gateway API first
  const pinataGateway = process.env.PINATA_GATEWAY;
  if (pinataGateway) {
    try {
      log(`  Trying Pinata gateway API...`, 'blue');
      const apiUrl = `${pinataGateway}/api/v0/ls?arg=${folderHash}`;
      const response = await fetch(apiUrl, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        if (data.Objects && data.Objects[0] && data.Objects[0].Links) {
          const files = data.Objects[0].Links
            .filter(link => (link.Name || '').match(/\.(jpg|jpeg|png|heic|webp)$/i))
            .map(link => link.Name);

          log(`  ✓ Found ${files.length} files via Pinata API`, 'green');
          return files;
        }
      }
    } catch (error) {
      log(`  ✗ Pinata API failed: ${error.message}`, 'yellow');
    }
  }

  // Try public IPFS HTTP API endpoints
  const ipfsApiEndpoints = [
    'https://ipfs.io',
    'https://dweb.link',
    'https://gateway.pinata.cloud'
  ];

  for (const endpoint of ipfsApiEndpoints) {
    try {
      log(`  Trying ${endpoint}...`, 'blue');
      const apiUrl = `${endpoint}/api/v0/ls?arg=${folderHash}`;
      const response = await fetch(apiUrl, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        if (data.Objects && data.Objects[0] && data.Objects[0].Links) {
          const files = data.Objects[0].Links
            .filter(link => (link.Name || '').match(/\.(jpg|jpeg|png|heic|webp)$/i))
            .map(link => link.Name);

          log(`  ✓ Found ${files.length} files via IPFS API`, 'green');
          return files;
        }
      }
    } catch (error) {
      log(`  ✗ ${endpoint} failed: ${error.message}`, 'yellow');
      continue;
    }
  }

  // Final fallback: Use Kubo RPC API format
  try {
    log('  Trying IPFS Kubo RPC format...', 'blue');
    const response = await fetch('https://ipfs.io/api/v0/ls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `arg=/ipfs/${folderHash}`
    });

    if (response.ok) {
      const data = await response.json();
      if (data.Objects && data.Objects[0] && data.Objects[0].Links) {
        const files = data.Objects[0].Links
          .filter(link => (link.Name || '').match(/\.(jpg|jpeg|png|heic|webp)$/i))
          .map(link => link.Name);

        log(`  ✓ Found ${files.length} files via Kubo RPC`, 'green');
        return files;
      }
    }
  } catch (error) {
    log(`  ✗ Kubo RPC failed: ${error.message}`, 'yellow');
  }

  // Last resort: Parse gateway HTML (limited to ~100 files)
  log('  Falling back to gateway HTML parsing...', 'yellow');
  log('  ⚠ Warning: This method is limited and may not return all files', 'yellow');

  const gateway = process.env.PINATA_GATEWAY || 'https://ipfs.io';
  const gatewayUrl = `${gateway}/ipfs/${folderHash}`;

  const gatewayResponse = await fetch(gatewayUrl);
  if (!gatewayResponse.ok) {
    throw new Error(`Failed to fetch folder: ${gatewayResponse.statusText}`);
  }

  const html = await gatewayResponse.text();
  const filePattern = /<a href="([^"]+\.(jpg|jpeg|png|heic|webp))"[^>]*>/gi;
  const files = [];
  let match;

  while ((match = filePattern.exec(html)) !== null) {
    let filename = decodeURIComponent(match[1]);
    filename = filename.replace(/^\/ipfs\/[^\/]+\//, '');
    if (filename && !files.includes(filename)) {
      files.push(filename);
    }
  }

  log(`  ⚠ HTML parsing found ${files.length} files (may be incomplete)`, 'yellow');
  log(`  💡 Consider manually creating a file list at: filelist.txt`, 'cyan');

  return files;
}

async function getLatestPinataHash() {
  const url = 'https://api.pinata.cloud/data/pinList?status=pinned&sort=date_pinned,desc';

  const response = await fetch(url, {
    headers: {
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_API_SECRET
    }
  });

  if (!response.ok) {
    throw new Error(`Pinata API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.rows[0]?.ipfs_pin_hash;
}

async function downloadFromIPFS(hash, filename, tempDir) {
  const gateway = process.env.PINATA_GATEWAY || 'https://ipfs.io';
  const url = `${gateway}/ipfs/${hash}/${filename}`;

  log(`  Downloading ${filename}...`, 'blue');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, Buffer.from(buffer));

  return filepath;
}

async function getApillonFiles() {
  try {
    log('  Fetching existing files from Apillon (may take a while)...', 'cyan');

    const auth = btoa(`${process.env.APILLON_API_KEY}:${process.env.APILLON_API_SECRET}`);
    const bucketUuid = process.env.APILLON_BUCKET_UUID;

    let allFiles = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.apillon.io/storage/buckets/${bucketUuid}/files?limit=100&page=${page}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const items = data.data?.items || [];

      allFiles.push(...items.filter(item => item.name !== '.gitkeep'));

      const total = data.data?.total || 0;
      hasMore = allFiles.length < total && items.length > 0;
      page++;
    }

    // Extract just the filenames
    const filenames = allFiles.map(item => item.name);
    log(`  Found ${filenames.length} files already in Apillon`, 'cyan');

    return filenames;
  } catch (error) {
    log(`⚠ Could not list Apillon files: ${error.message}`, 'yellow');
    log('  Will attempt to upload all files', 'yellow');
    return [];
  }
}

async function uploadToApillon(bucket, filepath, filename) {
  log(`  Uploading ${filename} to Apillon...`, 'blue');

  const auth = btoa(`${process.env.APILLON_API_KEY}:${process.env.APILLON_API_SECRET}`);
  const bucketUuid = process.env.APILLON_BUCKET_UUID;

  // Step 1: Initiate upload session
  const initiateUrl = `https://api.apillon.io/storage/buckets/${bucketUuid}/upload`;
  const fileBuffer = fs.readFileSync(filepath);

  const initiateResponse = await fetch(initiateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: [{
        fileName: filename,
        contentType: 'image/jpeg',
        path: 'approved'
      }]
    })
  });

  if (!initiateResponse.ok) {
    const error = await initiateResponse.text();
    throw new Error(`Failed to initiate upload: ${error}`);
  }

  const initiateData = await initiateResponse.json();
  const sessionUuid = initiateData.data.sessionUuid;
  const uploadUrl = initiateData.data.files[0].url;

  // Step 2: Upload file to signed URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: fileBuffer,
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }

  // Step 3: Complete upload session
  const completeUrl = `https://api.apillon.io/storage/buckets/${bucketUuid}/upload/${sessionUuid}/end`;
  const completeResponse = await fetch(completeUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });

  if (!completeResponse.ok) {
    const error = await completeResponse.text();
    throw new Error(`Failed to complete upload: ${error}`);
  }

  log(`  ✓ ${filename} uploaded`, 'green');
}

async function main() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   Pinata → Apillon Migration Tool          ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  // Step 1: Check environment variables
  log('Step 1: Checking environment variables...', 'blue');

  const requiredVars = [
    'APILLON_API_KEY',
    'APILLON_API_SECRET',
    'APILLON_BUCKET_UUID',
    'PINATA_API_KEY',
    'PINATA_API_SECRET'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    log('✗ Missing environment variables:', 'red');
    missing.forEach(v => log(`  - ${v}`, 'red'));
    log('\nEdit scripts/apillon-bucket/.env with required variables', 'yellow');
    process.exit(1);
  }

  log('✓ All environment variables present\n', 'green');

  // Step 2: Initialize Apillon
  log('Step 2: Connecting to Apillon...', 'blue');

  const storage = new Storage({
    key: process.env.APILLON_API_KEY,
    secret: process.env.APILLON_API_SECRET
  });

  const bucket = storage.bucket(process.env.APILLON_BUCKET_UUID);
  log('✓ Connected to Apillon\n', 'green');

  // Step 3: Get current Pinata hash
  log('Step 3: Finding current Pinata folder...', 'blue');

  let folderHash;
  try {
    folderHash = await getLatestPinataHash();
    if (!folderHash) {
      log('✗ No Pinata folder found', 'red');
      process.exit(1);
    }
    log(`✓ Found folder: ${folderHash}\n`, 'green');
  } catch (error) {
    log('✗ Could not access Pinata API', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 4: List all files in Pinata folder
  log('Step 4: Listing files in Pinata folder...', 'blue');

  let files;

  // Check for manual file list first
  const filelistPath = path.join(__dirname, 'filelist.txt');
  if (fs.existsSync(filelistPath)) {
    log('  📄 Found filelist.txt, using manual file list', 'green');
    const filelistContent = fs.readFileSync(filelistPath, 'utf-8');
    files = filelistContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .filter(line => line.match(/\.(jpg|jpeg|png|heic|webp)$/i));

    log(`✓ Loaded ${files.length} files from filelist.txt\n`, 'green');
  } else {
    // Auto-discover from IPFS
    try {
      files = await getPinataFolderContents(folderHash);
      if (files.length === 0) {
        log('✗ No image files found in Pinata folder', 'red');
        process.exit(1);
      }
      log(`✓ Found ${files.length} image(s)\n`, 'green');

      // Warn if it looks incomplete
      if (files.length === 100) {
        log('⚠ Warning: Found exactly 100 files, which suggests pagination limit', 'yellow');
        log('💡 Create a filelist.txt with all filenames (one per line) for complete migration\n', 'cyan');
      }
    } catch (error) {
      log('✗ Could not list folder contents', 'red');
      log(`Error: ${error.message}`, 'red');
      log('\n💡 Create a filelist.txt file with one filename per line', 'cyan');
      process.exit(1);
    }
  }

  // Step 5: Check existing files in Apillon
  log('Step 5: Checking existing files in Apillon...', 'blue');

  const existingFiles = await getApillonFiles();
  log(`✓ Found ${existingFiles.length} existing files in Apillon`, 'green');

  if (existingFiles.length > 0) {
    log(`  Sample existing files:`, 'cyan');
    existingFiles.slice(0, 5).forEach(f => log(`    - ${f}`, 'cyan'));
  }
  log('', 'reset');

  // Step 6: Create temp directory for downloads
  log('Step 6: Setting up temporary directory...', 'blue');

  const tempDir = path.join(__dirname, 'temp-migration');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  log(`✓ Created: ${tempDir}\n`, 'green');

  // Step 7: Download all images from Pinata
  log('Step 7: Downloading images from Pinata...', 'blue');

  const downloadedFiles = [];
  let downloadFailed = 0;
  const downloadErrors = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = path.join(tempDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      log(`[${i + 1}/${files.length}] ${filename} - already downloaded, skipping`, 'cyan');
      downloadedFiles.push({ filename, filepath });
      continue;
    }

    try {
      log(`[${i + 1}/${files.length}] Downloading ${filename}...`, 'cyan');
      const downloadedPath = await downloadFromIPFS(folderHash, filename, tempDir);
      downloadedFiles.push({ filename, filepath: downloadedPath });
      log(`  ✓ Downloaded\n`, 'green');
    } catch (error) {
      downloadFailed++;
      downloadErrors.push({ filename, error: error.message });
      log(`  ✗ Failed: ${error.message}\n`, 'red');
    }
  }

  log(`\nDownload summary: ${downloadedFiles.length} successful, ${downloadFailed} failed\n`, 'cyan');

  // Step 8: Upload all images to Apillon
  log('Step 8: Uploading images to Apillon...', 'blue');

  // Calculate how many files would be skipped
  const filesToSkip = downloadedFiles.filter(({ filename }) => existingFiles.includes(filename));
  const filesToUpload = downloadedFiles.filter(({ filename }) => !existingFiles.includes(filename));

  log(`  Files to skip (already exist): ${filesToSkip.length}`, 'yellow');
  log(`  Files to upload (new): ${filesToUpload.length}`, 'green');

  if (filesToUpload.length === 0) {
    log('\n✓ All files already exist in Apillon. Nothing to upload!\n', 'green');
    return;
  }

  log(`\n⚠ About to upload ${filesToUpload.length} files. Press Ctrl+C to cancel, or wait 3 seconds...`, 'yellow');
  await new Promise(resolve => setTimeout(resolve, 3000));

  let uploadSuccessful = 0;
  let uploadFailed = 0;
  let uploadSkipped = 0;
  const uploadErrors = [];

  for (let i = 0; i < downloadedFiles.length; i++) {
    const { filename, filepath } = downloadedFiles[i];

    // Skip if already exists in Apillon
    if (existingFiles.includes(filename)) {
      uploadSkipped++;
      if (uploadSkipped <= 5) {
        log(`[${i + 1}/${downloadedFiles.length}] ${filename} - already exists, skipping`, 'yellow');
      }
      continue;
    }

    try {
      log(`[${i + 1}/${downloadedFiles.length}] Uploading ${filename}...`, 'cyan');
      await uploadToApillon(bucket, filepath, filename);
      uploadSuccessful++;
      log(`  ✓ Uploaded\n`, 'green');
    } catch (error) {
      uploadFailed++;
      uploadErrors.push({ filename, error: error.message });
      log(`  ✗ Failed: ${error.message}\n`, 'red');
    }
  }

  log(`\nUpload summary: ${uploadSuccessful} successful, ${uploadFailed} failed\n`, 'cyan');

  // Step 9: Cleanup
  log('Step 9: Cleaning up temporary files...', 'blue');

  try {
    // Remove all downloaded files
    for (const { filepath } of downloadedFiles) {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    // Remove temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
    log('✓ Temporary files removed\n', 'green');
  } catch (error) {
    log('⚠ Could not remove all temp files', 'yellow');
  }

  // Step 10: Final Summary
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║         Migration Complete!                ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  log('Download Results:', 'blue');
  log(`  ✓ Downloaded: ${downloadedFiles.length}`, 'green');
  if (downloadFailed > 0) {
    log(`  ✗ Failed: ${downloadFailed}`, 'red');
  }

  log('\nUpload Results:', 'blue');
  log(`  ✓ Uploaded: ${uploadSuccessful}`, 'green');
  log(`  ⊘ Skipped (already exists): ${uploadSkipped}`, 'yellow');
  if (uploadFailed > 0) {
    log(`  ✗ Failed: ${uploadFailed}`, 'red');
  }

  if (downloadErrors.length > 0) {
    log('\nDownload Errors:', 'yellow');
    downloadErrors.forEach(({ filename, error }) => {
      log(`  - ${filename}: ${error}`, 'yellow');
    });
  }

  if (uploadErrors.length > 0) {
    log('\nUpload Errors:', 'yellow');
    uploadErrors.forEach(({ filename, error }) => {
      log(`  - ${filename}: ${error}`, 'yellow');
    });
  }

  log('\nNext steps:', 'blue');
  log('1. Verify images in Apillon dashboard', 'yellow');
  log('2. Update frontend to use Apillon instead of Pinata', 'yellow');
  log('3. Test the gallery page\n', 'yellow');
}

main().catch(error => {
  log('\n✗ Migration failed', 'red');
  log(error.message, 'red');
  console.error(error);
  process.exit(1);
});
