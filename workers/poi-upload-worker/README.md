# POI Upload Worker

Cloudflare Worker for Proof-of-Ink image uploads to Apillon Storage.

## Features

- Secure proxy for Apillon API (protects credentials)
- Two-phase upload workflow (initiate → upload → complete)
- Auto-sync: moves approved member images from `pending/` to `approved/`
- CORS-enabled for frontend access

## Endpoints

### POST /initiate

Returns a signed upload URL.

**Request:**
```json
{
  "fileName": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY.jpg",
  "contentType": "image/jpeg",
  "directoryPath": "pending"
}
```

### POST /complete

Finalizes an upload session.

**Request:**
```json
{
  "sessionUuid": "..."
}
```

### POST /sync-approved-members

Moves images from `pending/` to `approved/` for provided addresses.

**Request:**
```json
{
  "addresses": ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"]
}
```

**Note:** Frontend validates membership before calling this endpoint.

## Environment Variables

Set via `wrangler secret put`:
- `APILLON_API_KEY`
- `APILLON_API_SECRET`
- `APILLON_BUCKET_UUID`
- `ALLOWED_ORIGINS`

## Development

```bash
npm install
npm run dev          # Run locally
npm run deploy:prod  # Deploy to production
npm run tail:prod    # View logs
```

## File Naming

Format: `{address}.{ext}` (e.g., `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY.jpg`)
