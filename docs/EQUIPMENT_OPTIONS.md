# Oprema — referenca za hitri AI vnos

> Samodejno izpeljano iz `src/data/equipment.js` + `public/lang/sl.json`. Ne urejaj ročno — ob spremembi opreme zaženi generator (glej dno datoteke).

Skupno **409** kod opreme v **23** skupinah.

## Kako AI vrne opremo

V JSON izhodu naj AI uporabi polje `equipment` kot seznam **kod** iz desnega stolpca (npr. `["ABS","Leather","Navigation"]`). Lastnosti brez kode naj gredo v `customEquipment` kot `{ "category": "<id skupine>", "value": "<lepo ime>" }`.

---

## 🚗 Avtomobili (category: avto)

### Varnost  `varnost`

| Oznaka (label) | Koda (value) |
|---|---|
| ABS | `ABS` |
| ESP | `ESP` |
| Alarm | `Alarm` |
| Alarm s senzorjem nagiba | `TiltAlarm` |
| Imobilizator | `Immobilizer` |
| Centralno zaklepanje z daljincem | `CentralLocking` |
| Sledenje ukradenemu vozilu (GPS/GSM) | `StolenTracking` |
| Samodejni klic v sili (E-Call) | `ECall` |
| Varnostne ključavnice za platišča | `WheelLocks` |
| Opozorilo za mrtvi kot | `BlindSpot` |
| Prepoznavanje prometnih znakov | `RoadSign` |
| Opozorilo zapustitve voznega pasu | `LaneDep` |
| Asistent vodenja po pasu | `LaneAssist` |
| Samodejno zaviranje v sili | `AutoBrake` |
| Opozorilo prečnega prometa | `CrossTraffic` |
| Opozorilo na nalet od zadaj | `RearCollisionWarn` |
| Prepoznava kolesarjev / pešcev | `CyclistDetect` |
| Pomoč pri speljevanju v klanec | `HillHold` |
| Pomoč pri spuščanju (HDC) | `HillDescent` |
| Stabilizacija prikolice (TSA) | `TrailerStability` |
| Zapora diferenciala | `DiffLock` |
| Pomoč pri bočnem vetru | `CrosswindAssist` |
| Pnevmatike Run-Flat | `RunFlat` |
| Komplet za popravilo pnevmatik | `TireRepairKit` |
| Rezervno kolo | `SpareWheel` |
| Isofix | `Isofix` |
| Isofix na sovoznikovem sedežu | `IsofixFront` |
| Opomnik za zadnje varnostne pasove | `BeltReminderRear` |
| Gasilni aparat | `FireExtinguisher` |

### Zračne blazine  `zracne_blazine`

| Oznaka (label) | Koda (value) |
|---|---|
| Zračna blazina za voznika | `AirbagDriver` |
| Zračna blazina za sovoznika | `AirbagPassenger` |
| Izklop blazine za sovoznika | `AirbagPassengerOff` |
| Stranske zračne blazine | `AirbagSide` |
| Zavesne zračne blazine | `AirbagCurtain` |
| Kolenska zračna blazina | `AirbagKnee` |
| Osrednja zračna blazina | `AirbagCenter` |

### Osvetlitev  `razsvetljava`

| Oznaka (label) | Koda (value) |
|---|---|
| LED žarometi | `LED` |
| Xenon žarometi | `Xenon` |
| Matrični žarometi | `Matrix` |
| Laserski žarometi | `LaserLight` |
| Prilagodljivi (AFS) žarometi | `AdaptiveLight` |
| Osvetlitev ovinka | `CorneringLight` |
| Dinamični smerniki | `DynamicIndicators` |
| Dnevne luči | `DRL` |
| Meglenke | `Fog` |
| Zadnje meglenke | `FogRear` |
| Samodejne dolge luči | `AutoHighBeam` |
| Samodejni žarometi (senzor mraka) | `AutoLights` |
| Ambientalna osvetlitev | `AmbientLight` |
| Ambientalna osvetlitev (RGB) | `AmbientLightRGB` |
| Osvetlitev prostora za noge | `FootwellLight` |
| Osvetlitev prtljažnika | `TrunkLight` |
| Projekcija logotipa na tla | `PuddleLight` |
| Osvetlitev pragov | `DoorSillLight` |

### Udobje  `udobje`

