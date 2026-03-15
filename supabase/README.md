# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New Project**
3. Choose your organization, name the project (e.g., `shenandoah-speedtest`), set a database password, and pick the **US East** region
4. Wait ~2 minutes for the project to provision

---

## 2. Run the Migration SQL

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `migrations/001_init.sql` and paste it
4. Click **Run** (or press Cmd+Enter)
5. You should see "Success" — this creates the tables, RLS policies, and seeds 8 starter results

---

## 3. Enable Realtime

1. Go to **Database** → **Replication** in the sidebar
2. Under "Source" tables, find `speed_results`
3. Toggle it ON for realtime updates

---

## 4. Get Your Project Credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 5. Add to .env.local

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_IPINFO_TOKEN=your-ipinfo-token    # optional, for ISP detection
VITE_MAPBOX_TOKEN=your-mapbox-token    # required for the 3D map
```

---

## Schema Reference

### `speed_results`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| username | text | Public display name |
| download_mbps | numeric(8,2) | Download speed |
| upload_mbps | numeric(8,2) | Upload speed |
| ping_ms | integer | Latency in ms |
| carrier | text | Selected carrier |
| isp_detected | text | Auto-detected ISP |
| town | text | Snapped town name |
| region | text | State abbreviation |
| lat | numeric(9,6) | Town centroid latitude |
| lng | numeric(9,6) | Town centroid longitude |
| created_at | timestamptz | Submission time |

### `email_signups`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Unique email address |
| username | text | Associated username |
| created_at | timestamptz | Signup time |

### RLS Policies
- `speed_results`: Public SELECT + INSERT (no auth required)
- `email_signups`: Public INSERT only (emails are never shown publicly)
