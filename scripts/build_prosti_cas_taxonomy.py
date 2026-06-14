# -*- coding: utf-8 -*-
"""
Build public/json/brands_models_prosti_cas.json (leisure / recreational vehicles).

Source: the curated list provided by the owner, years/countries ignored.
Each row = (type, brand, model, [trims]). Models that collide within the same
brand across categories are merged (variants deduped, first-seen type wins).

Run:  PYTHONIOENCODING=utf-8 python scripts/build_prosti_cas_taxonomy.py
"""
import json, os, collections

# type values MUST match the body-type-card data-value attributes in
# public/views/advanced-search.html (grid-leisure) so type filtering works.
AVTODOM   = "Avtodom"
PRIKOLICA = "PocitniiskaPrikolica"
HISICA    = "MobilnaHisica"
BIVALNIK  = "SnemljivBivalnik"
SOTOR     = "SotorskaPrikolica"

# (type, brand, model, [trims])
ROWS = [
    # ───────────────────────── 1. AVTODOM ─────────────────────────
    (AVTODOM, "Adria", "300", ["300"]),
    (AVTODOM, "Adria", "400", ["400"]),
    (AVTODOM, "Adria", "500", ["500"]),
    (AVTODOM, "Adria", "600", ["600"]),
    (AVTODOM, "Adria", "700", ["700"]),
    (AVTODOM, "Adria", "450", ["450"]),
    (AVTODOM, "Adria", "550", ["550"]),
    (AVTODOM, "Adria", "650", ["650"]),
    (AVTODOM, "Adria", "750", ["750"]),
    (AVTODOM, "Adria", "Action", ["Action"]),
    (AVTODOM, "Adria", "Compact", ["Compact"]),
    (AVTODOM, "Adria", "Coral", ["Coral", "Coral Compact", "Coral S-Class", "Coral XL", "Coral SLS"]),
    (AVTODOM, "Adria", "Matrix", ["Matrix", "Matrix Plus", "Matrix Supreme"]),
    (AVTODOM, "Adria", "Twin", ["Twin", "Twin SP", "Twin Max"]),
    (AVTODOM, "Adria", "Sonic", ["Sonic", "Sonic Plus"]),
    (AVTODOM, "Adria", "Supreme", ["Supreme"]),

    (AVTODOM, "Airstream", "310", ["310 Class A"]),
    (AVTODOM, "Airstream", "325", ["325 Class A"]),
    (AVTODOM, "Airstream", "345", ["345 Class A"]),
    (AVTODOM, "Airstream", "190", ["190 Class B"]),
    (AVTODOM, "Airstream", "230", ["230 Class B"]),
    (AVTODOM, "Airstream", "Land Yacht", ["Land Yacht 350", "Land Yacht 360"]),
    (AVTODOM, "Airstream", "B190", ["B190"]),
    (AVTODOM, "Airstream", "Interstate", ["Interstate", "Interstate Grand Tour", "Interstate Lounge Ext", "Interstate 19", "Interstate 24", "Interstate 27"]),
    (AVTODOM, "Airstream", "Atlas", ["Atlas", "Atlas 25'", "Atlas 30'"]),
    (AVTODOM, "Airstream", "Panoramic", ["Panoramic"]),
    (AVTODOM, "Airstream", "Rangeline", ["Rangeline"]),

    (AVTODOM, "Bürstner", "540", ["540"]),
    (AVTODOM, "Bürstner", "560", ["560"]),
    (AVTODOM, "Bürstner", "580", ["580"]),
    (AVTODOM, "Bürstner", "610", ["610"]),
    (AVTODOM, "Bürstner", "Premio", ["Premio"]),
    (AVTODOM, "Bürstner", "Aviano", ["Aviano", "Aviano i"]),
    (AVTODOM, "Bürstner", "Argos", ["Argos"]),
    (AVTODOM, "Bürstner", "Delfin", ["Delfin"]),
    (AVTODOM, "Bürstner", "Elegance", ["Elegance"]),
    (AVTODOM, "Bürstner", "Panorama", ["Panorama"]),
    (AVTODOM, "Bürstner", "Solano", ["Solano"]),
    (AVTODOM, "Bürstner", "Lyseo", ["Lyseo", "Lyseo Gallery"]),
    (AVTODOM, "Bürstner", "Ixeo", ["Ixeo", "Ixeo Plus"]),
    (AVTODOM, "Bürstner", "Harmony", ["Harmony", "Harmony Line"]),

    (AVTODOM, "Carthago", "C-Tourer", ["C-Tourer"]),
    (AVTODOM, "Carthago", "Chic", ["Chic", "Chic S", "Chic I", "Chic E"]),
    (AVTODOM, "Carthago", "C-Line", ["C-Line", "C-Line I"]),
    (AVTODOM, "Carthago", "E-Line", ["E-Line"]),
    (AVTODOM, "Carthago", "Liner", ["Liner", "Liner i", "Liner i 2022"]),
    (AVTODOM, "Carthago", "Compact", ["Compact"]),
    (AVTODOM, "Carthago", "Highlander", ["Highlander"]),

    (AVTODOM, "Chausson", "Odyssée", ["Odyssée 4000", "Odyssée 5000"]),
    (AVTODOM, "Chausson", "Welcome", ["Welcome", "Welcome 83", "Welcome 85", "Welcome 93", "Welcome 717", "Welcome 787", "Welcome 817"]),
    (AVTODOM, "Chausson", "Titanium", ["Titanium", "Titanium 740", "Titanium 750", "Titanium 780"]),
    (AVTODOM, "Chausson", "Flash", ["Flash", "Flash 10", "Flash 12", "Flash 16"]),

    (AVTODOM, "Dethleffs", "Pirat", ["Pirat D", "Pirat DU", "Pirat 510"]),
    (AVTODOM, "Dethleffs", "Globetrotter", ["Globetrotter", "Globetrotter XLT"]),
    (AVTODOM, "Dethleffs", "Advantage", ["Advantage"]),
    (AVTODOM, "Dethleffs", "Beduin", ["Beduin"]),
    (AVTODOM, "Dethleffs", "Esprit", ["Esprit"]),
    (AVTODOM, "Dethleffs", "Pulso", ["Pulso"]),
    (AVTODOM, "Dethleffs", "Caribic", ["Caribic"]),
    (AVTODOM, "Dethleffs", "Globebus", ["Globebus", "Globebus G"]),
    (AVTODOM, "Dethleffs", "Globevan", ["Globevan"]),
    (AVTODOM, "Dethleffs", "Pulse", ["Pulse", "Pulse Classic"]),
    (AVTODOM, "Dethleffs", "Just", ["Just"]),
    (AVTODOM, "Dethleffs", "Trend", ["Trend"]),
    (AVTODOM, "Dethleffs", "Globetrail", ["Globetrail"]),

    (AVTODOM, "Frankia", "500", ["500"]),
    (AVTODOM, "Frankia", "600", ["600"]),
    (AVTODOM, "Frankia", "700", ["700"]),
    (AVTODOM, "Frankia", "Platin", ["Platin", "Platin i", "Platin 2"]),
    (AVTODOM, "Frankia", "Gold", ["Gold"]),
    (AVTODOM, "Frankia", "Royal", ["Royal"]),
    (AVTODOM, "Frankia", "A-Class", ["A-Class", "A 8000", "A 9000"]),
    (AVTODOM, "Frankia", "iSmove", ["iSmove", "iSmove 4x4"]),
    (AVTODOM, "Frankia", "M", ["M 8000"]),

    (AVTODOM, "Hymer", "B-Class", ["B-Class", "B-Class ML", "B-Class ML-T", "B-Class ML-T 570", "B-Class ML-T 580", "B-Class ML-T 660", "B-Class ML-T 680"]),
    (AVTODOM, "Hymer", "S-Class", ["S-Class", "S-Class SL", "S-Class S"]),
    (AVTODOM, "Hymer", "M-Class", ["M-Class"]),
    (AVTODOM, "Hymer", "Eriba", ["Eriba"]),
    (AVTODOM, "Hymer", "Exsis", ["Exsis", "Exsis-i", "Exsis-i 504", "Exsis-i 588", "Exsis-i 604"]),
    (AVTODOM, "Hymer", "Camp", ["Camp 51"]),
    (AVTODOM, "Hymer", "Van", ["Van 512"]),
    (AVTODOM, "Hymer", "Grand Canyon", ["Grand Canyon S"]),

    (AVTODOM, "Knaus", "200", ["200"]),
    (AVTODOM, "Knaus", "300", ["300"]),
    (AVTODOM, "Knaus", "400", ["400"]),
    (AVTODOM, "Knaus", "500", ["500"]),
    (AVTODOM, "Knaus", "600", ["600"]),
    (AVTODOM, "Knaus", "700", ["700"]),
    (AVTODOM, "Knaus", "Sport", ["Sport"]),
    (AVTODOM, "Knaus", "Sun", ["Sun", "Sun TI", "Sun i", "Sun 650"]),
    (AVTODOM, "Knaus", "Boxstar", ["Boxstar", "Boxstar 500"]),
    (AVTODOM, "Knaus", "Van", ["Van", "Van TI 500", "Van TI Plus", "Van TI 700"]),
    (AVTODOM, "Knaus", "Boxlife", ["Boxlife", "Boxlife 600"]),
    (AVTODOM, "Knaus", "Sky", ["Sky"]),

    (AVTODOM, "Laika", "400", ["400"]),
    (AVTODOM, "Laika", "500", ["500"]),
    (AVTODOM, "Laika", "600", ["600"]),
    (AVTODOM, "Laika", "Ecovip", ["Ecovip", "Ecovip 7", "Ecovip 8", "Ecovip 9", "Ecovip F63", "Ecovip 7S"]),
    (AVTODOM, "Laika", "Kosmo", ["Kosmo", "Kosmo K45", "Kosmo K55", "Kosmo K50", "Kosmo 9"]),
    (AVTODOM, "Laika", "Kreos", ["Kreos", "Kreos 9"]),

    (AVTODOM, "Morelo", "Palace", ["Palace", "Palace 2", "Palace 3"]),
    (AVTODOM, "Morelo", "Loft", ["Loft", "Loft 2"]),
    (AVTODOM, "Morelo", "Empire", ["Empire", "Empire 2"]),
    (AVTODOM, "Morelo", "Grand Palace", ["Grand Palace"]),

    (AVTODOM, "Niesmann+Bischoff", "Flair", ["Flair", "Flair 600", "Flair 700", "Flair 800", "Flair 900"]),
    (AVTODOM, "Niesmann+Bischoff", "Arto", ["Arto", "Arto 600", "Arto 700", "Arto 800", "Arto 900"]),
    (AVTODOM, "Niesmann+Bischoff", "iSmove", ["iSmove"]),
    (AVTODOM, "Niesmann+Bischoff", "Venture", ["Venture", "Venture 2"]),

    (AVTODOM, "Pilote", "400", ["400"]),
    (AVTODOM, "Pilote", "500", ["500"]),
    (AVTODOM, "Pilote", "600", ["600"]),
    (AVTODOM, "Pilote", "700", ["700"]),
    (AVTODOM, "Pilote", "R", ["R740", "R750"]),
    (AVTODOM, "Pilote", "P", ["P696", "P711", "P724"]),
    (AVTODOM, "Pilote", "G", ["G740", "G741", "G746"]),
    (AVTODOM, "Pilote", "C", ["C740", "C735", "C740 (evo)"]),

    (AVTODOM, "Pössl", "Roadcruiser", ["Roadcruiser", "Roadcruiser 600", "Roadcruiser 4x4"]),
    (AVTODOM, "Pössl", "Van", ["Van"]),
    (AVTODOM, "Pössl", "Summit", ["Summit", "Summit 600"]),
    (AVTODOM, "Pössl", "Campster", ["Campster", "Campster 540"]),

    (AVTODOM, "Rapido", "Randonneur", ["Randonneur 410", "Randonneur 510", "Randonneur 610"]),
    (AVTODOM, "Rapido", "700", ["700"]),
    (AVTODOM, "Rapido", "800", ["800"]),
    (AVTODOM, "Rapido", "900", ["900"]),
    (AVTODOM, "Rapido", "910", ["910"]),
    (AVTODOM, "Rapido", "990", ["990"]),
    (AVTODOM, "Rapido", "M", ["M", "M 70", "M 80", "M 100"]),
    (AVTODOM, "Rapido", "8F", ["8F"]),
    (AVTODOM, "Rapido", "80dF", ["80dF"]),
    (AVTODOM, "Rapido", "9F", ["9F"]),
    (AVTODOM, "Rapido", "90dF", ["90dF"]),
    (AVTODOM, "Rapido", "Série 10", ["Série 10"]),

    (AVTODOM, "Sunlight", "A-Class", ["A-Class"]),
    (AVTODOM, "Sunlight", "A", ["A 65", "A 75"]),
    (AVTODOM, "Sunlight", "T", ["T 68", "T 70", "T 70 4x4"]),
    (AVTODOM, "Sunlight", "Cliff", ["Cliff", "Cliff 600"]),

    (AVTODOM, "Winnebago", "Brave", ["Brave"]),
    (AVTODOM, "Winnebago", "Chieftain", ["Chieftain"]),
    (AVTODOM, "Winnebago", "Elandan", ["Elandan"]),
    (AVTODOM, "Winnebago", "LeSharo", ["LeSharo"]),
    (AVTODOM, "Winnebago", "Adventurer", ["Adventurer"]),
    (AVTODOM, "Winnebago", "Minnie Winnie", ["Minnie Winnie"]),
    (AVTODOM, "Winnebago", "Vectra", ["Vectra"]),
    (AVTODOM, "Winnebago", "Journey", ["Journey"]),
    (AVTODOM, "Winnebago", "Sightseer", ["Sightseer"]),
    (AVTODOM, "Winnebago", "Aspect", ["Aspect"]),
    (AVTODOM, "Winnebago", "View", ["View"]),
    (AVTODOM, "Winnebago", "Forza", ["Forza"]),
    (AVTODOM, "Winnebago", "Solei", ["Solei"]),
    (AVTODOM, "Winnebago", "Travato", ["Travato"]),
    (AVTODOM, "Winnebago", "Revel", ["Revel", "Revel 4x4"]),
    (AVTODOM, "Winnebago", "Vita", ["Vita"]),
    (AVTODOM, "Winnebago", "Solis", ["Solis"]),
    (AVTODOM, "Winnebago", "Ekko", ["Ekko"]),

    (AVTODOM, "Thor Motor Coach", "Four Winds", ["Four Winds", "Four Winds 5000"]),
    (AVTODOM, "Thor Motor Coach", "Hurricane", ["Hurricane", "Hurricane 32", "Hurricane 35", "Hurricane 36"]),
    (AVTODOM, "Thor Motor Coach", "Chateau", ["Chateau", "Chateau 30", "Chateau 25"]),
    (AVTODOM, "Thor Motor Coach", "Vegas", ["Vegas"]),
    (AVTODOM, "Thor Motor Coach", "Axis", ["Axis"]),
    (AVTODOM, "Thor Motor Coach", "Sanctuary", ["Sanctuary"]),

    (AVTODOM, "Forest River", "Berkshire", ["Berkshire", "Berkshire XLT", "Berkshire 45"]),
    (AVTODOM, "Forest River", "Georgetown", ["Georgetown", "Georgetown XL", "Georgetown 5 Series"]),
    (AVTODOM, "Forest River", "Sunseeker", ["Sunseeker", "Sunseeker LE", "Sunseeker 2400"]),
    (AVTODOM, "Forest River", "Forester", ["Forester"]),

    (AVTODOM, "Tiffin", "Allegro", ["Allegro", "Allegro Bus", "Allegro Bay", "Allegro RED", "Allegro Open Road"]),
    (AVTODOM, "Tiffin", "Phaeton", ["Phaeton", "Phaeton 40", "Phaeton 38"]),
    (AVTODOM, "Tiffin", "Zephyr", ["Zephyr", "Zephyr 45", "Zephyr 44"]),

    # ─────────────────── 2. POČITNIŠKA PRIKOLICA ───────────────────
    (PRIKOLICA, "Adria", "300", ["300"]),
    (PRIKOLICA, "Adria", "400", ["400"]),
    (PRIKOLICA, "Adria", "500", ["500"]),
    (PRIKOLICA, "Adria", "600", ["600"]),
    (PRIKOLICA, "Adria", "700", ["700"]),
    (PRIKOLICA, "Adria", "Altea", ["Altea", "Altea 501", "Altea 542", "Altea 402", "Altea 502", "Altea 502 LD", "Altea 522"]),
    (PRIKOLICA, "Adria", "Adiva", ["Adiva"]),
    (PRIKOLICA, "Adria", "Optima", ["Optima"]),
    (PRIKOLICA, "Adria", "Adora", ["Adora 612", "Adora 542", "Adora 613"]),
    (PRIKOLICA, "Adria", "Action", ["Action"]),
    (PRIKOLICA, "Adria", "Astella", ["Astella", "Astella 613"]),

    (PRIKOLICA, "Airstream", "Excella", ["Excella", "Excella 1000"]),
    (PRIKOLICA, "Airstream", "Sovereign", ["Sovereign"]),
    (PRIKOLICA, "Airstream", "Ambassador", ["Ambassador"]),
    (PRIKOLICA, "Airstream", "International", ["International", "International CCD"]),
    (PRIKOLICA, "Airstream", "Classic", ["Classic", "Classic 33"]),
    (PRIKOLICA, "Airstream", "Land Yacht", ["Land Yacht"]),
    (PRIKOLICA, "Airstream", "Safari", ["Safari"]),
    (PRIKOLICA, "Airstream", "Bambi", ["Bambi", "Bambi 16'", "Bambi 22'", "Bambi 22"]),
    (PRIKOLICA, "Airstream", "Flying Cloud", ["Flying Cloud", "Flying Cloud 23FB", "Flying Cloud 25RB"]),
    (PRIKOLICA, "Airstream", "Sport", ["Sport"]),

    (PRIKOLICA, "Bailey", "Ranger", ["Ranger", "Ranger GT60"]),
    (PRIKOLICA, "Bailey", "Senator", ["Senator", "Senator Carolina"]),
    (PRIKOLICA, "Bailey", "Pageant", ["Pageant"]),
    (PRIKOLICA, "Bailey", "Unicorn", ["Unicorn Barcelona", "Unicorn Cadiz", "Unicorn 4", "Unicorn 5", "Unicorn 6"]),
    (PRIKOLICA, "Bailey", "Pegasus", ["Pegasus Bologna", "Pegasus Grande"]),
    (PRIKOLICA, "Bailey", "Pursuit", ["Pursuit"]),
    (PRIKOLICA, "Bailey", "Phoenix", ["Phoenix"]),
    (PRIKOLICA, "Bailey", "Discovery", ["Discovery"]),

    (PRIKOLICA, "Bürstner", "380", ["380"]),
    (PRIKOLICA, "Bürstner", "420", ["420"]),
    (PRIKOLICA, "Bürstner", "460", ["460"]),
    (PRIKOLICA, "Bürstner", "500", ["500"]),
    (PRIKOLICA, "Bürstner", "Premio", ["Premio", "Premio Life", "Premio 560"]),
    (PRIKOLICA, "Bürstner", "Aviano", ["Aviano"]),
    (PRIKOLICA, "Bürstner", "Delfin", ["Delfin"]),
    (PRIKOLICA, "Bürstner", "Averso", ["Averso", "Averso Plus", "Averso 600"]),

    (PRIKOLICA, "Dethleffs", "Beduin", ["Beduin", "Beduin 420", "Beduin 470", "Beduin 540", "Beduin 550", "Beduin 560"]),
    (PRIKOLICA, "Dethleffs", "Camper", ["Camper", "Camper 500", "Camper 520"]),
    (PRIKOLICA, "Dethleffs", "Globetrotter", ["Globetrotter"]),
    (PRIKOLICA, "Dethleffs", "C'go", ["C'go", "C'go 520"]),

    (PRIKOLICA, "Eriba", "Nova", ["Nova", "Nova 550"]),
    (PRIKOLICA, "Eriba", "Futura", ["Futura"]),
    (PRIKOLICA, "Eriba", "Touring", ["Touring", "Touring 320", "Touring 540", "Touring 542", "Touring 545"]),
    (PRIKOLICA, "Eriba", "Feeling", ["Feeling", "Feeling 530"]),

    (PRIKOLICA, "Fendt", "400", ["400"]),
    (PRIKOLICA, "Fendt", "500", ["500"]),
    (PRIKOLICA, "Fendt", "600", ["600"]),
    (PRIKOLICA, "Fendt", "Bianco", ["Bianco", "Bianco 550", "Bianco 560", "Bianco 520"]),
    (PRIKOLICA, "Fendt", "Saphir", ["Saphir", "Saphir 530", "Saphir 560", "Saphir 550", "Saphir 540"]),
    (PRIKOLICA, "Fendt", "Karisma", ["Karisma"]),
    (PRIKOLICA, "Fendt", "Tendenza", ["Tendenza", "Tendenza 530"]),

    (PRIKOLICA, "Hobby", "400", ["400"]),
    (PRIKOLICA, "Hobby", "500", ["500"]),
    (PRIKOLICA, "Hobby", "600", ["600"]),
    (PRIKOLICA, "Hobby", "De Luxe", ["De Luxe 700", "De Luxe 550", "De Luxe 650", "De Luxe 450", "De Luxe 540"]),
    (PRIKOLICA, "Hobby", "Prestige", ["Prestige 560", "Prestige 660", "Prestige 500", "Prestige 650"]),
    (PRIKOLICA, "Hobby", "Excellent", ["Excellent 560", "Excellent 660", "Excellent 560 Fh"]),

    (PRIKOLICA, "Jayco", "Jay Flight", ["Jay Flight", "Jay Flight 27", "Jay Flight 29", "Jay Flight G2", "Jay Flight SLX", "Jay Flight 265RLS"]),
    (PRIKOLICA, "Jayco", "Eagle", ["Eagle", "Eagle 278", "Eagle Super Lite"]),
    (PRIKOLICA, "Jayco", "Cardinal", ["Cardinal"]),
    (PRIKOLICA, "Jayco", "White Hawk", ["White Hawk", "White Hawk 30FL"]),
    (PRIKOLICA, "Jayco", "North Point", ["North Point", "North Point 377"]),

    (PRIKOLICA, "Knaus", "400", ["400"]),
    (PRIKOLICA, "Knaus", "500", ["500"]),
    (PRIKOLICA, "Knaus", "600", ["600"]),
    (PRIKOLICA, "Knaus", "Sport", ["Sport", "Sport 500", "Sport 550", "Sport 600", "Sport 650"]),
    (PRIKOLICA, "Knaus", "Südwind", ["Südwind", "Südwind 550", "Südwind 600", "Südwind 650", "Südwind 700"]),
    (PRIKOLICA, "Knaus", "Boxlife", ["Boxlife", "Boxlife 500", "Boxlife 600"]),

    (PRIKOLICA, "Tabbert", "Comtesse", ["Comtesse", "Comtesse 550", "Comtesse 560", "Comtesse 600", "Comtesse 650"]),
    (PRIKOLICA, "Tabbert", "Puccini", ["Puccini", "Puccini 500", "Puccini 540"]),
    (PRIKOLICA, "Tabbert", "Cellini", ["Cellini", "Cellini 550"]),
    (PRIKOLICA, "Tabbert", "Da Vinci", ["Da Vinci"]),

    (PRIKOLICA, "Swift", "Corniche", ["Corniche"]),
    (PRIKOLICA, "Swift", "Danette", ["Danette"]),
    (PRIKOLICA, "Swift", "Champion", ["Champion"]),
    (PRIKOLICA, "Swift", "Challenger", ["Challenger", "Challenger 480", "Challenger 540", "Challenger 570", "Challenger 590", "Challenger 580"]),
    (PRIKOLICA, "Swift", "Conqueror", ["Conqueror", "Conqueror 645"]),
    (PRIKOLICA, "Swift", "Elegance", ["Elegance", "Elegance 665", "Elegance 650"]),
    (PRIKOLICA, "Swift", "Basecamp", ["Basecamp"]),

    (PRIKOLICA, "Coachman", "Laser", ["Laser", "Laser 650", "Laser 630", "Laser 675"]),
    (PRIKOLICA, "Coachman", "Pastiche", ["Pastiche", "Pastiche 550", "Pastiche 575", "Pastiche 565"]),
    (PRIKOLICA, "Coachman", "VIP", ["VIP", "VIP 575", "VIP 650"]),

    (PRIKOLICA, "Grand Design", "Reflection", ["Reflection 303", "Reflection 337", "Reflection 150", "Reflection 315"]),
    (PRIKOLICA, "Grand Design", "Solitude", ["Solitude 310", "Solitude 375", "Solitude 380", "Solitude 391"]),
    (PRIKOLICA, "Grand Design", "Imagine", ["Imagine 2250", "Imagine 2500RL"]),

    (PRIKOLICA, "Keystone", "Cougar", ["Cougar", "Cougar 29", "Cougar 31", "Cougar 29RL"]),
    (PRIKOLICA, "Keystone", "Montana", ["Montana", "Montana High Country", "Montana 385FL"]),
    (PRIKOLICA, "Keystone", "Springdale", ["Springdale", "Springdale 202"]),

    (PRIKOLICA, "Forest River", "Rockwood", ["Rockwood", "Rockwood 2504", "Rockwood 2604", "Rockwood 2608"]),
    (PRIKOLICA, "Forest River", "Flagstaff", ["Flagstaff", "Flagstaff 26", "Flagstaff 29", "Flagstaff 27"]),
    (PRIKOLICA, "Forest River", "Salem", ["Salem", "Salem 30", "Salem 32"]),

    # ───────────────────── 3. MOBILNA HIŠICA ─────────────────────
    (HISICA, "Adria Home", "Adria Mobil", ["Adria Mobil", "Adria Mobil Superior", "Adria Mobil 502", "Adria Mobil 602", "Adria Mobil 702", "Adria Mobil 752"]),
    (HISICA, "Adria Home", "Alpina", ["Alpina", "Alpina Elegance", "Alpina 652", "Alpina 662", "Alpina 672"]),
    (HISICA, "Adria Home", "Holiday", ["Holiday"]),
    (HISICA, "Adria Home", "Superior", ["Superior 632"]),

    (HISICA, "Willerby", "Granada", ["Granada"]),
    (HISICA, "Willerby", "Sheraton", ["Sheraton", "Sheraton 2", "Sheraton 38", "Sheraton 42"]),
    (HISICA, "Willerby", "Malvern", ["Malvern"]),
    (HISICA, "Willerby", "Melrose", ["Melrose"]),
    (HISICA, "Willerby", "Sandpiper", ["Sandpiper"]),
    (HISICA, "Willerby", "Avon", ["Avon", "Avon 35"]),
    (HISICA, "Willerby", "Vogue", ["Vogue", "Vogue 40", "Vogue 44"]),
    (HISICA, "Willerby", "Aspen", ["Aspen", "Aspen 36"]),

    (HISICA, "Trigano", "IRM", ["IRM 300", "IRM 400", "IRM 450", "IRM 500"]),
    (HISICA, "Trigano", "O'HARA", ["O'HARA", "O'HARA 520", "O'HARA 600"]),
    (HISICA, "Trigano", "COCO", ["COCO (Cocoon)", "COCO 2"]),

    (HISICA, "Clayton", "24", ["24"]),
    (HISICA, "Clayton", "28", ["28"]),
    (HISICA, "Clayton", "32", ["32"]),
    (HISICA, "Clayton", "Doublewide", ["Doublewide"]),
    (HISICA, "Clayton", "Triplewide", ["Triplewide"]),
    (HISICA, "Clayton", "i-house", ["i-house"]),
    (HISICA, "Clayton", "Energy Smart", ["Energy Smart"]),
    (HISICA, "Clayton", "CrossMod", ["CrossMod"]),
    (HISICA, "Clayton", "Tiny", ["Tiny Homes", "Tiny Series"]),
    (HISICA, "Clayton", "Stillwater", ["Stillwater"]),
    (HISICA, "Clayton", "TruMH", ["TruMH"]),

    (HISICA, "Cavco", "14", ["14"]),
    (HISICA, "Cavco", "24", ["24"]),
    (HISICA, "Cavco", "28", ["28"]),
    (HISICA, "Cavco", "Fleetwood", ["Fleetwood"]),
    (HISICA, "Cavco", "Palm Harbor", ["Palm Harbor"]),
    (HISICA, "Cavco", "Fairmont", ["Fairmont"]),
    (HISICA, "Cavco", "Silvercrest", ["Silvercrest"]),
    (HISICA, "Cavco", "Indio", ["Indio"]),
    (HISICA, "Cavco", "Franklin", ["Franklin", "Franklin 36"]),
    (HISICA, "Cavco", "Newport", ["Newport", "Newport 32"]),

    (HISICA, "Karmod", "20", ["20"]),
    (HISICA, "Karmod", "30", ["30"]),
    (HISICA, "Karmod", "40", ["40"]),
    (HISICA, "Karmod", "Prestige", ["Prestige"]),
    (HISICA, "Karmod", "Premium", ["Premium"]),
    (HISICA, "Karmod", "Villa", ["Villa"]),
    (HISICA, "Karmod", "Tiny", ["Tiny"]),
    (HISICA, "Karmod", "Container Home", ["Container Home"]),

    (HISICA, "Beauer", "3X", ["3X", "3X Plus"]),
    (HISICA, "Beauer", "2X", ["2X", "2X Pro"]),

    # ───────────────────────── 4. BIVALNIK ─────────────────────────
    (BIVALNIK, "Volkswagen", "T3 California", ["T3 California"]),
    (BIVALNIK, "Volkswagen", "T4 California", ["T4 California Coach", "T4 California Exclusive"]),
    (BIVALNIK, "Volkswagen", "T5 California", ["T5 California Beach", "T5 California Comfortline", "T5 California Ocean"]),
    (BIVALNIK, "Volkswagen", "T6 California", ["T6 California Beach", "T6 California Ocean", "T6 California Coast"]),
    (BIVALNIK, "Volkswagen", "T6.1 California", ["T6.1 California Beach", "T6.1 California Ocean"]),
    (BIVALNIK, "Volkswagen", "Grand California", ["Grand California 600", "Grand California 680"]),
    (BIVALNIK, "Volkswagen", "Caddy California", ["Caddy California"]),
    (BIVALNIK, "Volkswagen", "Westfalia", ["Westfalia Joker", "Westfalia Campmobile", "Westfalia Columbus", "Westfalia Amundsen"]),

    (BIVALNIK, "Adria", "Twin", ["Twin 600", "Twin 600 SP", "Twin 640", "Twin 640 SP", "Twin 640 Max"]),
    (BIVALNIK, "Adria", "Twin Sport", ["Twin Sport", "Twin Sport 600"]),
    (BIVALNIK, "Adria", "Twin Max", ["Twin Max"]),

    (BIVALNIK, "Ford", "Transit", ["Transit Camper"]),
    (BIVALNIK, "Ford", "Transit Nugget", ["Transit Nugget", "Transit Nugget 2022"]),
    (BIVALNIK, "Ford", "Custom Nugget", ["Custom Nugget"]),
    (BIVALNIK, "Ford", "Tourneo", ["Tourneo"]),
    (BIVALNIK, "Ford", "Transit Trail", ["Transit Trail"]),

    (BIVALNIK, "Hymer", "Van", ["Van", "Van 512", "Van 514", "Van 524", "Van 532"]),
    (BIVALNIK, "Hymer", "Free S", ["Free S", "Free S 500", "Free S 540", "Free S 600", "Free S 630"]),
    (BIVALNIK, "Hymer", "Grand Canyon", ["Grand Canyon S", "Grand Canyon X"]),

    (BIVALNIK, "Pössl", "Van", ["Van 2Win", "Van Summit"]),
    (BIVALNIK, "Pössl", "Summit", ["Summit 600", "Summit 640", "Summit 600 4x4"]),
    (BIVALNIK, "Pössl", "Campster", ["Campster 540"]),
    (BIVALNIK, "Pössl", "Roadcruiser", ["Roadcruiser 600"]),

    (BIVALNIK, "Westfalia", "James Cook", ["James Cook"]),
    (BIVALNIK, "Westfalia", "Columbus", ["Columbus"]),
    (BIVALNIK, "Westfalia", "Amundsen", ["Amundsen"]),
    (BIVALNIK, "Westfalia", "Sven Hedin", ["Sven Hedin"]),
    (BIVALNIK, "Westfalia", "Kepler", ["Kepler 60"]),

    (BIVALNIK, "Winnebago", "LeSharo", ["LeSharo"]),
    (BIVALNIK, "Winnebago", "Warrior", ["Warrior"]),
    (BIVALNIK, "Winnebago", "Rialta", ["Rialta"]),
    (BIVALNIK, "Winnebago", "Vista", ["Vista"]),
    (BIVALNIK, "Winnebago", "View", ["View"]),
    (BIVALNIK, "Winnebago", "Aspect", ["Aspect"]),
    (BIVALNIK, "Winnebago", "Travato", ["Travato 59G", "Travato 59K"]),
    (BIVALNIK, "Winnebago", "Revel", ["Revel", "Revel 4x4", "Revel 44E"]),
    (BIVALNIK, "Winnebago", "Solis", ["Solis", "Solis 59PX"]),
    (BIVALNIK, "Winnebago", "Ekko", ["Ekko 22A"]),

    (BIVALNIK, "Airstream", "B190", ["B190"]),
    (BIVALNIK, "Airstream", "Interstate", ["Interstate", "Interstate Grand Tour", "Interstate Lounge Ext", "Interstate 19", "Interstate 24"]),
    (BIVALNIK, "Airstream", "Atlas", ["Atlas 25'"]),
    (BIVALNIK, "Airstream", "Rangeline", ["Rangeline"]),

    (BIVALNIK, "Pleasure-Way", "Plateau", ["Plateau", "Plateau TS", "Plateau TS FL", "Plateau 4x4"]),
    (BIVALNIK, "Pleasure-Way", "Lexor", ["M/S Lexor"]),
    (BIVALNIK, "Pleasure-Way", "Ascent", ["Ascent", "Ascent 4x4"]),
    (BIVALNIK, "Pleasure-Way", "Excel", ["Excel"]),
    (BIVALNIK, "Pleasure-Way", "Ontour", ["Ontour"]),

    (BIVALNIK, "Roadtrek", "190", ["190"]),
    (BIVALNIK, "Roadtrek", "200", ["200"]),
    (BIVALNIK, "Roadtrek", "RS Adventurous", ["RS Adventurous"]),
    (BIVALNIK, "Roadtrek", "Agile", ["Agile"]),
    (BIVALNIK, "Roadtrek", "Zion", ["Zion", "Zion SRT", "Zion 2"]),
    (BIVALNIK, "Roadtrek", "Simplicity", ["Simplicity"]),
    (BIVALNIK, "Roadtrek", "Chase", ["Chase"]),

    # ─────────────────── 5. ŠOTORSKA PRIKOLICA ───────────────────
    (SOTOR, "Camp-let", "Classic", ["Classic"]),
    (SOTOR, "Camp-let", "Combi", ["Combi"]),
    (SOTOR, "Camp-let", "GT", ["GT", "GT 2000", "GT 320", "GT 4", "GT 4 plus"]),
    (SOTOR, "Camp-let", "Passion", ["Passion", "Passion 4", "Passion 5"]),
    (SOTOR, "Camp-let", "Royal", ["Royal", "Royal 360"]),
    (SOTOR, "Camp-let", "Apollo", ["Apollo", "Apollo 4"]),

    (SOTOR, "Trigano", "Camplair", ["Camplair 400", "Camplair 500", "Camplair Odyssey", "Camplair 450", "Camplair 550", "Camplair 470", "Camplair 570", "Camplair 520", "Camplair 620"]),
    (SOTOR, "Trigano", "Galleon", ["Galleon", "Galleon 600", "Galleon 650"]),
    (SOTOR, "Trigano", "Odyssey", ["Odyssey", "Odyssey 5"]),

    (SOTOR, "Aliner", "Classic", ["Classic"]),
    (SOTOR, "Aliner", "Expedition", ["Expedition", "Expedition 2.0", "Expedition 4"]),
    (SOTOR, "Aliner", "Ranger", ["Ranger", "Ranger 10"]),
    (SOTOR, "Aliner", "Scout", ["Scout"]),
    (SOTOR, "Aliner", "Ascape", ["Ascape", "Ascape XL"]),
    (SOTOR, "Aliner", "Family", ["Family"]),

    (SOTOR, "Holtkamper", "Kyte", ["Kyte", "Kyte 350", "Kyte 370", "Kyte 380", "Kyte 400"]),
    (SOTOR, "Holtkamper", "Wind", ["Wind", "Wind 400"]),
    (SOTOR, "Holtkamper", "Flyer", ["Flyer", "Flyer 450", "Flyer 460", "Flyer 480"]),

    (SOTOR, "Comanche", "FreeStander", ["FreeStander", "FreeStander 2", "FreeStander 3", "FreeStander 400", "FreeStander 500"]),
    (SOTOR, "Comanche", "Mc Camp", ["Mc Camp", "Mc Camp 2", "Mc Camp 200", "Mc Camp 250"]),

    (SOTOR, "Coleman", "Columbia", ["Columbia"]),
    (SOTOR, "Coleman", "Shenandoah", ["Shenandoah"]),
    (SOTOR, "Coleman", "Chesapeake", ["Chesapeake"]),
    (SOTOR, "Coleman", "Cheyenne", ["Cheyenne"]),
    (SOTOR, "Coleman", "Sun Valley", ["Sun Valley"]),
    (SOTOR, "Coleman", "Taos", ["Taos"]),
    (SOTOR, "Coleman", "Niagara", ["Niagara"]),
    (SOTOR, "Coleman", "Cobalt", ["Cobalt"]),
    (SOTOR, "Coleman", "E1", ["E1"]),
    (SOTOR, "Coleman", "Lantern", ["Lantern"]),
    (SOTOR, "Coleman", "Classic", ["Classic"]),
    (SOTOR, "Coleman", "Evolution", ["Evolution"]),
    (SOTOR, "Coleman", "Rubicon", ["Rubicon"]),
    (SOTOR, "Coleman", "17B", ["17B"]),
    (SOTOR, "Coleman", "17R", ["17R"]),

    (SOTOR, "Forest River", "Rockwood", ["Rockwood Tent 1640", "Rockwood Tent 1940", "Rockwood Premier 2318", "Rockwood Premier 2516", "Rockwood High Wall 2516"]),
    (SOTOR, "Forest River", "Flagstaff", ["Flagstaff 176", "Flagstaff MAC", "Flagstaff 228D"]),

    (SOTOR, "Jayco", "Jay Series", ["Jay Series 806", "Jay Series 1008", "Jay Series 1207"]),
    (SOTOR, "Jayco", "Eagle", ["Eagle 10", "Eagle 12"]),
    (SOTOR, "Jayco", "Select", ["Select 12", "Select 14"]),
    (SOTOR, "Jayco", "Jay Sport", ["Sport 8", "Jay Sport 8", "Jay Sport 10", "Jay Sport 8HD"]),
    (SOTOR, "Jayco", "Baja", ["Baja", "Baja 10"]),
]