| Oznaka (label) | Koda (value) |
|---|---|
| Električni sedeži | `ElectricSeats` |
| Sedeži s spominom | `MemorySeats` |
| Spomin za sovoznikov sedež | `MemorySeatsPassenger` |
| Električna ledvena opora | `LumbarSupport` |
| Športni sedeži | `SportSeats` |
| Komfortni sedeži (lounge) | `ComfortSeats` |
| Aktivni sedeži | `ActiveSeats` |
| Naslon za roke | `Armrest` |
| Električno zložljiva zadnja klop | `ElecFoldRearSeat` |
| Električni sedeži v drugi vrsti | `ElecSeatsRear` |
| Masažni sedeži | `MassageSeats` |
| Masažni sedeži zadaj | `MassageSeatsRear` |
| Električno nastavljiv volan | `ElectricWheel` |
| Ogrevan volan | `HeatedWheel` |
| Brezključni dostop | `Keyless` |
| Panoramska streha | `Panorama` |
| Fiksna panoramska streha | `PanoramaFixed` |
| Strešno okno | `Sibedah` |
| Električni prtljažnik | `ElecTrunk` |
| Mehko zapiranje vrat | `SoftClose` |
| Senčilo za zadnje steklo | `SunblindRear` |
| Senčila za zadnja stranska stekla | `SunblindSide` |
| Zatemnjena stekla (privacy glass) | `PrivacyGlass` |
| Akustična zasteklitev | `AcousticGlass` |
| Zračno vzmetenje | `AirSuspension` |
| Športno podvozje | `SportSuspension` |
| Prilagodljivo podvozje | `AdaptiveSuspension` |
| Aktivno nagibanje karoserije | `ActiveBodyControl` |
| Usnjena notranjost | `Leather` |
| Alcantara notranjost | `Alcantara` |
| Usnjena armaturna plošča | `LeatherDash` |
| Alcantara strop | `AlcantaraRoof` |
| Velur talne preproge | `VelourMats` |
| Hlajeno/ogrevano držalo za pijačo | `CooledCupholder` |

### Klima in ogrevanje  `klima_ogrevanje`

| Oznaka (label) | Koda (value) |
|---|---|
| Klimatska naprava | `Climate` |
| 2-conska klima | `Climate2Zone` |
| 3-conska klima | `Climate3Zone` |
| 4-conska klima | `Climate4Zone` |
| Ogrevani sedeži | `HeatedSeats` |
| Ogrevani zadnji sedeži | `HeatedSeatsRear` |
| Prezračevani sedeži | `CooledSeats` |
| Prezračevani zadnji sedeži | `CooledSeatsRear` |
| Ogrevano vetrobransko steklo | `HeatedWindscreen` |
| Ogrevane šobe za pranje stekla | `HeatedWasherJets` |
| Ogrevano zadnje steklo | `HeatedRearWindow` |
| Parkirna klimatska naprava / gretje | `ParkingHeater` |
| Grelnik motorja (Webasto) | `EngineHeater` |

### Parkiranje  `parkiranje`

| Oznaka (label) | Koda (value) |
|---|---|
| Sprednji parkirni senzorji | `ParkSensorFront` |
| Zadnji parkirni senzorji | `ParkSensorRear` |
| Zadnja kamera | `RearCamera` |
| 360° kamera | `Camera360` |
| 3D-prikaz okolice (bird view) | `Camera3D` |
| Kamera podvozja | `UndersideCamera` |
| Samodejno parkiranje | `AutoParking` |
| Parkiranje s pomnjenjem poti | `MemoryParking` |
| Daljinsko parkiranje | `RemoteParking` |
| Pomoč pri parkiranju s prikolico | `TrailerAssist` |
| Opozorilo pri izstopu | `ExitWarning` |

### Multimedija  `multimedija`

| Oznaka (label) | Koda (value) |
|---|---|
| Navigacijski sistem | `Navigation` |
| Navigacija s prometom v živo | `NavLiveTraffic` |
| Navigacija z obogateno resničnostjo | `NavAR` |
| Zaslon na dotik | `Touchscreen` |
| Upravljanje s kretnjami | `GestureControl` |
| Glasovni pomočnik | `VoiceAssistant` |
| Bluetooth | `Bluetooth` |
| Prostoročni sistem | `Handsfree` |
| Apple CarPlay / Android Auto | `CarPlay` |
| Brezžični CarPlay / Android Auto | `CarPlayWireless` |
| Digitalni radio DAB+ | `DAB` |
| Zasloni za zadnje potnike | `RearScreens` |
| Zaslon za sovoznika | `PassengerScreen` |
| TV-sprejemnik | `TVTuner` |
| Hi-Fi zvočni sistem | `HifiSound` |
| Premium zvočni sistem | `PremiumSound` |
| Subwoofer | `Subwoofer` |
| Aktivno odpravljanje hrupa | `NoiseCancelling` |
| Digitalni kokpit | `DigitalCockpit` |
| Head-up zaslon | `HUD` |
| Head-up zaslon z AR | `HUDAr` |
| Wi-Fi dostopna točka | `WiFi` |
| Brezžično polnjenje | `Wireless` |
| Dvojno brezžično polnjenje | `WirelessDual` |
| Vgrajena dashcam | `Dashcam` |
| Digitalni ključ (telefon) | `DigitalKey` |

