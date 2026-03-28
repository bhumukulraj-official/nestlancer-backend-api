# Backblaze B2 Storage & Cost Estimate (100 Users)

This document lists all storage buckets used by the Nestlancer backend, estimates storage and API usage for **100 users** (early-stage launch), and summarizes **Backblaze B2 pay-as-you-go** monthly cost including Caps & Alerts configuration, Cloud Replication, and Disaster Recovery.

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

Rounded for planning: **~1 GB** (well under B2's free 10 GB).

---

## 3. Backblaze B2 Pay-As-You-Go Pricing (Per TB Breakdown)

### 3.1 Official Pricing Table

| Category | Price | Per GB Equivalent | Free Tier |
|----------|-------|-------------------|-----------|
| **Storage** | **$6 / TB / month** | $0.006 / GB / month | First **10 GB free** |
| **Egress (Download bandwidth)** | **$0.01 / GB** (above free) | $10.00 / TB | Free up to **3× avg monthly storage** |
| **Class A (uploads, deletes)** | **Free** | $0.00 | Always free |
| **Class B (downloads, GetObject, HeadObject)** | **$0.004 / 10,000 calls** | $0.0000004 / call | First **2,500/day free** |
| **Class C (list, metadata)** | **$0.004 / 1,000 calls** | $0.000004 / call | First **2,500/day free** |

### 3.2 Per-TB Math for Budget Planning

```
STORAGE:
  $6.00 / TB / month
  = $0.006 / GB / month
  = $0.0002 / GB / day
  
  1 GB stored for 1 day  = $0.0002
  10 GB stored for 1 day = $0.002
  50 GB stored for 1 day = $0.01
  
EGRESS (above free tier):
  $0.01 / GB
  = $10.00 / TB
  
  1 GB downloaded  = $0.01
  10 GB downloaded = $0.10
  50 GB downloaded = $0.50
  
CLASS B TRANSACTIONS (above 2,500/day free):
  $0.004 / 10,000 calls = $0.0000004 / call
  
  10,000 extra calls/day  = $0.004
  100,000 extra calls/day = $0.04
  1,000,000 extra calls   = $0.40
  
CLASS C TRANSACTIONS (above 2,500/day free):
  $0.004 / 1,000 calls = $0.000004 / call
  
  1,000 extra calls/day  = $0.004
  10,000 extra calls/day = $0.04
  100,000 extra calls    = $0.40
```

Sources: [B2 Cloud Storage Pricing](https://www.backblaze.com/cloud-storage/pricing), [B2 API Transaction Pricing](https://www.backblaze.com/cloud-storage/transaction-pricing).

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

First 2,500 Class B calls/day are free → **1,615 < 2,500** → **$0** for API calls.

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
| **Egress** | Assume < 3 GB | Within 3× storage free tier → **$0** |
| **Cloud Replication (egress)** | ~1 GB replicated | No egress fees for replication → **$0** |
| **Replica Storage (US East)** | ~1 GB | First 10 GB free per account → **$0** |

**Estimated total: ~$0/month** for 100 users at this usage level (including replication).

If usage grows (e.g. 5 GB stored, 20 GB egress):

- Storage: (5 − 10) GB → still $0 (first 10 GB free). Above 10 GB: **$6/TB**.
- Egress: 20 GB − 3×5 GB = 5 GB over → 5 × $0.01 = **$0.05**.
- Replica storage: 5 GB on destination account → still $0 (first 10 GB free per account).

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
| **Replication** | EU Central → US East (auto, no egress fees) |
| **Replica storage** | ~1 GB on destination (first 10 GB free per account) |
| **Estimated B2 bill** | **~$0/month** at this scale (both accounts combined) |

---

## 7. Caps & Alerts Configuration (CRITICAL for Production & Budget)

### 7.1 What Are Caps & Alerts?

Backblaze B2 **Caps & Alerts** let you limit and monitor daily spending across four categories: Storage, Download Bandwidth, Class B Transactions, and Class C Transactions.

- A **Cap** is a hard daily spending limit. When reached, B2 returns `403 cap_exceeded` and **blocks all API calls** in that category until the daily reset at **12:00 AM GMT**.
- An **Alert** is a notification (email/text) sent when your spending reaches a threshold. **Alerts do NOT stop your service.**

> ⚠️ **VERIFIED FACT**: Alerts are triggered when the data caps reach **75% and 100%** of the cap value that you set. This means **Alerts are NOT independent of Caps** — they fire based on the cap value. You MUST set a cap to get alerts.

### 7.2 How Caps & Alerts Work Together

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ALERTS ARE TIED TO CAPS — NOT INDEPENDENT                           │
│                                                                      │
│  When you set a Cap of $X:                                           │
│                                                                      │
│    $0       Custom Alert     75% of $X       100% of $X              │
│    │             │               │               │                   │
│    ├─────────────┼───────────────┼───────────────┤                   │
│    │             │               │               │                   │
│    │        email/text      email/text      email/text               │
│    │        Service ✅      Service ✅      + SERVICE STOPS ❌       │
│    │                                        403 cap_exceeded         │
│    │                                        until 12AM GMT           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.3 What Happens When a Cap Is Hit (DANGER)

When a cap is exceeded, B2 returns a **`403 cap_exceeded`** error. The service **completely stops** for that category:

| Error Code | What Gets Blocked | Impact on Nestlancer |
|---|---|---|
| `403 storage_cap_exceeded` | ALL uploads blocked | Users cannot upload avatars, attachments, deliverables |
| `403 download_cap_exceeded` | ALL downloads blocked | Users cannot view/download any files |
| `403 cap_exceeded` (Class B) | ALL read/HEAD operations blocked | Health checks fail, `exists()` calls fail, signed URL downloads fail |
| `403 cap_exceeded` (Class C) | ALL list/metadata operations blocked | Bucket listing fails, admin operations fail |

**Recovery**: Each category resets at **12:00 AM GMT** each day. Until then, your service remains blocked.

### 7.4 The Four Categories & Free Tiers

| # | Category | Free Tier (Daily) | Your Est. Daily Usage (100 Users) | Exceeds Free? |
|---|----------|-------------------|-----------------------------------|---------------|
| 1 | **Daily Storage** | First 10 GB free | ~1 GB total | ✅ No → $0 |
| 2 | **Daily Download Bandwidth** | 1 GB free/day | ~few MB/day | ✅ No → $0 |
| 3 | **Daily Class B Transactions** | 2,500 free/day | ~1,615/day | ✅ No → $0 |
| 4 | **Daily Class C Transactions** | 2,500 free/day | ~100/day | ✅ No → $0 |
| 5 | **Class A Transactions** | Always free | ~12/day | ✅ Always $0 |

### 7.5 The Two Input Boxes on the Caps & Alerts Page

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  FOR EACH CATEGORY (Storage, Download, Class B, Class C):       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  SECTION 1: CAP (via "Edit Caps" button)                │     │
│  │                                                         │     │
│  │  ☐ No Cap   ← UNCHECK this to enable cap               │     │
│  │                                                         │     │
│  │  $ [________]  ← BOX 1: Cap amount (hard limit/day)    │     │
│  │                   SERVICE STOPS when this is reached    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  SECTION 2: ALERT (via "Edit" link next to each alert)  │     │
│  │                                                         │     │
│  │  $ [________]  ← BOX 2: Alert amount (notification)    │     │
│  │                   Just sends email/text at this amount  │     │
│  │                                                         │     │
│  │  ☐ Email   ☐ Text  ← Notification method checkboxes    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 7.6 ✅ Budget-Friendly Cap & Alert Values (Based on Per-TB Pricing)

**Strategy**: Set caps based on **actual per-TB pricing math** that allow enough headroom for your 100-user project to never get blocked, while keeping your **maximum daily budget under control**.

#### Per-TB Price → Cap Calculation

```
YOUR BUDGET CONSTRAINT:
  You want the LOWEST safe cap to protect your budget.
  Your actual daily usage = $0.00 (all within free tiers).
  Caps should be HIGH ENOUGH to never block normal/moderate growth,
  but LOW ENOUGH to protect your wallet from abuse/attacks.

TARGET: Max $1.00/day per category = $30/month worst case per category

WHAT $1.00/DAY BUYS IN EACH CATEGORY:
──────────────────────────────────────

STORAGE ($6/TB/month = $0.006/GB/month = $0.0002/GB/day):
  $1.00/day ÷ $0.0002/GB/day = ~5,000 GB = ~5 TB stored/day
  Your usage: ~1 GB → you are 5,000× below this cap

DOWNLOAD BANDWIDTH ($0.01/GB above free tier):
  $1.00/day ÷ $0.01/GB = 100 GB downloads/day (above free)
  Your usage: ~few MB/day → you are 10,000× below this cap

CLASS B ($0.004/10,000 calls above 2,500/day free):
  $1.00/day ÷ $0.004 × 10,000 = 25,000,000 calls/day
  Your usage: ~1,615/day → you are 15,000× below this cap

CLASS C ($0.004/1,000 calls above 2,500/day free):
  $1.00/day ÷ $0.004 × 1,000 = 1,000,000 calls/day
  Your usage: ~100/day → you are 10,000× below this cap
```

#### ✅ Recommended Settings (BOTH Accounts)

##### Account 1 — Primary (EU Central, `bhumukulraj.official@gmail.com`)

| Category | ☐ No Cap | BOX 1: Cap (Hard Limit) | BOX 2: Alert (Notification) | Email | Text |
|----------|----------|------------------------|----------------------------|-------|------|
| **Daily Storage** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Download Bandwidth** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Class B Transactions** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Class C Transactions** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |

##### Account 2 — Replica (US East, `bhumukulraj.official+backup@gmail.com`)

| Category | ☐ No Cap | BOX 1: Cap (Hard Limit) | BOX 2: Alert (Notification) | Email | Text |
|----------|----------|------------------------|----------------------------|-------|------|
| **Daily Storage** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Download Bandwidth** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Class B Transactions** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |
| **Daily Class C Transactions** | UNCHECKED | **$ `1.00`** | **$ `0.01`** | ☑ | ☑ |

### 7.7 Why $1.00 Cap + $0.01 Alert (Per-TB Math Proof)

#### BOX 1: Cap = $1.00/day — What This Protects

| Category | $1.00/day Buys | Your Actual Daily Usage | Buffer | Max Monthly Bill |
|----------|----------------|------------------------|--------|-----------------|
| **Storage** | ~5 TB stored | ~1 GB | **5,000× buffer** | **$30/month max** |
| **Download** | ~100 GB downloads/day | ~few MB | **10,000× buffer** | **$30/month max** |
| **Class B** | ~25 Million calls/day | ~1,615/day | **15,000× buffer** | **$30/month max** |
| **Class C** | ~1 Million calls/day | ~100/day | **10,000× buffer** | **$30/month max** |

> **Absolute worst case (all 4 categories maxed every day)**: 4 × $1.00 × 30 days = **$120/month**
>
> **Reality at 100 users**: **$0/month** (all within free tiers)

#### BOX 2: Alert = $0.01/day — Early Warning

| Category | $0.01 Alert Fires When... | Your Normal Usage | Triggers in Normal Use? |
|----------|---------------------------|-------------------|------------------------|
| **Storage** | Storage exceeds ~60 GB (above 10 GB free) | ~1 GB | ❌ Never |
| **Download** | Downloads exceed ~2 GB/day (above 1 GB free) | ~few MB | ❌ Never |
| **Class B** | >27,500 calls/day (above 2,500 free) | ~1,615/day | ❌ Never |
| **Class C** | >5,000 calls/day (above 2,500 free) | ~100/day | ❌ Never |

> $0.01 alert = **the smallest meaningful amount** = fires the moment ANY paid charges begin. This is your earliest possible warning.

### 7.8 Timeline of Protection (3 Alert Layers)

```
YOUR NORMAL USAGE ($0.00/day — all within free tiers)
│
│  ← Everything fine. $0 bill. All free tiers.
│
▼ $0.01/day — CUSTOM ALERT fires 🔔 (email + text)
│              "Some paid usage has started!"
│              You: Check dashboard, probably minor.
│              Service: ✅ KEEPS RUNNING
│
▼ $0.75/day — 75% AUTO-ALERT fires ⚠️ (email + text)
│              "You're at 75% of your $1.00 daily cap!"
│              You: Something is wrong. Investigate NOW.
│              Service: ✅ STILL RUNNING
│
▼ $1.00/day — 100% CAP HIT ❌ SERVICE STOPS
│              403 cap_exceeded errors
│              You: Login immediately. Fix root cause.
│              Service: ❌ BLOCKED until 12:00 AM GMT
│
│  BUDGET PROTECTED: Maximum $1.00/day = $30/month per category
│  AT 100 USERS: You will NEVER reach even $0.01/day
```

### 7.9 Budget Impact Comparison ($1.00 vs $10.00 Cap)

| Cap Value | Max Per Day (1 category) | Max Per Month (1 category) | Max Per Month (all 4) | Your Actual Bill |
|-----------|--------------------------|----------------------------|-----------------------|-----------------|
| **$1.00/day** ✅ | $1.00 | $30.00 | **$120.00** | **$0.00** |
| $5.00/day | $5.00 | $150.00 | $600.00 | $0.00 |
| $10.00/day | $10.00 | $300.00 | $1,200.00 | $0.00 |

> **$1.00/day cap is the sweet spot**: Low enough to protect your budget ($120/month worst-case total across all categories for both accounts), but high enough that your 100-user project will **never** be blocked. Even at 500+ users, you'd barely hit $0.01/day.

### 7.10 How to Configure — Step-by-Step

#### Setting Caps:

1. Login to your Backblaze account.
2. In the left navigation menu under **B2 Cloud Storage**, click **Caps & Alerts**.
3. Click **Edit Caps**.
4. **UNCHECK** the "No Cap" checkbox for all 4 categories.
5. Enter **`1.00`** in the dollar amount field for each category.
6. Click **Update Caps**.
7. Changes may take up to **10 minutes**.

#### Setting Alerts:

1. On the same **Caps & Alerts** page.
2. For each category, click **(Edit)** next to the alert.
3. Enter **`0.01`** in the dollar amount field.
4. Check **☑ Email** and **☑ Text** notification methods.
5. Click **Update Alert**.
6. Repeat for all 4 categories.

### 7.11 Step-by-Step Checklist

```
═══════════════════════════════════════════════════════════════
ACCOUNT 1 — PRIMARY (EU Central)
Email: bhumukulraj.official@gmail.com
═══════════════════════════════════════════════════════════════

1. SET CAPS:
   ☐ Login → B2 Cloud Storage → Caps & Alerts
   ☐ Click "Edit Caps"
   ☐ UNCHECK "No Cap" for ALL 4 categories
   ☐ Enter these values:
      Daily Storage Cap:             $ 1.00
      Daily Download Bandwidth Cap:  $ 1.00
      Daily Class B Transaction Cap: $ 1.00
      Daily Class C Transaction Cap: $ 1.00
   ☐ Click "Update Caps"
   ☐ Wait 10 minutes

2. SET ALERTS:
   ☐ Click (Edit) next to Daily Storage Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Download Bandwidth Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Class B Transaction Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Class C Transaction Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

═══════════════════════════════════════════════════════════════
ACCOUNT 2 — REPLICA (US East)
Email: bhumukulraj.official+backup@gmail.com
═══════════════════════════════════════════════════════════════

3. SET CAPS (SAME VALUES):
   ☐ Login → B2 Cloud Storage → Caps & Alerts
   ☐ Click "Edit Caps"
   ☐ UNCHECK "No Cap" for ALL 4 categories
   ☐ Enter these values:
      Daily Storage Cap:             $ 1.00
      Daily Download Bandwidth Cap:  $ 1.00
      Daily Class B Transaction Cap: $ 1.00
      Daily Class C Transaction Cap: $ 1.00
   ☐ Click "Update Caps"
   ☐ Wait 10 minutes

4. SET ALERTS (SAME VALUES):
   ☐ Click (Edit) next to Daily Storage Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Download Bandwidth Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Class B Transaction Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

   ☐ Click (Edit) next to Daily Class C Transaction Alert
      Alert amount:  $ 0.01
      ☑ Email   ☑ Text
      Click "Update Alert"

═══════════════════════════════════════════════════════════════
5. VERIFY REPLICATION STILL WORKS:
   ☐ Wait full 10 minutes after cap changes
   ☐ Login to Account 1 (EU Central)
   ☐ B2 Cloud Storage → Cloud Replication
   ☐ Verify replication rules are active ✅
   ☐ If NOT → re-authenticate Account 2 and recreate rules
═══════════════════════════════════════════════════════════════
```

### 7.12 Replication Safety with $1.00 Cap

> ⚠️ If a data cap is set too low on the destination account, authenticating to that account will not return any buckets.

At **$1.00/day storage cap**, let's verify replication is safe:

```
$1.00/day storage cap
= ~5 TB of storage can be held per day before cap triggers
= Your replica storage is ~1 GB
= You are 5,000× below the cap

Replication of ~1 GB costs:
  Storage: ~$0.0002/day
  Egress:  $0.00 (no egress fees for replication)
  Total:   ~$0.0002/day → FAR below $1.00 cap

VERDICT: $1.00 cap is 100% SAFE for replication ✅
```

### 7.13 Protection Layers

| Protection Layer | How It Helps |
|---|---|
| **Custom Alert ($0.01/day)** | Email + SMS the instant ANY paid usage starts |
| **Auto 75% Alert ($0.75/day)** | Second warning — something is seriously wrong |
| **Hard Cap ($1.00/day)** | Emergency stop — blocks service to protect wallet |
| **Your code limits** | Max 5 MB avatar, max 10 MB attachment, max 10 files/request |
| **100 users** | Even if ALL 100 users max out everything = still ~2–3 GB → **FREE** |
| **Free tier buffer** | 10 GB storage + 1 GB download/day + 2,500 Class B/C per day |
| **B2 rate limiting** | B2 applies rate limiting on API requests, returning HTTP 503/429 during high traffic |

### 7.14 Worst-Case Scenario Analysis

```
SCENARIO 1: Normal Operation (100 users)
─────────────────────────────────────────
  Storage:    ~1 GB             → FREE (under 10 GB)
  Downloads:  ~1,615/day        → FREE (under 2,500/day)
  Class C:    ~100/day          → FREE (under 2,500/day)
  Egress:     ~few MB/day       → FREE (under 1 GB/day)
  DAILY COST: $0.00
  MONTHLY COST: $0.00
  Custom Alert ($0.01): NOT triggered
  75% Alert ($0.75): NOT triggered
  Cap ($1.00): NOT hit

SCENARIO 2: Moderate Growth (500 users)
───────────────────────────────────────────
  Storage:    ~5 GB             → FREE (under 10 GB)
  Downloads:  ~8,000/day        → 5,500 paid × $0.0000004 = $0.002/day
  Egress:     ~2 GB/day         → 1 GB free + 1 GB × $0.01 = $0.01/day
  DAILY COST: ~$0.012
  MONTHLY COST: ~$0.36
  Custom Alert ($0.01): ✅ TRIGGERED → you get email + text
  75% Alert ($0.75): NOT triggered
  Cap ($1.00): NOT hit
  Service: ✅ KEEPS RUNNING

SCENARIO 3: Abuse / DDoS Attack
──────────────────────────────────
  Massive download/API spam
  DAILY COST: Rises toward $1.00
  Custom Alert ($0.01): ✅ TRIGGERED EARLY
  75% Alert ($0.75): ✅ TRIGGERED
  Cap ($1.00): ✅ HIT → SERVICE STOPS → wallet protected
  MAX DAILY COST: $1.00 per category = $4.00 total
  MAX MONTHLY COST: $120.00 (absolute worst, all 4 maxed daily)
  
  REALITY: You'd fix it long before this happens
```

### 7.15 What To Do If You Receive an Alert

| Alert Received | Urgency | Action |
|---|---|---|
| **Custom Alert ($0.01/day)** | 🟡 Low | Check B2 dashboard. You've just barely exceeded free tier. Probably fine. Monitor. |
| **75% Auto Alert ($0.75/day)** | 🔴 High | Something is very wrong. Check for abuse, DDoS, or misconfigured health checks. Act immediately. |
| **100% Cap Hit ($1.00/day)** | 🔴🔴 Critical | Service is STOPPED. Login to B2. Identify cause. Either temporarily increase cap to $2.00 or wait for 12:00 AM GMT reset. Fix root cause. |

---

## 8. Cloud Replication (Disaster Recovery)

Backblaze B2 **Cloud Replication** automatically replicates objects from a source bucket to a destination bucket in a different region. This ensures data redundancy: if the source region goes down, your data is safe in the replica region.

### 8.1 Why Cloud Replication?

- **Disaster Recovery**: If the EU Central (Amsterdam) region experiences an outage, the replica in US East (Virginia) remains unaffected.
- **Geographic Redundancy**: Data copies on two different continents.
- **Compliance**: Maintain copies in multiple jurisdictions if needed.
- **No Egress Fees**: Cloud Replication does not incur service or egress fees — you only pay for storage in both locations.

### 8.2 Prerequisites: Two Separate Backblaze Accounts

> ⚠️ **You can assign only one region to a Backblaze account.** To replicate data to a different region, you must have separate Backblaze accounts for each region.

Since you **cannot use the same email** for two accounts, use Gmail's **subaddressing** (`+` trick):

| Account | Email | Region | Role |
|---------|-------|--------|------|
| **Account 1 (Source)** | `bhumukulraj.official@gmail.com` | 🇪🇺 EU Central (Amsterdam) | Primary / Source |
| **Account 2 (Destination)** | `bhumukulraj.official+backup@gmail.com` | 🇺🇸 US East (Reston, Virginia) | Replica / Destination |

> Both emails deliver to the **same Gmail inbox**. Backblaze treats them as distinct email addresses, but Gmail routes `+backup` mail to the same mailbox.

### 8.3 Backblaze B2 Regions & Data Centers

Backblaze B2 has **4 regions** across **6 data centers**:

| # | Region | Region Code | Data Center Location | Country |
|---|--------|-------------|----------------------|---------|
| 1 | **US West** | `us-west-000` | Sacramento, CA & Phoenix, AZ | 🇺🇸 USA |
| 2 | **US East** | `us-east-005` | Reston, Virginia | 🇺🇸 USA |
| 3 | **EU Central** | `eu-central-003` | Amsterdam | 🇪🇺 Netherlands |
| 4 | **CA East** | — | Toronto, Ontario | 🇨🇦 Canada |

> **Pricing is identical across all regions** — $6/TB/month for pay-as-you-go, with the same free tiers.

### 8.4 Step-by-Step: Set Up Cloud Replication

#### Step 1: Create the Destination Account

1. Go to [backblaze.com/sign-up](https://www.backblaze.com/sign-up/cloud-storage).
2. Sign up with: `bhumukulraj.official+backup@gmail.com`
3. Select region: **US East**
4. Verify your email (arrives in same Gmail inbox).
5. Add a payment method (required for replication).

#### Step 2: Configure Caps & Alerts on BOTH Accounts FIRST

> ⚠️ Before creating any replication rule, configure caps on both accounts as described in **Section 7.6** above ($1.00 cap is safe for replication). Wait 10 minutes after cap changes.

#### Step 3: Create the Replication Rule (on Source Account)

1. Log in to **Account 1** (`bhumukulraj.official@gmail.com` — EU Central).
2. In the left navigation menu under **B2 Cloud Storage**, click **Cloud Replication**.
3. Click **Replicate Your Data**.
4. Enter a **name** for your replication rule (e.g., `nestlancer-eu-to-useast`).
5. Select the **source bucket** (e.g., `nestlancer-private`).
6. Select **destination region**: US East.
7. **Authenticate destination account**: Click **Sign in** and enter the credentials for `bhumukulraj.official+backup@gmail.com`.
8. Select or create the **destination bucket** (e.g., `nestlancer-private-replica`).
9. Review the **Cloud Replication Rule Confirmation** pane.
10. Click **Create Replication**.

#### Step 4: Repeat for Other Buckets (if needed)

| Source Bucket (EU Central) | Destination Bucket (US East) |
|----------------------------|------------------------------|
| `nestlancer-private` | `nestlancer-private-replica` |
| `nestlancer-public` | `nestlancer-public-replica` |
| `nestlancer-avatars` | `nestlancer-avatars-replica` |
| _(add more as needed)_ | |

> 💡 **Tip**: If you collapsed your 8 logical buckets into 2 physical buckets (1 private + 1 public), you only need **2 replication rules**.

#### Step 5: Verify Replication

- After creating the rule, check the **Cloud Replication** page in the source account.
- You can verify replication status on a **file-by-file basis** from the source account.

### 8.5 Replication Cost Estimate (100 Users)

| Item | Amount | Cost |
|------|--------|------|
| **Replication egress** (source → destination) | ~1 GB | **$0** (no egress fees for replication) |
| **Replica storage** (US East account) | ~1 GB | **$0** (first 10 GB free per account) |
| **Total replication cost** | | **$0/month** |

### 8.6 Replication Limitations & Restrictions

| Limitation | Details |
|---|---|
| **Max rules per bucket** | 2 replication rules per source bucket |
| **No chain replication** | Replicated data cannot be replicated again |
| **Metadata size** | Files with metadata > 2,048 bytes are not replicated |
| **Deletions** | Hide markers and deleted files are NOT replicated |
| **Encryption** | SSE-C (client-managed encryption) is not supported |
| **Object Lock** | If source bucket has Object Lock, destination must also have it |
| **App Key** | You cannot use a master key as the app key for Cloud Replication |
| **Region lock** | Cannot change account region after creation |
| **Data Caps** | If cap is set too low on destination, bucket auth fails. $1.00 cap is safe (see Section 7.12) |

### 8.7 Centralized Management with Groups (Optional)

To manage billing for both accounts under one roof:

1. Create a **Group** in Backblaze and enable B2 for the group.
2. Invite both accounts (EU Central source + US East destination) to the group.
3. Billing for storage and egress is charged to the group.
4. There are **no egress fees** for data replication within a group.

> ⚠️ Groups apply only to **consumption-based (pay-as-you-go)** accounts. Not supported for B2 Reserve accounts.

### 8.8 Disaster Recovery Workflow

```
Normal Operation:
┌─────────────────────┐    Cloud Replication     ┌─────────────────────┐
│   EU Central         │ ───────────────────────► │   US East            │
│   (Amsterdam)        │   Auto, No Egress Fee    │   (Virginia)         │
│                      │                          │                      │
│ bhumukulraj.official │                          │ bhumukulraj.official │
│   @gmail.com         │                          │   +backup@gmail.com  │
│                      │                          │                      │
│ nestlancer-private   │ ───────────────────────► │ nestlancer-private   │
│ nestlancer-public    │ ───────────────────────► │   -replica           │
│ nestlancer-avatars   │ ───────────────────────► │ nestlancer-public    │
│                      │                          │   -replica           │
└─────────────────────┘                          │ nestlancer-avatars   │
    ▲ PRIMARY                                     │   -replica           │
    │                                             └─────────────────────┘
    │                                                 ▲ REPLICA
  Users                                               │
  connect                                          If EU Central
  here                                             goes down,
  normally                                         switch DNS/config
                                                   to US East
```

**If EU Central goes down:**
1. Update your backend's `STORAGE_*` env vars to point to the US East replica bucket names and Account 2's app keys.
2. Update your CDN origin (if applicable) to the US East endpoint.
3. Redeploy or restart your backend.
4. Users are now served from US East (Virginia) with all their data intact.

---

## 9. Backblaze B2 Regions & Data Centers (Quick Reference)

| # | Region | Location | Data Centers | Notes |
|---|--------|----------|-------------|-------|
| 1 | 🇺🇸 **US West** | Sacramento, CA + Phoenix, AZ | 2 data centers | Default region, oldest |
| 2 | 🇺🇸 **US East** | Reston, Virginia | 1 data center (IAD 1) | Operated by Coresight; SOC 2, ISO 27001, NIST 800-53, HIPAA compliant |
| 3 | 🇪🇺 **EU Central** | Amsterdam, Netherlands | 1 data center | Best for EU users, GDPR-friendly |
| 4 | 🇨🇦 **CA East** | Toronto, Ontario | 1 data center | Newest region |

**Total: 4 regions, 6 data centers**

> All Backblaze data centers are **SSAE-18/SOC-2 compliant**, use **biometric security**, and have **ID checks and area locks** requiring badge-level access.

### Key Rules:
- **One region per account** — choose at account creation, cannot change later.
- **Same pricing across all regions** — no region surcharges.
- **Cross-region replication** requires separate accounts (one per region).
- **Groups** feature allows centralized billing across multiple accounts/regions.

---

## 10. Official Documentation Links

| Topic | URL |
|-------|-----|
| **B2 Cloud Storage Pricing** | https://www.backblaze.com/cloud-storage/pricing |
| **API Transaction Pricing** | https://www.backblaze.com/cloud-storage/transaction-pricing |
| **Data Caps & Alerts (Understand)** | https://www.backblaze.com/docs/cloud-storage-data-caps-and-alerts |
| **Create & Manage Caps & Alerts** | https://www.backblaze.com/docs/cloud-storage-create-and-manage-caps-and-alerts |
| **How to Use B2 Data Caps & Alerts** | https://help.backblaze.com/hc/en-us/articles/217931138-How-to-use-B2-data-caps-alerts |
| **Data Regions & Data Centers** | https://www.backblaze.com/docs/cloud-storage-data-regions |
| **Cloud Replication Overview** | https://www.backblaze.com/docs/cloud-storage-cloud-replication |
| **Cloud Replication Restrictions** | https://help.backblaze.com/hc/en-us/articles/4505969041051 |
| **Create Replication Rules (Web Console)** | https://www.backblaze.com/docs/cloud-storage-create-and-manage-cloud-replication-rules |
| **Create Replication Rules (Native API)** | https://www.backblaze.com/docs/cloud-storage-create-a-cloud-replication-rule-with-the-native-api |
| **Cloud Replication FAQ** | https://help.backblaze.com/hc/en-us/articles/13721894992155-Cloud-Replication-FAQ |
| **US East Region FAQ** | https://help.backblaze.com/hc/en-us/articles/11200044808731-U-S-East-Data-Region-FAQ |
| **EU Region FAQ** | https://help.backblaze.com/hc/en-us/articles/360034360834-EU-Region-FAQ |
| **Creating a Business Group** | https://www.backblaze.com/docs/cloud-storage-create-a-group |
| **Integration Checklist (cap_exceeded)** | https://www.backblaze.com/docs/cloud-storage-integration-checklist |
| **Native API Error Codes** | https://www.backblaze.com/docs/cloud-storage-native-api-error-handling-and-status-codes |

---

## 11. Final Summary Table

| Metric | Estimate (100 users) |
|--------|----------------------|
| **Buckets** | 8 logical (can collapse to 2 physical: 1 private, 1 public) |
| **Storage (source)** | ~1 GB (first 10 GB free on B2) |
| **Uploads/month** | ~370 (free) |
| **Downloads + HeadObject/month** | ~48,500 (~1,615/day; under 2,500/day free) |
| **List/metadata/month** | ~3,000 (under free tier) |
| **Source region** | 🇪🇺 EU Central (Amsterdam) |
| **Replica region** | 🇺🇸 US East (Reston, Virginia) |
| **Replication egress fees** | $0 (no egress fees for replication) |
| **Replica storage** | ~1 GB (first 10 GB free on destination account) |
| **Total Backblaze accounts** | 2 (`@gmail.com` + `+backup@gmail.com`) |
| **Caps (both accounts)** | ☐ No Cap UNCHECKED → **$1.00/day** on all 4 categories |
| **Alerts (both accounts)** | 🔔 **$0.01/day** on all 4 categories (Email + Text) |
| **Alert triggers** | Custom: $0.01 → Auto 75%: $0.75 → Auto 100% + STOP: $1.00 |
| **Estimated B2 bill (both accounts)** | **~$0/month** at this scale |
| **Max possible daily bill (capped)** | **$1.00/day per category × 4 = $4.00/day** |
| **Max possible monthly bill (capped)** | **$120/month absolute worst case (both accounts)** |
| **Realistic worst case (100 users)** | **~$0.00/month** (everything within free tiers) |

---

## 12. Per-TB Pricing Quick Reference Card

```
╔═══════════════════════════════════════════════════════════════════════╗
║              BACKBLAZE B2 PER-TB PRICING CHEAT SHEET                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  STORAGE:    $6.00 / TB / month  =  $0.006 / GB / month             ║
║              First 10 GB FREE                                         ║
║                                                                       ║
║  EGRESS:     $10.00 / TB  =  $0.01 / GB (above 3× storage free)     ║
║              Free up to 3× your average monthly storage               ║
║              Free unlimited to CDN partners (Cloudflare, etc.)        ║
║                                                                       ║
║  CLASS A:    FREE always (uploads, deletes)                           ║
║                                                                       ║
║  CLASS B:    $0.004 / 10,000 calls  =  $0.0000004 / call            ║
║              First 2,500/day FREE                                     ║
║                                                                       ║
║  CLASS C:    $0.004 / 1,000 calls   =  $0.000004 / call             ║
║              First 2,500/day FREE                                     ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║              YOUR CAPS & ALERTS (BOTH ACCOUNTS)                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  CAP:   $1.00/day per category  (☐ No Cap UNCHECKED)                 ║
║  ALERT: $0.01/day per category  (☑ Email  ☑ Text)                    ║
║                                                                       ║
║  $1.00/day storage cap   = ~5 TB before service stops                ║
║  $1.00/day download cap  = ~100 GB/day before service stops          ║
║  $1.00/day Class B cap   = ~25M calls/day before service stops       ║
║  $1.00/day Class C cap   = ~1M calls/day before service stops        ║
║                                                                       ║
║  Your actual usage: ~$0.00/day (all within free tiers)               ║
║  Max budget exposure: $120/month (all 4 cats, both accounts, 30 days)║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 13. Critical Rules Summary

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    PRODUCTION RULES — NEVER VIOLATE                     ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1. ✅ Caps set to $1.00/day on ALL 4 categories (both accounts)        ║
║     → "No Cap" checkbox must be UNCHECKED to enable the cap             ║
║     → $1.00 = budget-friendly max of $30/month per category             ║
║     → At 100 users, you'll NEVER hit this cap                           ║
║                                                                          ║
║  2. ✅ Alerts set to $0.01/day on ALL 4 categories (both accounts)      ║
║     → Earliest possible warning = fires when ANY paid usage starts      ║
║     → Auto 75% alert fires at $0.75/day                                 ║
║     → Service runs until $1.00/day cap is hit                           ║
║                                                                          ║
║  3. ✅ Enable BOTH Email and Text notifications                          ║
║     → Fastest possible response to unusual activity                      ║
║                                                                          ║
║  4. ⚠️ If cap is hit (service stops):                                    ║
║     → Login to B2 immediately                                            ║
║     → Identify cause (abuse? DDoS? misconfigured health check?)          ║
║     → Temporarily increase cap to $2.00 if needed                        ║
║     → OR wait for 12:00 AM GMT daily reset                               ║
║     → Fix root cause                                                     ║
║                                                                          ║
║  5. ⚠️ After ANY cap/alert change:                                       ║
║     → Wait 10 minutes before creating/modifying replication rules        ║
║     → Verify replication is still active                                  ║
║                                                                          ║
║  6. 💰 Budget protection:                                                ║
║     → $1.00/day cap = max $4.00/day across all categories                ║
║     → Max $120/month absolute worst case (both accounts combined)        ║
║     → Your actual bill at 100 users = $0/month                           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```