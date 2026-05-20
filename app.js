/**
 * app.js — S60 Finder core logic
 *
 * Reads from window.LISTINGS (defined in listings.js).
 * To swap in real data: replace LISTINGS with a fetch() result,
 * then call init() after the data is ready.
 */

// ─────────────────────────────────────────────
// LOCATION DATABASE
// Maps ZIP codes and city names → { lat, lng }
// Extend this table to support more locations.
// ─────────────────────────────────────────────
const LOCATION_DB = {
  // ZIP codes
  "10001": { lat: 40.7484, lng: -73.9967 },
  "10010": { lat: 40.7394, lng: -73.9828 },
  "90001": { lat: 33.9731, lng: -118.2479 },
  "90210": { lat: 34.0901, lng: -118.4065 },
  "60601": { lat: 41.8827, lng: -87.6233 },
  "60614": { lat: 41.9209, lng: -87.6480 },
  "77001": { lat: 29.7480, lng: -95.3677 },
  "85001": { lat: 33.4484, lng: -112.0740 },
  "19101": { lat: 39.9526, lng: -75.1652 },
  "78201": { lat: 29.4241, lng: -98.4936 },
  "92101": { lat: 32.7157, lng: -117.1611 },
  "75201": { lat: 32.7767, lng: -96.7970 },
  "95101": { lat: 37.3382, lng: -121.8863 },
  "78701": { lat: 30.2672, lng: -97.7431 },
  "98101": { lat: 47.6062, lng: -122.3321 },
  "80201": { lat: 39.7392, lng: -104.9903 },
  "02101": { lat: 42.3601, lng: -71.0589 },
  "02101": { lat: 42.3601, lng: -71.0589 },
  "37201": { lat: 36.1627, lng: -86.7816 },
  "97201": { lat: 45.5051, lng: -122.6750 },
  "94101": { lat: 37.7749, lng: -122.4194 },
  "94102": { lat: 37.7786, lng: -122.4187 },
  "30301": { lat: 33.7490, lng: -84.3880 },
  "20001": { lat: 38.9072, lng: -77.0369 },
  "33101": { lat: 25.7617, lng: -80.1918 },
  "48201": { lat: 42.3314, lng: -83.0458 },
  "55401": { lat: 44.9778, lng: -93.2650 },
  "63101": { lat: 38.6270, lng: -90.1994 },
  "84101": { lat: 40.7608, lng: -111.8910 },
  "89101": { lat: 36.1699, lng: -115.1398 },
  "32801": { lat: 28.5383, lng: -81.3792 },
  "28201": { lat: 35.2271, lng: -80.8431 },

  // City names and common aliases (all lowercase)
  "new york":         { lat: 40.7128, lng: -74.0060 },
  "new york, ny":     { lat: 40.7128, lng: -74.0060 },
  "nyc":              { lat: 40.7128, lng: -74.0060 },
  "los angeles":      { lat: 34.0522, lng: -118.2437 },
  "los angeles, ca":  { lat: 34.0522, lng: -118.2437 },
  "la":               { lat: 34.0522, lng: -118.2437 },
  "chicago":          { lat: 41.8781, lng: -87.6298 },
  "chicago, il":      { lat: 41.8781, lng: -87.6298 },
  "houston":          { lat: 29.7604, lng: -95.3698 },
  "houston, tx":      { lat: 29.7604, lng: -95.3698 },
  "phoenix":          { lat: 33.4484, lng: -112.0740 },
  "phoenix, az":      { lat: 33.4484, lng: -112.0740 },
  "philadelphia":     { lat: 39.9526, lng: -75.1652 },
  "philadelphia, pa": { lat: 39.9526, lng: -75.1652 },
  "philly":           { lat: 39.9526, lng: -75.1652 },
  "san antonio":      { lat: 29.4241, lng: -98.4936 },
  "san antonio, tx":  { lat: 29.4241, lng: -98.4936 },
  "san diego":        { lat: 32.7157, lng: -117.1611 },
  "san diego, ca":    { lat: 32.7157, lng: -117.1611 },
  "dallas":           { lat: 32.7767, lng: -96.7970 },
  "dallas, tx":       { lat: 32.7767, lng: -96.7970 },
  "san jose":         { lat: 37.3382, lng: -121.8863 },
  "san jose, ca":     { lat: 37.3382, lng: -121.8863 },
  "austin":           { lat: 30.2672, lng: -97.7431 },
  "austin, tx":       { lat: 30.2672, lng: -97.7431 },
  "seattle":          { lat: 47.6062, lng: -122.3321 },
  "seattle, wa":      { lat: 47.6062, lng: -122.3321 },
  "denver":           { lat: 39.7392, lng: -104.9903 },
  "denver, co":       { lat: 39.7392, lng: -104.9903 },
  "boston":           { lat: 42.3601, lng: -71.0589 },
  "boston, ma":       { lat: 42.3601, lng: -71.0589 },
  "nashville":        { lat: 36.1627, lng: -86.7816 },
  "nashville, tn":    { lat: 36.1627, lng: -86.7816 },
  "portland":         { lat: 45.5051, lng: -122.6750 },
  "portland, or":     { lat: 45.5051, lng: -122.6750 },
  "san francisco":    { lat: 37.7749, lng: -122.4194 },
  "san francisco, ca":{ lat: 37.7749, lng: -122.4194 },
  "sf":               { lat: 37.7749, lng: -122.4194 },
  "atlanta":          { lat: 33.7490, lng: -84.3880 },
  "atlanta, ga":      { lat: 33.7490, lng: -84.3880 },
  "washington dc":    { lat: 38.9072, lng: -77.0369 },
  "washington, dc":   { lat: 38.9072, lng: -77.0369 },
  "dc":               { lat: 38.9072, lng: -77.0369 },
  "miami":            { lat: 25.7617, lng: -80.1918 },
  "miami, fl":        { lat: 25.7617, lng: -80.1918 },
  "detroit":          { lat: 42.3314, lng: -83.0458 },
  "detroit, mi":      { lat: 42.3314, lng: -83.0458 },
  "minneapolis":      { lat: 44.9778, lng: -93.2650 },
  "minneapolis, mn":  { lat: 44.9778, lng: -93.2650 },
  "salt lake city":   { lat: 40.7608, lng: -111.8910 },
  "salt lake city, ut":{ lat: 40.7608, lng: -111.8910 },
  "las vegas":        { lat: 36.1699, lng: -115.1398 },
  "las vegas, nv":    { lat: 36.1699, lng: -115.1398 },
  "orlando":          { lat: 28.5383, lng: -81.3792 },
  "orlando, fl":      { lat: 28.5383, lng: -81.3792 },
  "charlotte":        { lat: 35.2271, lng: -80.8431 },
  "charlotte, nc":    { lat: 35.2271, lng: -80.8431 }
};

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
let currentListings = [];  // filtered + sorted listings currently shown
let userCoords = null;     // { lat, lng } derived from the location input
let favorites = new Set(); // listing IDs saved to localStorage

