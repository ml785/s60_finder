#!/usr/bin/env python3
"""
scraper/scrape.py — Fetches live Volvo S60 listings via the MarketCheck API
near ZIP 07762 and writes listings.js.

One-time setup:
  1. Sign up free at https://www.marketcheck.com/automotive-api/
  2. Copy your API key.
  3. Add it as a GitHub Actions secret named MARKETCHECK_API_KEY.

Auto-run via .github/workflows/update-listings.yml (twice daily).
Manual test: MARKETCHECK_API_KEY=your_key python3 scraper/scrape.py
"""

import os
import sys
import json
import requests
from datetime import datetime, timezone
from pathlib import Path

# ── Config ────────────────────────────────────────────────
ZIP_CODE = "07762"   # Spring Lake, NJ
RADIUS   = 50        # miles
MAX_ROWS = 100       # max results per request (API cap is 100)

AREA_LAT = 40.1548   # 07762 centroid — fallback when dealer coords absent
AREA_LNG = -74.0185

OUTPUT = Path(__file__).parent.parent / "listings.js"


# ── API fetch (paginates to retrieve all results) ─────────
def fetch_listings() -> list:
    api_key = os.environ.get("MARKETCHECK_API_KEY", "").strip()
    if not api_key:
        sys.exit(
            "\n⚠  MARKETCHECK_API_KEY not set.\n"
            "   Sign up free → https://www.marketcheck.com/automotive-api/\n"
            "   Then run: MARKETCHECK_API_KEY=your_key python3 scraper/scrape.py\n"
        )

    url = "https://mc-api.marketcheck.com/v2/search/car/active"
    base_params = {
        "api_key":    api_key,
        "zip":        ZIP_CODE,
        "radius":     RADIUS,
        "make":       "volvo",
        "model":      "s60",
        "rows":       MAX_ROWS,
        "sort_by":    "dist",
        "sort_order": "asc",
    }

    all_raw = []
    start   = 0

    while True:
        params = {**base_params, "start": start}
        print(f"  Fetching rows {start}–{start + MAX_ROWS - 1} …", end=" ")

        resp = requests.get(url, params=params, timeout=20)
        if resp.status_code == 401:
            sys.exit("⚠  Invalid API key. Check MARKETCHECK_API_KEY.")
        if resp.status_code == 429:
            print(f"\n⚠  Rate limit hit after {len(all_raw)} listings — using what we have.")
            break
        resp.raise_for_status()

        data  = resp.json()
        batch = data.get("listings") or []
        total = data.get("num_found", "?")
        print(f"{len(batch)} returned  (total available: {total})")

        all_raw.extend(batch)

        # Stop if this page was short (last page) or we've hit our cap
        if len(batch) < MAX_ROWS or len(all_raw) >= 500:
            break

        start += MAX_ROWS

    print(f"  → {len(all_raw)} listings fetched total")
    return all_raw


# ── Map API response → our listing schema ─────────────────
def map_listing(raw: dict, index: int) -> dict | None:
    build  = raw.get("build")  or {}
    dealer = raw.get("dealer") or {}
    media  = raw.get("media")  or {}
    photos = media.get("photo_links") or []

    year  = build.get("year", 0)
    trim  = build.get("trim")  or "S60"
    price = raw.get("price", 0)

    # Skip listings with no price or year (usually data errors)
    if not price or not year:
        return None

    drivetrain = "AWD" if "AWD" in (build.get("driven_wheels") or "").upper() else "FWD"

    color_raw = (
        build.get("ext_color_generic") or
        build.get("ext_color")         or ""
    )

    dealer_city  = dealer.get("city")  or ""
    dealer_state = dealer.get("state") or ""
    location = f"{dealer_city}, {dealer_state}".strip(", ") or f"Near {ZIP_CODE}"

    # MarketCheck includes dealer lat/lng — use it for accurate distance badges
    lat = float(dealer.get("latitude")  or AREA_LAT)
    lng = float(dealer.get("longitude") or AREA_LNG)

    return {
        "id":            raw.get("id") or f"mc-{index}",
        "year":          year,
        "trim":          trim,
        "trimCategory":  detect_trim(trim),
        "engine":        detect_engine(trim),
        "drivetrain":    drivetrain,
        "price":         price,
        "mileage":       raw.get("miles", 0),
        "color":         color_raw or "N/A",
        "colorCategory": detect_color(color_raw),
        "location":      location,
        "lat":           lat,
        "lng":           lng,
        "dealer":        dealer.get("name") or "",
        "features":      detect_features(build),
        "notes":         "",
        "image":         photos[0] if photos else None,
        "listingUrl":    raw.get("vdp_url") or "#",
    }