### Asistenčni sistemi  `asistenti`

| Oznaka (label) | Koda (value) |
|---|---|
| Tempomat | `CruiseControl` |
| Prilagodljivi tempomat | `AdaptiveCruise` |
| Aktivni tempomat Stop & Go | `AdaptiveCruiseStopGo` |
| Prediktivni tempomat | `PredictiveCruise` |
| Asistent v zastoju | `TrafficJamAssist` |
| Ohranjanje sredine pasu | `LaneCentering` |
| Asistent za izogibanje oviram | `EvasiveSteering` |
| Pomoč pri menjavi pasu | `LaneChangeAssist` |
| Asistent za avtocesto | `HighwayAssist` |
| Opozorilo o omejitvi hitrosti | `SpeedLimitAssist` |
| Prilagodljiv omejevalnik hitrosti | `AdaptiveSpeedLimit` |
| Nadzor pozornosti voznika | `DriverAttention` |
| Nočni vid | `NightVision` |
| Opozorilo utrujenosti | `FatigueAlert` |
| Nadzor tlaka v pnevmatikah | `TirePressure` |

### Prtljaga in tovor  `prtljaga`

| Oznaka (label) | Koda (value) |
|---|---|
| Vlečna kljuka | `TowBar` |
| Električno pomična vlečna kljuka | `TowBarElectric` |
| Strešni nosilci | `RoofRails` |
| Strešni kovček | `RoofBox` |
| Nosilec za kolesa | `BikeRack` |
| Držalo za smuči / deske | `SkiHolder` |
| Zložljivi zadnji sedeži | `FoldSeat` |
| Deljiva zadnja klop | `SplitRearSeat` |
| Mreža za prtljago | `LuggageNet` |
| Pokrivalo prtljažnika | `CargoCover` |
| Tovorna pregrada | `CargoPartition` |
| Dvižna tla prtljažnika | `AdjustableBoot` |
| Predal pod prtljažnikom | `UnderfloorStorage` |
| 12V vtičnica | `PowerSocket12v` |
| 230V vtičnica | `PowerSocket230v` |
| Odpiranje prtljažnika z nogo | `KickSensorTrunk` |

### Oprema gospodarskih vozil  `gospodarska`

| Oznaka (label) | Koda (value) |
|---|---|
| Klima v kabini | `AirConCabin` |
| Parkirno gretje | `ParkingHeaterC` |
| Tempomat | `CruiseControlC` |
| Retarder / motorna zavora | `RetarderC` |
| Nakladalna dvižna ploščad | `TailLift` |
| Hladilna nadgradnja | `RefrigeratedBox` |
| Nakladalni žerjav | `CraneC` |
| Prekucnik (kiper) | `TipperC` |
| Vlečna naprava | `TowHitchC` |
| Spalna kabina | `SleeperCab` |
| Hladilnik v kabini | `WebFridge` |
| AdBlue | `AdBlue` |
| Tahograf | `TachographC` |
| Pregradna stena | `PartitionWall` |
| Obloga tovornega prostora | `PlywoodLining` |
| Dvojna kolesa (twin) | `TwinTyres` |
| Asistent vodenja po pasu | `LaneAssistC` |
| Vzvratna kamera | `ReverseCameraC` |

### Oprema mehanizacije  `mehanizacija`

| Oznaka (label) | Koda (value) |
|---|---|
| Klima v kabini | `AirConCabinM` |
| Gretje kabine | `CabHeating` |
| Zaprta kabina | `EnclosedCab` |
| Štirikolesni pogon (4WD) | `FourWheelDriveM` |
| Sprednji nakladalnik | `FrontLoader` |
| Sprednji priklop (PTO) | `FrontPTO` |
| Sprednja hidravlika | `FrontHydraulics` |
| Hitra spojka priključkov | `QuickHitch` |
| Vlečna naprava | `TowHitchM` |
| GPS vodenje | `GPSGuidance` |
| Samodejno krmiljenje | `AutoSteer` |
| LED delovne luči | `WorkLightsLED` |
| Rotacijska luč | `BeaconLight` |
| Zračne zavore | `AirBrakesM` |
| Počasne prestave (creeper) | `CreeperGear` |
| Zračno blaženi sedež | `AirSeatM` |
| Radio | `RadioM` |
| Vzvratna kamera | `ReverseCameraM` |

