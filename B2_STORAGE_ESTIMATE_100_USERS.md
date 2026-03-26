# Backblaze B2 Storage & Cost Estimate (100 Users)

This document lists all storage buckets used by the Nestlancer backend, estimates storage and API usage for **100 users** (early-stage launch), and summarizes **Backblaze B2 pay-as-you-go** monthly cost.

---

## 1. All Buckets in This Project

From `storage.schema.ts`, `config.service.ts`, and `STORAGE_SETUP_CDN.md`:

| # | Bucket name (default) | Env var | Purpose |
|---|------------------------|---------|---------|
| 1 | `nestlancer-private` | `STORAGE_BUCKET_PRIVATE` | User media uploads, deliverables (signed URLs) |
| 2 | `nestlancer-public` | `STORAGE_BUCKET_PUBLIC` | Public assets, CDN origin, health check |
| 3 | `nestlancer-avatars` | `STORAGE_BUCKET_AVATARS` | User profile avatars (AvatarService) |
| 4 | `nestlancer-requests` | `STORAGE_BUCKET_ATTACHMENTS` | Request attachments (max 10 MB/file, 10/file per request) |
| 5 | `nestlancer-quotes-pdfs` | `STORAGE_BUCKET_QUOTES` | Generated quote PDFs |
| 6 | `nestlancer-deliverables` | `STORAGE_BUCKET_DELIVERABLES` | Config; actual files in `nestlancer-private` |
| 7 | `nestlancer-reports` | `STORAGE_BUCKET_REPORTS` | Admin/analytics reports |
| 8 | `nestlancer-pdfs` | `STORAGE_BUCKET_PDFS` | Receipts & invoices (bucket `'pdfs'` in code) |

You can map several logical buckets to **one physical B2 bucket** via env vars (e.g. one private + one public) to simplify setup.

---

## 2. Storage Space Estimate (100 Users)

Assumptions: 100 users, early-stage usage (light activity).

| Bucket / use | Assumption | Estimated storage |
|--------------|------------|-------------------|
| **Avatars** | 100 users × 1 avatar, ~0.5 MB avg (max 5 MB in code) | **50 MB** |
| **Request attachments** | 30 users × 3 attachments × 1.5 MB avg (max 10 MB, 10/request) | **135 MB** |
| **Private / media** | 40 users × 2 uploads × 2 MB avg | **160 MB** |
| **Quotes PDFs** | 25 quotes/month × 200 KB | **5 MB** |
| **Deliverables** (in private) | 15 deliverables/month × 2 MB | **30 MB** |
| **Reports** | 5 reports/month × 1 MB | **5 MB** |
| **PDFs (receipts/invoices)** | 40 PDFs/month × 100 KB | **4 MB** |
| **Public** (thumbnails/derivatives) | Small set | **20 MB** |
| **Buffer** | Growth, temp, duplicates | **91 MB** |
| **Total** | | **~500 MB** |

Rounded for planning: **~1 GB** (well under B2’s free 10 GB).

---

## 3. Backblaze B2 Pay-As-You-Go Pricing (reference)

- **Storage**: **$6 / TB / month** (first **10 GB free**).
- **Upload**: **Free** (no upload fees; Class A API free).
- **Egress**: **Free** up to **3×** your average monthly storage; above that **$0.01/GB**.
- **Class A (uploads, deletes)**: **Free**.
- **Class B (downloads, GetObject, HeadObject)**: First **2,500/day** free, then **$0.004 per 10,000** calls.
- **Class C (list, metadata)**: First **2,500/day** free, then **$0.004 per 1,000** calls.

Sources: [B2 Cloud Storage Pricing](https://www.backblaze.com/b2/cloud-storage-pricing.html), [B2 API Transaction Pricing](https://www.backblaze.com/b2/b2-transactions-price.html).

---

## 4. Upload / Read / Download Frequency (100 Users)

Rough **monthly** counts, assuming light early-stage usage.

### Uploads (Class A – free)

| Action | Est. per month |
|--------|-----------------|
| Avatar upload/update | 100 initial + 15 changes ≈ **115** |
| Request attachments | **90** |
| Media (private bucket) | **80** |
| Quote PDFs | **25** |
| Deliverables | **15** |
| Receipt/invoice PDFs | **40** |
| Reports | **5** |
| **Total uploads** | **~370/month** (~12/day) |

All within free Class A.

### Reads / downloads (Class B)

- **GetObject** (actual file download via signed or public URL) and **HeadObject** (e.g. `exists()` checks) count as Class B.

| Action | Est. per month |
|--------|-----------------|
| Avatar image views | 100 users × 50 views ≈ **5,000** |
| Request attachment downloads | **150** |
| Deliverable downloads (signed) | **80** |
| Quote PDF views | **50** |
| Receipt/invoice downloads | **60** |
| Report downloads | **15** |
| Storage health check `exists('nestlancer-public', '.healthcheck')` | e.g. 1/min → **~43,200** |
| **Total Class B** | **~48,500/month** ≈ **1,615/day** |

First 2,500 Class B calls/day are free → **1,615 &lt; 2,500** → **$0** for API calls.

### List / metadata (Class C)

- ListObjects, HeadBucket, etc.: assume **~3,000/month** (~100/day). Under 2,500/day free → **$0**.

---

## 5. Monthly Cost Summary (100 Users, B2 Pay-As-You-Go)

| Item | Amount | B2 cost |
|------|--------|--------|
| **Storage** | ~1 GB | First 10 GB free → **$0** |
| **Upload** | ~370/month | Class A free → **$0** |
| **Download / read (Class B)** | ~48.5k/month (~1.6k/day) | Under 2,500/day free → **$0** |
| **List / metadata (Class C)** | ~3k/month | Under 2,500/day free → **$0** |
| **Egress** | Assume &lt; 3 GB | Within 3× storage free tier → **$0** |

**Estimated total: ~\$0/month** for 100 users at this usage level.

If usage grows (e.g. 5 GB stored, 20 GB egress):

- Storage: (5 − 10) GB → still $0 (first 10 GB free). Above 10 GB: **$6/TB**.
- Egress: 20 GB − 3×5 GB = 5 GB over → 5 × $0.01 = **$0.05**.

So even with moderate growth, the first few months stay at or near **$0**; cost grows only when you exceed free tiers (10 GB storage, 3× storage egress, 2,500 Class B/C per day).

---

## 6. Summary Table

| Metric | Estimate (100 users) |
|--------|----------------------|
| **Buckets** | 8 logical (can collapse to 2 physical: 1 private, 1 public) |
| **Storage** | ~1 GB (first 10 GB free on B2) |
| **Uploads/month** | ~370 (free) |
| **Downloads + HeadObject/month** | ~48,500 (~1,615/day; under 2,500/day free) |
| **List/metadata/month** | ~3,000 (under free tier) |
| **Estimated B2 bill** | **~\$0/month** at this scale |

You can paste this into `STORAGE_SETUP_CDN.md` or keep it as a separate planning doc; adjust the user count and assumptions as you grow.
