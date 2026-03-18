# Shenandoah Valley Speed Test

A free community internet speed test built for the people of the Shenandoah Valley, Virginia.

**[shenandoahspeedtest.com](https://shenandoahspeedtest.com)**

---

## Why I Built This

Internet in the Shenandoah Valley is a mixed bag. Depending on where you live — whether that's Winchester, Luray, Edinburg, or somewhere out on a rural route — your experience can be completely different from your neighbor's. Some folks have fiber. Others are still on DSL or satellite. Most of us have no idea what speeds our neighbors are actually getting or whether we're being shortchanged by our provider.

This tool exists to change that.

**A few things I had in mind when building it:**

- **Home buying decisions** — before you sign on a property, you deserve to know what internet actually looks like in that area. Not what the ISP's coverage map claims. What real people in that zip code are actually getting.
- **Carrier comparisons** — if your neighbor two miles away is on Starlink and pulling 200 Mbps while you're on the same provider getting 18, that's information worth having. Vote with your wallet.
- **Community awareness** — the Valley has been underserved on broadband for a long time. The more data we have as a community, the better the case we can make for better infrastructure.

This is version 1. I plan to keep adding to it.

---

## How It Works

When you run a test, the app measures three things:

**Ping** — sends 5 rapid requests to a CDN and averages the response times. This tells you your latency — how "snappy" your connection feels for things like video calls and gaming.

**Download speed** — downloads test payloads from Cloudflare's speed infrastructure and measures how fast the data arrives. This is what determines how well you can stream, browse, and download files.

**Upload speed** — sends data from your browser to a remote endpoint and measures the transfer rate. Upload matters for video calls, cloud backups, and working from home.

Your location is detected automatically (or estimated from your IP if you decline location access) and snapped to the nearest named Valley town — your exact address is never stored, only the town centroid.

After the test, you can submit your result to the community map and leaderboard. Results are visible to everyone. Emails (if provided) are stored privately and never shown publicly.

---

## The Globe

The interactive 3D globe is the heart of the app. Built with [CesiumJS](https://cesium.com/cesiumjs/) and powered by Cesium Ion, it features:

- **Cesium World Imagery** — high-resolution satellite tiles of the Valley
- **Cesium World Terrain** — real elevation data with vertex normals and water masking, exaggerated 1.5x so the ridgelines pop
- **Sun lighting & atmosphere** — natural shadows and depth across the mountains
- **Cinematic fly-in** — the globe starts spinning from space, then swoops down to a low-angle view of the Shenandoah Valley with labeled towns
- **Full interaction** — drag, rotate, pinch-zoom on mobile or desktop

Every submitted result appears as a color-coded pin:

- **Green** — 100+ Mbps (solid connection)
- **Amber** — 25–100 Mbps (usable but room to improve)
- **Red** — under 25 Mbps (this is the problem we're talking about)

Click any pin to see the top results for that town, the average speed, and how many tests have been submitted from there. When you submit a new result, the globe animates to your location.

---

## What's Coming

This is a living project. Things I'm planning to add:

- Town-level speed averages and trend charts over time
- ISP comparison breakdowns by carrier within each town
- A way to flag results as outdated or suspicious
- Embed widget other local sites can use
- Mobile app (maybe)

If you have ideas, open an issue or reach out.

---

## Privacy

- Your exact GPS coordinates are never stored — only the nearest town centroid
- Usernames are chosen by you and are public
- Email is optional and never shown publicly
- No accounts, no tracking, no ads

---

## Built By

[Eleven North](https://elevennorth.co) — a digital studio in the Shenandoah Valley, VA.

We build websites, apps, and AI tools for local businesses. If you need something built, [say hello](https://elevennorth.co).

---

## Tech Stack

- React 19 + Vite + TypeScript
- CesiumJS with Cesium Ion (3D globe, terrain, imagery)
- Tailwind CSS v4
- Supabase (PostgreSQL + Realtime)
- Cloudflare speed infrastructure (test endpoints)

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_IPINFO_TOKEN` | ipinfo.io token (stored as full URL) |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion access token |

---

*Free forever. Open source. For the Valley.*
