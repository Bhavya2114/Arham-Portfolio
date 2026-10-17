# Arham Power Solutions website: content and structure review

Reviewed on `main` at `9ee05a6`, on 17 Oct 2026. This is a review only: no code was changed.

**How it was measured:** the production build on a 390 px wide phone (844 px tall screen). A "screen" below means one phone screen (844 px). Every page ends with the same footer, which is **1,145 px tall on a phone (about 1.4 screens)**, and that is included in the page lengths.

**What the site has to do:**
1. Show past work across India, with the interactive map as the centrepiece.
2. Build trust.
3. Get enquiries by call, WhatsApp or the form.

Most visitors are on phones.

---

## 0. The short version

The site looks good, but right now it **cannot do its job**:

- **It cannot get enquiries.** The enquiry form sends nothing. After submitting, visitors are told their enquiry "has **not** been saved … or transmitted". The phone and WhatsApp number is a placeholder (`7878787878`). The email is a generic `arham@gmail.com`. On a phone, the header has no call, WhatsApp or "Enquire" button: the Enquire button is hidden below 640 px wide.
- **It doesn't show real work.** All 5 photos are labelled stock ("Illustrative Visualization"). The Projects page has 0 projects. Tapping any city on the map shows the same 8 ALLEN campuses in Kota, so Patna and Guwahati show Kota coaching centres.
- **The map isn't the centrepiece.** On the homepage it is the 5th section, about **9.2 phone screens down** (7,791 px). In the nav it is item 5 of 6, after a separate "Projects" page that is empty.
- **Disclaimers undermine trust.** About 20 notices say the content is provisional, illustrative, unverified or pending. Examples: "Provisional Category", "Subject to confirmation", "Scope Disclosure", "Project Documentation Notice", "Automated enquiry delivery remains unconfigured pending executive routing decisions".
- **It's too long and too corporate for a phone.** The homepage is **13.3 screens** long. Headings like "Dedicated Engineering Precision in Electrical & Lighting Infrastructure" say little to a building owner. The About and Services pages repeat the same three services that the homepage shows twice.
- **The brand name is wrong.** "Arham Power Solutions" appears nowhere. The logo, page titles and share previews say "Electrical & Lighting" or "Electrical Engineering, Contracting & Lighting Solutions".

---

## 1. Page inventory

### 1.0 On every page

