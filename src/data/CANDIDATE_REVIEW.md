# Candidate project locations — review workflow (internal)

`candidateProjectLocations.js` lists **potential** Arham project sites: ALLEN campuses in Kota and Jaipur. **None is a confirmed Arham project.** ALLEN being at an address is not evidence that Arham worked there.

**Public use (site-owner decision, 2026-10-15).** `src/pages/Presence.jsx` is the only importer. In the Kota and Jaipur city panels it lists each record's **name and supplied address** under "ALLEN campus locations", with the note that Arham's work at these campuses has not been confirmed.

Those entries:
- are not counted as projects;
- have no map pins and need no coordinates;
- open no project details.

The file is still never part of `projects.js`, the project selectors, the map component, the gallery or the homepage. `scratch/test_candidate_locations.js` enforces this. The JavaScript bundle includes the whole module, notes included, so the internal notes can be downloaded even though they aren't displayed.

## Statuses

```
UNVERIFIED ──► PENDING_REVIEW ──► APPROVED
     │               │
     └───────────────┴──────────► REJECTED
```

| Status | Meaning |
| --- | --- |
| `UNVERIFIED` | Supplied address recorded; the building is not yet located or confirmed. |
| `PENDING_REVIEW` | The location has evidence (official address and/or a mapped feature) and awaits human review. |
| `APPROVED` | A reviewer has confirmed **all** approval conditions below. Terminal for this draft. |
| `REJECTED` | Not an Arham project, duplicate, or location unresolvable. Terminal. |

A reviewer may also move `PENDING_REVIEW` back to `UNVERIFIED` when new doubts arise. `canTransition(from, to)` in the data file encodes these rules. It only answers yes or no; it publishes nothing.

## Location fields

- `coordinates` is set only when a mapped feature explicitly named for that campus sits where the official address or landmark places it.
  - `precision: 'building'` means a named building outline.
  - `precision: 'point'` means a named point; the exact building is unconfirmed.
- `locationVerification` is one of `building`, `point`, `ambiguous` or `not-located`.
- `ambiguous: true` means more than one building could match, for example Sankalp's two conflicting features, the Sangyan and Samyak second buildings, or Satyarth with no plot number. The coordinates stay `null` until this is resolved.
- `locationCandidates` holds mapped features that were found but not accepted.
- City-centre or street-level coordinates are never used.

## Conditions for APPROVED (all required)

1. **Arham's work is confirmed:** written confirmation from Arham management, ideally a work order or completion record, that Arham carried out electrical wiring or lighting work at this building.
2. **Permission to publish:** permission from the client (ALLEN) and Arham to name the site and publish details, or a decision to mark it `isClientConfidential`.
3. **Photographs:** real project photographs, with permission to publish them.
4. **Verified location:** the building location is verified, by site visit or official confirmation, with `coordinates.precision === 'building'`.
5. **Recorded review:** the reviewer's name and date are recorded in the record's `notes`.

## After approval (manual, separate change)

An approved candidate is **not** shown anywhere automatically. A developer creates a new record in `src/data/projects.js` by hand:
- using the approved name, the actual scope of work, the photographs and the verified building `coordinates`;
- with `status: 'draft'` first, moving to `'published'` only after management sign-off, per the policy in `projects.js`.

That record must pass `scratch/test_project_discovery.js` and the data validation. The candidate record stays here as the audit trail.

There is deliberately no code path that converts or publishes candidates.

## Research log (2026-10-15)

- **Official addresses:** ALLEN contact pages for Kota (`allen.ac.in/delhi/contactus.asp?cent=kota`) and Jaipur (`...?cent=jaipur`). Their "Locate in MAP" links are placeholders, so they give no coordinates.
- **Mapped features:** OpenStreetMap via Nominatim (ODbL). Only features explicitly named for a campus were considered.
- **Third-party listings** (TargetStudy) were used only where ALLEN's official page does not list a campus. Those records are `UNVERIFIED`.