def build():
    # brand -> model -> {type, variants(ordered, unique)}
    tree = collections.OrderedDict()
    for vtype, brand, model, trims in ROWS:
        b = tree.setdefault(brand, collections.OrderedDict())
        if model not in b:
            b[model] = {"type": vtype, "_trims": []}
        seen = b[model]["_trims"]
        for t in trims:
            if t not in seen:
                seen.append(t)

    out = collections.OrderedDict()
    for brand in sorted(tree, key=lambda s: s.lower()):
        out[brand] = collections.OrderedDict()
        for model in sorted(tree[brand], key=lambda s: s.lower()):
            entry = tree[brand][model]
            out[brand][model] = {
                "type": entry["type"],
                "variants": [{"trim": t} for t in entry["_trims"]],
            }
    return out


def main():
    data = build()
    here = os.path.dirname(os.path.abspath(__file__))
    dest = os.path.join(here, "..", "public", "json", "brands_models_prosti_cas.json")
    dest = os.path.normpath(dest)
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    brands = len(data)
    models = sum(len(m) for m in data.values())
    variants = sum(len(v["variants"]) for m in data.values() for v in m.values())
    print(f"Wrote {dest}")
    print(f"  brands={brands}  models={models}  variants={variants}")


if __name__ == "__main__":
    main()
