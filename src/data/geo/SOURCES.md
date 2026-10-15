# Presence map geography — sources and coverage status

Generated modules: `states/IN-XX.js`, built by `scripts/geo/` (see its README). The geometry is projected with `src/lib/mapProjection.js`, the same calibrated Mercator fit used for the state outlines and city markers.

## Datasets

| Layer | Dataset | Origin | Licence | Attribution shown on map |
| --- | --- | --- | --- | --- |
| State outlines | Simplemaps India admin-1 SVG | Simplemaps | See `src/components/map/MAP_LICENSE.md` | — |
| District lines (11 coverage states) | geoBoundaries gbOpen IND ADM2, 2021 | Pathways Data Pvt. Ltd. / Local Government Directory (lgdirectory.gov.in) | ODbL 1.0 | "District boundaries: geoBoundaries / LGD (ODbL)" |
| City areas (OSM) | OpenStreetMap administrative or `place=city` polygons | OpenStreetMap contributors | ODbL 1.0 | "City locations and areas © OpenStreetMap contributors (ODbL)" |
| Pune city area | Pune 2022 electoral wards (union) | Nikhil VJ, github.com/answerquest/pune-2022-wards (traced from PMC ward maps) | MIT | Notice kept here |
| Vadodara city area | Vadodara administrative wards (union) | DataMeet Municipal Spatial Data, sourced from the Vadodara Municipal Corporation website | CC BY 4.0 | Shown under the map while Vadodara is selected |
| Ahmedabad city area | Ahmedabad Municipal Corporation wards (union of 48) | DataMeet Municipal Spatial Data, digitised from an AMC Google My Map | **CC BY-SA 2.5 India** | Shown under the map while Ahmedabad is selected |
| Approximate urban footprints (15 cities) | Natural Earth 10m Urban Areas (satellite-derived, early 2000s) | Natural Earth | Public domain | Credited under the map while one of these cities is selected |
| Taranagar urban footprint | Derived from Microsoft Global ML Building Footprints (2026-02 release, India tile 123121212) | Microsoft | ODbL 1.0 | Credited under the map while Taranagar is selected |

### ShareAlike notice: `states/IN-GJ.js`