### Oprema počitniških vozil  `prosti_cas`

| Oznaka (label) | Koda (value) |
|---|---|
| Kuhinja | `KitchenL` |
| Hladilnik | `FridgeL` |
| Plinski štedilnik | `GasStoveL` |
| Pečica | `OvenL` |
| Kopalnica | `BathroomL` |
| Stranišče (WC) | `ToiletL` |
| Tuš | `ShowerL` |
| Rezervoar za vodo | `WaterTankL` |
| Topla voda (bojler) | `HotWaterL` |
| Ogrevanje | `HeatingL` |
| Klimatska naprava | `AirConL` |
| Solarni paneli | `SolarL` |
| Generator | `GeneratorL` |
| Tenda / markiza | `AwningL` |
| Nosilec za kolesa | `BikeRackL` |
| TV | `TVL` |
| Satelitski sprejem | `SatelliteL` |
| Fiksna postelja | `FixedBedL` |
| Pograd / etažne postelje | `BunkBedsL` |
| Vzvratna kamera | `ReversingCameraL` |
| Manevrirni pogon (mover) | `MoverL` |
| Vlečna kljuka | `TowBarL` |

## 🏍️ Motorna kolesa (category: moto)

### Lastnosti motorja  `moto`

| Oznaka (label) | Koda (value) |
|---|---|
| ABS (moto) | `MotoABS` |
| ABS v ovinku (Cornering ABS) | `CorneringABS` |
| Odklopljiv ABS | `SwitchableABS` |
| Nadzor oprijema (TC) | `TractionControl` |
| Nadzor dviga (Wheelie Control) | `WheelieControl` |
| Nadzor zdrsa (Slide Control) | `SlideControl` |
| Launch Control | `LaunchControl` |
| Nadzor zaviranja z motorjem | `EngineBrakeControl` |
| Pomoč pri speljevanju v klanec | `MotoHillHold` |
| Načini vožnje (Rain/Road/Sport ...) | `RideModes` |
| Tempomat (moto) | `MotoCruise` |
| Prilagodljivi tempomat (moto) | `MotoAdaptiveCruise` |
| Opozorilo za mrtvi kot (moto) | `MotoBlindSpot` |
| Opozorilo za čelno trčenje (moto) | `MotoCollisionWarn` |
| TPMS (moto) | `TPMS` |
| Quickshifter | `Quickshifter` |
| Alarm (moto) | `MotoAlarm` |
| Imobilizator (moto) | `MotoImmobilizer` |
| Brezključni vžig (moto) | `MotoKeyless` |

### Moto udobje  `moto_udobje`

| Oznaka (label) | Koda (value) |
|---|---|
| Elektronsko vzmetenje | `ElecSuspension` |
| Pol-aktivno vzmetenje | `SemiActiveSuspension` |
| Nastavljiva višina sedeža | `AdjustableSeatHeight` |
| Ogrevan sedež (moto) | `HeatedSeatMoto` |
| Ogrevani ročaji | `HeatedGrips` |
| Električno nastavljiv vetrobran | `ElecWindscreen` |
| Nastavljive ročice | `AdjustableLevers` |
| Nastavljiv položaj krmila | `AdjustableBars` |
| Ročni ščitniki | `HandGuards` |
| Ščitnik motorja (crash bar) | `EngineGuard` |
| Zaščitna plošča motorja | `SkidPlate` |
| Centralno stojalo | `CenterStand` |
| Stransko stojalo s senzorjem | `SideStandSensor` |
| Ergonomski sedež (moto) | `ComfortSeatMoto` |

### Moto oprema in svetloba  `moto_oprema`

