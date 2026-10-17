/**
 * Arham Power Solutions — projects shown on Our Work (/our-work). ONE ROW PER PROJECT; everything on
 * the page (city pin counts, filter chips, client groups, state / India totals) is derived from this
 * list by the selectors in data/projectBrowse.js, so adding a row updates the whole page.
 *
 * Row format:
 *   id         stable unique id, e.g. 'allen-kota-sankalp'
 *   client     client name, e.g. 'ALLEN Career Institute'; null for private / no-client jobs
 *              (those are grouped by category instead)
 *   category   'Coaching centre' | 'Commercial' | 'Residential' | 'Industrial' | 'Hospital' | 'School' | …
 *   name       campus / building name (shown in full on the project; lists truncate long names)
 *   area       short locality, e.g. 'Indra Vihar'
 *   city       city exactly as listed in presenceCoverage.js (rows with any other city are not shown);
 *              satellite towns are filed under their big city (Thane, Navi Mumbai, Kalyan, Panvel,
 *              Vasai, Mira Road → Mumbai; Liluah → Kolkata; Gandhinagar → Ahmedabad)
 *   stateCode  e.g. 'IN-RJ'
 *   address    optional full postal address: shown on the project with an "Open in Google Maps" link
 *   scope      what Arham did, from SCOPE_LABELS below, e.g. ['Full wiring', 'Lighting', 'DB panels']
 *   status     'completed' | 'ongoing'
 *   year       completion year (or start year while ongoing; optional then)
 *   photos     1–6 photos (public paths, or new URL(..., import.meta.url).href)
 *   lat, lng   optional site coordinates: with them the project gets its own pin on the map,
 *              otherwise its city's pin is highlighted
 */

export const MAX_PHOTOS = 6;
export const MAX_ADDRESS_LENGTH = 240;

/** Work types used in `scope` (shown as chips) and their short forms for summaries ("wiring & lighting"). */
export const SCOPE_LABELS = Object.freeze({
  'Full wiring': 'wiring',
  Lighting: 'lighting',
  'DB panels': 'panels',
  Cabling: 'cabling',
  Earthing: 'earthing',
  'Facade lighting': 'facade lighting',
});

// The ALLEN campus photo (Images/allen image.png), used for every ALLEN row until campus photos are added.
const ALLEN_PHOTO = new URL('../../Images/allen image.png', import.meta.url).href;
const ALLEN = 'ALLEN Career Institute';

// One ALLEN building: full wiring and lighting, completed. No coordinates (the city pin is highlighted).
const allen = (id, name, area, city, stateCode, address) =>
  Object.freeze({
    id,
    client: ALLEN,
    category: 'Coaching centre',
    name,
    area,
    city,
    stateCode,
    address,
    scope: ['Full wiring', 'Lighting'],
    status: 'completed',
    year: 2022,
    photos: [ALLEN_PHOTO],
    lat: null,
    lng: null,
  });

