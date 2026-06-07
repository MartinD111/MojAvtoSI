# -*- coding: utf-8 -*-
"""
Merges the extra high-performance / exotic vehicle list into
public/json/brands_models_global.json without touching the Excel source.

Rules:
  - New brand  → add brand + model + trims.
  - Brand exists, model missing  → add model + trims.
  - Brand exists, model exists, trim missing  → append trim.
  - Exact duplicate trim (same trim string for same model) → skip.
  - Sort brands and models alphabetically (case-insensitive) after merge.
"""
import json, sys
from collections import OrderedDict

OUT = sys.argv[1] if len(sys.argv) > 1 else \
    r"c:/Users/marti/AMS d.o.o/MojAvto.si/public/json/brands_models_global.json"

FUEL_MAP = {
    'phev': 'Plug-in Hybrid', 'plug-in hybrid': 'Plug-in Hybrid',
    'petrol': 'Petrol', 'diesel': 'Diesel', 'electric': 'Electric',
    'hybrid': 'Hybrid', 'lpg': 'LPG', 'cng': 'CNG',
}

def fuel(raw):
    return FUEL_MAP.get(raw.strip().lower(), raw.strip())

def cc(raw):
    s = str(raw).strip()
    if not s or s in ('', 'nan', 'None'):
        return None
    try:
        return int(float(s))
    except ValueError:
        return None