# ── Field helpers ─────────────────────────────────────────
def detect_trim(text: str) -> str:
    t = text.upper()
    if "POLESTAR"    in t:                    return "Polestar Engineered"
    if "RECHARGE"    in t or " T8" in t:     return "Recharge"
    if "INSCRIPTION" in t:                    return "Inscription"
    if "R-DESIGN"    in t or "RDESIGN" in t: return "R-Design"
    if "MOMENTUM"    in t:                    return "Momentum"
    return ""


def detect_engine(trim: str) -> str:
    t = trim.upper()
    if " T8" in t: return "T8 PHEV AWD (455 hp)"
    if " T6" in t: return "T6 AWD (316 hp)"
    if " T5" in t: return "T5 FWD (250 hp)"
    return ""


def detect_color(color: str) -> str:
    c = color.lower()
    if any(w in c for w in ("white", "pearl", "crystal")):                   return "white"
    if any(w in c for w in ("black", "onyx", "obsidian", "caviar")):         return "black"
    if any(w in c for w in ("silver", "grey", "gray", "osmium", "vapour",
                             "pebble", "thunder", "platinum", "bright")):    return "silver"
    if any(w in c for w in ("blue", "denim", "mussel", "ocean", "marine")):  return "blue"
    if any(w in c for w in ("red", "fusion", "scarlet", "crimson")):         return "red"
    return ""


def detect_features(build: dict) -> list:
    """
    MarketCheck's build object has keys like 'std_awd', 'std_leather_seats', etc.
    Map whichever are true into our feature tag list.
    """
    mapping = {
        "std_awd":             "awd",
        "std_leather_seats":   "leather seats",
        "std_sunroof":         "sunroof",
        "std_apple_carplay":   "apple carplay",
        "std_heated_seats":    "heated seats",
        "std_backup_camera":   "backup camera",
        "std_blind_spot_mon":  "blind spot monitoring",
    }
    features = []
    for key, label in mapping.items():
        if build.get(key):
            features.append(label)

    # AWD drivetrain always gets the "awd" feature tag too
    if "AWD" in (build.get("driven_wheels") or "").upper() and "awd" not in features:
        features.append("awd")

    return features


# ── Write output ──────────────────────────────────────────
def write_js(listings: list) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    OUTPUT.write_text(
        f"// listings.js — AUTO-GENERATED. Do not edit manually.\n"
        f"// Source: MarketCheck API — ZIP {ZIP_CODE}, {RADIUS} mi radius.\n"
        f"// Last updated: {ts}\n\n"
        f"const LISTINGS = {json.dumps(listings, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"✓  Wrote {len(listings)} listings → {OUTPUT.name}")


# ── Entry point ───────────────────────────────────────────
def main() -> None:
    print(f"S60 Finder scraper  |  MarketCheck API  |  ZIP {ZIP_CODE}  |  {RADIUS} mi")
    print("-" * 60)

    raw = fetch_listings()
    listings = [l for l in (map_listing(r, i) for i, r in enumerate(raw)) if l]

    if not listings:
        print("⚠  No valid listings returned — listings.js left unchanged.")
        sys.exit(1)

    write_js(listings)


if __name__ == "__main__":
    main()