| Oznaka (label) | Koda (value) |
|---|---|
| Navigacija (moto) | `MotoNavigation` |
| Nosilec za navigacijo s polnjenjem | `NavMountCharging` |
| TFT barvni zaslon | `MotoTFT` |
| USB / 12V vtičnica (moto) | `MotoUSB` |
| Stranske torbe / kovčki | `Panniers` |
| Zgornji kovček (top case) | `TopCase` |
| Torba na rezervoarju | `TankBag` |
| Povečan rezervoar za gorivo | `LargeFuelTank` |
| Športni izpuh | `SportExhaust` |
| Izpuh z nastavljivo glasnostjo | `AdjustableExhaust` |
| LED žarometi (moto) | `MotoLED` |
| Prilagodljivi LED žarometi (moto) | `MotoAdaptiveLight` |
| Dnevne luči (moto) | `MotoDRL` |
| Meglenke / dodatni žarometi (moto) | `MotoFog` |
| Dinamična zavorna luč | `DynamicBrakeLight` |
| Vlečna kljuka (moto) | `MotoTowBar` |
| Vzvratna prestava | `ReverseGear` |
| Gume za vse terene (dual-sport) | `DualSportTires` |
| Kovana platišča | `ForgedWheels` |

## ⛵ Plovila — MojaNavtika

### Navigacija in plovba  `navtika_plovba`

| Oznaka (label) | Koda (value) |
|---|---|
| GPS / Ploter | `gps_chartplotter` |
| Multifunkcijski zaslon (MFD) | `mfd` |
| Avtopilot | `autopilot` |
| Avtopilot za jadrnice | `autopilot_sail` |
| Avtopilot za izvenkrmni motor | `autopilot_outboard` |
| Radar | `radar` |
| Radar HD Doppler | `radar_doppler` |
| VHF radio | `vhf_radio` |
| Ročni VHF radio | `vhf_handheld` |
| Globinomer / Fish finder | `depth_sounder` |
| Fishfinder CHIRP | `fishfinder_chirp` |
| Sonar z bočnim snopom (SideScan) | `sidescan_sonar` |
| 3D-sonar (StructureScan) | `sonar_3d` |
| Merilnik hitrosti (log) | `speed_log` |
| Vetromerni inštrument | `wind_instrument` |
| AIS sprejemnik | `ais` |
| AIS oddajnik-sprejemnik | `ais_transponder` |
| Kompas | `compass` |
| Satelitski kompas (GNSS) | `satellite_compass` |
| Merilnik temperature vode | `water_temp` |
| Barometer | `barometer` |
| Termovizijska kamera | `thermal_camera` |
| Iskalni reflektor | `searchlight` |
| Navigacijske luči LED | `nav_lights_led` |
| Sledilnik plovbe | `boat_tracker` |

### Paluba in manevriranje  `navtika_paluba`

| Oznaka (label) | Koda (value) |
|---|---|
| Električno sidro (vratar) | `anchor_windlass` |
| Daljinsko upravljanje sidrnega vitla | `windlass_remote` |
| Števec verige | `chain_counter` |
| Pramčni potisnik | `bow_thruster` |
| Krmni potisnik | `stern_thruster` |
| Krmilna palica (joystick) | `joystick_control` |
| Teakova paluba | `teak` |
| Sintetična teakova paluba | `teak_synthetic` |
| Bimini / senčnik | `bimini` |
| Sprayhood | `sprayhood` |
| Zaprt kokpit (enclosure) | `cockpit_enclosure` |
| Trda streha (hardtop) | `hardtop` |
| Tenda za sonce | `sun_awning` |
| Pasarela / mostič | `pasarela` |
| Hidravlična pasarela | `pasarela_hydraulic` |
| Kopalna platforma | `swim_platform` |
| Hidravlična kopalna platforma | `swim_platform_hydraulic` |
| Kopalna lestev | `bathing_ladder` |
| Zunanja prha | `stern_shower` |
| Prha na premcu | `bow_shower` |
| Daviti (za gumenjak) | `davits` |
| Dvigalo za tender | `tender_crane` |
| Cockpit miza | `cockpit_table` |
| Cockpit blazine | `cockpit_cushions` |
| Cockpit hladilnik | `cockpit_fridge` |
| Žar za na palubo | `deck_grill` |
| Držalo za deske (SUP/wakeboard) | `board_holder` |
| Podvodne luči | `underwater_lights` |
| Razsvetljava palube | `deck_lighting` |
| Zunanji zvočniki (marine) | `outdoor_speakers` |
| Zaščitna ograja (reling) | `guardrails` |
| Varnostna vrata ograje | `boarding_gates` |

### Udobje in kabina  `navtika_udobje`