# ── Extra vehicle data ────────────────────────────────────────────────────────
# (make, model, trim, fuel_type, engine_capacity_cc or '')
EXTRA = [
    ("Ford","F-150","XL","Petrol",2700),
    ("Ford","F-150","XLT","Petrol",2700),
    ("Ford","F-150","Lariat","Petrol",3500),
    ("Ford","F-150","King Ranch","Petrol",5000),
    ("Ford","F-150","Platinum","Petrol",3500),
    ("Ford","F-150","Limited","Petrol",3500),
    ("Ford","F-150","Tremor","Petrol",3500),
    ("Ford","F-150","Raptor R","Petrol",5000),
    ("Ford","Ranger","XL","Petrol",2300),
    ("Ford","Ranger","XLT","Petrol",2300),
    ("Ford","Ranger","Lariat","Petrol",2300),
    ("Ford","Mustang","EcoBoost Premium","Petrol",2300),
    ("Ford","Mustang","GT Premium","Petrol",5000),
    ("Ford","Mustang","GT500","Petrol",5200),
    ("Ford","Mustang","Mach 1 Handling Package","Petrol",5000),
    ("Ford","Mustang","Dark Horse","Petrol",5000),
    ("Ford","Explorer","ST","Petrol",3000),
    ("Ford","Explorer","King Ranch","Petrol",3000),
    ("Ford","Explorer","Platinum","Petrol",3000),
    ("Ford","Edge","ST","Petrol",2700),
    ("Ford","Expedition","Platinum","Petrol",3500),
    ("Ford","Expedition","King Ranch","Petrol",3500),
    ("Ford","Bronco","Badlands","Petrol",2700),
    ("Ford","Bronco","Outer Banks","Petrol",2700),
    ("Ford","Bronco","Wildtrak","Petrol",2700),
    ("Ford","Bronco","Raptor","Petrol",3000),
    ("BMW","Series 1","M140i","Petrol",3000),
    ("BMW","Series 1","M135i xDrive","Petrol",2000),
    ("BMW","Series 2","M2 Competition","Petrol",3000),
    ("BMW","Series 2","M2 CS","Petrol",3000),
    ("BMW","Series 3","M3 (E92)","Petrol",3999),
    ("BMW","Series 3","M3 (F80)","Petrol",3000),
    ("BMW","Series 3","M3 CS (F80)","Petrol",3000),
    ("BMW","Series 3","M3 CSL (E46)","Petrol",3246),
    ("BMW","Series 3","M3 Touring (G81)","Petrol",3000),
    ("BMW","Series 4","M4 CSL (G82)","Petrol",3000),
    ("BMW","Series 4","M4 GTS (F82)","Petrol",3000),
    ("BMW","Series 5","M5 CS (F90)","Petrol",4400),
    ("BMW","Series 5","M5 Touring (G99)","PHEV",4400),
    ("BMW","Series 6","M6 Competition","Petrol",4400),
    ("BMW","Series 7","M760Li","Petrol",6600),
    ("BMW","Series 8","M8 Competition","Petrol",4400),
    ("BMW","X3","X3 M Competition","Petrol",3000),
    ("BMW","X4","X4 M Competition","Petrol",3000),
    ("BMW","X5","X5 M Competition","Petrol",4400),
    ("BMW","X6","X6 M Competition","Petrol",4400),
    ("BMW","X7","X7 M60i","Petrol",4400),
    ("BMW","Z4","M40i","Petrol",3000),
    ("BMW","i4","M50","Electric",""),
    ("BMW","iX","iX M60","Electric",""),
    ("BMW","M2","M2 (F87)","Petrol",3000),
    ("BMW","M3 (E30)","Sport Evolution","Petrol",2467),
    ("BMW","M3 (E36)","M3 GT","Petrol",2990),
    ("BMW","M3 (E46)","M3 GTR","Petrol",4000),
    ("BMW","M5 (E60)","M5","Petrol",4999),
    ("BMW","M5 (E39)","M5","Petrol",4941),
    ("Mercedes-Benz","A-Class","AMG A 45 S","Petrol",1991),
    ("Mercedes-Benz","C-Class","AMG C 63 (W204)","Petrol",6208),
    ("Mercedes-Benz","C-Class","AMG C 63 S (W205)","Petrol",3982),
    ("Mercedes-Benz","C-Class","AMG C 63 Black Series","Petrol",6208),
    ("Mercedes-Benz","C-Class","C 63 AMG (W204)","Petrol",6208),
    ("Mercedes-Benz","E-Class","AMG E 63 S (W213)","Petrol",3982),
    ("Mercedes-Benz","E-Class","AMG E 63 S Estate","Petrol",3982),
    ("Mercedes-Benz","E-Class","AMG E 55 (W211)","Petrol",5439),
    ("Mercedes-Benz","S-Class","S 65 AMG (W222)","Petrol",5980),
    ("Mercedes-Benz","S-Class","Maybach S 650 (X222)","Petrol",5980),
    ("Mercedes-Benz","S-Class","Maybach S 600 (X222)","Petrol",5980),
    ("Mercedes-Benz","SL","SL 65 AMG (R230)","Petrol",5980),
    ("Mercedes-Benz","SLS AMG","SLS AMG Black Series","Petrol",6208),
    ("Mercedes-Benz","GT","AMG GT R Pro","Petrol",3982),
    ("Mercedes-Benz","GT","AMG GT Track Series","Petrol",3982),
    ("Mercedes-Benz","G-Class","AMG G 63 (W463)","Petrol",3982),
    ("Mercedes-Benz","G-Class","AMG G 65 (W463)","Petrol",5980),
    ("Mercedes-Benz","CLS","AMG CLS 63 S","Petrol",5500),
    ("Mercedes-Benz","CLA","AMG CLA 45 S","Petrol",1991),
    ("Mercedes-Benz","GLA","AMG GLA 45 S","Petrol",1991),
    ("Mercedes-Benz","GLE","AMG GLE 63 S","Petrol",3982),
    ("Mercedes-Benz","GLS","Maybach GLS 600","Petrol",3982),
    ("Audi","A3","RS 3 Sportback","Petrol",2480),
    ("Audi","A4","RS 4 Avant (B7)","Petrol",4163),
    ("Audi","A4","RS 4 Avant (B9)","Petrol",2894),
    ("Audi","A6","RS 6 Avant (C7)","Petrol",3993),
    ("Audi","A6","RS 6 Avant (C8)","Petrol",3996),
    ("Audi","A7","RS 7 Sportback (C7)","Petrol",3993),
    ("Audi","R8","V10 Plus (Type 4S)","Petrol",5204),
    ("Audi","R8","V10 RWS","Petrol",5204),
    ("Audi","R8","Spyder V10 Plus","Petrol",5204),
    ("Audi","TT","TT RS (8J)","Petrol",2480),
    ("Audi","TT","TT RS Roadster (8S)","Petrol",2480),
    ("Audi","Q5","SQ5 (8R)","Petrol",2995),
    ("Audi","Q7","SQ7 TDI","Diesel",3956),
    ("Audi","Q8","RS Q8","Petrol",3996),
    ("Porsche","911","GT2 RS (991)","Petrol",3800),
    ("Porsche","911","GT2 RS (997)","Petrol",3600),
    ("Porsche","911","GT3 Touring (992)","Petrol",3996),
    ("Porsche","911","GT3 RS (997)","Petrol",3600),
    ("Porsche","911","Sport Classic (997)","Petrol",3800),
    ("Porsche","911","Speedster (991)","Petrol",4000),
    ("Porsche","911","R (991)","Petrol",4000),
    ("Porsche","911","Carrera 4 GTS","Petrol",3000),
    ("Porsche","Cayman","GT4 RS","Petrol",4000),
    ("Porsche","Boxster","Spyder (987)","Petrol",3400),
    ("Porsche","Boxster","Spyder (981)","Petrol",3800),
    ("Porsche","Panamera","Turbo S E-Hybrid","PHEV",3996),
    ("Porsche","Macan","Turbo","Petrol",3600),
    ("Porsche","Cayenne","Turbo GT","Petrol",3996),
    ("Toyota","Land Cruiser","70 Series LX","Petrol",4500),
    ("Toyota","Land Cruiser","70 Series Hardtop","Diesel",4200),
    ("Toyota","Supra","GR Supra A90 Final Edition","Petrol",3000),
    ("Toyota","GR86","GR86 Premium","Petrol",2400),
    ("Toyota","Yaris","GR Yaris Circuit Pack","Petrol",1618),
    ("Toyota","Camry","TRD","Petrol",3500),
    ("Toyota","RAV4","Prime","PHEV",2500),
    ("Toyota","Highlander","Platinum","Petrol",3500),
    ("Toyota","4Runner","TRD Pro","Petrol",4000),
    ("Toyota","Tacoma","TRD Pro","Petrol",3500),
    ("Toyota","Tundra","TRD Pro","Petrol",5700),
    ("Toyota","Corolla","GR Corolla Circuit Edition","Petrol",1600),
    ("Honda","Civic","Type R (FK8)","Petrol",2000),
    ("Honda","Civic","Type R (FK2)","Petrol",2000),
    ("Honda","Civic","Type R (EP3)","Petrol",2000),
    ("Honda","S2000","S2000 CR","Petrol",2000),
    ("Honda","NSX","NSX-R (NA2)","Petrol",3200),
    ("Honda","NSX","NSX Type S (NC1)","Hybrid",3493),
    ("Honda","Accord","2.0T Sport","Petrol",2000),
    ("Honda","Accord","Hybrid Touring","Hybrid",2000),
    ("Nissan","GT-R","GT-R Nismo (R35)","Petrol",3800),
    ("Nissan","GT-R","GT-R50","Petrol",3800),
    ("Nissan","Skyline GT-R","R33 Nismo 400R","Petrol",2800),
    ("Nissan","Skyline GT-R","R34 Z-Tune","Petrol",2800),
    ("Nissan","370Z","370Z Nismo (Z34)","Petrol",3700),
    ("Nissan","370Z","370Z Roadster","Petrol",3700),
    ("Nissan","Z","Z Nismo","Petrol",3000),
    ("Nissan","Altima","SR VC-Turbo","Petrol",2000),
    ("Nissan","Maxima","Platinum","Petrol",3500),
    ("Nissan","Titan","PRO-4X","Petrol",5600),
    ("Mazda","MX-5","Miata RF Club","Petrol",2000),
    ("Mazda","MX-5","Miata 30th Anniversary","Petrol",2000),
    ("Mazda","RX-7","RX-7 Spirit R","Petrol",1300),
    ("Mazda","RX-8","RX-8 Spirit R","Petrol",1300),
    ("Mazda","3","Mazda3 Turbo","Petrol",2500),
    ("Mazda","6","Mazda6 Signature","Petrol",2500),
    ("Mazda","CX-5","Signature","Petrol",2500),
    ("Mazda","CX-50","Meridian","Petrol",2500),
    ("Mazda","MX-5","Miata Grand Touring","Petrol",2000),
    ("Subaru","Impreza","WRX STI S209","Petrol",2500),
    ("Subaru","Impreza","WRX STI S204","Petrol",2000),
    ("Subaru","Impreza","WRX STI 22B","Petrol",2212),
    ("Subaru","BRZ","BRZ tS","Petrol",2400),
    ("Subaru","WRX","STI Limited","Petrol",2500),
    ("Subaru","Outback","Onyx Edition XT","Petrol",2400),
    ("Subaru","Forester","Sport","Petrol",2500),
    ("Subaru","Crosstrek","Sport","Petrol",2500),
    ("Mitsubishi","Lancer","Evolution VI Tommi Makinen","Petrol",2000),
    ("Mitsubishi","Lancer","Evolution IX MR","Petrol",2000),
    ("Mitsubishi","Lancer","Evolution X FQ-440 MR","Petrol",2000),
    ("Mitsubishi","Eclipse","GSX","Petrol",2000),
    ("Lamborghini","Aventador","LP 750-4 SV","Petrol",6498),
    ("Lamborghini","Aventador","LP 780-4 Ultimae","Petrol",6498),
    ("Lamborghini","Huracán","LP 610-4 Spyder","Petrol",5204),
    ("Lamborghini","Huracán","STO","Petrol",5204),
    ("Lamborghini","Sesto Elemento","Sesto Elemento","Petrol",5204),
    ("Lamborghini","Veneno","Veneno","Petrol",6498),
    ("Lamborghini","Centenario","Centenario","Petrol",6498),
    ("Lamborghini","Sián","Sián FKP 37","Hybrid",6498),
    ("Lamborghini","Countach","LPI 800-4","Hybrid",6498),
    ("Ferrari","F50","F50 GT","Petrol",4700),
    ("Ferrari","Enzo","FXX","Petrol",5998),
    ("Ferrari","LaFerrari","FXX-K","Hybrid",6262),
    ("Ferrari","599 GTB Fiorano","599 GTO","Petrol",5999),
    ("Ferrari","488 GTB","488 Pista Spider","Petrol",3902),
    ("Ferrari","F8 Tributo","F8 Tributo Spider","Petrol",3902),
    ("Ferrari","812 Superfast","812 Competizione A","Petrol",6496),
    ("Ferrari","SF90 Stradale","SF90 Spider","Hybrid",3990),
    ("Ferrari","296 GTB","296 GTB Assetto Fiorano","Hybrid",2992),
    ("Ferrari","12Cilindri","12Cilindri Spider","Petrol",6496),
    ("Ferrari","Purosangue","Purosangue","Petrol",6496),
    ("McLaren","720S","720S Spider","Petrol",3994),
    ("McLaren","720S","765LT","Petrol",3994),
    ("McLaren","720S","765LT Spider","Petrol",3994),
    ("McLaren","P1","P1 GTR","PHEV",3800),
    ("McLaren","Senna","Senna GTR","Petrol",3994),
    ("McLaren","Senna","Senna Can-Am","Petrol",3994),
    ("McLaren","Artura","Artura","Hybrid",2993),
    ("McLaren","650S","650S Can-Am","Petrol",3800),
    ("McLaren","570S","570S GT4","Petrol",3800),
    ("McLaren","750S","750S Spider","Petrol",3994),
    ("Aston Martin","DBS","DBS 770 Ultimate","Petrol",5204),
    ("Aston Martin","DBS","Superleggera","Petrol",5204),
    ("Aston Martin","Vantage","Vantage AMR","Petrol",3982),
    ("Aston Martin","DB11","DB11 AMR","Petrol",5204),
    ("Aston Martin","Valhalla","Valhalla","Hybrid",4000),
    ("Aston Martin","Valkyrie","Valkyrie AMR Pro","Hybrid",6498),
    ("Aston Martin","DBX","DBX707","Petrol",3982),
    ("Bugatti","Chiron","Chiron Sport 110 Ans","Petrol",8000),
    ("Bugatti","Chiron","Super Sport 300+","Petrol",8000),
    ("Bugatti","Divo","Divo","Petrol",8000),
    ("Bugatti","Centodieci","Centodieci","Petrol",8000),
    ("Bugatti","La Voiture Noire","La Voiture Noire","Petrol",8000),
    ("Pagani","Zonda","Zonda Cinque Roadster","Petrol",7300),
    ("Pagani","Huayra","Huayra BC Roadster","Petrol",6000),
    ("Pagani","Huayra","Huayra Tricolore","Petrol",6000),
    ("Pagani","Utopia","Utopia Roadster","Petrol",6000),
    ("Koenigsegg","Agera","Agera RS","Petrol",5000),
    ("Koenigsegg","Jesko","Jesko Absolut","Petrol",5000),
    ("Koenigsegg","Regera","Regera","PHEV",5000),
    ("Koenigsegg","Gemera","Gemera","Hybrid",2000),
    ("Chevrolet","Corvette","Z06 (C5)","Petrol",5700),
    ("Chevrolet","Corvette","ZR1 (C7)","Petrol",6200),
    ("Chevrolet","Corvette","ZR1 (C4)","Petrol",5700),
    ("Chevrolet","Camaro","ZL1 1LE","Petrol",6200),
    ("Chevrolet","Camaro","SS 1LE","Petrol",6200),
    ("Chevrolet","Silverado","1500 Trail Boss","Petrol",5300),
    ("Chevrolet","Silverado","2500HD ZR2","Petrol",6600),
    ("Chevrolet","Tahoe","Z71","Petrol",5300),
    ("Chevrolet","Suburban","High Country","Petrol",5300),
    ("Chevrolet","Colorado","ZR2","Petrol",2700),
    ("Chevrolet","Blazer","RS","Petrol",3600),
    ("Dodge","Challenger","SRT Demon","Petrol",6200),
    ("Dodge","Challenger","SRT Hellcat Redeye","Petrol",6200),
    ("Dodge","Charger","SRT Hellcat Redeye","Petrol",6200),
    ("Jeep","Grand Cherokee","Trackhawk","Petrol",6200),
    ("Jeep","Wrangler","Rubicon 392","Petrol",6400),
    ("Jeep","Wrangler","Rubicon Xtreme Recon","Petrol",3600),
    ("Jeep","Gladiator","Mojave","Petrol",3600),
    ("Jeep","Wagoneer","Series III","Petrol",6200),
    ("RAM","1500","TRX","Petrol",6200),
    ("RAM","1500","Limited","Petrol",5700),
    ("RAM","2500","Power Wagon","Petrol",6400),
    ("Cadillac","Escalade","ESV Platinum","Petrol",6200),
    ("Cadillac","CT5","CT5-V Blackwing","Petrol",6200),
    ("Cadillac","CT4","CT4-V Blackwing","Petrol",3600),
    ("Cadillac","Lyriq","Lyriq","Electric",""),
    ("Lincoln","Navigator","Black Label","Petrol",3500),
    ("Lincoln","Aviator","Grand Touring Black Label","PHEV",3000),
    ("Lincoln","Continental","Coach Door Edition","Petrol",3000),
    ("Volkswagen","Golf","R (Mk7)","Petrol",1984),
    ("Volkswagen","Golf","GTI Clubsport S","Petrol",1984),
    ("Volkswagen","Golf","GTI TCR","Petrol",1984),
    ("Volkswagen","Golf","R32 (Mk5)","Petrol",3189),
    ("Volkswagen","Golf","R32 (Mk4)","Petrol",3189),
    ("Volkswagen","Scirocco","R (Mk3)","Petrol",1984),
    ("Volkswagen","Tiguan","R-Line","Petrol",2000),
    ("Volkswagen","Arteon","R-Line","Petrol",2000),
    ("Volkswagen","Passat","R36","Petrol",3597),
    ("Volkswagen","Touareg","R50","Diesel",5000),
    ("Volkswagen","ID.4","Pro S","Electric",""),
    ("Volkswagen","ID. Buzz","1st Edition","Electric",""),
    ("Škoda","Octavia","RS 245","Petrol",2000),
    ("Škoda","Octavia","Scout","Petrol",2000),
    ("Škoda","Superb","Laurin & Klement L&K","Petrol",2000),
    ("Škoda","Kodiaq","RS","Petrol",2000),
    ("Škoda","Fabia","Monte Carlo","Petrol",1500),
    ("Seat","Leon","Cupra R","Petrol",2000),
    ("Seat","Leon","Cupra 290","Petrol",2000),
    ("Seat","Ibiza","Cupra Bocanegra","Petrol",1400),
    ("Cupra","Formentor","VZ5","Petrol",2480),
    ("Cupra","Born","77 kWh","Electric",""),
    ("Renault","Megane","R.S. Trophy-R","Petrol",1800),
    ("Renault","Clio","R.S. Trophy","Petrol",1600),
    ("Renault","Clio","R.S. 220 Trophy","Petrol",1600),
    ("Renault","Clio","V6 Phase 2","Petrol",3000),
    ("Renault","5","Turbo 2","Petrol",1400),
    ("Renault","Alpine A110","R","Petrol",1800),
    ("Peugeot","308","GTi by Peugeot Sport","Petrol",1600),
    ("Peugeot","208","GTi 30th","Petrol",1600),
    ("Peugeot","508","PSE","PHEV",1600),
    ("Peugeot","RCZ","R","Petrol",1600),
    ("Opel","Astra","OPC","Petrol",2000),
    ("Opel","Corsa","OPC","Petrol",1600),
    ("Opel","Insignia","OPC","Petrol",2800),
    ("Mini","John Cooper Works","GP","Petrol",2000),
    ("Mini","Cooper","SE Cabrio","Electric",""),
    ("Alfa Romeo","Giulia","Quadrifoglio Racing","Petrol",2900),
    ("Alfa Romeo","Stelvio","Quadrifoglio Racing","Petrol",2900),
    ("Alfa Romeo","4C","Spider 33 Stradale Tributo","Petrol",1750),
    ("Fiat","500","Abarth 695 Biposto","Petrol",1400),
    ("Fiat","500","Abarth 595 Esseesse","Petrol",1400),
    ("Jaguar","F-Type","Project 7","Petrol",5000),
    ("Jaguar","XE","SV Project 8","Petrol",5000),
    ("Jaguar","XJ","XJR575","Petrol",5000),
    ("Land Rover","Range Rover","Sport SVR Ultimate","Petrol",5000),
    ("Land Rover","Defender","90 V8 Carpathian Edition","Petrol",5000),
    ("Lexus","LFA","Nürburgring Package","Petrol",4800),
    ("Lexus","RC F","Track Edition","Petrol",5000),
    ("Lexus","GS F","GS F","Petrol",5000),
    ("Lexus","IS 500","F Sport Performance","Petrol",5000),
    ("Acura","NSX","Type S","Petrol",3500),
    ("Acura","Integra","Type R (DC2)","Petrol",1800),
    ("Infiniti","Q60","Red Sport 400 AWD","Petrol",3000),
    ("Infiniti","QX80","Sensory","Petrol",5600),
    ("Genesis","G70","Launch Edition","Petrol",3300),
    ("Genesis","G80","Sport","Petrol",3300),
    ("Kia","Stinger","GT2","Petrol",3300),
    ("Kia","EV6","GT-Line AWD","Electric",""),
    ("Hyundai","Ioniq 5 N","Ioniq 5 N","Electric",""),
    ("Hyundai","Elantra N","Elantra N","Petrol",2000),
    ("Hyundai","Kona N","Kona N","Petrol",2000),
    ("Hyundai","Veloster N","Veloster N","Petrol",2000),
    ("Tesla","Model S","Plaid+","Electric",""),
    ("Tesla","Model X","Plaid","Electric",""),
    ("Tesla","Model Y","Performance","Electric",""),
    ("Polestar","1","1","PHEV",2000),
    ("Polestar","2","BST Edition 270","Electric",""),
    ("Volvo","S60","Polestar Engineered","PHEV",2000),
    ("Volvo","V60","Polestar Engineered","PHEV",2000),
    ("Volvo","XC60","Polestar Engineered","PHEV",2000),
    ("Saab","9-3","Turbo X","Petrol",2800),
    ("Saab","9-5","Aero Turbo6","Petrol",2800),
    ("Maserati","GranTurismo","MC Stradale","Petrol",4700),
    ("Maserati","Quattroporte","GTS","Petrol",3800),
    ("Bentley","Continental GT","Supersports","Petrol",6000),
    ("Bentley","Bentayga","Speed","Petrol",6000),
    ("Rolls-Royce","Cullinan","Black Badge","Petrol",6750),
    ("Rolls-Royce","Ghost","Black Badge","Petrol",6750),
    ("Lotus","Emira","Emira V6","Petrol",3500),
    ("Lotus","Evora","GT430","Petrol",3500),
    ("Lotus","Exige","Cup 430","Petrol",3500),
    ("Morgan","Plus 4","Plus 4 70th Edition","Petrol",2000),
    ("Morgan","Plus 6","Plus 6","Petrol",3000),
    ("Rivian","R1T","Launch Edition","Electric",""),
    ("Rivian","R1S","Adventure Package","Electric",""),
    ("Lucid","Air","Grand Touring Performance","Electric",""),
    ("Rimac","Nevera","Nevera","Electric",""),
    ("Pininfarina","Battista","Anniversario","Electric",""),
]