/** Real projects: the 98 ALLEN Career Institute buildings. Add more rows here. */
// TODO year: placeholder 2022 for all ALLEN rows
export const SHOWCASE_PROJECTS = Object.freeze([
  allen("allen-kota-sankalp", "ALLEN Sankalp", "Indra Vihar", "Kota", 'IN-RJ', "CP-6, Indra Vihar, Kota, Rajasthan 324005"),
  allen("allen-kota-samanvaya", "ALLEN Samanvaya", "Talwandi", "Kota", 'IN-RJ', "C-210/2, Talwandi, Kota, Rajasthan 324005"),
  allen("allen-kota-sangyan", "ALLEN Sangyan", "Landmark City, Kunhari", "Kota", 'IN-RJ', "Plot No. SP-Corner 4, Block FGH, Landmark City, Kunhari, Kota, Rajasthan 324008"),
  allen("allen-kota-supath", "ALLEN Supath", "Naya Nohra", "Kota", 'IN-RJ', "Naya Nohra, Baran Road, Kota, Rajasthan 324001"),
  allen("allen-kota-sammunnat", "ALLEN Sammunnat", "Jawahar Nagar", "Kota", 'IN-RJ', "4/A, District Center, Jawahar Nagar, Kota, Rajasthan 324005"),
  allen("allen-kota-samarth", "ALLEN Samarth", "Indra Vihar", "Kota", 'IN-RJ', "CP-14, Indra Vihar, Kota, Rajasthan 324005"),
  allen("allen-kota-sabal", "ALLEN Sabal", "Indra Vihar", "Kota", 'IN-RJ', "CP-07, Indra Vihar, Kota, Rajasthan 324005"),
  allen("allen-kota-safalya", "ALLEN Safalya", "Rajeev Gandhi Nagar", "Kota", 'IN-RJ', "Plot No. 1, Rajeev Gandhi Nagar, Kota, Rajasthan 324005"),
  allen("allen-kota-safalya-2", "ALLEN Safalya-2", "Rajeev Gandhi Nagar", "Kota", 'IN-RJ', "Plot No. 1, Rajeev Gandhi Nagar, Kota, Rajasthan 324005"),
  allen("allen-kota-saakar", "ALLEN Saakar", "Rajeev Gandhi Nagar", "Kota", 'IN-RJ', "6, Rajeev Gandhi Nagar, Opp. City Mall, Kota, Rajasthan 324005"),
  allen("allen-kota-samyak", "ALLEN Samyak", "Landmark City, Kunhari", "Kota", 'IN-RJ', "Landmark City, Bundi Road, Kunhari, Kota, Rajasthan 324008"),
  allen("allen-kota-samyak-2", "ALLEN Samyak-2", "Landmark City, Kunhari", "Kota", 'IN-RJ', "Plot No. A-2, Landmark City Road, Kunhari, Kota, Rajasthan 324008"),
  allen("allen-kota-satyarth", "ALLEN Satyarth", "Jawahar Nagar", "Kota", 'IN-RJ', "District Center, Jawahar Nagar, Kota, Rajasthan 324005"),
  allen("allen-kota-srajit-4", "ALLEN Srajit-4", "IPIA", "Kota", 'IN-RJ', "Road No. 1, IPIA, Kota, Rajasthan 324005"),
  allen("allen-kota-sarokar", "ALLEN Sarokar", "Talwandi", "Kota", 'IN-RJ', "C-10, Nursery Road, Talwandi, Kota, Rajasthan 324005"),
  allen("allen-jaipur-sarvatra-jln-marg", "ALLEN Jaipur – Sarvatra, JLN Marg Campus", "JLN Marg", "Jaipur", 'IN-RJ', "11, Samachar Jagat, Opp. Vidyashram School, JLN Marg, Jaipur, Rajasthan 302017"),
  allen("allen-jaipur-sarvatra-7-gopalpura-2", "ALLEN Jaipur – Sarvatra-7, Gopalpura Campus-2", "Gopalpura Bypass", "Jaipur", 'IN-RJ', "Plot No. 49, 10 B Scheme, Gopalpura Bypass, Jaipur, Rajasthan"),
  allen("allen-jaipur-hanuman-nagar", "ALLEN Jaipur – Hanuman Nagar Campus", "Hanuman Nagar", "Jaipur", 'IN-RJ', "Plot No. B-13, 17, Sirsi Road, Hanuman Nagar, Jaipur, Rajasthan 302021"),
  allen("allen-jaipur-sarvatra-3-bani-park", "ALLEN Jaipur – Sarvatra-3, Bani Park Campus", "Bani Park", "Jaipur", 'IN-RJ', "Plot No. D-200, Kachcha Bandha Road (Jhotwara Road), Bani Park, E-Scheme, Jaipur, Rajasthan 302016"),
  allen("allen-jodhpur-aiims-road", "ALLEN Jodhpur – AIIMS Road Campus", "AIIMS Road", "Jodhpur", 'IN-RJ', "Block A, Sumanand Corporate Park, Narayan Sagar Scheme, AIIMS Road, Jodhpur, Rajasthan 342005"),
  allen("allen-jodhpur-paota", "ALLEN Jodhpur – Paota Campus", "Paota", "Jodhpur", 'IN-RJ', "Panchmukhi Vishwakarma Tower, Maan ji ka Hattha, Opp. Sunrise Hotel, Paota, Mandore Road, Jodhpur, Rajasthan 342007"),
  allen("allen-jodhpur-sardarpura", "ALLEN Jodhpur – Sardarpura Campus", "Sardarpura", "Jodhpur", 'IN-RJ', "Plot No. 924, 'Dainik Pratinidhi', 10th E Road, Sardarpura, Jodhpur, Rajasthan 342003"),
  allen("allen-udaipur-hiran-magri-sector-4", "ALLEN Udaipur – Hiran Magri Sector 4 Campus", "Hiran Magri", "Udaipur", 'IN-RJ', "Riddhi Siddhi Prime, 23/25, Tagore Nagar, Hiran Magri Sector 4, Hansa Palace to Jain Mandir Road, Udaipur, Rajasthan 313002"),
  allen("allen-bikaner-jnv-colony", "ALLEN Bikaner – JNV Colony Campus", "JNV Colony", "Bikaner", 'IN-RJ', "1-B-28, JNV Colony, Near Maharshi Gautam Circle, Bikaner, Rajasthan 334003"),
  allen("allen-sikar-sanskar", "ALLEN Sikar – Sanskar", "Piprali Road", "Sikar", 'IN-RJ', "Near Piprali Circle, Jhunjhunu Bypass, Piprali Road, Samarthpura, Sikar, Rajasthan"),
  allen("allen-sikar-srijan", "ALLEN Sikar – Srijan Campus", "Gokulpura", "Sikar", 'IN-RJ', "Near Gokulpura Tiraha, Jaipur-Jhunjhunu Bypass, Sikar, Rajasthan"),
  allen("allen-sikar-shivam-heights", "ALLEN Sikar – Shivam Heights Campus", "Ramlila Maidan", "Sikar", 'IN-RJ', "Shivam Heights, Ramlila Maidan, Sikar, Rajasthan"),
  allen("allen-sikar-city-office", "ALLEN Sikar – City Office", "Piprali Road", "Sikar", 'IN-RJ', "Near 'Test and Toast', Piprali Road, Samarthpura, Sikar, Rajasthan"),
  allen("allen-jhunjhunu-gudha-road", "ALLEN Jhunjhunu – Gudha Road Campus", "Gudha Road", "Jhunjhunu", 'IN-RJ', "Plot No. 2, Ajadi Colony & Islam Nagar, between Gudha Road & Bakra Road, Near Gudha Phatak, Jhunjhunu, Rajasthan 333001"),
  allen("allen-jhunjhunu-sanskar-shikshan-sansthan", "ALLEN Jhunjhunu – Sanskar Shikshan Sansthan Campus", "Gudha Gorji", "Jhunjhunu", 'IN-RJ', "Sanskar Science Academy, Gudha Gorji, Jhunjhunu, Rajasthan 333001"),
  allen("allen-taranagar-taranagar-centre", "ALLEN Taranagar Centre", "Rajgarh Road", "Taranagar", 'IN-RJ', "Bypass Circle, Rajgarh Road, District Court Road, Near Waterworks, Taranagar (Churu), Rajasthan 331304"),
  allen("allen-mumbai-mahaveer-business-park", "ALLEN Thane – Mahaveer Business Park Campus", "Thane West", "Mumbai", 'IN-MH', "19th Floor, Mahaveer Business Park, Teen Hath Naka Flyover, Bhakti Mandir, Shivaji Nagar, Thane West, Maharashtra 400604"),
  allen("allen-mumbai-ghatkopar-e", "ALLEN Mumbai – Ghatkopar (E) Campus", "Ghatkopar East", "Mumbai", 'IN-MH', "K.K. Solitaire, Plot No. 278, Opp. Vanita Vikas School, Pant Nagar, Near Railway Station, Ghatkopar East, Mumbai 400077"),
  allen("allen-mumbai-kalyan-bail-bazar", "ALLEN Kalyan (Bail Bazar) Campus", "Kalyan West", "Mumbai", 'IN-MH', "Shop No. A-5, Charms Star Building, beside HDFC Bank, Near Sanai Mangal Karyalay, Agra Road, Bhoiwada, Bail Bazar, Kalyan West 421301"),
  allen("allen-mumbai-dombivli-e", "ALLEN Dombivli (E) Campus", "Dombivli East", "Mumbai", 'IN-MH', "Basement, 2nd–4th Floor, Snehbandhan Commercial Complex, Opp. Tanishq Showroom, above Kalyan Jewellers, Dombivli East 421201"),
  allen("allen-mumbai-thane-w-naupada", "ALLEN Thane (W) – Naupada Campus", "Thane West – Naupada", "Mumbai", 'IN-MH', "1st Floor, Osho Poonam, Opp. Bharat Dairy, B-Cabin Junction, Gokhale Road, Naupada, Thane West 400602"),
  allen("allen-mumbai-mulund-w-ii", "ALLEN Mumbai – Mulund (W) Campus-II", "Mulund West", "Mumbai", 'IN-MH', "1st Floor, Pramukh Krupa, Junction of MG Road & Ganesh Gawde Road, Mulund West, Mumbai 400080"),
  allen("allen-mumbai-manpada", "ALLEN Thane – Manpada Campus", "Thane West – Manpada", "Mumbai", 'IN-MH', "Shop No. 10–13 & SG17, Shopee Imperia (Dosti Imperia), Village Chitalsar, Manpada, Ghodbunder Road, Thane West 400607"),
  allen("allen-mumbai-kharghar", "ALLEN Navi Mumbai – Kharghar Campus", "Navi Mumbai – Kharghar", "Mumbai", 'IN-MH', "1st Floor, Ashoka Residency, Plot No. 3, Sector 12, Kharghar, Navi Mumbai 410210"),
  allen("allen-mumbai-nerul-e", "ALLEN Navi Mumbai – Nerul (E) Campus", "Navi Mumbai – Nerul", "Mumbai", 'IN-MH', "Shop No. A-001, Ground Floor, Nerul Station Commercial Complex, Nerul East, Navi Mumbai 400706"),
  allen("allen-mumbai-panvel", "ALLEN Panvel Campus", "Panvel", "Mumbai", 'IN-MH', "1st Floor, Leela-Madhav Complex, Plot No. 312, above DIGI 1 Showroom, near Orion Mall, Panvel, Raigad 410206"),
  allen("allen-mumbai-vasai-w", "ALLEN Vasai (W) Campus", "Vasai West", "Mumbai", 'IN-MH', "1st, 2nd & 7th Floor, KT Signature, 100 Feet Road Corner, Ambadi Road, Sai Nagar, Vasai West 401202"),
  allen("allen-mumbai-andheri-e-ii", "ALLEN Mumbai – Andheri (E) Campus-II", "Andheri East", "Mumbai", 'IN-MH', "4th & 5th Floor, The Sajay Business Hub, A-Wing, Andheri-Kurla Road, Near Andheri Metro Gate No. 2, Andheri East, Mumbai 400069"),
  allen("allen-mumbai-andheri-w", "ALLEN Mumbai – Andheri (W) Campus", "Andheri West", "Mumbai", 'IN-MH', "Times Chamber, Ground & 1st Floor, S.V. Road, Opp. Andheri (W) Railway Station, Andheri West, Mumbai 400058"),
  allen("allen-mumbai-kandivali-e", "ALLEN Mumbai – Kandivali (E) Campus", "Kandivali East", "Mumbai", 'IN-MH', "2nd Floor, Thakur Cinema Mall, above McDonald's, Thakur Village, Kandivali East, Mumbai 400101"),
  allen("allen-mumbai-mira-road", "ALLEN Mira Road Campus", "Mira Road East", "Mumbai", 'IN-MH', "Gate No. 2, Shree L.R. Tiwari Campus, Kanakia Road, Mira Road East, Thane 401107"),
  allen("allen-mumbai-borivali-w-ii", "ALLEN Mumbai – Borivali (W) Campus-II", "Borivali West", "Mumbai", 'IN-MH', "1st–3rd Floor, M K High School Complex, Factory Lane, Borivali West, Mumbai"),
  allen("allen-pune-shankar-sheth-road", "ALLEN Pune – Shankar Sheth Road Campus", "Shankar Sheth Road", "Pune", 'IN-MH', "321/A, Oswal Bhavan – Vardhman Building, 7 Loves Chowk, Shankar Sheth Road, Mahatma Phule Peth, Pune 411042"),
  allen("allen-pune-pimpri-chinchwad", "ALLEN Pimpri-Chinchwad Campus", "Pimpri Colony", "Pune", 'IN-MH', "Shubham Galleria, 2nd Floor, Near Pimpri Railway Flyover, KBS Road, Pimpri Colony, Pimpri-Chinchwad 411018"),
  allen("allen-pune-baner-aundh", "ALLEN Pune – Baner-Aundh Campus", "Baner", "Pune", 'IN-MH', "Kapil Complex, No. 82(P), Baner, Pune 411045"),
  allen("allen-pune-hadapsar", "ALLEN Pune – Hadapsar Campus", "Hadapsar", "Pune", 'IN-MH', "Mukta Chambers, S. No. 174, H. No. 4/1 & 4/2, Near Amanora, Hadapsar, Pune 411028"),
  allen("allen-pune-kothrud", "ALLEN Pune – Kothrud Campus", "Kothrud", "Pune", 'IN-MH', "'Nandan Square', Plot No. 1A, Survey No. 19, Opp. Siddharth Towers, Kothrud, Pune 411038"),
  allen("allen-pune-viman-nagar", "ALLEN Pune – Viman Nagar Campus", "Viman Nagar", "Pune", 'IN-MH', "Orville Business Port, Near Konark Epitome, MHADA Colony, Viman Nagar, Pune 411014"),
  allen("allen-pune-pimple-saudagar", "ALLEN Pune – Pimple Saudagar Campus", "Rahatani", "Pune", 'IN-MH', "Kusum Vishwa Complex, Survey No. 16, Hissa No. 4 & 5, Village Rahatani, Shivraj Nagar, Pune 411017"),
  allen("allen-pune-new-shivaji-nagar", "ALLEN Pune – New Shivaji Nagar Campus", "Shivaji Nagar", "Pune", 'IN-MH', "Kohinoor B-Zone, CTS No. 1565, F.P. 81, TPS-1, Opp. Shivaji Nagar Metro Station, Shivaji Nagar, Pune 411005"),
  allen("allen-nagpur-it-park", "ALLEN Nagpur – IT Park Campus", "Trimurti Nagar", "Nagpur", 'IN-MH', "Plot No. 28, Wing B, VIPL IT Park, Parsodi, Trimurti Nagar, Nagpur 440022"),
  allen("allen-nagpur-sadar", "ALLEN Nagpur – Sadar Campus", "Sadar", "Nagpur", 'IN-MH', "Old Mother Pet Campus, Mount Road, Sadar, behind Saraf Chambers, Nagpur 440001"),
  allen("allen-nagpur-shastri-nagar", "ALLEN Nagpur – Shastri Nagar Campus", "Shastri Nagar", "Nagpur", 'IN-MH', "Plot No. 40, Garoba Maidan, Opp. Annapurna Mata Mandir, Near Shastri Nagar Square, Inox Road, Nagpur 440008"),
  allen("allen-nagpur-wardha-road-jamtha", "ALLEN Nagpur – Wardha Road (Jamtha) Campus", "Wardha Road", "Nagpur", 'IN-MH', "Hibiscus Garden Commercial Complex, New Jabalpur Ring Road, off Wardha Road, Gawsi-Manapur, Nagpur Rural 441108"),
  allen("allen-nashik-old-commissioner-road", "ALLEN Nashik – Old Commissioner Road Campus", "Canada Corner", "Nashik", 'IN-MH', "4th Floor, Business Square, Opp. Abhyudaya Co-op Bank, Old Commissioner Road, Canada Corner, Nashik 422005"),
  allen("allen-chhatrapati-sambhaji-nagar-pioneer-heights-allen-tower", "ALLEN Chhatrapati Sambhaji Nagar – Pioneer Heights Campus (ALLEN Tower)", "Adalat Road", "Chhatrapati Sambhaji Nagar", 'IN-MH', "ALLEN Tower, Plot No. 36 & 37, Ashoka Layout, Opp. District Court, Adalat Road, Chhatrapati Sambhaji Nagar 431001"),
  allen("allen-akola-goenka-layout-ii", "ALLEN Akola – Goenka Layout Campus-II", "Goenka Layout", "Akola", 'IN-MH', "Plot No. 61, 62, 63, Goenka Layout, Near Podar International School, Jawahar Nagar, Akola 444005"),
  allen("allen-nanded-shyam-nagar", "ALLEN Nanded – Shyam Nagar Campus", "Shyam Nagar", "Nanded", 'IN-MH', "Plot No. 1, Gopal Krishna Education Centre, Yeshwant College Road, Shyam Nagar, Nanded 431602"),
  allen("allen-latur-shivaji-nagar", "ALLEN Latur – Shivaji Nagar Campus", "Shivaji Nagar", "Latur", 'IN-MH', "Laxmi Landmark, Ground Floor, Near Vishwa Travels, Shivaji Nagar, Udyog Bhavan, Latur 413531"),
  allen("allen-latur-ausa-road", "ALLEN Latur – Ausa Road Campus", "Ausa Road", "Latur", 'IN-MH', "Plot No. R-8/1324/B, Dr. Dube Heights, Rajiv Gandhi Chowk, beside Life Style Building, Ausa Road, Latur 413512"),
  allen("allen-ahmedabad-sadhya-sbr", "ALLEN Ahmedabad – Sadhya SBR", "Thaltej", "Ahmedabad", 'IN-GJ', "Opp. Saptavilla Bungalow, behind Sindhu Bhavan, Thaltej, Ahmedabad 380059"),
  allen("allen-ahmedabad-maninagar", "ALLEN Ahmedabad – Maninagar Campus", "Maninagar", "Ahmedabad", 'IN-GJ', "1st Floor, Purshottam Mahal, Opp. Swaminarayan Temple, Near Jaihind Cross Road, Railway Crossing Road, Maninagar, Ahmedabad 380008"),
  allen("allen-ahmedabad-chandkheda", "ALLEN Ahmedabad – Chandkheda Campus", "Chandkheda", "Ahmedabad", 'IN-GJ', "3rd Floor, Chanakya Plaza, Near Swagat Bungalow, New C.G. Road, Chandkheda, Ahmedabad 380024"),
  allen("allen-ahmedabad-nikol", "ALLEN Ahmedabad – Nikol Campus", "Nikol", "Ahmedabad", 'IN-GJ', "3rd & 4th Floor, Sunrise Business Center, Nikol Gam to Ring Road, Nikol, Ahmedabad 382350"),
  allen("allen-ahmedabad-gandhinagar", "ALLEN Gandhinagar Campus", "Gandhinagar – Infocity", "Ahmedabad", 'IN-GJ', "3rd Floor, Super Mall-2, Gate No. 1, Near GH-0 Circle, SG Highway, Infocity, Gandhinagar 382009"),
  allen("allen-ahmedabad-jagatpur", "ALLEN Ahmedabad – Jagatpur Campus", "Jagatpur", "Ahmedabad", 'IN-GJ', "3rd Floor, Savvy Swaraaj Sports Club, near Godrej Garden City, Jagatpur, Ahmedabad 382421"),
  allen("allen-ahmedabad-south-bopal", "ALLEN Ahmedabad – South Bopal Campus", "South Bopal", "Ahmedabad", 'IN-GJ', "1st Floor, Gala Mart, Near Sobo Centre, South Bopal, Ahmedabad 380058"),
  allen("allen-vadodara-sattva", "ALLEN Vadodara – Sattva Campus", "Akota", "Vadodara", 'IN-GJ', "Plot No. 37-38, Preetvan Society, Gulabvadi, Near Old Padra Road, Akota, Vadodara 390020"),
  allen("allen-vadodara-naimisharanya-sama", "ALLEN Vadodara – Naimisharanya Sama Campus", "Sama", "Vadodara", 'IN-GJ', "Naimisharanya, beside Bharat Petrol Pump, Opp. Sama Lake, Sama Savli Road, Vadodara"),
  allen("allen-raipur-pachpedi-naka", "ALLEN Raipur – Pachpedi Naka Campus", "Pachpedi Naka", "Raipur", 'IN-CT', "Block A-2, Pujari Chambers, Opp. GST Bhawan, beside Pujari Park, Pachpedi Naka, Raipur 492001"),
  allen("allen-bilaspur-vyapar-vihar", "ALLEN Bilaspur – Vyapar Vihar Campus", "Vyapar Vihar", "Bilaspur", 'IN-CT', "Shri Balaji Emporium, 2nd Floor, above Westside, Opp. ICICI Bank, Main Road, Vyapar Vihar, Bilaspur 495001"),
  allen("allen-bilaspur-hsm-global-public-school", "ALLEN Bilaspur – HSM Global Public School Campus", "Dayalband", "Bilaspur", 'IN-CT', "HSM Global Public School, Chawla Chambers, Near Gurudwara, Dayalband, Bilaspur 495001"),
  allen("allen-kolkata-chinar-park", "ALLEN Kolkata – Chinar Park Campus", "New Town", "Kolkata", 'IN-WB', "PS IXL Building, Near Holiday Inn, Chinar Park More, Biswa Bangla Sarani, Atghara, New Town, Kolkata 700136"),
  allen("allen-kolkata-hazra", "ALLEN Kolkata – Hazra Campus", "Hazra", "Kolkata", 'IN-WB', "1 Andul Raj Road, Opp. Basusree Cinema, beside Metro Gate No. 5, Jatin Das Park, Kolkata 700026"),
  allen("allen-kolkata-central", "ALLEN Kolkata – Central Campus", "AJC Bose Road", "Kolkata", 'IN-WB', "225C, AJC Bose Road, beside Hotel Park Prime, Kolkata 700020"),
  allen("allen-kolkata-barrackpore", "ALLEN Barrackpore Campus", "Barrackpore", "Kolkata", 'IN-WB', "117 S.N. Banerjee Road, M-1 Sukanta Sadan Complex, Barrackpore, Kolkata 700120"),
  allen("allen-kolkata-sealdah", "ALLEN Kolkata – Sealdah Campus", "Sealdah", "Kolkata", 'IN-WB', "6th Floor, Smart Bazaar Building, Near Sealdah Railway/Metro Station, Kolkata 700014"),
  allen("allen-kolkata-liluah", "ALLEN Liluah Campus", "Liluah, Howrah", "Kolkata", 'IN-WB', "3rd Floor, RD Mall, Grand Trunk Road, Belur Math, Liluah, Howrah 711204"),
  allen("allen-siliguri-sevoke-road", "ALLEN Siliguri – Sevoke Road Campus", "Sevoke Road", "Siliguri", 'IN-WB', "4th Floor, Tradium Complex, Checkpost, Sevoke Road, Siliguri 734001"),
  allen("allen-patna-ashiana-digha", "ALLEN Patna – Ashiana Digha Campus", "Ashiana Digha Road", "Patna", 'IN-BR', "VAU'S Springs, Block A Building, Ashiana Digha Road, Patna 800014"),
  allen("allen-patna-kankarbagh", "ALLEN Patna – Kankarbagh Campus", "Kankarbagh", "Patna", 'IN-BR', "Deoki Commercial Complex, 2nd Floor, Doctors Colony, Lohia Nagar, Kankarbagh, Patna 800020"),
  allen("allen-patna-boring-road", "ALLEN Patna – Boring Road Campus", "Boring Road", "Patna", 'IN-BR', "Surya Crystal, Boring Road Chauraha, Near Heera Panna Building, Patna 800001"),
  allen("allen-patna-raj-tower", "ALLEN Patna – Raj Tower Campus", "Boring Road", "Patna", 'IN-BR', "2nd Floor, above V-Mart, Near Boring Road Chauraha, Patna 800001"),
  allen("allen-patna-samprada", "ALLEN Patna – Samprada Campus", "Boring Road", "Patna", 'IN-BR', "Raja Radhika Raman Path, beside JP Complex, Boring Road, Patna 800001"),
  allen("allen-patna-shailja-tower", "ALLEN Patna – Shailja Tower Campus", "Kankarbagh", "Patna", 'IN-BR', "4th Floor, Main Kankarbagh Road, Near Reliance Digital, Patna 800020"),
  allen("allen-ranchi-harmu-road", "ALLEN Ranchi – Harmu Road Campus", "Harmu Road", "Ranchi", 'IN-JH', "205, 2nd Floor, Mangal Murti Heights, beside Vishal Mega Mart, Harmu Road, Ranchi 834001"),
  allen("allen-ranchi-hawai-nagar", "ALLEN Ranchi – Hawai Nagar Campus", "Hawai Nagar, Hatia", "Ranchi", 'IN-JH', "Florence Nightingale School Campus, Hawai Nagar, Near Road No. 14, Birsa Chowk–Khunti Road, Hatia, Ranchi 834003"),
  allen("allen-ranchi-matrix-mall", "ALLEN Ranchi – Matrix Mall Campus", "Lalpur", "Ranchi", 'IN-JH', "Matrix Mall, 70, Circular Road, P&T Colony, Lalpur, Ranchi 834008"),
  allen("allen-bhubaneswar-signature-plaza", "ALLEN Bhubaneswar – Signature Plaza Campus", "Maitree Vihar", "Bhubaneswar", 'IN-OR', "Plot No. J/1, First Floor, Opp. Tech Mahindra, Maitree Vihar, Bhubaneswar 751023"),
  allen("allen-bhubaneswar-suyogya-khandagiri", "ALLEN Bhubaneswar – Suyogya Khandagiri Campus", "Khandagiri", "Bhubaneswar", 'IN-OR', "Plot No. 193(P) & 194(P), Opp. Khandagiri Police Station, Khandagiri Square, Bhubaneswar 751030"),
  allen("allen-bhubaneswar-sarthak", "ALLEN Bhubaneswar – Sarthak Campus", "Patia", "Bhubaneswar", 'IN-OR', "IDCO Plot No. 38, Chandaka Industrial Estate, Patia, Bhubaneswar 751024"),
  allen("allen-guwahati-ltwc-compound", "ALLEN Guwahati – LTWC Compound Campus", "G.S. Road", "Guwahati", 'IN-AS', "LTWC Compound, adjacent to Aaykar Bhawan, G.S. Road, Guwahati 781005"),
  allen("allen-panaji-centre", "ALLEN Panaji Centre", "MG Road", "Panaji", 'IN-GA', "Office No. 302, 3rd Floor, Edcon Incrocio, MG Road, Opp. Don Bosco School, Panaji, Goa 403001"),
]);

/**
 * Placeholder rows were removed: only real projects are shown. The switch stays so a placeholder set
 * could be shown again in a local preview; it is off and the list is empty.
 */
export const USE_PLACEHOLDER_PROJECTS = false;
const PLACEHOLDER_PROJECTS = Object.freeze([]);

/** The rows the page uses. */
export const getProjectRows = () => (USE_PLACEHOLDER_PROJECTS ? [...SHOWCASE_PROJECTS, ...PLACEHOLDER_PROJECTS] : [...SHOWCASE_PROJECTS]);

/** A project's photos (at most MAX_PHOTOS). */
export const projectPhotos = (p) => (Array.isArray(p?.photos) ? p.photos.filter(Boolean).slice(0, MAX_PHOTOS) : []);

export const hasSiteCoordinates = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/** `address` is optional; when present it must be a non-empty single-line string of sensible length. */
export const isValidAddress = (address) =>
  address == null || (typeof address === 'string' && address.trim().length > 0 && address.length <= MAX_ADDRESS_LENGTH && !/[\n\r]/.test(address));

/** Google Maps search for a project: its name + address (opened in a new tab). */
export const mapsSearchUrl = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}`)}`;

export default SHOWCASE_PROJECTS;