// ─────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

function init() {
  loadFavorites();
  currentListings = LISTINGS;
  renderCards(currentListings);
  updateResultsCount(currentListings.length);
  updateFavCount();

  document.getElementById("filterForm").addEventListener("submit", handleSearch);
  document.getElementById("sortBy").addEventListener("change", handleSortChange);
  document.getElementById("clearFilters").addEventListener("click", clearFilters);
  document.getElementById("toggleFavorites").addEventListener("click", openFavoritesModal);
  document.getElementById("modalClose").addEventListener("click", closeFavoritesModal);
  document.getElementById("favoritesModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeFavoritesModal();
  });

  // Mobile filter panel toggle
  document.getElementById("mobileFilterToggle").addEventListener("click", () => {
    document.getElementById("filtersPanel").classList.toggle("open");
  });

  // Geolocation button
  document.getElementById("geoBtn").addEventListener("click", useMyLocation);
}

// ─────────────────────────────────────────────
// SEARCH / FILTER HANDLER
// Async so it can await the Nominatim geocoder.
// ─────────────────────────────────────────────
async function handleSearch(e) {
  e.preventDefault();

  const locationInput = document.getElementById("location").value.trim();
  const btn = document.querySelector(".search-btn");

  if (locationInput && locationInput !== "My Location") {
    btn.textContent = "Searching…";
    btn.disabled = true;
    userCoords = await geocodeLocation(locationInput);
    btn.textContent = "Search Listings";
    btn.disabled = false;

    if (!userCoords) {
      showLocationWarning();
    } else {
      hideLocationWarning();
    }
  } else if (!locationInput) {
    userCoords = null;
    hideLocationWarning();
  }
  // If the field says "My Location", userCoords was already set by useMyLocation()

  const filters = readFilters();
  const filtered = applyFilters(LISTINGS, filters);
  const sortBy = document.getElementById("sortBy").value;
  currentListings = sortListings(filtered, sortBy);

  renderCards(currentListings);
  updateResultsCount(currentListings.length);

  // On mobile, close the filter panel after searching
  document.getElementById("filtersPanel").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleSortChange() {
  const sortBy = document.getElementById("sortBy").value;
  currentListings = sortListings(currentListings, sortBy);
  renderCards(currentListings);
}

// ─────────────────────────────────────────────
// READ FILTER VALUES FROM THE FORM
// ─────────────────────────────────────────────
function readFilters() {
  const checkedFeatures = Array.from(
    document.querySelectorAll('input[name="feature"]:checked')
  ).map((cb) => cb.value);

  return {
    priceMin:   parseNum(document.getElementById("priceMin").value),
    priceMax:   parseNum(document.getElementById("priceMax").value),
    yearMin:    parseNum(document.getElementById("yearMin").value),
    yearMax:    parseNum(document.getElementById("yearMax").value),
    maxMileage: parseNum(document.getElementById("maxMileage").value),
    trim:       document.getElementById("trim").value,
    drivetrain: document.getElementById("drivetrain").value,
    color:      document.getElementById("color").value,
    features:   checkedFeatures,
    radius:     parseNum(document.getElementById("radius").value),
    keywords:   document.getElementById("keywords").value.trim().toLowerCase()
  };
}

function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ─────────────────────────────────────────────
// CLEAR FILTERS
// ─────────────────────────────────────────────
function clearFilters() {
  document.getElementById("filterForm").reset();
  userCoords = null;
  hideLocationWarning();
  currentListings = sortListings(LISTINGS, document.getElementById("sortBy").value);
  renderCards(currentListings);
  updateResultsCount(currentListings.length);
}

// ─────────────────────────────────────────────
// LOCATION PARSING
// Returns { lat, lng } or null if not recognized.
// ─────────────────────────────────────────────
function parseLocation(input) {
  if (!input) return null;
  const key = input.trim().toLowerCase();
  return LOCATION_DB[key] || null;
}

function showLocationWarning() {
  document.getElementById("locationWarning").style.display = "block";
}

function hideLocationWarning() {
  document.getElementById("locationWarning").style.display = "none";
}

// ─────────────────────────────────────────────
// GEOCODING
// Tries the local lookup table first (instant),
// then falls back to Nominatim — the free
// OpenStreetMap geocoder (no API key needed).
// ─────────────────────────────────────────────
async function geocodeLocation(input) {
  const local = parseLocation(input);
  if (local) return local;

  try {
    const params = new URLSearchParams({ q: input, format: "json", limit: "1", countrycodes: "us" });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "Accept-Language": "en-US" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // Network unavailable or rate-limited — fail silently
  }
  return null;
}

// ─────────────────────────────────────────────
// BROWSER GEOLOCATION
// ─────────────────────────────────────────────
function useMyLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  const btn = document.getElementById("geoBtn");
  btn.textContent = "Locating…";
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      document.getElementById("location").value = "My Location";
      hideLocationWarning();
      btn.textContent = "📍 Use my location";
      btn.disabled = false;

      // Re-render immediately with the new coords
      const filters = readFilters();
      const filtered = applyFilters(LISTINGS, filters);
      currentListings = sortListings(filtered, document.getElementById("sortBy").value);
      renderCards(currentListings);
      updateResultsCount(currentListings.length);
    },
    () => {
      btn.textContent = "📍 Use my location";
      btn.disabled = false;
      alert("Location access denied. Please type a city or ZIP code.");
    },
    { timeout: 8000 }
  );
}

