# Shenandoah Valley Speed Test

A free community internet speed test built for the people of the Shenandoah Valley, Virginia.

**[shenandoahspeedtest.com](https://shenandoahspeedtest.com)**

---

## Why This Exists

Internet in the Shenandoah Valley is a mixed bag. Depending on where you live — whether that's Winchester, Luray, Edinburg, or somewhere out on a rural route — your experience can be completely different from your neighbor's. Some folks have fiber. Others are still on DSL or satellite. Most of us have no idea what speeds our neighbors are actually getting or whether we're being shortchanged by our provider.

ISP coverage maps are marketing tools, not technical documentation. They report to the FCC that an entire census block is served if even one address can receive service. For rural areas, that means entire communities are "covered" on paper while having zero actual access.

This tool exists because the only honest source of internet data is the people actually using it. Your neighbors. Your community. Real results from real connections.

**A few things we had in mind when building it:**

- **Home buying decisions** — before you sign on a property, you deserve to know what internet actually looks like in that area. Not what the ISP's coverage map claims. What real people in that community are actually getting.
- **Carrier comparisons** — if your neighbor two miles away is on Starlink and pulling 200 Mbps while you're on the same provider getting 18, that's information worth having. Vote with your wallet.
- **Community awareness** — the Valley has been underserved on broadband for a long time. The more data we have as a community, the better the case we can make for better infrastructure.

---

## Features

### 🌐 Interactive 3D Globe

The heart of the app. Built with [CesiumJS](https://cesium.com/cesiumjs/) and powered by Cesium Ion:

- **Satellite imagery** — high-resolution Cesium World Imagery tiles of the Valley
- **Real terrain** — Cesium World Terrain with vertex normals and water masking, exaggerated 1.5x so the ridgelines pop
- **Sun lighting & atmosphere** — natural shadows and depth across the mountains
- **Cinematic fly-in** — the globe starts spinning from space, then swoops down to a low-angle view of the Valley with labeled towns
- **Full interaction** — drag, rotate, and pinch-zoom on mobile or desktop

Every submitted result appears as a color-coded pin:

| Color | Speed | Meaning |
|-------|-------|---------|
| 🟢 Green | 100+ Mbps | Solid connection |
| 🟡 Amber | 25–100 Mbps | Usable but room to improve |
| 🔴 Red | Under 25 Mbps | This is the problem we're talking about |

Click any pin to see top results for that town, average speeds, and test counts.

### 📊 Community Leaderboard

A real-time leaderboard showing the fastest results across the Valley, with filtering and carrier breakdowns.

### 🏘️ Town-Level Pages

Browse real internet speed data from **150+ communities** across the Valley, organized by parent area:

- **Search & sort** by name, speed, or test count
- **Town detail pages** with average speeds, best providers, speed trend charts, recent test tables, and dynamically generated FAQ content
- **Nearby communities** — discover related towns in the same area

### 📈 Personal Speed Dashboard

Track your internet performance over time with a private dashboard (magic link auth via Supabase):

- **Speed history charts** — download, upload, and ping trends
- **Time of day analysis** — find your best and worst hours for connectivity
- **Neighborhood comparison** — see how your speeds compare to your town average and Valley-wide carrier averages
- **Smart recommendations** — personalized suggestions based on your speed data (e.g., whether Starlink might be a better option)
- **Test history** with pagination

### 📄 About Page

The full story behind the project — why we built it, how the speed test works, privacy details, and who's behind it.

### 🔗 Social Sharing

Share your test results on X (Twitter) and Facebook with pre-formatted text including your speed, carrier, and community.

### 🔍 SEO & Structured Data

The app is thoroughly optimized for search engines:

- **Dynamic `<head>` management** — per-page titles, descriptions, canonical URLs, and Open Graph/Twitter Card tags via `react-helmet-async`
- **JSON-LD structured data** — including `WebApplication`, `LocalBusiness`, `FAQPage`, `Dataset`, and `SiteNavigationElement` schemas
- **Dynamically generated FAQ** on each town detail page (e.g., "What is the best internet provider in Luray?")
- **`robots.txt` and `sitemap.xml`** included
- **Correct Open Graph image** sized to 1200×630 for proper social previews

---

## How the Speed Test Works

When you run a test, the app measures three things:

**Ping** — sends 5 rapid requests to a CDN and averages the response times. This tells you your latency — how "snappy" your connection feels for things like video calls and gaming.

**Download speed** — downloads test payloads from Cloudflare's speed infrastructure and measures how fast the data arrives. This is what determines how well you can stream, browse, and download files.

**Upload speed** — sends data from your browser to a remote endpoint and measures the transfer rate. Upload matters for video calls, cloud backups, and working from home.

Your location is detected automatically (or estimated from your IP via ipinfo.io if you decline location access) and snapped to the nearest named Valley town — your exact address is never stored, only the town centroid.

After the test, you can submit your result to the community map and leaderboard. Results are visible to everyone. Emails (if provided) are stored privately and never shown publicly.

---

## Privacy

- Your exact GPS coordinates are never stored — only the nearest town centroid
- Usernames are chosen by you and are public
- Email is optional and never shown publicly — only used for the personal dashboard
- No tracking, no ads

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + inline styles |
| 3D Globe | CesiumJS with Cesium Ion |
| Backend | Supabase (PostgreSQL, Realtime, Auth) |
| Speed Test | Cloudflare speed infrastructure |
| ISP Detection | ipinfo.io |
| SEO | react-helmet-async + JSON-LD schemas |
| Routing | React Router v7 |

## Project Structure

```
src/
├── components/
│   ├── CesiumGlobe.tsx    # 3D interactive globe with terrain & speed pins
│   ├── ErrorBoundary.tsx  # React error boundary wrapper
│   ├── Footer.tsx         # Site-wide footer
│   ├── Header.tsx         # Navigation header with mobile menu
│   ├── Leaderboard.tsx    # Community speed leaderboard popup
│   ├── ResultCard.tsx     # Speed test results display
│   ├── SEOHead.tsx        # Dynamic <head> meta tag management
│   ├── ShareButton.tsx    # X/Twitter & Facebook share buttons
│   ├── SpeedGauge.tsx     # Animated speed gauge dial
│   └── SubmitForm.tsx     # Result submission form
├── hooks/
│   ├── useAuth.ts         # Supabase auth (magic link)
│   ├── useLeaderboard.ts  # Leaderboard data fetching
│   ├── useSpeedTest.ts    # Speed test orchestration
│   └── useStats.ts        # Town/carrier stats queries
├── lib/
│   ├── geocode.ts         # 150+ Valley town definitions & geo lookup
│   ├── ispDetect.ts       # ISP detection via ipinfo.io
│   ├── seo.ts             # SEO utility functions
│   ├── speedtest.ts       # Speed test engine (ping, download, upload)
│   └── supabase.ts        # Supabase client & type definitions
├── pages/
│   ├── AboutPage.tsx      # About page with story, how it works, privacy
│   ├── DashboardPage.tsx  # Personal speed dashboard (auth required)
│   ├── HomePage.tsx       # Main page: globe, speed test, leaderboard
│   ├── TownDetailPage.tsx # Individual town stats, trends, FAQ
│   └── TownsPage.tsx      # Browse all 150+ communities
├── App.tsx                # Router setup & layout
├── main.tsx               # App entry point
└── index.css              # Global styles & CSS custom properties
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_IPINFO_TOKEN` | ipinfo.io token (stored as full URL) |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion access token |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Built By

[Eleven North](https://elevennorth.co) — a digital studio in the Shenandoah Valley, VA.

We build websites, apps, and AI tools for local businesses. If you need something built, [say hello](https://elevennorth.co).

---

*Free forever. Open source. For the Valley.*
