# Presence map boundary build

These scripts generate `src/data/geo/states/IN-XX.js`: district lines and verified city areas for each coverage state, already projected into the `/presence` map's SVG units. The website itself never runs them, and no mapping library ships with the site.

## Requirements (build time only)

```bash
npm install --no-save polygon-clipping@0.15.7
```

## Inputs (download into one data folder; not committed)

| File | Source | Licence |
| --- | --- | --- |
| `ind_adm2_simplified.geojson` | geoBoundaries gbOpen IND ADM2 (2021) | ODbL 1.0 |
| `city_nominatim.json` | output of `city_nominatim.mjs` (OpenStreetMap via Nominatim) | ODbL 1.0 |
| `pune_answerquest.geojson` | github.com/answerquest/pune-2022-wards | MIT |
| `datameet/Vadodara_vardodara_wards.geojson` | github.com/datameet/Municipal_Spatial_Data (Vadodara) | CC BY 4.0 |
| `datameet/Ahmedabad_Wards.geojson` | github.com/datameet/Municipal_Spatial_Data (Ahmedabad) | CC BY-SA 2.5 India; any state file that includes it is marked ShareAlike automatically |
| `ne/ne_10m_urban_areas.geojson` | Natural Earth 10m Urban Areas (github.com/nvkelso/natural-earth-vector) | Public domain |
| `taranagar_buildup.geojson` | output of `buildup_footprint.mjs` run on the Microsoft Global ML Building Footprints India tile `123121212` | ODbL 1.0 |

## Steps

```bash
node scripts/geo/city_nominatim.mjs . <data>/city_nominatim.json
```
```bash
node scripts/geo/buildup_footprint.mjs <tile.csv.gz> 28.6708 75.0361 <data>/taranagar_buildup.geojson
```
```bash
node scripts/geo/build_geography.mjs . <data>
```

`city_nominatim.mjs` only proposes OpenStreetMap candidates. A candidate must contain the city's approved reference point (`src/data/cityCoordinates.js`), must not be a district, tehsil or taluka, and must have a plausible area. It is used only after it is added to `CITY_SOURCES` in `build_geography.mjs`. That build fails if any listed city outline does not contain its reference point or has an implausible area.

## Adding a verified city boundary

1. Obtain the boundary from a source whose licence permits website use, and record the source and licence.
2. Add an entry for `'<stateCode>|<City>'` to `CITY_SOURCES`, with `kind` set to `municipal`, `municipal-equivalent` or `osm-place-area`.
3. Re-run the build, then update `src/data/geo/SOURCES.md`.

The map components need no changes.
