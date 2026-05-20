# S60 Finder

A lightweight, static web app for searching Volvo S60 listings. Filters by location, price, year, mileage, trim, drivetrain, color, and features. Built for GitHub Pages — no backend, no APIs, no dependencies.

## Features

- 15 realistic mock Volvo S60 listings (2019–2024)
- Filter by: location + radius, price, year, mileage, trim, drivetrain, color, features, keywords
- Sort by: lowest price, newest year, lowest mileage, closest distance
- Distance calculation using the Haversine formula (enter a ZIP code or city name)
- Save/favorite listings with localStorage persistence
- Listing detail modal
- Responsive layout for desktop and mobile

## File Structure

```
S60 Finder/
├── index.html      # App shell and filter form
├── styles.css      # All styling (dark navy theme, responsive)
├── app.js          # Filter, sort, render, and favorites logic
├── listings.js     # Mock dataset — replace or extend to add real data
└── README.md
```

## Running Locally

No build step required. Just open `index.html` in any browser:

```bash
# Option 1: double-click index.html in Finder
# Option 2: serve with Python
python3 -m http.server 8080
# then open http://localhost:8080
```

## Hosting on GitHub Pages

1. Create a new GitHub repository (public).
2. Push all project files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. In your repo on GitHub, go to **Settings → Pages**.
4. Under **Source**, select **Deploy from a branch**, choose `main`, folder `/` (root).
5. Click **Save**. Your site will be live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

GitHub Pages typically takes 1–2 minutes to deploy.

## Adding Real Listings

### Option A — Edit the array directly

Open `listings.js` and add or replace entries in the `LISTINGS` array. Each listing must follow this shape:

```js
{
  id: 16,                          // unique integer
  year: 2023,
  trim: "T6 Inscription",          // display label
  trimCategory: "Inscription",     // must match filter dropdown value
  engine: "T6 AWD (316 hp)",
  drivetrain: "AWD",               // "AWD" or "FWD"
  price: 44000,
  mileage: 12000,
  color: "Osmium Grey Metallic",   // display label
  colorCategory: "silver",         // "white"|"black"|"silver"|"blue"|"red"|""
  location: "Austin, TX",
  lat: 30.2672,                    // for distance calculation
  lng: -97.7431,
  dealer: "Dealer Name",
  features: ["awd", "leather seats", "heated seats", "backup camera"],
  notes: "Short notes about the listing",
  listingUrl: "https://..."        // or "#" for no link
}
```

Feature strings must exactly match the checkbox values in `index.html`:
`"awd"`, `"leather seats"`, `"sunroof"`, `"apple carplay"`, `"heated seats"`, `"backup camera"`, `"blind spot monitoring"`

### Option B — Load from an external JSON file

Replace the `LISTINGS` constant in `listings.js` with a `fetch()` call, then call `init()` after the data loads:

```js
// listings.js — dynamic version
fetch("listings.json")
  .then(res => res.json())
  .then(data => {
    window.LISTINGS = data;
    // init() is called by app.js on DOMContentLoaded,
    // so trigger a re-render after data arrives:
    if (typeof renderCards === "function") {
      renderCards(window.LISTINGS);
      updateResultsCount(window.LISTINGS.length);
    }
  });
```

> Note: `fetch()` requires a server (not `file://`). Use `python3 -m http.server` or push to GitHub Pages.

### Option C — Import from CSV

Use a small script to convert a CSV export from a scraping service into the listing object format, write it to `listings.js`, and commit the file.

## Extending the Location Database

`app.js` contains a `LOCATION_DB` object mapping ZIP codes and city names to lat/lng. Add entries to support more locations:

```js
"98109": { lat: 47.6367, lng: -122.3567 },  // Seattle, Queen Anne
"portland, me": { lat: 43.6591, lng: -70.2568 }
```

## Customization Tips

- **Colors / theme**: Edit the CSS custom properties at the top of `styles.css` under `:root`.
- **Add more trims**: Add `<option>` entries to the trim `<select>` in `index.html` and update the `trimCategory` field in your listing data.
- **Add more features**: Add checkboxes in `index.html` and include matching strings in the `features` array of each listing.
- **Different make/model**: Swap "Volvo S60" references in `index.html` titles and `app.js` keyword search string, update `listings.js`.