| Oznaka (label) | Koda (value) |
|---|---|
| Hladilnik | `refrigerator` |
| Zamrzovalnik | `freezer` |
| Ledomat | `ice_maker` |
| Vinski hladilnik | `wine_cooler` |
| Štedilnik | `stove` |
| Indukcijska kuhalna plošča | `induction_hob` |
| Pečica | `oven` |
| Mikrovalovna | `microwave` |
| Pomivalni stroj | `dishwasher` |
| Pralni / sušilni stroj | `washing_machine` |
| Centralno sesanje | `central_vacuum` |
| TV | `tv` |
| TV z dvižnim mehanizmom | `tv_popup` |
| Satelitski TV sistem | `satellite_tv` |
| Zvočni sistem | `audio_system` |
| Subwoofer (vgradni) | `cabin_subwoofer` |
| USB vtičnice v kabinah | `cabin_usb` |
| Bralne lučke | `reading_lights` |
| Zatemnitvene rolete | `cabin_blinds` |
| Mreže proti mrčesu | `insect_screens` |
| Okna z dvojno zasteklitvijo | `double_glazing` |
| Garderobne omare | `wardrobes` |
| Sef | `safe` |
| Vzmetnice po meri | `custom_mattresses` |

### Sanitarije in voda  `navtika_sanitarije`

| Oznaka (label) | Koda (value) |
|---|---|
| Električno stranišče | `electric_toilet` |
| Ročno stranišče s črpalko | `manual_toilet` |
| Fekalni tank (črna voda) | `blackwater_tank` |
| Grelnik vode | `water_heater` |
| Razsoljevalnik (watermaker) | `watermaker` |
| Črpalka za sladko vodo | `fresh_water_pump` |
| Sistem za filtriranje vode | `water_filter` |
| Tuš kabina | `shower_cabin` |
| Umivalnik z mešalno pipo | `washbasin` |
| Kopalniške omarice | `bathroom_cabinets` |

### Energija in varnost  `navtika_energija`

| Oznaka (label) | Koda (value) |
|---|---|
| Klimatska naprava | `air_conditioning` |
| Ogrevanje | `heating` |
| Dizelsko ogrevanje (Webasto/Espar) | `diesel_heating` |
| Talno ogrevanje | `underfloor_heating` |
| Solarni paneli | `solar` |
| MPPT regulator polnjenja | `mppt_regulator` |
| Generator | `generator` |
| Inverter | `inverter` |
| Polnilnik akumulatorja | `battery_charger` |
| Samodejni preklop obalne napetosti (ATS) | `shore_power_ats` |
| Baterijski monitor | `battery_monitor` |
| Galvanski izolator | `galvanic_isolator` |
| Izolacijski transformator | `isolation_transformer` |
| Sistem za upravljanje energije | `energy_management` |
| Gumenjak / tender | `tender` |

### Varnost na morju  `navtika_varnost`

| Oznaka (label) | Koda (value) |
|---|---|
| Reševalni splav | `life_raft` |
| Reševalni jopiči | `life_jackets` |
| EPIRB (satelitski oddajnik v sili) | `epirb` |
| PLB (osebni lokator) | `plb` |
| AIS SART (iskalnik v sili) | `ais_sart` |
| Radarski reflektor | `radar_reflector` |
| Sistem MOB (človek v morju) | `mob_system` |
| Sistem za gašenje v strojnici | `fire_suppression` |
| Gasilni aparati | `fire_extinguishers` |
| Detektor plina (CO) | `gas_detector` |
| Detektor dima / toplote | `smoke_detector` |
| Samodejna kaljužna črpalka | `bilge_pump_auto` |
| Alarm za visoko vodo | `high_water_alarm` |
| Sidrni alarm | `anchor_alarm` |
| Komplet prve pomoči | `first_aid` |
| Signalne rakete | `flares` |
| Defibrilator (AED) | `aed` |
| Daljinski nadzor (aplikacija) | `remote_monitoring` |

## 🔁 Skupno (vse kategorije)

### Garancija in zgodovina  `garancija`

| Oznaka (label) | Koda (value) |
|---|---|
| Servisna knjižica | `ServiceBook` |
| Garancija | `Warranty` |
| Nekadilsko vozilo | `NonSmoking` |

### Drugo  `drugo`

| Oznaka (label) | Koda (value) |
|---|---|
| Kadilsko vozilo | `Kadilski` |
| Taksi | `Taxi` |
| Avtošola | `DrivingSchool` |

---

## Regeneracija

Ta datoteka je izpeljana. Po urejanju `equipment.js` ali prevodov jo osveži z:

```bash
node scripts/build_equipment_reference.mjs
```
