# Proof-of-Ink Upload Worker

Cloudflare Worker that acts as a secure proxy for uploading Proof-of-Ink images to Apillon Storage.

## Architecture

```
Frontend (DApp)
    │
    │ POST /upload (with base64 image)
    ├──> Cloudflare Worker (this)
         │
         ├──> Apillon API (initiate upload)
         ├──> S3 (direct upload via signed URL)
         └──> Apillon API (complete upload)
```

## Security Model

- **Frontend**: Uses read-only Apillon API key (can only list files)
- **Worker**: Uses write-enabled Apillon API key (server-side, secrets protected, only allowed origins can call the worker)

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Apillon API Credentials**: Get from [apillon.io](https://apillon.io)

## Installation

```bash
cd workers/poi-upload-worker
npm install
```

## Configuration

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Set Environment Secrets

**Production:**

```bash
wrangler secret put APILLON_API_KEY --env production
wrangler secret put APILLON_API_SECRET --env production
wrangler secret put APILLON_BUCKET_UUID --env production
wrangler secret put ALLOWED_ORIGINS --env production
```

**ALLOWED_ORIGINS Format:**

```
https://kappasigmamu.github.io,http://localhost:3000
```

### 3. Test Locally

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`

## Deployment

### Deploy to Development

```bash
npm run deploy:dev
```

### Deploy to Production

```bash
npm run deploy:prod
```

### View Deployment Info

```bash
wrangler deployments list
```

### View Real-time Logs

**Development:**

```bash
npm run tail:dev
```

**Production:**

```bash
npm run tail:prod
```

### Cloudflare Dashboard

Monitor worker metrics at:

```
https://dash.cloudflare.com > Workers & Pages > poi-upload-worker
```
