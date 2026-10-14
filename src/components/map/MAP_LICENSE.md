# India Map Vector Geometry — Licensing & Boundary Verification

## 1. Dataset Provenance & Source
- **Asset Name**: Simplemaps Level-1 India Administrative Boundaries SVG
- **Source URL**: `https://simplemaps.com/static/svg/country/in/admin1/in.svg`
- **Distributor**: Simplemaps (Free Resource Library)
- **Geometry Format**: SVG (Scale: 1000 x 1000, 36 paths)

## 2. License Terms
- **Permitted Use**: Free for personal and commercial website use, templates, and applications.
- **Modification**: Modification and optimization for web component rendering permitted.
- **Redistribution Restriction**: May not be redistributed or re-sold as standalone raw map packs or downloadable SVG clip-art libraries.
- **Attribution**: Attribution is recommended and provided in this documentation and web metadata.

## 3. Boundary & Cartographic Verification
- **Territorial Integrity**:
  - The vector dataset represents all 28 States and 8 Union Territories of India.
  - Northern boundaries depict the complete territories of the Union Territory of Jammu & Kashmir and the Union Territory of Ladakh without truncation at ceasefire lines.
  - Eastern boundaries depict Arunachal Pradesh in its entirety.
  - Island territories of Andaman & Nicobar and Lakshadweep are fully mapped.
  - Reflects the 2020 merger of Dadra & Nagar Haveli and Daman & Diu (`IN-DH`).

## 4. State Identifiers & Standards
- State and Union Territory identifiers in `indiaMapGeometry.js` are mapped to canonical ISO 3166-2:IN codes:
  - `IN-AN`, `IN-AP`, `IN-AR`, `IN-AS`, `IN-BR`, `IN-CH`, `IN-CT`, `IN-DH`, `IN-DL`, `IN-GA`
  - `IN-GJ`, `IN-HP`, `IN-HR`, `IN-JH`, `IN-JK`, `IN-KA`, `IN-KL`, `IN-LA`, `IN-LD`, `IN-MH`
  - `IN-ML`, `IN-MN`, `IN-MP`, `IN-MZ`, `IN-NL`, `IN-OR`, `IN-PB`, `IN-PY`, `IN-RJ`, `IN-SK`
  - `IN-TG`, `IN-TN`, `IN-TR`, `IN-UP`, `IN-UT`, `IN-WB`

## 5. Limitations & Legal Disclaimer
- **Not an Official Survey of India Endorsement**: This vector map is a simplified digital visualization intended solely for web navigation and locating project records. It does not constitute an official cartographic publication or legal survey clearance by the Survey of India or the Government of India.
- **No Boundary Disputes Asserted**: The depiction of borders is for informational reference only.

## 6. Projection Calibration (Phase B investigation)
- **Finding**: The geometry uses a **Mercator** projection. Fitting known state extents gives equal horizontal and vertical scale (≈27.38 SVG units per degree of longitude), which is what Mercator should produce.
- **Calibration** (least-squares fit against 39 reference extents of Gujarat, Arunachal Pradesh, Tamil Nadu, Goa, Delhi, Tripura, Sikkim, Kerala, Rajasthan, West Bengal, Odisha and Punjab):
  - `x = 27.3816 × longitude − 1767.155`
  - `y = −27.3492 × mercatorY(latitude) + 1138.898`, where `mercatorY(φ) = ln(tan(π/4 + φ/2))` expressed in degrees
  - Residuals: RMS ≈ 0.57 units (≈ 2 km), max ≈ 2.5 units (≈ 10 km). That is accurate enough for city-level markers.
- **Status**: City markers are **pending**. The reference extents were approximate public values, used only to test this fit. No city coordinates are stored in the codebase. Before any marker is rendered, verified latitude/longitude must be supplied for each city in `src/data/presenceCoverage.js`, and the fit must be re-checked.
