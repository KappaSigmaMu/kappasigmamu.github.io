# Apillon Bucket Setup Scripts

Scripts for setting up and migrating Proof-of-Ink tattoo images to Apillon IPFS storage.

## Quick Start

```bash
cd scripts/apillon-bucket
npm install
cp .env.example .env
# Edit .env with your credentials
npm run setup
npm run migrate
```

## Commands

### `npm run setup`

Initial bucket setup (run once):
- Creates folder structure (`pending/`, `approved/`, `rejected/`)
- Verifies configuration

### `npm run migrate`

Migrate images from Pinata to Apillon:
1. Downloads images from Pinata IPFS
2. Uploads to Apillon's `approved/` folder
3. Automatically skips duplicates

**Prerequisites:**
- Run `npm run setup` first
- Configure Pinata credentials in `.env`
- Optional: Create `filelist.txt` with one filename per line (156 images total)

## Environment Variables

Create `scripts/apillon-bucket/.env`:

```env
# Apillon credentials
APILLON_API_KEY=your_api_key
APILLON_API_SECRET=your_api_secret
APILLON_BUCKET_UUID=your_bucket_uuid

# Pinata credentials
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_secret_api_key
PINATA_GATEWAY=https://your-gateway.mypinata.cloud
```

Get Apillon credentials from: https://app.apillon.io

## Bucket Structure

```
kappa-sigma-mu-poi/
├── pending/      # Awaiting approval
├── approved/     # Live in gallery
└── rejected/     # Archive
```