The site owner approved the Ahmedabad boundary for use under CC BY-SA 2.5 India. Because `states/IN-GJ.js` adapts that data, **the whole file is licensed under [CC BY-SA 2.5 India](https://creativecommons.org/licenses/by-sa/2.5/in/)**. Its header carries the notice, and its `licence` field records the same terms in machine-readable form.

Its other components keep their own terms as well: the district lines remain ODbL 1.0, and Vadodara remains CC BY 4.0. Anyone redistributing that file or an adaptation of it must keep the notice and the licence. The other state files contain no ShareAlike data.

District data reflects 2021 boundaries. Later reorganisations are not shown, for example the Rajasthan district changes of 2023–2024.

## City-area outlines (27 of 27 approved cities)

**Types:**
- **official:** a municipal limit, or its exact equivalent.
- **approximate:** an OpenStreetMap city area or a derived urban footprint.

Approximate outlines are drawn dashed on the map and carry a note saying they are not official boundaries.

**Confidence** is how well the outline represents the city's urban area:
- **high:** an official limit.
- **medium:** a curated city area, or a recent building-derived footprint.
- **low:** a coarse, older satellite footprint. It is good enough to place and visualise the city, but its edges are rough and may undercount recent growth.

| State | City | Type | Kind | Confidence | Area | Source | Licence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rajasthan | Jaipur | official | municipal | high | 393 km² | OSM relation/7923743, Jaipur Municipal Corporation | ODbL 1.0 |
| Rajasthan | Jodhpur | approximate | osm-place-area | medium | 118 km² | OSM way/31725312, `place=city` area | ODbL 1.0 |
| Rajasthan | Udaipur | approximate | urban-footprint | low | 136 km² | Natural Earth urban area | Public domain |
| Rajasthan | Kota | approximate | urban-footprint | low | 179 km² | Natural Earth urban area | Public domain |
| Rajasthan | Bikaner | approximate | urban-footprint | low | 70 km² | Natural Earth urban area | Public domain |
| Rajasthan | Sikar | approximate | urban-footprint | low | 89 km² | Natural Earth urban area | Public domain |
| Rajasthan | Jhunjhunu | approximate | urban-footprint | low | 66 km² | Natural Earth urban area | Public domain |
| Rajasthan | Taranagar | approximate | urban-footprint | medium | 8 km² | Derived from Microsoft building footprints (100 m grid, ≥3 buildings per cell, 200 m gap closing, area containing the reference point) | ODbL 1.0 |
| Maharashtra | Mumbai | official | municipal-equivalent | high | 513 km² | Mumbai City + Mumbai Suburban districts (= MCGM), geoBoundaries/LGD | ODbL 1.0 |
| Maharashtra | Pune | official | municipal | high | 522 km² | PMC 2022 electoral wards (answerquest/pune-2022-wards) | MIT |
| Maharashtra | Nagpur | official | municipal | high | 212 km² | OSM relation/12969115, Nagpur City | ODbL 1.0 |
| Maharashtra | Nashik | approximate | urban-footprint | low | 191 km² | Natural Earth urban area | Public domain |
| Maharashtra | Chhatrapati Sambhaji Nagar | approximate | urban-footprint | low | 265 km² | Natural Earth urban area | Public domain |
| Maharashtra | Akola | approximate | urban-footprint | low | 102 km² | Natural Earth urban area (the OSM municipal polygon, ~8 km², was rejected as incomplete) | Public domain |
| Maharashtra | Nanded | approximate | urban-footprint | low | 82 km² | Natural Earth urban area | Public domain |
| Maharashtra | Latur | approximate | urban-footprint | low | 66 km² | Natural Earth urban area | Public domain |
| Gujarat | Ahmedabad | official | municipal | high | 451 km² | AMC wards via DataMeet (from an AMC Google My Map) | CC BY-SA 2.5 IN |
| Gujarat | Vadodara | official | municipal | high | 161 km² | VMC wards via DataMeet (older 12-ward limits) | CC BY 4.0 |
| Chhattisgarh | Raipur | approximate | urban-footprint | low | 95 km² | Natural Earth urban area | Public domain |
| Chhattisgarh | Bilaspur | approximate | urban-footprint | low | 54 km² | Natural Earth urban area | Public domain |
| West Bengal | Kolkata | official | municipal | high | 201 km² | OSM relation/9381363 | ODbL 1.0 |
| West Bengal | Siliguri | approximate | osm-place-area | medium | 47 km² | OSM way/22826546, `place=city` area | ODbL 1.0 |
| Bihar | Patna | approximate | osm-place-area | medium | 137 km² | OSM way/383774533, `place=city` area | ODbL 1.0 |
| Jharkhand | Ranchi | approximate | urban-footprint | low | 70 km² | Natural Earth urban area | Public domain |
| Odisha | Bhubaneswar | official | municipal | high | 148 km² | OSM relation/7901215, Bhubaneswar Municipal Corporation | ODbL 1.0 |
| Assam | Guwahati | approximate | urban-footprint | low | 131 km² | Natural Earth urban area | Public domain |
| Goa | Panaji | approximate | urban-footprint | low | 6 km² | Natural Earth urban area (city core only; smaller than the corporation area) | Public domain |

Uttar Pradesh has no approved city, so it has no city outline. Every outline contains its city's approved reference point and lies inside its state; the build fails otherwise. No district or tehsil boundary is used as a city outline. Mumbai's outline is the documented equivalence between two districts and the Municipal Corporation of Greater Mumbai, and it is labelled as such. If a future city has no outline, the map falls back to a view of about 60 km around its reference point and says so.

### Upgrading an approximate outline

Replace its entry in `scripts/geo/build_geography.mjs` with an official municipal or ward source, rebuild, and update this table. No component changes are needed.
