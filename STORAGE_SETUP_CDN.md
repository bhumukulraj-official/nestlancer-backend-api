# Storage & CDN Setup (Backblaze B2 + Cloudflare)

Complete guide for configuring Backblaze B2 storage with Cloudflare CDN for the Nestlancer project (Next.js frontend + NestJS backend).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Buckets Configuration](#2-buckets-configuration)
3. [Configure Backblaze B2](#3-configure-backblaze-b2)
4. [Environment Variables](#4-environment-variables)
5. [Connect Backblaze B2 to Cloudflare CDN](#5-connect-backblaze-b2-to-cloudflare-cdn)
6. [CORS Configuration for B2](#6-cors-configuration-for-b2)
7. [Next.js Frontend Configuration](#7-nextjs-frontend-configuration)
8. [Security Hardening](#8-security-hardening)
9. [Verification & Testing](#9-verification--testing)
10. [Quick Checklist](#10-quick-checklist)
11. [Troubleshooting](#appendix-a-troubleshooting)
12. [Cost Summary](#appendix-b-cost-summary-backblaze-b2--cloudflare)

---

## 1. Architecture Overview

### 1.1 Data Flow

```
Next.js Frontend (Browser)
    │
    ├─── Public assets (images, avatars, thumbnails)
    │    └── GET https://cdn.yourdomain.com/avatars/user123.webp
    │        └── Cloudflare Edge (300+ PoPs worldwide)
    │            ├── Cache HIT  → serve instantly from edge
    │            └── Cache MISS → fetch from B2 origin:
    │                  f<NNN>.backblazeb2.com/file/nestlancer-public/avatars/user123.webp
    │                  └── Cache response at edge for future requests
    │
    ├─── Private files (deliverables, invoices, PDFs)
    │    └── Backend generates presigned URL → browser GETs directly from B2
    │        https://s3.eu-central-003.backblazeb2.com/nestlancer-private/...?X-Amz-Signature=...
    │
    └─── Uploads (presigned PUT)
         └── Backend generates presigned PUT URL → browser PUTs file to B2
             https://s3.eu-central-003.backblazeb2.com/nestlancer-private/...?X-Amz-Signature=...
             (CORS rules on B2 bucket required)
```

### 1.2 Why Cloudflare + Backblaze B2?

| Benefit | Detail |
|---------|--------|
| **Free egress** | Backblaze is a Cloudflare [Bandwidth Alliance](https://www.cloudflare.com/bandwidth-alliance/backblaze/) partner — **all egress from B2 through Cloudflare is completely FREE** (not counted against any tier or quota) |
| **Global CDN** | Cloudflare's 300+ edge locations cache public assets close to users worldwide |
| **Free SSL** | Cloudflare provides free, auto-renewing SSL/TLS certificates |
| **DDoS protection** | Cloudflare WAF and DDoS mitigation shield B2 from abuse |
| **Cost at 100 users** | **$0/month** — B2 free tier (10 GB) + free Cloudflare plan + free egress via Bandwidth Alliance |

> **⚠️ CRITICAL — Bandwidth Alliance**: Because of this partnership, egress from B2 through Cloudflare is **FREE and unlimited**. You should **always** serve public B2 content through your Cloudflare CDN hostname, never via raw B2 URLs. This eliminates egress costs entirely.
>
> **Reference**: [Backblaze + Cloudflare Bandwidth Alliance](https://www.cloudflare.com/bandwidth-alliance/backblaze/), [Backblaze B2 CDN Guide](https://www.backblaze.com/docs/cloud-storage-deliver-public-backblaze-b2-content-through-cloudflare-cdn)

---

## 2. Buckets Configuration

### 2.1 Logical Buckets in the Codebase

From `storage.schema.ts` and `config.service.ts`, the application uses these logical buckets:

| # | Bucket Name (Default) | Env Var | Purpose | Access Level |
|---|----------------------|---------|---------|-------------|
| 1 | `nestlancer-private` | `STORAGE_BUCKET_PRIVATE` | User media uploads, deliverables (signed URLs) | **Private** |
| 2 | `nestlancer-public` | `STORAGE_BUCKET_PUBLIC` | Public assets, CDN origin, health check | **Public** |
| 3 | `nestlancer-avatars` | `STORAGE_BUCKET_AVATARS` | User profile avatars | **Public** (recommended) |
| 4 | `nestlancer-requests` | `STORAGE_BUCKET_ATTACHMENTS` | Request attachments (max 10 MB/file, 10/request) | **Private** |
| 5 | `nestlancer-quotes-pdfs` | `STORAGE_BUCKET_QUOTES` | Generated quote PDFs | **Private** |
| 6 | `nestlancer-deliverables` | `STORAGE_BUCKET_DELIVERABLES` | Config; actual files in private bucket | **Private** |
| 7 | `nestlancer-reports` | `STORAGE_BUCKET_REPORTS` | Admin/analytics reports | **Private** |
| 8 | `nestlancer-pdfs` | `STORAGE_BUCKET_PDFS` | Receipts & invoices (hard-coded as `pdfs` in some services) | **Private** |

### 2.2 Plan A: Two Physical Buckets + Two Replicas (Recommended)

Collapse 8 logical buckets into **2 physical B2 buckets** + 2 replica buckets for backup:

| Role | Physical B2 Bucket | B2 Type | Purpose |
|------|-------------------|---------|---------|
| **Primary private** | `nestlancer-private` | Private | All sensitive data: media, attachments, quotes, deliverables, reports, invoices. Use path prefixes per type. |
| **Primary public** | `nestlancer-public` | Public | CDN origin: public avatars, thumbnails, static assets, `.healthcheck` file. |
| **Replica private** | `nestlancer-private-replica` | Private | Cloud Replication target in US East (disaster recovery). |
| **Replica public** | `nestlancer-public-replica` | Public | Cloud Replication target in US East (disaster recovery). |

**Path prefix convention** inside the private bucket:

```
nestlancer-private/
├── media/           ← user media uploads (MediaStorageService)
├── avatars/         ← only if avatars must be private
├── attachments/     ← request attachments (RequestAttachmentsService)
├── quotes/          ← quote PDFs (STORAGE_BUCKET_QUOTES)
├── deliverables/    ← deliverable files (DeliverablesService)
├── reports/         ← admin/analytics reports
└── pdfs/            ← receipts & invoices (ReceiptPdfService, InvoicePdfService)
```

**Path prefix convention** inside the public bucket:

```
nestlancer-public/
├── avatars/         ← public user profile images
├── assets/          ← static assets, logos, thumbnails
└── .healthcheck     ← health check file (StorageHealthService)
```

### 2.3 Bucket-by-Bucket Details

#### `nestlancer-public` — Public Bucket (CDN Origin)

| Property | Value |
|----------|-------|
| **Used by** | `MediaConfig.S3_PUBLIC_BUCKET`, `StorageHealthService` (`.healthcheck`) |
| **B2 type** | Public |
| **CDN** | ✅ Primary CDN origin — served through `cdn.yourdomain.com` |
| **Cache strategy** | Long TTL — use content-hashed filenames for cache busting |

#### `nestlancer-private` — Private Bucket (Signed URLs Only)

| Property | Value |
|----------|-------|
| **Used by** | `MediaConfig.S3_PRIVATE_BUCKET`, `MediaStorageService`, `DeliverablesService`, `ReceiptPdfService`, `InvoicePdfService` |
| **B2 type** | Private |
| **CDN** | ⚠️ NOT exposed through CDN. Accessed only via presigned URLs generated by the NestJS backend. |
| **Cache** | Do NOT cache — presigned URLs are time-limited and user-specific |

#### `nestlancer-avatars` — Avatars

| Option | Recommendation |
|--------|---------------|
| **Public avatars** (recommended) | Map `STORAGE_BUCKET_AVATARS` → `nestlancer-public`. Store under `avatars/` prefix. Serve through CDN. |
| **Private avatars** | Map `STORAGE_BUCKET_AVATARS` → `nestlancer-private`. Store under `avatars/` prefix. Serve via signed URLs only. |

#### Other Private Buckets

`nestlancer-requests`, `nestlancer-quotes-pdfs`, `nestlancer-deliverables`, `nestlancer-reports`, `nestlancer-pdfs` — all contain sensitive data. Map all to `nestlancer-private` with appropriate path prefixes. Serve only via presigned URLs.

---

## 3. Configure Backblaze B2

### 3.1 Prerequisites

| Item | Detail |
|------|--------|
| Primary account | **EU Central (Amsterdam)** — `bhumukulraj.official@gmail.com` |
| Replica account | **US East (Virginia)** — `bhumukulraj.official+backup@gmail.com` |
| Setup reference | See `B2_STORAGE_ESTIMATE_100_USERS.pdf` for account creation, replication, caps & alerts |

### 3.2 Create the Public Bucket

1. Log in to your **primary** Backblaze account (EU Central)
2. Go to **B2 Cloud Storage** → **Buckets** → **Create a Bucket**
3. Configure:

| Field | Value |
|-------|-------|
| Bucket Unique Name | `nestlancer-public` |
| Files in Bucket are | **Public** |
| Default Encryption | **Disable** (Cloudflare needs to read files without decryption) |
| Object Lock | **Disable** |

4. After creation, go to **Bucket Settings** → **Bucket Info**
5. Add this custom info entry:
   - **Key**: `Cache-Control`
   - **Value**: `public, max-age=31536000, immutable`

   > This header tells Cloudflare and browsers to cache files for **1 year**. Use content-hashed filenames (e.g., `avatar-a1b2c3d4.webp`) so you never need to invalidate cache — when a file changes, upload with a new name.

6. Click **Update Bucket**

### 3.3 Create the Private Bucket

Same steps as above but:

| Field | Value |
|-------|-------|
| Bucket Unique Name | `nestlancer-private` |
| Files in Bucket are | **Private** |
| Default Encryption | **Enable** (SSE-B2, Backblaze-managed keys) |
| Object Lock | **Disable** |

No `Cache-Control` bucket info needed — private files are served via presigned URLs with their own expiry.

### 3.4 Upload a Health Check File

Upload a small file to the public bucket for connectivity testing:

```bash
# Using the B2 CLI (or upload via the web console)
echo "ok" > .healthcheck
b2 upload-file nestlancer-public .healthcheck .healthcheck
```

The `StorageHealthService` calls `storageService.exists('nestlancer-public', '.healthcheck')` to verify storage connectivity.

### 3.5 Create an Application Key

1. Go to **Account** → **App Keys** → **Add a New Application Key**
2. Configure:

| Field | Value |
|-------|-------|
| Name of Key | `nestlancer-app-key` |
| Allow access to Bucket(s) | **All** *(or select `nestlancer-private` and `nestlancer-public`)* |
| Type of Access | **Read and Write** |
| Allow List All Bucket Names | **Yes** |
| File name prefix | *(leave blank)* |

3. Click **Create New Key**
4. **IMMEDIATELY** copy and save:
   - **keyID** → use as `B2_KEY_ID`
   - **applicationKey** → use as `B2_APPLICATION_KEY`

> ⚠️ The `applicationKey` is displayed **only once**. If you lose it, you must delete the key and create a new one.

### 3.6 Note Your Endpoints

For **EU Central (Amsterdam)**, the endpoints are:

| Endpoint Type | Value |
|--------------|-------|
| **S3-Compatible Endpoint** | `https://s3.eu-central-003.backblazeb2.com` |
| **S3 Region** | `eu-central-003` |
| **Friendly URL Host** | `f003.backblazeb2.com` *(check your bucket details — the `f<NNN>` number is cluster-specific)* |

**How to find your Friendly URL host:**

1. In B2, go to **Buckets** → click on `nestlancer-public`
2. Click **Upload/Download** → upload a test file
3. After upload, click on the file — the **Friendly URL** will show something like:
   ```
   https://f003.backblazeb2.com/file/nestlancer-public/test.txt
   ```
4. The host portion (`f003.backblazeb2.com`) is what you need for Cloudflare CNAME

> ⚠️ **Important**: The `f<NNN>` number varies by account/cluster. Do NOT assume `f003` — check your actual B2 dashboard. For the rest of this guide, replace `f003.backblazeb2.com` with your actual value.

### 3.7 Cloud Replication (Disaster Recovery)

See **Section 8 of the B2 Storage Estimate document** for full replication setup:

| Source (EU Central) | Destination (US East) |
|--------------------|----------------------|
| `nestlancer-private` | `nestlancer-private-replica` |
| `nestlancer-public` | `nestlancer-public-replica` |

Replication has **no egress fees** and **no service fees** — you only pay for storage on the replica account (first 10 GB free per account).

---

## 4. Environment Variables

### 4.1 Backend (NestJS) `.env.production`

```env
# ──────────────────────────────────────────────
# Storage provider
# ──────────────────────────────────────────────
STORAGE_PROVIDER=b2

# ──────────────────────────────────────────────
# B2 connection (EU Central — Amsterdam)
# ──────────────────────────────────────────────
B2_KEY_ID=<your-keyID-from-step-3.5>
B2_APPLICATION_KEY=<your-applicationKey-from-step-3.5>
B2_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
B2_REGION=eu-central-003

# ──────────────────────────────────────────────
# Bucket names — Plan A (2 physical buckets)
# ──────────────────────────────────────────────
STORAGE_BUCKET_PRIVATE=nestlancer-private
STORAGE_BUCKET_PUBLIC=nestlancer-public
STORAGE_BUCKET_AVATARS=nestlancer-public
STORAGE_BUCKET_ATTACHMENTS=nestlancer-private
STORAGE_BUCKET_QUOTES=nestlancer-private
STORAGE_BUCKET_DELIVERABLES=nestlancer-private
STORAGE_BUCKET_REPORTS=nestlancer-private
STORAGE_BUCKET_PDFS=nestlancer-private

# ──────────────────────────────────────────────
# CDN (Cloudflare) — public asset base URL
# ──────────────────────────────────────────────
CDN_URL=https://cdn.yourdomain.com

# ──────────────────────────────────────────────
# Presigned URL config
# ──────────────────────────────────────────────
SIGNED_URL_EXPIRES_IN=3600
```

> **Note on `STORAGE_BUCKET_AVATARS`**: Set to `nestlancer-public` if avatars are public (recommended). Set to `nestlancer-private` if avatars must be private (served via signed URLs).

### 4.2 Frontend (Next.js) `.env.production`

```env
# CDN URL for public assets (available in browser via NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com

# Backend API URL (for presigned URL requests, auth, etc.)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 4.3 Development `.env.development`

```env
# Backend
STORAGE_PROVIDER=b2
B2_KEY_ID=<your-dev-keyID>
B2_APPLICATION_KEY=<your-dev-applicationKey>
B2_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
B2_REGION=eu-central-003

STORAGE_BUCKET_PRIVATE=nestlancer-private
STORAGE_BUCKET_PUBLIC=nestlancer-public
STORAGE_BUCKET_AVATARS=nestlancer-public
STORAGE_BUCKET_ATTACHMENTS=nestlancer-private
STORAGE_BUCKET_QUOTES=nestlancer-private
STORAGE_BUCKET_DELIVERABLES=nestlancer-private
STORAGE_BUCKET_REPORTS=nestlancer-private
STORAGE_BUCKET_PDFS=nestlancer-private

CDN_URL=https://cdn.yourdomain.com

# Next.js frontend
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 5. Connect Backblaze B2 to Cloudflare CDN

### 5.1 Prerequisites

- [ ] Domain's DNS is managed by Cloudflare (nameservers pointed to Cloudflare)
- [ ] Cloudflare account (Free plan is sufficient)
- [ ] B2 public bucket (`nestlancer-public`) created and a test file uploaded
- [ ] Your Friendly URL host noted (e.g., `f003.backblazeb2.com`)

### 5.2 How the CDN Integration Works

This is the core concept — understand this before proceeding:

```
WHAT THE USER REQUESTS:
  https://cdn.yourdomain.com/avatars/user123.webp

WHAT CLOUDFLARE DOES:
  1. DNS resolves cdn.yourdomain.com → CNAME → f003.backblazeb2.com
  2. Cloudflare proxy intercepts the request (orange cloud enabled)
  3. Transform Rule rewrites the URL path:
     /avatars/user123.webp  →  /file/nestlancer-public/avatars/user123.webp
  4. Origin Rule sets the Host header:
     Host: cdn.yourdomain.com  →  Host: f003.backblazeb2.com

WHAT B2 RECEIVES:
  GET /file/nestlancer-public/avatars/user123.webp
  Host: f003.backblazeb2.com
  → Returns the file with Cache-Control headers

WHAT CLOUDFLARE DOES WITH THE RESPONSE:
  1. Caches the response at the nearest edge PoP
  2. Serves it to the user with CF-Cache-Status: MISS (first time)
  3. Next request → CF-Cache-Status: HIT (served from edge, no B2 request)

EGRESS COST:
  $0 — Bandwidth Alliance partnership = free egress from B2 to Cloudflare
```

### 5.3 Step 1 — DNS CNAME Record

1. Go to your domain in **Cloudflare Dashboard** → **DNS** → **Records**
2. Click **Add Record**:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name** | `cdn` *(creates `cdn.yourdomain.com`)* |
| **Target** | `f003.backblazeb2.com` *(replace with YOUR Friendly URL host from §3.6)* |
| **Proxy status** | **Proxied** ☁️ *(orange cloud — MUST be enabled)* |
| **TTL** | Auto |

3. Click **Save**

> ⚠️ The proxy **MUST** be enabled (orange cloud). If set to DNS-only (grey cloud), Cloudflare will not cache, protect, or serve your content — requests go directly to B2, you pay full egress, and the Bandwidth Alliance benefit is lost.

### 5.4 Step 2 — SSL/TLS Configuration

1. In Cloudflare, go to **SSL/TLS** → **Overview**
2. Set encryption mode to: **Full (strict)**

> B2 serves content over HTTPS with valid certificates, so **Full (strict)** works correctly and is the most secure option.

### 5.5 Step 3 — Transform Rule: URL Path Rewrite (CRITICAL)

**This is the most important step.** Without it, requests to `cdn.yourdomain.com/image.jpg` will return `404` because B2 expects the path to include `/file/<bucket-name>/`.

1. In Cloudflare, go to **Rules** → **Transform Rules**
2. Click the **Rewrite URL** tab
3. Click **+ Create rule**
4. Configure:

**If incoming requests match:**

| Field | Operator | Value |
|-------|----------|-------|
| Hostname | equals | `cdn.yourdomain.com` |

**Then → Path → Rewrite to:**

| Type | Expression |
|------|-----------|
| **Dynamic** | `concat("/file/nestlancer-public", http.request.uri.path)` |

**Then → Query:**

| Setting | Value |
|---------|-------|
| Query | **Preserve** |

5. **Rule name**: `B2 public bucket path rewrite`
6. Click **Deploy**

**Verification — what this rule does:**

| User requests | B2 receives |
|--------------|-------------|
| `cdn.yourdomain.com/avatars/user123.webp` | `/file/nestlancer-public/avatars/user123.webp` |
| `cdn.yourdomain.com/.healthcheck` | `/file/nestlancer-public/.healthcheck` |
| `cdn.yourdomain.com/assets/logo.svg` | `/file/nestlancer-public/assets/logo.svg` |

### 5.6 Step 4 — Origin Rule: Host Header Override

When Cloudflare proxies a request, it sends the `Host` header as the client-facing hostname (`cdn.yourdomain.com`). B2 needs to receive its own hostname to route the request correctly.

1. In Cloudflare, go to **Rules** → **Origin Rules**
2. Click **+ Create rule**
3. Configure:

**If incoming requests match:**

| Field | Operator | Value |
|-------|----------|-------|
| Hostname | equals | `cdn.yourdomain.com` |

**Then → Host Header → Override:**

| Field | Value |
|-------|-------|
| Host Header | `f003.backblazeb2.com` *(your Friendly URL host)* |

4. **Rule name**: `B2 host header override`
5. Click **Deploy**

> Without this rule, B2 may return `421 Misdirected Request` or `404` because it doesn't recognize `cdn.yourdomain.com` as a valid host.

### 5.7 Step 5 — Cache Rules

1. In Cloudflare, go to **Rules** → **Cache Rules** (or **Caching** → **Cache Rules**)
2. Click **+ Create rule**

**Rule: Cache all CDN assets aggressively**

| Field | Value |
|-------|-------|
| **Rule name** | `Cache B2 public assets` |
| **When…** | Hostname equals `cdn.yourdomain.com` |
| **Cache eligibility** | **Eligible for cache** |
| **Edge TTL** | Override origin → **1 month** (2,592,000 seconds) |
| **Browser TTL** | Override origin → **1 year** (31,536,000 seconds) |
| **Serve stale content** | Enable *(serve stale while revalidating)* |
| **Respect strong ETags** | Enable |
| **Cache key** | *(leave default)* |

3. Click **Deploy**

> **Why long TTLs?** Use content-hashed filenames (e.g., `avatar-a1b2c3.webp`). When a user updates their avatar, the backend uploads with a new filename. The old cached version is never requested again. This is the standard CDN cache-busting strategy used by Next.js, webpack, and all modern build tools.

### 5.8 Step 6 — Disable Features That May Corrupt Responses

Some Cloudflare features can modify response content, which can corrupt binary files (images, PDFs) served from B2.

**Option A — Disable globally** (simple, recommended for CDN-only domains):

1. **Speed** → **Optimization** → **Content Optimization**:
   - Auto Minify (JS/CSS/HTML): **Off**
   - Rocket Loader: **Off**
   - Mirage: **Off** (Pro plan only)
   - Polish: **Off** (Pro plan only) *(or keep On if you want Cloudflare image optimization)*

2. **Scrape Shield**:
   - Email Address Obfuscation: **Off**
   - Server-side Excludes: **Off**

**Option B — Scope to CDN subdomain only** (use Configuration Rules):

1. Go to **Rules** → **Configuration Rules**
2. Create rule:
   - When: Hostname equals `cdn.yourdomain.com`
   - Auto Minify: **Off** (all)
   - Rocket Loader: **Off**
   - Email Obfuscation: **Off**
   - Server-side Excludes: **Off**
3. Deploy

---

## 6. CORS Configuration for B2

### 6.1 Why CORS Matters for Next.js

| Use Case | Why CORS Is Needed |
|----------|-------------------|
| **`next/image` component** | Fetches images from CDN domain — browser requires CORS headers if using `crossOrigin` attribute |
| **Presigned PUT uploads** | Browser uploads directly to B2 via presigned URLs — B2 must return appropriate CORS headers |
| **Font loading from CDN** | Browsers require CORS headers when loading fonts from a different origin via `@font-face` |
| **`fetch()` API calls** | If your frontend `fetch()`es files from the CDN, CORS must be configured |

### 6.2 Set CORS Rules on B2 Buckets

Go to **B2 Cloud Storage** → **Buckets** → select bucket → **CORS Rules** → **Update CORS Rules**

#### Public bucket (`nestlancer-public`):

```json
[
  {
    "corsRuleName": "cdnAndFrontendAccess",
    "allowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
      "https://cdn.yourdomain.com",
      "http://localhost:3000"
    ],
    "allowedOperations": [
      "s3_get",
      "s3_head"
    ],
    "allowedHeaders": [
      "Authorization",
      "Content-Type",
      "Content-Length",
      "Range"
    ],
    "exposeHeaders": [
      "Content-Length",
      "Content-Type",
      "ETag",
      "x-bz-content-sha1"
    ],
    "maxAgeSeconds": 86400
  }
]
```

#### Private bucket (`nestlancer-private`):

```json
[
  {
    "corsRuleName": "presignedUploadAndDownload",
    "allowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
      "http://localhost:3000"
    ],
    "allowedOperations": [
      "s3_get",
      "s3_head",
      "s3_put"
    ],
    "allowedHeaders": [
      "Authorization",
      "Content-Type",
      "Content-Length",
      "Content-MD5",
      "x-amz-content-sha256",
      "x-amz-date",
      "x-amz-security-token",
      "x-bz-content-sha1",
      "x-bz-info-*"
    ],
    "exposeHeaders": [
      "Content-Length",
      "Content-Type",
      "ETag",
      "x-bz-content-sha1",
      "x-amz-request-id"
    ],
    "maxAgeSeconds": 3600
  }
]
```

> **Remove `http://localhost:3000`** from production CORS rules. Keep it only in development.

### 6.3 Cloudflare CORS Response Headers

Since Cloudflare caches responses **including their headers**, you may need to ensure CORS headers are consistently present, even on cache HITs. Add them via a Cloudflare response header transform rule:

1. Go to **Rules** → **Transform Rules** → **Modify Response Header** tab
2. Click **+ Create rule**
3. Configure:

| Field | Value |
|-------|-------|
| Rule name | `CDN CORS headers` |
| When… | Hostname equals `cdn.yourdomain.com` |

4. Add the following header modifications:

| Operation | Header Name | Value |
|-----------|------------|-------|
| **Set** | `Access-Control-Allow-Origin` | `*` |
| **Set** | `Access-Control-Allow-Methods` | `GET, HEAD, OPTIONS` |
| **Set** | `Access-Control-Max-Age` | `86400` |
| **Set** | `Timing-Allow-Origin` | `*` |

5. Click **Deploy**

> **Note**: Using `*` for `Access-Control-Allow-Origin` is safe and appropriate for **truly public assets** (images, CSS, fonts, static files). The private bucket is never served through this CDN subdomain, so no sensitive data is exposed.

---

## 7. Next.js Frontend Configuration

### 7.1 `next.config.js` — Image Remote Patterns

Configure Next.js to allow loading and optimizing images from your CDN and B2:

```js
// next.config.js (or next.config.mjs / next.config.ts)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // CDN for public assets (avatars, thumbnails, etc.)
      {
        protocol: 'https',
        hostname: 'cdn.yourdomain.com',
        pathname: '/**',
      },
      // B2 S3 endpoint for presigned URLs (private files)
      {
        protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
        pathname: '/**',
      },
      // B2 Friendly URL (fallback / if any URLs reference this)
      {
        protocol: 'https',
        hostname: 'f003.backblazeb2.com',
        pathname: '/file/**',
      },
    ],
    // Responsive image breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Prefer modern formats
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
```

### 7.2 URL Helper Utility

```ts
// lib/storage-urls.ts

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || '';

/**
 * Build a public CDN URL for a file in the public bucket.
 * 
 * @param key File path within the public bucket (e.g., "avatars/user123.webp")
 * @returns Full CDN URL (e.g., "https://cdn.yourdomain.com/avatars/user123.webp")
 */
export function getCdnUrl(key: string): string {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  return `${CDN_URL}/${cleanKey}`;
}

/**
 * Convert a raw B2 URL to a CDN URL.
 * 
 * Use this when the backend returns raw B2 URLs (S3-style) and you want
 * to serve the file through Cloudflare CDN instead.
 * 
 * @example
 * Input:  "https://s3.eu-central-003.backblazeb2.com/nestlancer-public/avatars/u1.webp"
 * Output: "https://cdn.yourdomain.com/avatars/u1.webp"
 */
export function b2UrlToCdnUrl(b2Url: string, publicBucket = 'nestlancer-public'): string {
  if (!b2Url) return '';
  try {
    const url = new URL(b2Url);
    const pathParts = url.pathname.split('/');

    // S3-style: /nestlancer-public/path/file.jpg → remove bucket name
    if (pathParts[1] === publicBucket) {
      const key = pathParts.slice(2).join('/');
      return getCdnUrl(key);
    }

    // Friendly URL: /file/nestlancer-public/path/file.jpg → remove /file/<bucket>
    if (pathParts[1] === 'file' && pathParts[2] === publicBucket) {
      const key = pathParts.slice(3).join('/');
      return getCdnUrl(key);
    }

    // Not a public bucket URL — return as-is (probably a presigned URL)
    return b2Url;
  } catch {
    return b2Url;
  }
}

/**
 * Check if a URL is a presigned URL (should NOT be converted to CDN).
 */
export function isPresignedUrl(url: string): boolean {
  return url.includes('X-Amz-Signature') || url.includes('X-Amz-Credential');
}
```

### 7.3 Avatar Component Example

```tsx
// components/ui/Avatar.tsx
import Image from 'next/image';
import { getCdnUrl } from '@/lib/storage-urls';

interface AvatarProps {
  /** Path within the public bucket, e.g., "avatars/user123.webp" */
  path: string | null;
  alt: string;
  size?: number;
  className?: string;
}

const DEFAULT_AVATAR = '/images/default-avatar.svg'; // local fallback

export function Avatar({ path, alt, size = 64, className }: AvatarProps) {
  const src = path ? getCdnUrl(path) : DEFAULT_AVATAR;

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className ?? ''}`}
      // For avatars, "fill" isn't needed; fixed size is fine
      unoptimized={!path} // skip optimization for local fallback SVG
    />
  );
}
```

### 7.4 Presigned URL Download Hook

```tsx
// hooks/usePresignedDownload.ts
'use client';

import { useState, useCallback } from 'react';

interface PresignedDownloadOptions {
  /** File ID or key to request a download URL for */
  fileId: string;
  /** Optional filename for the download */
  filename?: string;
}

export function usePresignedDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async ({ fileId, filename }: PresignedDownloadOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Request presigned URL from your NestJS backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}/download-url`,
        { credentials: 'include' }
      );

      if (!res.ok) throw new Error('Failed to get download URL');

      const { url } = await res.json();

      // Trigger browser download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { download, loading, error };
}
```

### 7.5 Presigned URL Upload Utility

```ts
// lib/upload.ts

interface UploadOptions {
  /** Presigned PUT URL from the backend */
  presignedUrl: string;
  /** File to upload */
  file: File;
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Upload a file directly to B2 via a presigned PUT URL.
 * The presigned URL is generated by the NestJS backend.
 * CORS must be configured on the B2 bucket (see §6.2).
 */
export function uploadToPresignedUrl({
  presignedUrl,
  file,
  onProgress,
  signal,
}: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Upload aborted', 'AbortError'));
      });
    }

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    xhr.send(file);
  });
}
```

---

## 8. Security Hardening

### 8.1 The Transform Rule Already Restricts Bucket Access

The Transform Rule in §5.5 hardcodes `nestlancer-public` in the path rewrite expression:

```
concat("/file/nestlancer-public", http.request.uri.path)
```

This means **every** request to `cdn.yourdomain.com` is forced into the `nestlancer-public` bucket path. It is **impossible** for someone to access `nestlancer-private` or any other bucket through the CDN subdomain — B2 will only receive paths starting with `/file/nestlancer-public/`.

### 8.2 Remove B2 Internal Headers

B2 returns several internal headers that expose implementation details. Strip them:

1. Go to **Rules** → **Transform Rules** → **Modify Response Header** tab
2. Create rule (or add to the existing CORS rule from §6.3):

| Field | Value |
|-------|-------|
| Rule name | `Strip B2 headers & add security headers` |
| When… | Hostname equals `cdn.yourdomain.com` |

**Headers to remove:**

| Operation | Header Name |
|-----------|------------|
| Remove | `x-bz-file-id` |
| Remove | `x-bz-file-name` |
| Remove | `x-bz-content-sha1` |
| Remove | `x-bz-upload-timestamp` |
| Remove | `x-bz-info-src_last_modified_millis` |
| Remove | `x-bz-info-large_file_sha1` |

**Security headers to add:**

| Operation | Header Name | Value |
|-----------|------------|-------|
| Set | `X-Content-Type-Options` | `nosniff` |
| Set | `X-Frame-Options` | `DENY` |
| Set | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| Set | `Permissions-Policy` | `interest-cohort=()` |

3. Click **Deploy**

### 8.3 Hotlink Protection (Optional)

If you want to prevent other websites from embedding your images:

1. Go to **Scrape Shield** → **Hotlink Protection** → **On**
2. Or create a more granular WAF rule:

| Field | Value |
|-------|-------|
| When… | `Hostname equals cdn.yourdomain.com AND NOT http.referer contains "yourdomain.com" AND NOT http.referer eq ""` |
| Action | **Block** |

> **Note**: Leave empty `Referer` allowed — direct browser navigation and some apps don't send a Referer.

### 8.4 Rate Limiting (Recommended)

1. Go to **Security** → **WAF** → **Rate limiting rules**
2. Create rule:

| Field | Value |
|-------|-------|
| Rule name | `CDN abuse protection` |
| When… | Hostname equals `cdn.yourdomain.com` |
| Requests per period | 1000 per 10 seconds per IP |
| Action | Block for 60 seconds |

---

## 9. Verification & Testing

### 9.1 Test Direct B2 Access

```bash
# ✅ Public bucket — should return 200
curl -sI "https://f003.backblazeb2.com/file/nestlancer-public/.healthcheck"
# Expected: HTTP/1.1 200 OK

# ❌ Private bucket — should return 401
curl -sI "https://f003.backblazeb2.com/file/nestlancer-private/test.txt"
# Expected: HTTP/1.1 401 Unauthorized
```

### 9.2 Test CDN Delivery

```bash
# Test that the CDN serves the health check file
curl -sI "https://cdn.yourdomain.com/.healthcheck"

# Expected response headers:
# HTTP/2 200
# content-type: text/plain  (or application/octet-stream)
# cache-control: public, max-age=31536000, immutable
# cf-cache-status: MISS  (first request)
# cf-ray: <ray-id>
```

### 9.3 Test Caching

```bash
# First request — MISS (fetched from B2)
curl -sI "https://cdn.yourdomain.com/.healthcheck" | grep -i "cf-cache-status"
# cf-cache-status: MISS

# Second request — HIT (served from Cloudflare edge)
curl -sI "https://cdn.yourdomain.com/.healthcheck" | grep -i "cf-cache-status"
# cf-cache-status: HIT
```

### 9.4 Test CORS Headers

```bash
# CORS preflight request
curl -sI -X OPTIONS \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: GET" \
  "https://cdn.yourdomain.com/.healthcheck"

# Expected:
# access-control-allow-origin: *
# access-control-allow-methods: GET, HEAD, OPTIONS
```

### 9.5 Test That Private Bucket Is Inaccessible via CDN

```bash
# Try to path-traverse to the private bucket via CDN
curl -sI "https://cdn.yourdomain.com/../../file/nestlancer-private/secret.pdf"
# Expected: 404 or 400 — the Transform Rule forces all paths into the public bucket

# The actual request B2 receives would be:
# /file/nestlancer-public/../../file/nestlancer-private/secret.pdf
# B2 normalizes paths and this resolves within nestlancer-public, not the private bucket
```

### 9.6 Test Next.js Image Loading

Create a test page in your Next.js app:

```tsx
// app/test-cdn/page.tsx (App Router)
import Image from 'next/image';

export default function TestCDNPage() {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CDN Test Page</h1>
      
      {/* Test next/image with CDN */}
      <Image
        src={`${cdnUrl}/.healthcheck`}
        alt="Health check"
        width={100}
        height={100}
        unoptimized // text file, skip image optimization
      />
      
      {/* Test with an actual image */}
      <Image
        src={`${cdnUrl}/avatars/test-avatar.webp`}
        alt="Test avatar"
        width={128}
        height={128}
      />
      
      <p className="mt-4">
        Check browser DevTools → Network tab:
        <br />• Verify images load from <code>{cdnUrl}</code>
        <br />• Verify <code>CF-Cache-Status: HIT</code> on reload
      </p>
    </div>
  );
}
```

### 9.7 Verify Bandwidth Alliance (Free Egress)

After sending some CDN traffic:

1. Log in to **Backblaze** → **B2 Cloud Storage**
2. Go to **Caps & Alerts** → check daily download bandwidth usage
3. Egress to Cloudflare should show as **$0.00** (Bandwidth Alliance)
4. Your `$0.01` alert should **NOT** trigger, confirming free egress

---

## 10. Quick Checklist

### ✅ Backblaze B2

- [ ] B2 enabled on the EU Central account
- [ ] `nestlancer-public` bucket created — type: **Public**
- [ ] `nestlancer-private` bucket created — type: **Private**
- [ ] Public bucket info has `Cache-Control: public, max-age=31536000, immutable`
- [ ] CORS rules configured on **both** buckets (§6.2)
- [ ] Application key created — `keyID` and `applicationKey` saved securely
- [ ] S3 endpoint noted: `https://s3.eu-central-003.backblazeb2.com`
- [ ] Friendly URL host noted: `f<NNN>.backblazeb2.com` (from bucket details)
- [ ] `.healthcheck` file uploaded to public bucket
- [ ] Cloud Replication configured to US East (see B2 Storage Estimate doc §8)
- [ ] Caps & Alerts configured (see B2 Storage Estimate doc §7)

### ✅ Cloudflare

- [ ] Domain DNS managed by Cloudflare
- [ ] CNAME record: `cdn` → `f<NNN>.backblazeb2.com` — **Proxied** ☁️
- [ ] SSL/TLS mode: **Full (strict)**
- [ ] **Transform Rule** (URL Rewrite): `concat("/file/nestlancer-public", http.request.uri.path)`
- [ ] **Origin Rule** (Host Header): Override to `f<NNN>.backblazeb2.com`
- [ ] **Cache Rule**: Cache everything on `cdn.yourdomain.com` — Edge TTL 1 month
- [ ] **Response Header Rule**: CORS headers (`Access-Control-Allow-Origin: *`) + remove B2 internal headers + add security headers
- [ ] Auto Minify / Rocket Loader / Mirage: **Disabled** for CDN subdomain
- [ ] Verified: `curl -sI https://cdn.yourdomain.com/.healthcheck` → HTTP 200
- [ ] Verified: Second request shows `CF-Cache-Status: HIT`

### ✅ NestJS Backend

- [ ] `STORAGE_PROVIDER=b2`
- [ ] `B2_KEY_ID`, `B2_APPLICATION_KEY` set
- [ ] `B2_ENDPOINT=https://s3.eu-central-003.backblazeb2.com`
- [ ] `B2_REGION=eu-central-003`
- [ ] All `STORAGE_BUCKET_*` env vars match actual B2 bucket names
- [ ] `CDN_URL=https://cdn.yourdomain.com` set
- [ ] Health check returns healthy storage status
- [ ] Public uploads return CDN URLs
- [ ] Private uploads return presigned URLs

### ✅ Next.js Frontend

- [ ] `NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com` set
- [ ] `NEXT_PUBLIC_API_URL=https://api.yourdomain.com` set
- [ ] `next.config.js` → `images.remotePatterns` includes `cdn.yourdomain.com`
- [ ] `next.config.js` → `images.remotePatterns` includes `s3.eu-central-003.backblazeb2.com` (for presigned URLs)
- [ ] `lib/storage-urls.ts` helper utilities created
- [ ] Image components use `getCdnUrl()` for public assets
- [ ] Presigned URL download flow works
- [ ] Presigned URL upload flow works (CORS verified)
- [ ] `next/image` loads and optimizes CDN images correctly

---

## Appendix A: Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| **`404 Not Found`** from CDN | Transform Rule not deployed or expression incorrect | Verify rule exists in Rules → Transform Rules. Check expression: `concat("/file/nestlancer-public", http.request.uri.path)` |
| **`403 Forbidden`** from CDN | Bucket is set to Private in B2 | Verify `nestlancer-public` bucket type is **Public** |
| **`421 Misdirected Request`** | Host header not overridden | Create Origin Rule with Host Header Override → `f<NNN>.backblazeb2.com` |
| **`521 Web server is down`** | Cloudflare can't reach B2 origin | Check CNAME target is correct. Verify B2 is online. Try DNS-only (grey cloud) temporarily to debug. |
| **`CF-Cache-Status: BYPASS`** | File type or response not cacheable by default | Create Cache Rule to "Eligible for cache" for `cdn.yourdomain.com` |
| **`CF-Cache-Status: DYNAMIC`** | No Cache Rule configured | Add Cache Rule for `cdn.yourdomain.com` → Eligible for cache |
| **CORS error in browser** | Missing CORS headers on response | 1. Add CORS rules to B2 bucket (§6.2). 2. Add CORS response headers in Cloudflare (§6.3). |
| **`next/image` "Invalid src" error** | CDN domain not in `remotePatterns` | Add CDN hostname to `next.config.js` `images.remotePatterns` (§7.1) |
| **Presigned upload fails with CORS error** | Private bucket missing `s3_put` in CORS rules | Add `s3_put` to `allowedOperations` in private bucket CORS rules (§6.2) |
| **Stale/old content served** | Long cache TTL with same filename | Use content-hashed filenames. To force purge: Cloudflare Dashboard → Caching → Purge Cache → Custom Purge → enter the specific URL |
| **B2 `cap_exceeded` error** | Daily spending cap hit | See B2 Storage Estimate doc §7.15 for action plan |
| **Images load slowly on first view** | Cache MISS — Cloudflare fetching from B2 for first time | Expected on first request. Subsequent requests will be cache HITs. Optionally use Cloudflare Argo Tiered Caching (paid) to reduce MISSes. |

---

## Appendix B: Cost Summary (Backblaze B2 + Cloudflare)

| Item | Cost (100 Users) | Notes |
|------|-----------------|-------|
| B2 Storage (first 10 GB) | **$0** | Free tier covers ~1 GB |
| B2 Egress → Cloudflare | **$0** | Bandwidth Alliance = **free unlimited egress** |
| B2 Egress → Direct (presigned URLs) | **$0** | Within free tier (3× storage) |
| B2 Class A API (uploads) | **$0** | Always free |
| B2 Class B API (downloads) | **$0** | ~1,615/day, under 2,500/day free tier |
| B2 Class C API (list/metadata) | **$0** | ~100/day, under 2,500/day free tier |
| Cloudflare CDN (Free plan) | **$0** | Unlimited bandwidth on free plan |
| Cloudflare SSL certificates | **$0** | Universal SSL included |
| Cloudflare WAF (basic) | **$0** | Rate limiting + basic rules on free plan |
| Cloud Replication (storage) | **$0** | Replica ~1 GB, under 10 GB free on destination account |
| Cloud Replication (egress) | **$0** | No egress fees for replication |
| **TOTAL** | **$0/month** | |

> 💡 At 100 users with ~1 GB storage, your **entire storage + CDN + SSL + DDoS protection** infrastructure costs **$0/month**. The Bandwidth Alliance partnership makes Backblaze B2 + Cloudflare one of the most cost-effective storage + CDN stacks available.

---

## Appendix C: URL Pattern Reference

| Asset Type | URL Pattern | Served Via |
|-----------|------------|------------|
| Public avatar | `https://cdn.yourdomain.com/avatars/user123.webp` | Cloudflare CDN (cached) |
| Public thumbnail | `https://cdn.yourdomain.com/thumbnails/img-abc.webp` | Cloudflare CDN (cached) |
| Public static asset | `https://cdn.yourdomain.com/assets/logo.svg` | Cloudflare CDN (cached) |
| Health check | `https://cdn.yourdomain.com/.healthcheck` | Cloudflare CDN (cached) |
| Private deliverable | `https://s3.eu-central-003.backblazeb2.com/nestlancer-private/deliverables/file.zip?X-Amz-Algorithm=...&X-Amz-Signature=...` | Presigned URL (time-limited, direct to B2) |
| Private invoice PDF | `https://s3.eu-central-003.backblazeb2.com/nestlancer-private/pdfs/invoice-123.pdf?X-Amz-Algorithm=...&X-Amz-Signature=...` | Presigned URL (time-limited, direct to B2) |
| Private attachment | `https://s3.eu-central-003.backblazeb2.com/nestlancer-private/attachments/doc.pdf?X-Amz-Algorithm=...&X-Amz-Signature=...` | Presigned URL (time-limited, direct to B2) |

---

## Appendix D: Official Documentation Links

| Topic | URL |
|-------|-----|
| **B2 + Cloudflare CDN Setup** | https://www.backblaze.com/docs/cloud-storage-deliver-public-backblaze-b2-content-through-cloudflare-cdn |
| **Cloudflare Bandwidth Alliance** | https://www.cloudflare.com/bandwidth-alliance/backblaze/ |
| **B2 CORS Rules** | https://www.backblaze.com/docs/cloud-storage-cross-origin-resource-sharing-rules |
| **B2 S3-Compatible API** | https://www.backblaze.com/docs/cloud-storage-s3-compatible-api |
| **B2 Bucket Info (Headers)** | https://www.backblaze.com/docs/cloud-storage-buckets#bucket-info |
| **Cloudflare Transform Rules** | https://developers.cloudflare.com/rules/transform/ |
| **Cloudflare Origin Rules** | https://developers.cloudflare.com/rules/origin-rules/ |
| **Cloudflare Cache Rules** | https://developers.cloudflare.com/cache/how-to/cache-rules/ |
| **Next.js Image Optimization** | https://nextjs.org/docs/app/building-your-application/optimizing/images |
| **Next.js remotePatterns** | https://nextjs.org/docs/app/api-reference/components/image#remotepatterns |
| **B2 Cloud Storage Pricing** | https://www.backblaze.com/cloud-storage/pricing |
| **B2 Transaction Pricing** | https://www.backblaze.com/cloud-storage/transaction-pricing |

---

*Last updated: 2025-01*  
*Companion document: `B2_STORAGE_ESTIMATE_100_USERS.pdf` (caps, alerts, replication, cost estimates)*