// ─────────────────────────────────────────────
// HAVERSINE DISTANCE (miles)
// ─────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ─────────────────────────────────────────────
// FILTERING
// Each active filter must pass. All are optional.
// ─────────────────────────────────────────────
function applyFilters(listings, filters) {
  return listings.filter((listing) => {
    if (filters.priceMin !== null && listing.price < filters.priceMin) return false;
    if (filters.priceMax !== null && listing.price > filters.priceMax) return false;

    if (filters.yearMin !== null && listing.year < filters.yearMin) return false;
    if (filters.yearMax !== null && listing.year > filters.yearMax) return false;

    if (filters.maxMileage !== null && listing.mileage > filters.maxMileage) return false;

    if (filters.trim && listing.trimCategory !== filters.trim) return false;

    if (filters.drivetrain && listing.drivetrain !== filters.drivetrain) return false;

    if (filters.color && listing.colorCategory !== filters.color) return false;

    // All selected feature checkboxes must be present in the listing
    if (filters.features.length > 0) {
      for (const feat of filters.features) {
        if (!listing.features.includes(feat)) return false;
      }
    }

    // Distance filter — only applied when location resolved successfully
    if (filters.radius !== null && userCoords) {
      const dist = haversineDistance(
        userCoords.lat, userCoords.lng,
        listing.lat, listing.lng
      );
      if (dist > filters.radius) return false;
    }

    // Keyword — searches title, trim, color, location, notes, and features
    if (filters.keywords) {
      const haystack = [
        `${listing.year} volvo s60`,
        listing.trim,
        listing.engine,
        listing.color,
        listing.location,
        listing.dealer,
        listing.notes,
        ...listing.features
      ].join(" ").toLowerCase();
      if (!haystack.includes(filters.keywords)) return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────────
// SORTING
// ─────────────────────────────────────────────
function sortListings(listings, sortBy) {
  const copy = [...listings];
  switch (sortBy) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "year-desc":
      return copy.sort((a, b) => b.year - a.year);
    case "mileage-asc":
      return copy.sort((a, b) => a.mileage - b.mileage);
    case "distance-asc":
      if (!userCoords) return copy; // no location — order unchanged
      return copy.sort((a, b) => {
        const dA = haversineDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const dB = haversineDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return dA - dB;
      });
    default:
      return copy;
  }
}

// ─────────────────────────────────────────────
// RENDERING — CARDS
// ─────────────────────────────────────────────
function renderCards(listings, containerSelector = "#listingsGrid") {
  const grid = document.querySelector(containerSelector);

  if (listings.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No listings found</h3>
        <p>Try adjusting your filters or expanding your search radius.</p>
      </div>`;
    return;
  }

  grid.innerHTML = listings.map((l) => buildCardHTML(l)).join("");

  // Attach save-button listeners after injecting HTML
  grid.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      toggleFavorite(id);
      syncSaveButton(e.currentTarget, id);
      updateFavCount();
    });
  });

  // View Listing buttons (mock — show a notice for demo data)
  grid.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const listing = LISTINGS.find((l) => l.id === id);
      if (listing && listing.listingUrl !== "#") {
        window.open(listing.listingUrl, "_blank");
      } else {
        showListingDetail(id);
      }
    });
  });
}

function buildCardHTML(listing) {
  const isFav = favorites.has(listing.id);
  const distance = userCoords
    ? `${haversineDistance(userCoords.lat, userCoords.lng, listing.lat, listing.lng).toLocaleString()} mi away`
    : null;

  // Show up to 3 feature badges; overflow becomes "+N" badge
  const maxBadges = 3;
  const visible = listing.features.slice(0, maxBadges);
  const overflow = listing.features.length - maxBadges;
  const featureHTML =
    visible.map((f) => `<span class="badge">${f}</span>`).join("") +
    (overflow > 0 ? `<span class="badge badge--more">+${overflow}</span>` : "");

  return `
<div class="card" data-id="${listing.id}">
  <div class="card-image" style="background:${colorGradient(listing.colorCategory)}">
    <svg class="car-svg" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,34 L10,20 Q18,10 35,9 L65,9 Q82,10 90,20 L95,34 L95,40 Q95,43 91,43 L85,43 L85,41 L15,41 L15,43 L9,43 Q5,43 5,40 Z"
            fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M37,9 L33,27 L67,27 L63,9 Z"
            fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
      <line x1="50" y1="9" x2="50" y2="27" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
      <circle cx="25" cy="41" r="8" fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>
      <circle cx="25" cy="41" r="3.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="75" cy="41" r="8" fill="rgba(0,0,0,0.28)" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>
      <circle cx="75" cy="41" r="3.5" fill="rgba(255,255,255,0.2)"/>
    </svg>
    <span class="card-color-label">${listing.color}</span>
  </div>
  <div class="card-body">
    <div class="card-header-row">
      <div>
        <div class="card-title">${listing.year} Volvo S60</div>
        <div class="card-trim">${listing.trim}</div>
      </div>
      <div class="card-price">$${listing.price.toLocaleString()}</div>
    </div>
    <div class="card-stats">
      <span>${listing.year}</span>
      <span class="dot">·</span>
      <span>${listing.mileage.toLocaleString()} mi</span>
      <span class="dot">·</span>
      <span>${listing.drivetrain}</span>
    </div>
    <div class="card-location">
      <span class="pin">📍</span>
      <span>${listing.location}</span>
      ${distance ? `<span class="card-distance">${distance}</span>` : ""}
    </div>
    <div class="card-dealer">${listing.dealer}</div>
    <div class="card-badges">${featureHTML}</div>
  </div>
  <div class="card-actions">
    <button class="save-btn ${isFav ? "saved" : ""}" data-id="${listing.id}">
      ${isFav ? "♥ Saved" : "♡ Save"}
    </button>
    <button class="view-btn" data-id="${listing.id}">View Listing →</button>
  </div>
</div>`;
}

// Per-color gradient for the image placeholder area.
// "White" cars get a steel-blue tint so the SVG silhouette is visible
// on what is otherwise a near-white background inside a white card.
function colorGradient(category) {
  const map = {
    white:  "linear-gradient(135deg, #5c7a90 0%, #3a5870 100%)",
    black:  "linear-gradient(135deg, #2a2d35 0%, #16181f 100%)",
    silver: "linear-gradient(135deg, #6b7e8e 0%, #445566 100%)",
    blue:   "linear-gradient(135deg, #1a4a8a 0%, #0d2955 100%)",
    red:    "linear-gradient(135deg, #8a1a1a 0%, #550d0d 100%)"
  };
  return map[category] || "linear-gradient(135deg, #1a2d42 0%, #0d1827 100%)";
}

// ─────────────────────────────────────────────
// LISTING DETAIL MODAL (for mock "#" listings)
// ─────────────────────────────────────────────
function showListingDetail(id) {
  const listing = LISTINGS.find((l) => l.id === id);
  if (!listing) return;

  const modal = document.getElementById("listingDetailModal");
  const content = document.getElementById("listingDetailContent");
  const featureList = listing.features.map((f) => `<li>${f}</li>`).join("");

  content.innerHTML = `
    <div class="detail-header" style="background:${colorGradient(listing.colorCategory)}">
      <span class="card-car-icon" style="font-size:3rem">🚗</span>
    </div>
    <div class="detail-body">
      <h2>${listing.year} Volvo S60 ${listing.trim}</h2>
      <p class="detail-price">$${listing.price.toLocaleString()}</p>
      <div class="detail-grid">
        <div><strong>Engine</strong><span>${listing.engine}</span></div>
        <div><strong>Drivetrain</strong><span>${listing.drivetrain}</span></div>
        <div><strong>Mileage</strong><span>${listing.mileage.toLocaleString()} mi</span></div>
        <div><strong>Color</strong><span>${listing.color}</span></div>
        <div><strong>Location</strong><span>${listing.location}</span></div>
        <div><strong>Dealer</strong><span>${listing.dealer}</span></div>
      </div>
      <div class="detail-features">
        <strong>Features</strong>
        <ul>${featureList}</ul>
      </div>
      <p class="detail-notes">${listing.notes}</p>
      <p class="detail-mock-note">⚠️ This is sample data. In production, "View Listing" would open the real listing page.</p>
    </div>`;

  modal.classList.add("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const detailModal = document.getElementById("listingDetailModal");
  document.getElementById("listingDetailClose").addEventListener("click", () => {
    detailModal.classList.remove("open");
  });
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.classList.remove("open");
  });
});

// ─────────────────────────────────────────────
// FAVORITES — localStorage persistence
// ─────────────────────────────────────────────
function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem("s60finder_favorites") || "[]");
    favorites = new Set(stored);
  } catch {
    favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem("s60finder_favorites", JSON.stringify([...favorites]));
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  saveFavorites();
}

function syncSaveButton(btn, id) {
  const saved = favorites.has(id);
  btn.textContent = saved ? "♥ Saved" : "♡ Save";
  btn.classList.toggle("saved", saved);
}

// ─────────────────────────────────────────────
// FAVORITES MODAL
// ─────────────────────────────────────────────
function openFavoritesModal() {
  const modal = document.getElementById("favoritesModal");
  const grid = document.getElementById("favoritesGrid");

  const favListings = LISTINGS.filter((l) => favorites.has(l.id));

  if (favListings.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <h3>No saved listings</h3>
        <p>Hit the Save button on any listing to bookmark it here.</p>
      </div>`;
  } else {
    renderCards(favListings, "#favoritesGrid");
  }

  modal.classList.add("open");
}

function closeFavoritesModal() {
  document.getElementById("favoritesModal").classList.remove("open");
}

// ─────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────
function updateResultsCount(n) {
  const el = document.getElementById("resultsCount");
  el.textContent = n === 1 ? "1 listing found" : `${n} listings found`;
}

function updateFavCount() {
  document.getElementById("favCount").textContent = favorites.size;
}