| Part | Content | Notes |
|---|---|---|
| **Header** (81 px) | Logo "ARHAM •" with the line "ELECTRICAL & LIGHTING" under it. Desktop nav: Home · About · Services · Projects · Our Work · Contact, plus a yellow **Enquire Now** button. | **Phone:** logo and menu icon only. *Enquire Now* is hidden below 640 px (`hidden sm:block`), so a phone visitor sees **no call, WhatsApp or enquire option** without opening the menu. |
| **Mobile menu** | The 6 links, each with an "Active" badge; Enquire Now at the bottom. | Every link shows the "Active" badge, which reads like a status label and adds noise. |
| **Footer** (1,145 px on a phone) | Logo plus "ELECTRICAL & LIGHTING". "Arham specializes in electrical engineering, industrial infrastructure wiring, and architectural lighting solutions…". An "Engineering & Contracting" chip. **Navigation** (6 links). **Core Capabilities** (5 items, including "Substation & Cabling Installations" and "Commercial Lighting Design & Automation", which appear nowhere else). **Contact & Inquiries**: Borkheda, Kota, Rajasthan · arham@gmail.com · 7878787878 + WhatsApp · 9 AM – 6 PM. "* Official direct telephone, WhatsApp, and office coordinates verified for commercial project consultations." "© 2026 Arham." Bottom line: "Electrical Infrastructure • Lighting Solutions • **Standalone Foundation**". | "Standalone Foundation" means nothing to a visitor (it's a leftover). The "* …verified…" footnote is placeholder-style text sitting next to placeholder contact details. On a phone the footer is 1.4 screens. |

### 1.1 Home `/`: 11,246 px ≈ **13.3 phone screens**

| # | Section (position) | Eyebrow / heading / subheading | Content summary | Buttons and links | Images | Disclaimers and placeholders |
|---|---|---|---|---|---|---|
| 1 | **Hero** (0–1,071 px, about 1.2 screens) | Eyebrow "Electrical Engineering & Lighting Solutions". **H1 "High-Precision Electrical Infrastructure & Architectural Lighting"** | One long sentence about specialized electrical engineering, industrial infrastructure wiring, power distribution and architectural lighting; two small ticks: "Commercial & Industrial Contracting", "Code-Compliant Engineering Standards". | **Explore Our Projects** → `#projects` (the stock-photo section on this page, not real projects). **Discuss Your Project** → scrolls to the form. | `hero-architecture.jpg`: night photo of a glass office building. **Stock**, with the chip "Architectural Illumination". | Caption: "**Illustrative Visualization:** Modern commercial infrastructure and lighting. Verified project photography will be featured upon corporate verification." |
| 2 | **About intro** `#about` (1,071–3,407 px, **2.8 screens**) | Eyebrow "About Arham". **H2 "Dedicated Engineering Precision in Electrical & Lighting Infrastructure"**. Sub-block **H3 "CORE TECHNICAL CAPABILITIES"** with 3 cards: Electrical Infrastructure & Wiring · Power Distribution & Engineering Systems · Architectural & Commercial Lighting | Two long corporate paragraphs, then the 3 capability cards. | **Read Full Company Profile** → /about. **Explore Services & Scope** → /services. | `about-engineering.jpg`: switchgear control room. **Stock**, chip "Power Distribution & Controls". | "**Illustrative Technical Visualization:** … Official facility photography will be cataloged upon corporate verification." · "* **Provisional business categories subject to official company confirmation.**" · each card: "**Provisional Category**" |
| 3 | **Services overview** `#services` (3,407–5,466 px, **2.4 screens**) | Eyebrow "Our Capabilities". **H2 "Electrical Solutions Built Around Your Project"** | Intro paragraph; 3 service cards (the same 3 services as section 2) with numbered icons; a "**Detailed Scope & Execution Methodology**" strip. | **Explore All Services & Scope** → /services | none | Each card: "**Provisional Category**" + "**Subject to confirmation**". Box: "**Scope Disclosure:** Capability categories and service scopes outlined above represent provisional business domains… subject to formal confirmation by company management prior to publication." |
| 4 | **Project preview** `#projects` (5,466–7,791 px, **2.8 screens**) | Eyebrow "Selected Projects". **H2 "A Closer Look at Our Work"** | 3 photo cards (Electrical Infrastructure · Power Distribution · Architectural Lighting): the **same 3 services a third time**. A "Geographic Project Locations" strip: "Explore planned geographic mapping … once company location data is confirmed." | **View Project Gallery** → /projects (empty). **Explore Our Presence** → `#presence` (the teaser below). | `project-infrastructure.jpg`, `project-distribution.jpg`, `project-lighting.jpg`. All **stock**; alt text starts "Illustrative…". Each has an "Illustrative Visualization" tag. | Intro: "Verified project records … will be published upon corporate verification." · "**Project Documentation Notice:** The photographs presented above provide illustrative visual representations…" · the strip says map data is "planned" and "once … confirmed", **contradicting the live map** right below it. |
| 5 | **India map teaser** `#presence` (**starts at 7,791 px ≈ 9.2 screens down**; 830 px) | **H2 "Our work across India"** | "Electrical wiring and lighting projects in cities across the country." Stats **27+ Cities · 10 States**. | **Explore our work** → /presence; the map image also links to /presence. | `presence-overview.png/.webp`: static render of the real map (transparent). **Real.** | "10 States": the data has 11 states, but Uttar Pradesh has no cities, so 10 states have cities. Decide which number to show (see §2). |
| 6 | **Enquiry** `#contact` (8,621–10,101 px, 1.75 screens) | Eyebrow "Commercial Consultation". **H2 "Ready to Discuss Your Project Requirements?"** | Sub: "Connect with our electrical engineering and lighting team to discuss facility drawings, power distribution requirements, or tender specifications." 7-field form: Full name*, Company, Business email*, Phone (optional!), Enquiry category*, Site location, Project scope*. | **Formulate Commercial Enquiry** | none | "Submit your project scope … strict client nondisclosure and confidentiality standards." · "* Validating this form prepares your enquiry draft directly without third-party tracking cookies…" · "* … **Automated enquiry delivery remains unconfigured pending executive routing decisions.**" · **On submit:** a box headed "**Channel Awaiting Activation** / Form Validated — Delivery Channel Pending Corporate Activation … your personal enquiry has **not** been saved to a server or transmitted". |
| | Footer | | | | | |

### 1.2 About `/about`: 7,005 px ≈ **8.3 screens**

| # | Section | Eyebrow / heading | Content | Buttons | Images | Disclaimers |
|---|---|---|---|---|---|---|
| 1 | Page hero (417 px) | Breadcrumb Home / About. Eyebrow "Company Profile & Principles". **H1 "Engineering Precision, Code Compliance & Contracting Integrity"** | One sentence: "Arham is an electrical engineering and contracting firm focused on…" | breadcrumb only | none | none |
| 2 | Intro (1,058 px) | **H2 "Delivering Resilient Infrastructure for Modern Facilities"** | Two long paragraphs (the "backbone of facility operations" copy, close to Home §2). | none | `about-engineering.jpg`: **stock, the same photo as Home §2**. Chip "Engineering & Contracting". | "**Corporate Verification Standard:** Arham maintains a policy of verifiable transparency. We do not publish speculative operational statistics, unconfirmed years, or fabricated client testimonials…" · "**Illustrative Technical View:** … Official site documentation is cataloged upon corporate verification." |
| 3 | Disciplines (1,210 px) | **H2 "Primary Contracting Disciplines"**, sub "Our engineering scope encompasses three distinct but interconnected areas…" | The **same 3 services**, for the 4th time on the site. | none | none | Each card: "Core Discipline" badge |
| 4 | Process (990 px) | Eyebrow "Execution Methodology". **H2 "Structured Project Delivery Process"** | 4 steps: 01 Site Review & Specification Assessment · 02 Containment & Raceways Execution · 03 Panel Positioning & Circuit Termination · 04 Pre-Commissioning Testing & Handover. Heavy jargon (SLD, raceways, LOTO). | none | none | none |
| 5 | Commitments (1,373 px) | **H2 "Quality, Safety & Client Trust Commitments"**, sub "How we establish dependable client relationships through verified practices rather than speculative marketing claims." | 4 cards: Site Safety & Regulatory Compliance · Client Confidentiality & Discretion · **Authenticated Project Records** ("Every published case study in our gallery corresponds to verified work orders…": **the gallery is empty**) · Single-Point Engineering Coordination. | none | none | The "Authenticated" claim points to an empty gallery. |
| 6 | CTA card (459 px) | Eyebrow "Verified Portfolio". **H2 "Inspect Our Authenticated Projects & Case Studies"** | "Review our published installation profiles… Each published profile is filtered for client confidentiality and authenticated…" | **View Project Gallery** → /projects (empty) · **Discuss a Project** → /#contact | none | The whole card promotes an empty gallery. |

### 1.3 Services `/services`: 6,681 px ≈ **7.9 screens**

| # | Section | Eyebrow / heading | Content | Buttons | Images | Disclaimers |
|---|---|---|---|---|---|---|
| 1 | Page hero (417 px) | Eyebrow "Engineering Capabilities & Scope". **H1 "Specialized Electrical Engineering & Lighting Capabilities"** | "Contracting capabilities encompassing industrial cable raceways, high and low tension power distribution switchboards…" | breadcrumb | none | none |
| 2 | Service 1 `#infrastructure` (1,042 px) | Eyebrow "Cabling & Containment". **H2 "Electrical Infrastructure & Industrial Cabling"**, then "KEY INSTALLATION SCOPE & ACTIVITIES:" bullets | Description plus a scope list. | **View Projects in This Category** → /projects (empty, and not filtered) · **Enquire for Project** → /contact?service=infrastructure | `project-infrastructure.jpg`: **stock** | "**Illustrative Visualization:** Technical engineering scope representation. Official client installations are archived in the gallery." (They aren't.) |
| 3 | Service 2 `#distribution` (1,016 px) | "Panels & Distribution". **H2 "HT/LT Power Distribution & Switchboards"** | same pattern | same pattern | `project-distribution.jpg`: **stock** | same caption |
| 4 | Service 3 `#lighting` (1,042 px) | "Commercial Lighting". **H2 "Architectural & Commercial Lighting Solutions"** | same pattern | same pattern | `project-lighting.jpg`: **stock** | same caption |
| 5 | Quality (1,014 px) | **H2 "Quality, Safety & Engineering Compliance Standards"** | 3 cards: Statutory Safety & Code Compliance · Specification Adherence · Quality Testing & Inspection. Overlaps About §5 and About §4 step 04. | none | none | none |
| 6 | CTA card (432 px) | Eyebrow "Project Consultation". **H2 "Discuss Your Facility's Electrical Requirements"** | "…our engineering team is ready to review project drawings and specifications." | **Inquire About a Project** → /contact · **Inspect Project Gallery** → /projects (empty) | none | none |

### 1.4 Projects `/projects`: 3,167 px ≈ **3.8 screens** (0 projects)

| # | Section | Eyebrow / heading | Content | Buttons | Disclaimers |
|---|---|---|---|---|---|
| 1 | Page hero (385 px) | Eyebrow "Corporate Portfolio". **H1 "Engineering Projects & Installation Showcase"** | "Explore Arham's authenticated track record… Every showcased case study adheres to company verification…" | breadcrumb | Promises a track record that the page doesn't show. |
| 2 | Filter panel | "FILTER PORTFOLIO" · "**Awaiting Publication (0 records)**" | Category chips (All · Power Infrastructure · HT/LT Distribution · Architectural Lighting) plus "All States (0)" and "All Cities (0)" drop-downs. | chips | Filters with nothing to filter. |
| 3 | Empty state | Badge "**Portfolio In Preparation**". **H2 "Project Portfolio Under Authentication & Curation"** | "Arham's project case studies are currently undergoing rigorous authentication… will be published here upon executive authorization." | **Explore Geographic Presence** · **Inquire Directly** | The whole section is a "not ready" notice. |
| 4 | Map CTA card (404 px) | Eyebrow "Regional Execution Footprint". **H2 "Explore Projects Region by Region"** | "Navigate our interactive state-by-state administrative map to inspect verified municipal project hubs…" | **Open Regional Map** → **`/#presence`** (the homepage teaser, **not** the map page) · **Discuss a Project** → /#contact | "verified municipal project hubs" isn't true. |

Images: none.

### 1.5 Our Work `/presence`: 2,233 px ≈ **2.6 screens** (the map)

| # | Section | Eyebrow / heading | Content | Buttons | Images | Notes |
|---|---|---|---|---|---|---|
| 1 | Map hero (81–836 px) | Eyebrow "OUR WORK". **H1 "Where We've Worked"** | "Explore the cities where Arham has delivered electrical wiring and lighting projects." Tag line "Interactive map · Project locations · Electrical and lighting work". Hint chip "Tap a highlighted state to explore". **Map: 372–772 px, fully visible on the first phone screen.** | Tapping a state shows its cities in a bottom sheet (phone) or side panel (desktop). Tapping a city shows its project cards. Pinch-zoom works. "Map data" credits sit behind a button. | The map is live SVG. **Project cards show the same 8 placeholder "ALLEN … Campus, Kota / Coaching centre / Complete wiring · 2022" items with one ALLEN photo, for every city in every state.** | The cards are the biggest truth problem on the site: a visitor tapping *Patna* sees Kota campuses. |
| 2 | "Project showcase" strip (251 px) | **H2 "Project showcase"** | "Project case studies with photographs are being prepared and will appear here once approved for publication." | **Discuss a project** → /contact | none | A placeholder notice under the centrepiece. |

Page title: "Our Presence — ARHAM Electrical & Lighting Installations". The page is named three ways: "Our Presence" (title), "Our Work" (nav) and "Where We've Worked" (H1).

### 1.6 Contact `/contact`: 3,796 px ≈ **4.5 screens**

| # | Section | Eyebrow / heading | Content | Buttons | Disclaimers |
|---|---|---|---|---|---|
| 1 | Page hero (359 px) | Eyebrow "Commercial Inquiries". **H1 "Commercial Inquiries & Project Coordination"** | "Connect with our electrical engineering and contracting team to discuss facility electrification, HT/LT switchgear distribution, tender submissions…" | breadcrumb | none |
| 2 | Form card | **H2 "Initiate a Project Consultation"** | "Provide your technical requirements below. We review single-line diagrams, containment specifications, and project schedules." The same 7-field form as Home. | **Formulate Commercial Enquiry** | The same nondisclosure, "Validating this form…" and **delivery-not-configured** notices as Home. Submitting shows "Channel Awaiting Activation". |
| 3 | Contact card | **H2 "CORPORATE COORDINATES"** | Direct Telephone / Mobile **7878787878** · WhatsApp Business **7878787878** · Commercial Inquiries **arham@gmail.com** · Registered Corporate Office **Borkheda, Kota, Rajasthan, India** · Operational Hours **9 AM – 6 PM** | tel:, wa.me/917878787878, mailto: | The phone/WhatsApp number is a **placeholder**. On a phone this card sits **below the whole form**, about 2 screens down. |
| 4 | Tender card | **H3 "TENDER & RFP SUBMISSIONS"** | "For commercial tenders, bill-of-quantities (BOQ) estimations, and formal electrical contracting RFPs, please ensure drawing packages include single-line diagrams…" | **Inspect Authenticated Portfolio** → /projects (empty) | none |
| 5 | Privacy box | "**Privacy Assurance:** Arham does not distribute or sell commercial enquiry details…" | | | Corporate tone. |

Images: none. There is no office map, no directions and no address link.

### 1.7 Project detail `/projects/:id`: 1,947 px ≈ 2.3 screens (always "not found": there are 0 projects)

| Section | Content |
|---|---|
| Not-found state | Icon. Badge "**Record Status: Not Found or Unverified**". **H1 "Project Profile Not Available"**. "The requested project identifier (unknown-id) does not correspond to an active, publicly released project record." "Project profiles are published exclusively after rigorous authentication against executive work orders and client nondisclosure requirements." Buttons **Back to Project Gallery** → /projects · **Explore Regional Map** → **`/#presence`** (homepage, not the map page). |

When projects exist, the template has a photo area (patterned placeholder), "Authenticated Record" / "Authenticated" labels, project facts and enquiry buttons. None of it is reachable today.

### 1.8 404 `*`: 1,769 px ≈ 2.1 screens

| Section | Content |
|---|---|
| 404 | Logo ("ELECTRICAL & LIGHTING"). **H1 "Route Not Found"**. "The requested URL path does not correspond to an active page on the Arham corporate website." Buttons **Return Home** → / · **View Projects** → /projects (empty). |

### 1.9 Every place the old brand name appears ("Arham Power Solutions" appears nowhere)

| Where | Current text |
|---|---|
| Logo (header, footer, 404), `src/components/ui/BrandLogo.jsx:57` | "ELECTRICAL & LIGHTING" under "ARHAM" |
| Logo accessible name, `BrandLogo.jsx:33` | "ARHAM — Electrical, Wiring and Lighting" |
| Browser tab, `index.html:7` | "ARHAM — Electrical Engineering, Contracting & Lighting Solutions" |
| Share previews (WhatsApp, LinkedIn, X), `index.html:14,24` (og:title, twitter:title) | same as above |
| Home page title, `src/pages/Home.jsx:15` | same as above |
| /presence page title, `src/pages/Presence.jsx:38` | "Our Presence — ARHAM Electrical & Lighting Installations" |
| Other page titles | "About Arham \| Electrical Engineering, Contracting & Lighting" · "Services & Engineering Capabilities \| Arham" · "Project Gallery & Installation Case Studies \| Arham" · "Contact & Commercial Inquiries \| Arham" · "Project Record Not Found \| Arham" · "Page Not Found (404) \| Arham" |
| Footer, `Footer.jsx:32,169,176` | "Engineering & Contracting" chip · "© 2026 Arham." · "Standalone Foundation" |
| Home hero eyebrow, `src/sections/Hero.jsx` | "Electrical Engineering & Lighting Solutions" |
| Home H2, `src/sections/CompanyIntroduction.jsx:41` | "…Electrical & Lighting Infrastructure" |
| Home enquiry sub-text | "Connect with our electrical engineering and lighting team…" |
| Body copy throughout | "Arham is a specialized contracting firm…", "Arham delivers…" (never the full name) |
| Map page tag line, `Presence.jsx:254` | "Interactive map · Project locations · Electrical and lighting work" |
| Meta descriptions, `index.html` | "Arham is an electrical engineering, contracting, industrial wiring, and architectural lighting solutions firm…" |

"Power distribution" is one of the three services, but the name and tagline say only "Electrical & Lighting".

---

## 2. Assessment

**Key:** KEEP · SHORTEN · REWRITE · MERGE (with) · MOVE (to) · REMOVE

### 2.0 Site-wide

| Item | Verdict | Reason |
|---|---|---|
| Enquiry form delivery | **REWRITE (fix)** | It sends nothing and tells the visitor so. Connect a real channel (form service, email or WhatsApp pre-fill) before anything else. |
| Placeholder phone, WhatsApp and email | **REWRITE** | `7878787878` and `arham@gmail.com` look fake. Use the real number and a company-domain email. |
| Phone header | **REWRITE** | Add a visible **Call** and **WhatsApp** action. Best: a slim sticky bar at the bottom of phone screens ("Call · WhatsApp · Enquire"). |
| Brand name | **REWRITE** | "Arham Power Solutions" everywhere (§1.9). Tagline suggestion: "Electrical wiring · Lighting · Power distribution". |
| All "Illustrative / Provisional / Subject to confirmation / pending / Authenticated / Verified" notices | **REMOVE** | They tell visitors the business isn't real yet. If a photo isn't Arham's, replace it or drop it. Don't caption it as fake. |
| Stock photos (5) | **REPLACE** | Use real site photos, even phone photos of finished panels, wiring and lit buildings. Stock + "illustrative" captions is the worst combination. |
| Footer | **SHORTEN** | 1.4 screens on a phone. Keep: name, one line, phone, WhatsApp, email, address, 4–5 links. Remove "Core Capabilities" (it lists services that aren't offered elsewhere), "Standalone Foundation", the footnote and the chip. |
| Mobile menu "Active" badges | **REMOVE** | Noise; they read like status labels. |
| Links to `/#presence` (4 places: Projects ×2, Project detail, ProjectPreview) | **REWRITE** | Point them at the map page itself, not the homepage teaser. |
| "10 States" vs data | **DECIDE** | 11 states are coloured on the map, but Uttar Pradesh has no cities listed. Either add UP's cities and say 11, or remove UP from the map and keep 10. The number and the map must match. |

### 2.1 Home

| # | Section | Verdict | Reason |
|---|---|---|---|
| 1 | Hero | **REWRITE + SHORTEN** | The H1 is jargon and the photo is stock. Say what you do, where, for whom: "Electrical wiring, lighting and power distribution — 27+ cities across India." Primary button **See our work on the map** → map page; secondary **Call / WhatsApp**. Add a stats strip (cities, states, years, projects). Remove the caption. |
| 2 | About intro + "Core technical capabilities" | **REMOVE** (merge 2 lines into the hero / About) | 2.8 screens repeating Services, plus two disclaimers. Its 3 cards are the 1st of 4 copies of the services. |
| 3 | Services overview | **SHORTEN** | Keep one compact block of 3 services (icon, title, one line), linking to /services. Remove "Provisional Category", "Subject to confirmation", "Scope Disclosure" and the methodology strip. |
| 4 | Project preview ("A Closer Look at Our Work") | **REWRITE → "Recent projects"** | Today it's the same 3 services again, with stock photos and a notice. Replace with 3 real projects (photo, name, city, type, year) linking to the map page. Hide the section until real projects exist. |
| 5 | India map teaser | **MOVE (right after the hero) + KEEP** | It's the centrepiece but sits 9.2 screens down. Keep the image, stats and button; make the whole block tappable. |
| 6 | Enquiry form | **SHORTEN + REWRITE** | Lead with big **Call** and **WhatsApp** buttons, then a 4-field form: name, **phone (required)**, city / site location, message. Email optional; "Company" optional or removed; drop "Enquiry category". Plain heading: "Tell us about your project". Remove all three footnotes. |
| — | (missing) Why choose us / clients | **ADD** | 3–4 short reasons (years, cities, in-house team, testing before handover) and the kinds of clients you work for (coaching institutes, schools, offices, factories, hospitals, homes), with logos if you're allowed. |

**Result:** about 6 phone screens instead of 13.3, with the map on screen 2.

### 2.2 About

| # | Section | Verdict | Reason |
|---|---|---|---|
| 1 | Hero | **REWRITE** | "Engineering Precision, Code Compliance & Contracting Integrity" says nothing concrete. Use "About Arham Power Solutions" and one human line: who, since when, based in Kota. |
| 2 | Intro + photo | **SHORTEN + REWRITE** | Two paragraphs of generic copy. Replace with a short story: founded when, by whom, team size, licence class, where you work. Use a real team or site photo. **Remove "Corporate Verification Standard".** |
| 3 | Primary Contracting Disciplines | **REMOVE** (covered by Services) | The 4th copy of the 3 services. |
| 4 | Project Delivery Process | **MOVE (to Services) + SHORTEN** | Clients like a process, but in plain words: "1. Site visit & quote · 2. Wiring & installation · 3. Panels & connections · 4. Testing & handover". One line each. |
| 5 | Quality, Safety & Client Trust | **MERGE (with Services "Quality" → one "Why choose us" list) + SHORTEN** | Two pages have near-identical quality sections. "Authenticated Project Records" makes a promise the site can't keep: remove it. |
| 6 | CTA "Inspect Our Authenticated Projects…" | **REWRITE** | Point to the map ("See where we've worked") and to Call / WhatsApp. |
| — | (missing) Numbers, clients, licences, team | **ADD** | Years in business, projects done, cities, states, team size, electrical contractor licence or certifications, client types or logos. This is what builds trust. |

**Verdict for the page:** keep it, but cut it to about 3 screens. If there isn't enough real "about" content yet, merge it into the homepage "Why choose us" section and remove the page from the nav until there is.

### 2.3 Services

| # | Section | Verdict | Reason |
|---|---|---|---|
| 1 | Hero | **REWRITE** | "Our services": "Wiring, lighting and power distribution for buildings of every size." |
| 2–4 | The 3 service blocks | **KEEP + SHORTEN + REWRITE** | This is where the detail belongs, so keep the 3 blocks here (and only here in full). For each: a plain 1–2 line description, 4–6 bullets in plain words (e.g. "Full building wiring", "Cable trays and conduits", "Main and sub-distribution panels", "LED, facade and outdoor lighting"), a real photo, and buttons **See projects on the map** · **WhatsApp us about this**. Remove the "Illustrative Visualization" captions. |
| 5 | Quality, Safety & Compliance | **MERGE** (with About §5 → "Why choose us") | Duplicate. |
| — | Process (moved from About) | **ADD here** | 4 short steps. |
| — | Who we work for | **ADD** | Client types, with logos where permitted. |
| 6 | CTA card | **REWRITE** | Call / WhatsApp / Enquire. Remove "Inspect Project Gallery". |

### 2.4 Projects `/projects`

| Section | Verdict | Reason |
|---|---|---|
| Whole page | **MERGE (into the map page) and REMOVE from the nav** | 0 projects; every section is a "coming soon" notice or a filter for nothing. A separate gallery competes with the map for "our work". Project cards belong under the map, filtered by the selected state or city. Keep `/projects` as a redirect to the map page. |

### 2.5 Our Work `/presence` (the map)

| # | Section | Verdict | Reason |
|---|---|---|---|
| 1 | Title + intro | **SHORTEN** | Good: the map starts at 372 px and fits on the first phone screen. Make it tighter and clearer: eyebrow + H1 + one line + hint uses about 290 px. Suggest: H1 "Our work across India", one line "27+ cities in 10 states — tap a state to see the projects.", with the stats as two small chips. Drop the "Interactive map · Project locations · …" tag line (it repeats the line above) and the separate hint chip if the line already says "tap a state". |
| 1 | Map | **KEEP** | The best thing on the site. |
| 1 | Project cards on the map | **REWRITE (urgent)** | Every city shows the same 8 ALLEN Kota campuses. Show **real projects per city**. Until then, show the city list and an honest, positive line ("Project photos for Patna coming soon — ask us about it on WhatsApp"), not another city's projects. |
| 2 | "Project showcase" strip | **REPLACE** | Replace it with the merged project list (cards, filtered by the map selection, with "All India" as the default) and a closing Call / WhatsApp CTA. Remove the "being prepared … once approved" text. |
| — | Page name | **REWRITE** | Use one name: nav **Our Work**, H1 "Our work across India", tab title "Our Work — Arham Power Solutions". Change the URL to `/our-work`, and keep `/presence` and `/projects` redirecting to it. |

### 2.6 Contact

| # | Section | Verdict | Reason |
|---|---|---|---|
| 1 | Hero | **REWRITE + SHORTEN** | "Contact us": "Call, WhatsApp or send us your project details — we reply within a working day." |
| 3 | Contact details | **MOVE (above the form)** | On a phone the number and WhatsApp are about 2 screens down, under the form. Put big **Call** and **WhatsApp** buttons first, then email, address (with a Google Maps link) and hours. Use real details. |
| 2 | Form | **SHORTEN + make it work** | The same 4-field form as Home. "Initiate a Project Consultation" becomes "Send us your project details". The button "Formulate Commercial Enquiry" becomes **"Send enquiry"**. |
| 4 | Tender & RFP | **SHORTEN** | One line under the form: "Tenders and BOQs: email your drawings to …". |
| 5 | Privacy box | **SHORTEN** | One plain line under the form button: "We only use your details to reply to you." |

### 2.7 Project detail `/projects/:id`

**REMOVE for now (redirect to the map page).** Bring it back as `/our-work/<project>` once there are real projects with enough content for a page. Until then, project cards can open in place (the map page already has a card and a photo lightbox). Remove the "Record Status: Not Found or Unverified" wording either way.

### 2.8 404

**REWRITE** "Route Not Found" → "Page not found", with links **Home · Our Work · Contact** (not the empty Projects page).

### 2.9 Heading quality: current → suggested

| Current | Suggested (plain English) |
|---|---|
| High-Precision Electrical Infrastructure & Architectural Lighting | Electrical wiring, lighting and power distribution across India |
| Dedicated Engineering Precision in Electrical & Lighting Infrastructure | (remove) |
| Electrical Solutions Built Around Your Project | What we do |
| A Closer Look at Our Work | Recent projects |
| Our work across India | Our work across India *(good, keep)* |
| Ready to Discuss Your Project Requirements? | Tell us about your project |
| Engineering Precision, Code Compliance & Contracting Integrity | About Arham Power Solutions |
| Delivering Resilient Infrastructure for Modern Facilities | Who we are |
| Structured Project Delivery Process | How we work |
| Quality, Safety & Client Trust Commitments | Why clients choose us |
| Inspect Our Authenticated Projects & Case Studies | See where we've worked |
| Specialized Electrical Engineering & Lighting Capabilities | Our services |
| HT/LT Power Distribution & Switchboards | Power distribution & panels |
| Engineering Projects & Installation Showcase | (page merged into Our Work) |
| Where We've Worked | Our work across India (one name for the page) |
| Commercial Inquiries & Project Coordination | Contact us |
| Initiate a Project Consultation | Send us your project details |
| CORPORATE COORDINATES | Call, WhatsApp or visit |
| Route Not Found | Page not found |

**Buttons:** "Formulate Commercial Enquiry" → "Send enquiry" · "Inspect Authenticated Portfolio" → "See our work" · "Explore Services & Scope" → "Our services" · "Read Full Company Profile" → "About us".

### 2.10 Duplicate content map

| Content | Appears on |
|---|---|
| The 3 services (wiring/cabling · power distribution · lighting) | Home §2 cards, Home §3 cards, Home §4 photo cards, About §3, Services §2–4, footer "Core Capabilities" (5 variants), the enquiry category list. **Keep it in full on Services, briefly once on Home.** |
| The same stock photos | `about-engineering.jpg` on Home and About; the 3 `project-*.jpg` on Home and Services. |
| Quality / safety / testing | About §4 step 04, About §5, Services §5. **One "Why choose us" list.** |
| "Our work" | Home §4 "A Closer Look at Our Work", the Projects page, Our Work map page, Home map teaser. **One place: the map page.** |
| Enquiry form + its three footnotes | Home §6 and Contact. **Keep both forms, but make them short and identical, with no footnotes.** |
| "Discuss a project" CTA cards | Home, About, Services, Projects ×2, Presence. Replace with one consistent Call / WhatsApp / Enquire block (or the sticky phone bar). |

---

## 3. Navigation and the India map

### 3.1 Header nav today

`Home · About · Services · Projects · Our Work · Contact` (+ Enquire Now)

- **"Our Work" is item 5 of 6**, after "Projects", an empty page with a similar name. Visitors who want to see work will tap "Projects" first and find nothing.
- On phones the nav is behind the menu icon and **there's no visible contact action**.
- "Home" isn't needed as a nav item (the logo does it), which frees space for the important items on desktop.

**Proposed:** `Our Work · Services · About · Contact`, with a yellow **WhatsApp / Call** button on the right (desktop) and a sticky **Call · WhatsApp · Enquire** bar on phones.

- **"Our Work" is the right name:** short, plain, and it covers both the map and the projects once they're merged. (Alternatives: "Projects" or "Our Projects". Pick one word and use it for the nav, the H1, the page title and the URL.)
- **It should come first.** It's the site's main reason to exist after the homepage.

### 3.2 Where the map appears today

1. **`/presence` (nav "Our Work")**: the full interactive map. On a 390 px phone the map runs 372–772 px, so it is **entirely on the first screen**. Nothing pushes it below the fold. The intro could still be about 80–100 px tighter (§2.5).
2. **Homepage teaser** (static image + stats + button): **section 5 of 6, starting about 9.2 screens down.** Most phone visitors won't scroll that far.
3. Mentions that link to the homepage teaser instead of the map page: Projects (×2), Project detail, Home §4.

### 3.3 Recommendations

- **Move the homepage teaser to directly after the hero** (screen 2), and give the hero's main button to the map: **"See our work on the map"**.
- **Optional, desktop only:** put the map image *in* the hero, beside the headline (text left, map right). On phones keep it as the next section so the headline and Call / WhatsApp buttons stay on screen 1.
- **Combine Projects and Our Work into one page:** the map on top, a project list under it (all projects by default; the selected state or city filters it), then the enquiry CTA. One page, one name, one URL.
- **Map page header:** H1 + one line + two stat chips, then the map straight away. Remove the second tag line and the "Project showcase" placeholder strip.
- **Fix the map's project cards** before promoting the map further: tapping any city currently shows the ALLEN Kota placeholders.

---

## 4. Proposed structure

### 4.1 Sitemap (5 pages, 4 nav items)

```
/                    Home
/our-work            Our Work  (map + projects)   ← nav 1   (/presence and /projects redirect here)
/services            Services                     ← nav 2
/about               About                        ← nav 3   (could merge into Home if content is thin)
/contact             Contact                      ← nav 4
*                    404
(later) /our-work/<project>   project page, once real projects have enough content
```

**On every page:**
- Header: logo **ARHAM POWER SOLUTIONS**; nav Our Work · Services · About · Contact; WhatsApp / Call button.
- Phones: a sticky bottom bar **Call · WhatsApp · Enquire**.
- Footer, kept short: name + tagline, phone, WhatsApp, email, address, links.

### 4.2 Home: top to bottom (target about 6 phone screens)

1. **Hero** (rewritten). "Arham Power Solutions" eyebrow. H1 "Electrical wiring, lighting and power distribution across India". One line. Buttons **See our work on the map** (→ /our-work) and **WhatsApp us**. A real photo.
2. **India map teaser** (MOVED up from position 5). "Our work across India", **27+ cities · 10 states** (matching the data), the whole block tappable → /our-work.
3. **Stats strip** (NEW, or part of 1 or 2). Years · projects · cities · states.
4. **What we do** (SHORTENED from "Services overview"). 3 compact cards, linking to /services.
5. **Recent projects** (REWRITTEN from "A Closer Look at Our Work"). 3 real projects with photo, city and year, linking to /our-work. *Hidden until real projects exist.*
6. **Why clients choose us + who we work for** (NEW; merges About §5 and Services §5). 3–4 reasons, client types or logos.
7. **Tell us about your project** (SHORTENED). Call and WhatsApp buttons first, then the 4-field form.

*Removed:* the "Dedicated Engineering Precision…" intro block (Home §2) and every disclaimer.

### 4.3 Our Work `/our-work` (merges /presence and /projects)

1. **Header** (SHORTENED). H1 "Our work across India", one line ("27+ cities in 10 states — tap a state to see the projects"), two stat chips.
2. **Interactive map** (KEPT; unchanged behaviour). Tapping a state lists its cities; tapping a city shows its **real** projects.
3. **Projects list** (NEW here; replaces the /projects page and the "Project showcase" strip). Cards with photo, name, city, type and year. Shows all projects, or those in the selected state or city.
4. **CTA**: "Have a project in your city?" Call · WhatsApp · Enquire.

### 4.4 Services

1. **Hero**: "Our services" + one line.
2. **Wiring & cabling**: short description, bullets, real photo, buttons "See projects" (→ /our-work) and "WhatsApp us".
3. **Power distribution & panels**: same pattern.
4. **Lighting**: same pattern.
5. **How we work** (MOVED from About; 4 short steps).
6. **Who we work for** (NEW; client types or logos).
7. **CTA**: Call · WhatsApp · Enquire.

### 4.5 About (target about 3 screens)

1. **Hero**: "About Arham Power Solutions" + one line (based in Kota, working across India since ____).
2. **Our story**: 3–4 short sentences, with a real team or site photo.
3. **Numbers**: years · projects · cities · states · team size.
4. **Why clients choose us** (the merged quality, safety and testing list, in plain words) + licences and certifications.
5. **CTA**: "See our work on the map" + WhatsApp.

*Removed:* Primary Contracting Disciplines (it's on Services), "Corporate Verification Standard", "Authenticated Project Records", the "Inspect Our Authenticated Projects" card.

### 4.6 Contact

1. **Hero**: "Contact us" + "We reply within a working day."
2. **Call · WhatsApp · Email** (MOVED above the form): big buttons with real details.
3. **Short form** (that actually sends): name, phone, city / site, message. Optional: email, service.
4. **Office**: address with a Google Maps link, and hours.
5. One line for tenders / BOQs (email address). One line on privacy.

### 4.7 404

"Page not found" + links **Home · Our Work · Contact**.

---

## 5. Before launch: content to collect from Arham

Most of the above depends on real content, not code. Checklist:

- [ ] Real phone and WhatsApp number(s), company-domain email, full office address.
- [ ] How enquiries should arrive: email inbox, WhatsApp, or both. Then connect the form.
- [ ] 10–20 real project photos (finished panels, wiring, lighting, building exteriors), with project name or client type, city, year and scope.
- [ ] The UP decision (cities or no state) so the map and the "states" number match.
- [ ] Numbers: years in business, total projects, team size.
- [ ] Licences / certifications (electrical contractor licence class, ISO, etc.).
- [ ] Client types, and any client logos you have permission to show.
- [ ] Whether the ALLEN campuses are real Arham projects (Kota). If yes, they become real projects under Kota on the map. If not, they must come off the map cards.
- [ ] A logo for "Arham Power Solutions" (the current mark is text).