# ── Load existing JSON ────────────────────────────────────────────────────────
with open(OUT, 'r', encoding='utf-8') as f:
    data = json.load(f)

added_brands = added_models = added_trims = skipped = 0

for (make, model, trim_str, fuel_raw, cc_raw) in EXTRA:
    f_val = fuel(fuel_raw)
    cc_val = cc(cc_raw) if cc_raw else None

    variant = {'trim': trim_str}
    if f_val:
        variant['fuel_type'] = f_val
    if cc_val:
        variant['engine_capacity_cc'] = cc_val

    if make not in data:
        data[make] = {}
        added_brands += 1

    if model not in data[make]:
        data[make][model] = []
        added_models += 1

    existing_trims = {v['trim'] for v in data[make][model]}
    if trim_str in existing_trims:
        skipped += 1
        continue

    data[make][model].append(variant)
    added_trims += 1

# ── Re-sort alphabetically ────────────────────────────────────────────────────
out = OrderedDict()
for brand in sorted(data, key=str.lower):
    out[brand] = OrderedDict()
    for model in sorted(data[brand], key=str.lower):
        out[brand][model] = data[brand][model]

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print('New brands  :', added_brands)
print('New models  :', added_models)
print('New trims   :', added_trims)
print('Skipped (dup):', skipped)
print('Total brands:', len(out))
