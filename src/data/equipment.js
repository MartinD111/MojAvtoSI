// ═══════════════════════════════════════════════════════════════════════════════
// Equipment data — MojAvto.si
// Single source of truth for equipment/features.
// Values MUST match `name="features"` checkboxes in advanced-search.html
// Used by: create-listing (step 4) + advanced-search filters
// ═══════════════════════════════════════════════════════════════════════════════

export const EQUIPMENT_GROUPS = [
    {
        id: 'varnost',
        label: 'eq_group_varnost',
        icon: 'shield-check',
        categories: ['avto'],
        items: [
            { value: 'ABS',       label: 'eq_abs', icon: 'shield' },
            { value: 'ESP',       label: 'eq_esp', icon: 'activity' },
            { value: 'Alarm',     label: 'eq_alarm', icon: 'bell' },
            { value: 'TiltAlarm', label: 'eq_tilt_alarm', icon: 'bell-ring' },
            { value: 'Immobilizer', label: 'eq_immobilizer', icon: 'lock' },
            { value: 'CentralLocking', label: 'eq_central_locking', icon: 'key-round' },
            { value: 'StolenTracking', label: 'eq_stolen_tracking', icon: 'locate-fixed' },
            { value: 'ECall',     label: 'eq_ecall', icon: 'phone-call' },
            { value: 'WheelLocks', label: 'eq_wheel_locks', icon: 'lock-keyhole' },
            { value: 'BlindSpot', label: 'eq_blind_spot', icon: 'eye-off' },
            { value: 'RoadSign',  label: 'eq_road_sign', icon: 'signpost' },
            { value: 'LaneDep',   label: 'eq_lane_dep', icon: 'split' },
            { value: 'LaneAssist',label: 'eq_lane_assist', icon: 'move-horizontal' },
            { value: 'AutoBrake', label: 'eq_auto_brake', icon: 'octagon' },
            { value: 'CrossTraffic', label: 'eq_cross_traffic', icon: 'arrow-left-right' },
            { value: 'RearCollisionWarn', label: 'eq_rear_collision_warn', icon: 'alert-triangle' },
            { value: 'CyclistDetect', label: 'eq_cyclist_detect', icon: 'bike' },
            { value: 'HillHold',  label: 'eq_hill_hold', icon: 'trending-up' },
            { value: 'HillDescent', label: 'eq_hill_descent', icon: 'trending-down' },
            { value: 'TrailerStability', label: 'eq_trailer_stability', icon: 'caravan' },
            { value: 'DiffLock',  label: 'eq_diff_lock', icon: 'cog' },
            { value: 'CrosswindAssist', label: 'eq_crosswind_assist', icon: 'wind' },
            { value: 'RunFlat',   label: 'eq_run_flat', icon: 'disc' },
            { value: 'TireRepairKit', label: 'eq_tire_repair_kit', icon: 'wrench' },
            { value: 'SpareWheel', label: 'eq_spare_wheel', icon: 'circle-dot' },
            { value: 'Isofix',    label: 'eq_isofix', icon: 'baby' },
            { value: 'IsofixFront', label: 'eq_isofix_front', icon: 'baby' },
            { value: 'BeltReminderRear', label: 'eq_belt_reminder_rear', icon: 'user-check' },
            { value: 'FireExtinguisher', label: 'eq_fire_extinguisher', icon: 'flame' },
        ],
    },
    {
        id: 'zracne_blazine',
        label: 'eq_group_airbags',
        icon: 'shield',
        categories: ['avto'],
        items: [
            { value: 'AirbagDriver',   label: 'eq_airbag_driver', icon: 'user' },
            { value: 'AirbagPassenger', label: 'eq_airbag_passenger', icon: 'user' },
            { value: 'AirbagPassengerOff', label: 'eq_airbag_passenger_off', icon: 'user-x' },
            { value: 'AirbagSide',     label: 'eq_airbag_side', icon: 'panel-left' },
            { value: 'AirbagCurtain',  label: 'eq_airbag_curtain', icon: 'panel-top' },
            { value: 'AirbagKnee',     label: 'eq_airbag_knee', icon: 'move-down' },
            { value: 'AirbagCenter',   label: 'eq_airbag_center', icon: 'columns-2' },
        ],
    },
    {
        id: 'razsvetljava',
        label: 'eq_group_razsvetljava',
        icon: 'sun',
        categories: ['avto'],
        items: [
            { value: 'LED',    label: 'eq_led', icon: 'sun' },
            { value: 'Xenon',  label: 'eq_xenon', icon: 'sparkles' },
            { value: 'Matrix', label: 'eq_matrix', icon: 'lightbulb' },
            { value: 'LaserLight', label: 'eq_laser_light', icon: 'flashlight' },
            { value: 'AdaptiveLight', label: 'eq_adaptive_light', icon: 'lightbulb' },
            { value: 'CorneringLight', label: 'eq_cornering_light', icon: 'corner-up-right' },
            { value: 'DynamicIndicators', label: 'eq_dynamic_indicators', icon: 'move-right' },
            { value: 'DRL',    label: 'eq_drl', icon: 'sun-dim' },
            { value: 'Fog',    label: 'eq_fog', icon: 'cloud-fog' },
            { value: 'FogRear', label: 'eq_fog_rear', icon: 'cloud-fog' },
            { value: 'AutoHighBeam', label: 'eq_auto_high_beam', icon: 'sun-medium' },
            { value: 'AutoLights', label: 'eq_auto_lights', icon: 'sunrise' },
            { value: 'AmbientLight', label: 'eq_ambient_light', icon: 'sparkles' },
            { value: 'AmbientLightRGB', label: 'eq_ambient_light_rgb', icon: 'palette' },
            { value: 'FootwellLight', label: 'eq_footwell_light', icon: 'lightbulb' },
            { value: 'TrunkLight', label: 'eq_trunk_light', icon: 'package' },
            { value: 'PuddleLight', label: 'eq_puddle_light', icon: 'projector' },
            { value: 'DoorSillLight', label: 'eq_door_sill_light', icon: 'panel-bottom' },
        ],
    },
    {
        id: 'udobje',
        label: 'eq_group_udobje',
        icon: 'sofa',
        categories: ['avto'],
        items: [
            { value: 'ElectricSeats',  label: 'eq_electric_seats', icon: 'armchair' },
            { value: 'MemorySeats',    label: 'eq_memory_seats', icon: 'save' },
            { value: 'MemorySeatsPassenger', label: 'eq_memory_seats_passenger', icon: 'save' },
            { value: 'LumbarSupport',  label: 'eq_lumbar_support', icon: 'move-vertical' },
            { value: 'SportSeats',     label: 'eq_sport_seats', icon: 'armchair' },
            { value: 'ComfortSeats',   label: 'eq_comfort_seats', icon: 'armchair' },
            { value: 'ActiveSeats',    label: 'eq_active_seats', icon: 'activity' },
            { value: 'Armrest',        label: 'eq_armrest', icon: 'minus' },
            { value: 'ElecFoldRearSeat', label: 'eq_elec_fold_rear_seat', icon: 'chevron-down' },
            { value: 'ElecSeatsRear',  label: 'eq_elec_seats_rear', icon: 'armchair' },
            { value: 'MassageSeats',   label: 'eq_massage_seats', icon: 'waves' },
            { value: 'MassageSeatsRear', label: 'eq_massage_seats_rear', icon: 'waves' },
            { value: 'ElectricWheel',  label: 'eq_electric_wheel', icon: 'circle-dot' },
            { value: 'HeatedWheel',    label: 'eq_heated_wheel', icon: 'circle-dot' },
            { value: 'Keyless',        label: 'eq_keyless', icon: 'key' },
            { value: 'Panorama',       label: 'eq_panorama', icon: 'layers' },
            { value: 'PanoramaFixed',  label: 'eq_panorama_fixed', icon: 'layers' },
            { value: 'Sibedah',        label: 'eq_sibedah', icon: 'maximize-2' },
            { value: 'ElecTrunk',      label: 'eq_elec_trunk', icon: 'package' },
            { value: 'SoftClose',      label: 'eq_soft_close', icon: 'door-closed' },
            { value: 'SunblindRear',   label: 'eq_sunblind_rear', icon: 'panel-top' },
            { value: 'SunblindSide',   label: 'eq_sunblind_side', icon: 'panel-right' },
            { value: 'PrivacyGlass',   label: 'eq_privacy_glass', icon: 'square' },
            { value: 'AcousticGlass',  label: 'eq_acoustic_glass', icon: 'ear-off' },
            { value: 'AirSuspension',  label: 'eq_air_suspension', icon: 'arrow-up-down' },
            { value: 'SportSuspension', label: 'eq_sport_suspension', icon: 'arrow-down' },
            { value: 'AdaptiveSuspension', label: 'eq_adaptive_suspension', icon: 'sliders-horizontal' },
            { value: 'ActiveBodyControl', label: 'eq_active_body_control', icon: 'move' },
            { value: 'Leather',        label: 'eq_leather', icon: 'layers' },
            { value: 'Alcantara',      label: 'eq_alcantara', icon: 'layers' },
            { value: 'LeatherDash',    label: 'eq_leather_dash', icon: 'layers' },
            { value: 'AlcantaraRoof',  label: 'eq_alcantara_roof', icon: 'layers' },
            { value: 'VelourMats',     label: 'eq_velour_mats', icon: 'square' },
            { value: 'CooledCupholder', label: 'eq_cooled_cupholder', icon: 'coffee' },
        ],
    },
    {
        id: 'klima_ogrevanje',
        label: 'eq_group_climate',
        icon: 'thermometer-snowflake',
        categories: ['avto'],
        items: [
            { value: 'Climate',        label: 'eq_climate', icon: 'thermometer-snowflake' },
            { value: 'Climate2Zone',   label: 'eq_climate_2zone', icon: 'snowflake' },
            { value: 'Climate3Zone',   label: 'eq_climate_3zone', icon: 'snowflake' },
            { value: 'Climate4Zone',   label: 'eq_climate_4zone', icon: 'snowflake' },
            { value: 'HeatedSeats',    label: 'eq_heated_seats', icon: 'flame' },
            { value: 'HeatedSeatsRear',label: 'eq_heated_seats_rear', icon: 'flame' },
            { value: 'CooledSeats',    label: 'eq_cooled_seats', icon: 'snowflake' },
            { value: 'CooledSeatsRear', label: 'eq_cooled_seats_rear', icon: 'snowflake' },
            { value: 'HeatedWindscreen', label: 'eq_heated_windscreen', icon: 'thermometer-sun' },
            { value: 'HeatedWasherJets', label: 'eq_heated_washer_jets', icon: 'droplet' },
            { value: 'HeatedRearWindow', label: 'eq_heated_rear_window', icon: 'square' },
            { value: 'ParkingHeater',  label: 'eq_parking_heater', icon: 'flame' },
            { value: 'EngineHeater',   label: 'eq_engine_heater', icon: 'thermometer' },
        ],
    },
    {
        id: 'parkiranje',
        label: 'eq_group_parkiranje',
        icon: 'parking-square',
        categories: ['avto'],
        items: [
            { value: 'ParkSensorFront', label: 'eq_park_sensor_front', icon: 'radar' },
            { value: 'ParkSensorRear',  label: 'eq_park_sensor_rear', icon: 'radar' },
            { value: 'RearCamera',      label: 'eq_rear_camera', icon: 'video' },
            { value: 'Camera360',       label: 'eq_camera_360', icon: 'aperture' },
            { value: 'Camera3D',        label: 'eq_camera_3d', icon: 'box' },
            { value: 'UndersideCamera', label: 'eq_underside_camera', icon: 'video' },
            { value: 'AutoParking',     label: 'eq_auto_parking', icon: 'parking-circle' },
            { value: 'MemoryParking',   label: 'eq_memory_parking', icon: 'save' },
            { value: 'RemoteParking',   label: 'eq_remote_parking', icon: 'smartphone' },
            { value: 'TrailerAssist',   label: 'eq_trailer_assist', icon: 'caravan' },
            { value: 'ExitWarning',     label: 'eq_exit_warning', icon: 'door-open' },
        ],
    },
    {
        id: 'multimedija',
        label: 'eq_group_multimedija',
        icon: 'monitor-smartphone',
        categories: ['avto'],
        items: [
            { value: 'Navigation',     label: 'eq_navigation', icon: 'map' },
            { value: 'NavLiveTraffic', label: 'eq_nav_live_traffic', icon: 'route' },
            { value: 'NavAR',          label: 'eq_nav_ar', icon: 'scan' },
            { value: 'Touchscreen',    label: 'eq_touchscreen', icon: 'tablet' },
            { value: 'GestureControl', label: 'eq_gesture_control', icon: 'hand' },
            { value: 'VoiceAssistant', label: 'eq_voice_assistant', icon: 'mic' },
            { value: 'Bluetooth',      label: 'eq_bluetooth', icon: 'bluetooth' },
            { value: 'Handsfree',      label: 'eq_handsfree', icon: 'phone-call' },
            { value: 'CarPlay',        label: 'eq_carplay', icon: 'smartphone' },
            { value: 'CarPlayWireless', label: 'eq_carplay_wireless', icon: 'smartphone' },
            { value: 'DAB',            label: 'eq_dab', icon: 'radio' },
            { value: 'RearScreens',    label: 'eq_rear_screens', icon: 'monitor' },
            { value: 'PassengerScreen', label: 'eq_passenger_screen', icon: 'tablet' },
            { value: 'TVTuner',        label: 'eq_tv_tuner', icon: 'tv' },
            { value: 'HifiSound',      label: 'eq_hifi_sound', icon: 'speaker' },
            { value: 'PremiumSound',   label: 'eq_premium_sound', icon: 'speaker' },
            { value: 'Subwoofer',      label: 'eq_subwoofer', icon: 'volume-2' },
            { value: 'NoiseCancelling', label: 'eq_noise_cancelling', icon: 'ear-off' },
            { value: 'DigitalCockpit', label: 'eq_digital_cockpit', icon: 'layout-dashboard' },
            { value: 'HUD',            label: 'eq_hud', icon: 'target' },
            { value: 'HUDAr',          label: 'eq_hud_ar', icon: 'scan' },
            { value: 'WiFi',           label: 'eq_wifi', icon: 'wifi' },
            { value: 'Wireless',       label: 'eq_wireless', icon: 'zap' },
            { value: 'WirelessDual',   label: 'eq_wireless_dual', icon: 'zap' },
            { value: 'Dashcam',        label: 'eq_dashcam', icon: 'video' },
            { value: 'DigitalKey',     label: 'eq_digital_key', icon: 'key-round' },
        ],
    },
    {
        id: 'asistenti',
        label: 'eq_group_asistenti',
        icon: 'cpu',
        categories: ['avto'],
        items: [
            { value: 'CruiseControl',     label: 'eq_cruise', icon: 'timer' },
            { value: 'AdaptiveCruise',    label: 'eq_adaptive_cruise', icon: 'timer-reset' },
            { value: 'AdaptiveCruiseStopGo', label: 'eq_adaptive_cruise_stopgo', icon: 'timer-reset' },
            { value: 'PredictiveCruise',  label: 'eq_predictive_cruise', icon: 'route' },
            { value: 'TrafficJamAssist',  label: 'eq_traffic_jam', icon: 'users' },
            { value: 'LaneCentering',     label: 'eq_lane_centering', icon: 'align-center' },
            { value: 'EvasiveSteering',   label: 'eq_evasive_steering', icon: 'corner-up-left' },
            { value: 'LaneChangeAssist',  label: 'eq_lane_change_assist', icon: 'arrow-left-right' },
            { value: 'HighwayAssist',     label: 'eq_highway_assist', icon: 'milestone' },
            { value: 'SpeedLimitAssist',  label: 'eq_speed_limit_assist', icon: 'gauge' },
            { value: 'AdaptiveSpeedLimit', label: 'eq_adaptive_speed_limit', icon: 'gauge' },
            { value: 'DriverAttention',   label: 'eq_driver_attention', icon: 'eye' },
            { value: 'NightVision',       label: 'eq_night_vision', icon: 'moon' },
            { value: 'FatigueAlert',      label: 'eq_fatigue', icon: 'coffee' },
            { value: 'TirePressure',      label: 'eq_tpms', icon: 'gauge' },
        ],
    },
    {
        id: 'prtljaga',
        label: 'eq_group_prtljaga',
        icon: 'package',
        categories: ['avto'],
        items: [
            { value: 'TowBar',       label: 'eq_tow_bar', icon: 'anchor' },
            { value: 'TowBarElectric', label: 'eq_tow_bar_electric', icon: 'anchor' },
            { value: 'RoofRails',    label: 'eq_roof_rails', icon: 'square' },
            { value: 'RoofBox',      label: 'eq_roof_box', icon: 'box' },
            { value: 'BikeRack',     label: 'eq_bike_rack', icon: 'bike' },
            { value: 'SkiHolder',    label: 'eq_ski_holder', icon: 'snowflake' },
            { value: 'FoldSeat',     label: 'eq_fold_seat', icon: 'chevron-down' },
            { value: 'SplitRearSeat', label: 'eq_split_rear_seat', icon: 'columns-3' },
            { value: 'LuggageNet',   label: 'eq_luggage_net', icon: 'grid-2x2' },
            { value: 'CargoCover',   label: 'eq_cargo_cover', icon: 'rectangle-horizontal' },
            { value: 'CargoPartition', label: 'eq_cargo_partition', icon: 'fence' },
            { value: 'AdjustableBoot', label: 'eq_adjustable_boot', icon: 'arrow-up-down' },
            { value: 'UnderfloorStorage', label: 'eq_underfloor_storage', icon: 'archive' },
            { value: 'PowerSocket12v', label: 'eq_power_socket_12v', icon: 'plug' },
            { value: 'PowerSocket230v', label: 'eq_power_socket_230v', icon: 'plug-zap' },
            { value: 'KickSensorTrunk', label: 'eq_kick_sensor_trunk', icon: 'footprints' },
        ],
    },
    {
        id: 'gospodarska',
        label: 'eq_group_commercial',
        icon: 'truck',
        categories: ['gospodarska'],
        items: [
            { value: 'AirConCabin',     label: 'eq_aircon_cabin', icon: 'thermometer-snowflake' },
            { value: 'ParkingHeaterC',  label: 'eq_parking_heater_c', icon: 'flame' },
            { value: 'CruiseControlC',  label: 'eq_cruise_c', icon: 'timer' },
            { value: 'RetarderC',       label: 'eq_retarder', icon: 'gauge' },
            { value: 'TailLift',        label: 'eq_tail_lift', icon: 'arrow-up-down' },
            { value: 'RefrigeratedBox', label: 'eq_refrigerated_box', icon: 'snowflake' },
            { value: 'CraneC',          label: 'eq_crane_c', icon: 'construction' },
            { value: 'TipperC',         label: 'eq_tipper', icon: 'truck' },
            { value: 'TowHitchC',       label: 'eq_tow_hitch_c', icon: 'anchor' },
            { value: 'SleeperCab',      label: 'eq_sleeper_cab', icon: 'bed' },
            { value: 'WebFridge',       label: 'eq_web_fridge', icon: 'refrigerator' },
            { value: 'AdBlue',          label: 'eq_adblue', icon: 'droplet' },
            { value: 'TachographC',     label: 'eq_tachograph', icon: 'clock' },
            { value: 'PartitionWall',   label: 'eq_partition_wall', icon: 'fence' },
            { value: 'PlywoodLining',   label: 'eq_plywood_lining', icon: 'square' },
            { value: 'TwinTyres',       label: 'eq_twin_tyres', icon: 'disc' },
            { value: 'LaneAssistC',     label: 'eq_lane_assist_c', icon: 'move-horizontal' },
            { value: 'ReverseCameraC',  label: 'eq_reverse_camera_c', icon: 'video' },
        ],
    },
    {
        id: 'mehanizacija',
        label: 'eq_group_machinery',
        icon: 'tractor',
        categories: ['mehanizacija'],
        items: [
            { value: 'AirConCabinM',    label: 'eq_aircon_cabin_m', icon: 'thermometer-snowflake' },
            { value: 'CabHeating',      label: 'eq_cab_heating', icon: 'flame' },
            { value: 'EnclosedCab',     label: 'eq_enclosed_cab', icon: 'square' },
            { value: 'FourWheelDriveM', label: 'eq_four_wheel_drive_m', icon: 'move' },
            { value: 'FrontLoader',     label: 'eq_front_loader', icon: 'arrow-up' },
            { value: 'FrontPTO',        label: 'eq_front_pto', icon: 'cog' },
            { value: 'FrontHydraulics', label: 'eq_front_hydraulics', icon: 'arrow-up-down' },
            { value: 'QuickHitch',      label: 'eq_quick_hitch', icon: 'link' },
            { value: 'TowHitchM',       label: 'eq_tow_hitch_m', icon: 'anchor' },
            { value: 'GPSGuidance',     label: 'eq_gps_guidance', icon: 'radar' },
            { value: 'AutoSteer',       label: 'eq_auto_steer', icon: 'navigation' },
            { value: 'WorkLightsLED',   label: 'eq_work_lights_led', icon: 'sun' },
            { value: 'BeaconLight',     label: 'eq_beacon_light', icon: 'siren' },
            { value: 'AirBrakesM',      label: 'eq_air_brakes_m', icon: 'octagon' },
            { value: 'CreeperGear',     label: 'eq_creeper_gear', icon: 'gauge' },
            { value: 'AirSeatM',        label: 'eq_air_seat_m', icon: 'armchair' },
            { value: 'RadioM',          label: 'eq_radio_m', icon: 'radio' },
            { value: 'ReverseCameraM',  label: 'eq_reverse_camera_m', icon: 'video' },
        ],
    },
    {
        id: 'prosti_cas',
        label: 'eq_group_leisure',
        icon: 'palmtree',
        categories: ['prosti-cas'],
        items: [
            { value: 'KitchenL',        label: 'eq_kitchen_l', icon: 'chef-hat' },
            { value: 'FridgeL',         label: 'eq_fridge_l', icon: 'refrigerator' },
            { value: 'GasStoveL',       label: 'eq_gas_stove_l', icon: 'flame' },
            { value: 'OvenL',           label: 'eq_oven_l', icon: 'chef-hat' },
            { value: 'BathroomL',       label: 'eq_bathroom_l', icon: 'shower-head' },
            { value: 'ToiletL',         label: 'eq_toilet_l', icon: 'droplet' },
            { value: 'ShowerL',         label: 'eq_shower_l', icon: 'shower-head' },
            { value: 'WaterTankL',      label: 'eq_water_tank_l', icon: 'droplets' },
            { value: 'HotWaterL',       label: 'eq_hot_water_l', icon: 'thermometer' },
            { value: 'HeatingL',        label: 'eq_heating_l', icon: 'flame' },
            { value: 'AirConL',         label: 'eq_aircon_l', icon: 'thermometer-snowflake' },
            { value: 'SolarL',          label: 'eq_solar_l', icon: 'sun' },
            { value: 'GeneratorL',      label: 'eq_generator_l', icon: 'zap' },
            { value: 'AwningL',         label: 'eq_awning_l', icon: 'umbrella' },
            { value: 'BikeRackL',       label: 'eq_bike_rack_l', icon: 'bike' },
            { value: 'TVL',             label: 'eq_tv_l', icon: 'tv' },
            { value: 'SatelliteL',      label: 'eq_satellite_l', icon: 'satellite-dish' },
            { value: 'FixedBedL',       label: 'eq_fixed_bed_l', icon: 'bed' },
            { value: 'BunkBedsL',       label: 'eq_bunk_beds_l', icon: 'bed' },
            { value: 'ReversingCameraL', label: 'eq_reversing_camera_l', icon: 'video' },
            { value: 'MoverL',          label: 'eq_mover_l', icon: 'move' },
            { value: 'TowBarL',         label: 'eq_tow_bar_l', icon: 'anchor' },
        ],
    },
    {
        id: 'garancija',
        label: 'eq_group_garancija',
        icon: 'badge-check',
        categories: ['all'],
        items: [
            { value: 'ServiceBook',  label: 'eq_service_book', icon: 'book-open' },
            { value: 'Warranty',     label: 'eq_warranty', icon: 'badge-check' },
            { value: 'NonSmoking',   label: 'eq_non_smoking', icon: 'cigarette-off' },
        ],
    },
    {
        id: 'moto',
        label: 'eq_group_moto',
        icon: 'bike',
        categories: ['moto'],
        items: [
            { value: 'MotoABS',        label: 'eq_moto_abs', icon: 'shield' },
            { value: 'CorneringABS',   label: 'eq_cornering_abs', icon: 'shield' },
            { value: 'SwitchableABS',  label: 'eq_switchable_abs', icon: 'shield-off' },
            { value: 'TractionControl', label: 'eq_traction_control', icon: 'activity' },
            { value: 'WheelieControl', label: 'eq_wheelie_control', icon: 'trending-up' },
            { value: 'SlideControl',   label: 'eq_slide_control', icon: 'move' },
            { value: 'LaunchControl',  label: 'eq_launch_control', icon: 'rocket' },
            { value: 'EngineBrakeControl', label: 'eq_engine_brake_control', icon: 'gauge' },
            { value: 'MotoHillHold',   label: 'eq_moto_hill_hold', icon: 'trending-up' },
            { value: 'RideModes',      label: 'eq_ride_modes', icon: 'sliders-horizontal' },
            { value: 'MotoCruise',     label: 'eq_moto_cruise', icon: 'timer' },
            { value: 'MotoAdaptiveCruise', label: 'eq_moto_adaptive_cruise', icon: 'timer-reset' },
            { value: 'MotoBlindSpot',  label: 'eq_moto_blind_spot', icon: 'eye-off' },
            { value: 'MotoCollisionWarn', label: 'eq_moto_collision_warn', icon: 'alert-triangle' },
            { value: 'TPMS',           label: 'eq_moto_tpms', icon: 'gauge' },
            { value: 'Quickshifter',   label: 'eq_quickshifter', icon: 'zap' },
            { value: 'MotoAlarm',      label: 'eq_moto_alarm', icon: 'bell' },
            { value: 'MotoImmobilizer', label: 'eq_moto_immobilizer', icon: 'lock' },
            { value: 'MotoKeyless',    label: 'eq_moto_keyless', icon: 'key' },
        ],
    },
    {
        id: 'moto_udobje',
        label: 'eq_group_moto_comfort',
        icon: 'armchair',
        categories: ['moto'],
        items: [
            { value: 'ElecSuspension', label: 'eq_elec_suspension', icon: 'arrow-up-down' },
            { value: 'SemiActiveSuspension', label: 'eq_semi_active_suspension', icon: 'sliders-horizontal' },
            { value: 'AdjustableSeatHeight', label: 'eq_adjustable_seat_height', icon: 'move-vertical' },
            { value: 'HeatedSeatMoto', label: 'eq_heated_seat_moto', icon: 'flame' },
            { value: 'HeatedGrips',    label: 'eq_heated_grips', icon: 'flame' },
            { value: 'ElecWindscreen', label: 'eq_elec_windscreen', icon: 'panel-top' },
            { value: 'AdjustableLevers', label: 'eq_adjustable_levers', icon: 'settings-2' },
            { value: 'AdjustableBars', label: 'eq_adjustable_bars', icon: 'settings-2' },
            { value: 'HandGuards',     label: 'eq_hand_guards', icon: 'shield' },
            { value: 'EngineGuard',    label: 'eq_engine_guard', icon: 'shield' },
            { value: 'SkidPlate',      label: 'eq_skid_plate', icon: 'shield' },
            { value: 'CenterStand',    label: 'eq_center_stand', icon: 'parking-square' },
            { value: 'SideStandSensor', label: 'eq_side_stand_sensor', icon: 'triangle' },
            { value: 'ComfortSeatMoto', label: 'eq_comfort_seat_moto', icon: 'armchair' },
        ],
    },
    {
        id: 'moto_oprema',
        label: 'eq_group_moto_gear',
        icon: 'package',
        categories: ['moto'],
        items: [
            { value: 'MotoNavigation', label: 'eq_moto_navigation', icon: 'map' },
            { value: 'NavMountCharging', label: 'eq_nav_mount_charging', icon: 'smartphone' },
            { value: 'MotoTFT',        label: 'eq_moto_tft', icon: 'monitor' },
            { value: 'MotoUSB',        label: 'eq_moto_usb', icon: 'plug' },
            { value: 'Panniers',       label: 'eq_panniers', icon: 'package' },
            { value: 'TopCase',        label: 'eq_top_case', icon: 'box' },
            { value: 'TankBag',        label: 'eq_tank_bag', icon: 'briefcase' },
            { value: 'LargeFuelTank',  label: 'eq_large_fuel_tank', icon: 'fuel' },
            { value: 'SportExhaust',   label: 'eq_sport_exhaust', icon: 'wind' },
            { value: 'AdjustableExhaust', label: 'eq_adjustable_exhaust', icon: 'volume-2' },
            { value: 'MotoLED',        label: 'eq_moto_led', icon: 'sun' },
            { value: 'MotoAdaptiveLight', label: 'eq_moto_adaptive_light', icon: 'lightbulb' },
            { value: 'MotoDRL',        label: 'eq_moto_drl', icon: 'sun-dim' },
            { value: 'MotoFog',        label: 'eq_moto_fog', icon: 'cloud-fog' },
            { value: 'DynamicBrakeLight', label: 'eq_dynamic_brake_light', icon: 'alert-octagon' },
            { value: 'MotoTowBar',     label: 'eq_moto_tow_bar', icon: 'anchor' },
            { value: 'ReverseGear',    label: 'eq_reverse_gear', icon: 'corner-down-left' },
            { value: 'DualSportTires', label: 'eq_dual_sport_tires', icon: 'mountain' },
            { value: 'ForgedWheels',   label: 'eq_forged_wheels', icon: 'disc' },
        ],
    },
    {
        id: 'navtika_plovba',
        label: 'eq_group_navtika_plovba',
        icon: 'compass',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'gps_chartplotter', label: 'eq_gps_chartplotter', icon: 'map' },
            { value: 'mfd', label: 'eq_mfd', icon: 'monitor' },
            { value: 'autopilot', label: 'eq_autopilot', icon: 'compass' },
            { value: 'autopilot_sail', label: 'eq_autopilot_sail', icon: 'compass' },
            { value: 'autopilot_outboard', label: 'eq_autopilot_outboard', icon: 'compass' },
            { value: 'radar', label: 'eq_radar', icon: 'radio' },
            { value: 'radar_doppler', label: 'eq_radar_doppler', icon: 'radio' },
            { value: 'vhf_radio', label: 'eq_vhf_radio', icon: 'phone' },
            { value: 'vhf_handheld', label: 'eq_vhf_handheld', icon: 'phone' },
            { value: 'depth_sounder', label: 'eq_depth_sounder', icon: 'activity' },
            { value: 'fishfinder_chirp', label: 'eq_fishfinder_chirp', icon: 'fish' },
            { value: 'sidescan_sonar', label: 'eq_sidescan_sonar', icon: 'scan' },
            { value: 'sonar_3d', label: 'eq_sonar_3d', icon: 'box' },
            { value: 'speed_log', label: 'eq_speed_log', icon: 'gauge' },
            { value: 'wind_instrument', label: 'eq_wind_instrument', icon: 'wind' },
            { value: 'ais', label: 'eq_ais', icon: 'shield' },
            { value: 'ais_transponder', label: 'eq_ais_transponder', icon: 'shield' },
            { value: 'compass', label: 'eq_compass', icon: 'navigation' },
            { value: 'satellite_compass', label: 'eq_satellite_compass', icon: 'navigation' },
            { value: 'water_temp', label: 'eq_water_temp', icon: 'thermometer' },
            { value: 'barometer', label: 'eq_barometer', icon: 'gauge' },
            { value: 'thermal_camera', label: 'eq_thermal_camera', icon: 'video' },
            { value: 'searchlight', label: 'eq_searchlight', icon: 'flashlight' },
            { value: 'nav_lights_led', label: 'eq_nav_lights_led', icon: 'lightbulb' },
            { value: 'boat_tracker', label: 'eq_boat_tracker', icon: 'locate-fixed' },
        ],
    },
    {
        id: 'navtika_paluba',
        label: 'eq_group_navtika_paluba',
        icon: 'anchor',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'anchor_windlass', label: 'eq_anchor_windlass', icon: 'anchor' },
            { value: 'windlass_remote', label: 'eq_windlass_remote', icon: 'anchor' },
            { value: 'chain_counter', label: 'eq_chain_counter', icon: 'list-ordered' },
            { value: 'bow_thruster', label: 'eq_bow_thruster', icon: 'shuffle' },
            { value: 'stern_thruster', label: 'eq_stern_thruster', icon: 'shuffle' },
            { value: 'joystick_control', label: 'eq_joystick_control', icon: 'gamepad' },
            { value: 'teak', label: 'eq_teak', icon: 'layers' },
            { value: 'teak_synthetic', label: 'eq_teak_synthetic', icon: 'layers' },
            { value: 'bimini', label: 'eq_bimini', icon: 'umbrella' },
            { value: 'sprayhood', label: 'eq_sprayhood', icon: 'wind' },
            { value: 'cockpit_enclosure', label: 'eq_cockpit_enclosure', icon: 'square' },
            { value: 'hardtop', label: 'eq_hardtop', icon: 'panel-top' },
            { value: 'sun_awning', label: 'eq_sun_awning', icon: 'umbrella' },
            { value: 'pasarela', label: 'eq_pasarela', icon: 'menu' },
            { value: 'pasarela_hydraulic', label: 'eq_pasarela_hydraulic', icon: 'menu' },
            { value: 'swim_platform', label: 'eq_swim_platform', icon: 'layout' },
            { value: 'swim_platform_hydraulic', label: 'eq_swim_platform_hydraulic', icon: 'layout' },
            { value: 'bathing_ladder', label: 'eq_bathing_ladder', icon: 'chevrons-down' },
            { value: 'stern_shower', label: 'eq_stern_shower', icon: 'droplet' },
            { value: 'bow_shower', label: 'eq_bow_shower', icon: 'droplet' },
            { value: 'davits', label: 'eq_davits', icon: 'arrow-up-down' },
            { value: 'tender_crane', label: 'eq_tender_crane', icon: 'arrow-up' },
            { value: 'cockpit_table', label: 'eq_cockpit_table', icon: 'table' },
            { value: 'cockpit_cushions', label: 'eq_cockpit_cushions', icon: 'square' },
            { value: 'cockpit_fridge', label: 'eq_cockpit_fridge', icon: 'refrigerator' },
            { value: 'deck_grill', label: 'eq_deck_grill', icon: 'flame' },
            { value: 'board_holder', label: 'eq_board_holder', icon: 'grip' },
            { value: 'underwater_lights', label: 'eq_underwater_lights', icon: 'lightbulb' },
            { value: 'deck_lighting', label: 'eq_deck_lighting', icon: 'lightbulb' },
            { value: 'outdoor_speakers', label: 'eq_outdoor_speakers', icon: 'speaker' },
            { value: 'guardrails', label: 'eq_guardrails', icon: 'fence' },
            { value: 'boarding_gates', label: 'eq_boarding_gates', icon: 'door-open' },
        ],
    },
    {
        id: 'navtika_udobje',
        label: 'eq_group_navtika_udobje',
        icon: 'smile',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'refrigerator', label: 'eq_refrigerator', icon: 'refrigerator' },
            { value: 'freezer', label: 'eq_freezer', icon: 'snowflake' },
            { value: 'ice_maker', label: 'eq_ice_maker', icon: 'snowflake' },
            { value: 'wine_cooler', label: 'eq_wine_cooler', icon: 'wine' },
            { value: 'stove', label: 'eq_stove', icon: 'flame' },
            { value: 'induction_hob', label: 'eq_induction_hob', icon: 'circle-dot' },
            { value: 'oven', label: 'eq_oven', icon: 'chef-hat' },
            { value: 'microwave', label: 'eq_microwave', icon: 'box' },
            { value: 'dishwasher', label: 'eq_dishwasher', icon: 'box' },
            { value: 'washing_machine', label: 'eq_washing_machine', icon: 'washing-machine' },
            { value: 'central_vacuum', label: 'eq_central_vacuum', icon: 'wind' },
            { value: 'tv', label: 'eq_tv', icon: 'tv' },
            { value: 'tv_popup', label: 'eq_tv_popup', icon: 'tv' },
            { value: 'satellite_tv', label: 'eq_satellite_tv', icon: 'satellite-dish' },
            { value: 'audio_system', label: 'eq_audio_system', icon: 'speaker' },
            { value: 'cabin_subwoofer', label: 'eq_cabin_subwoofer', icon: 'volume-2' },
            { value: 'cabin_usb', label: 'eq_cabin_usb', icon: 'plug' },
            { value: 'reading_lights', label: 'eq_reading_lights', icon: 'lightbulb' },
            { value: 'cabin_blinds', label: 'eq_cabin_blinds', icon: 'panel-top' },
            { value: 'insect_screens', label: 'eq_insect_screens', icon: 'grid-2x2' },
            { value: 'double_glazing', label: 'eq_double_glazing', icon: 'square' },
            { value: 'wardrobes', label: 'eq_wardrobes', icon: 'archive' },
            { value: 'safe', label: 'eq_safe', icon: 'lock' },
            { value: 'custom_mattresses', label: 'eq_custom_mattresses', icon: 'bed' },
        ],
    },
    {
        id: 'navtika_sanitarije',
        label: 'eq_group_navtika_sanitary',
        icon: 'droplet',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'electric_toilet', label: 'eq_electric_toilet', icon: 'droplet' },
            { value: 'manual_toilet', label: 'eq_manual_toilet', icon: 'droplet' },
            { value: 'blackwater_tank', label: 'eq_blackwater_tank', icon: 'database' },
            { value: 'water_heater', label: 'eq_water_heater', icon: 'thermometer' },
            { value: 'watermaker', label: 'eq_watermaker', icon: 'droplets' },
            { value: 'fresh_water_pump', label: 'eq_fresh_water_pump', icon: 'droplet' },
            { value: 'water_filter', label: 'eq_water_filter', icon: 'filter' },
            { value: 'shower_cabin', label: 'eq_shower_cabin', icon: 'shower-head' },
            { value: 'washbasin', label: 'eq_washbasin', icon: 'droplet' },
            { value: 'bathroom_cabinets', label: 'eq_bathroom_cabinets', icon: 'archive' },
        ],
    },
    {
        id: 'navtika_energija',
        label: 'eq_group_navtika_energija',
        icon: 'zap',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'air_conditioning', label: 'eq_air_conditioning', icon: 'wind' },
            { value: 'heating', label: 'eq_heating', icon: 'flame' },
            { value: 'diesel_heating', label: 'eq_diesel_heating', icon: 'flame' },
            { value: 'underfloor_heating', label: 'eq_underfloor_heating', icon: 'flame' },
            { value: 'solar', label: 'eq_solar', icon: 'sun' },
            { value: 'mppt_regulator', label: 'eq_mppt_regulator', icon: 'sun' },
            { value: 'generator', label: 'eq_generator', icon: 'zap' },
            { value: 'inverter', label: 'eq_inverter', icon: 'refresh-cw' },
            { value: 'battery_charger', label: 'eq_battery_charger', icon: 'battery-charging' },
            { value: 'shore_power_ats', label: 'eq_shore_power_ats', icon: 'plug-zap' },
            { value: 'battery_monitor', label: 'eq_battery_monitor', icon: 'battery' },
            { value: 'galvanic_isolator', label: 'eq_galvanic_isolator', icon: 'shield' },
            { value: 'isolation_transformer', label: 'eq_isolation_transformer', icon: 'plug' },
            { value: 'energy_management', label: 'eq_energy_management', icon: 'cpu' },
            { value: 'tender', label: 'eq_tender', icon: 'sailboat' },
        ],
    },
    {
        id: 'navtika_varnost',
        label: 'eq_group_navtika_safety',
        icon: 'life-buoy',
        categories: ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'],
        items: [
            { value: 'life_raft', label: 'eq_life_raft', icon: 'life-buoy' },
            { value: 'life_jackets', label: 'eq_life_jackets', icon: 'life-buoy' },
            { value: 'epirb', label: 'eq_epirb', icon: 'radio' },
            { value: 'plb', label: 'eq_plb', icon: 'radio' },
            { value: 'ais_sart', label: 'eq_ais_sart', icon: 'radio' },
            { value: 'radar_reflector', label: 'eq_radar_reflector', icon: 'triangle' },
            { value: 'mob_system', label: 'eq_mob_system', icon: 'user-x' },
            { value: 'fire_suppression', label: 'eq_fire_suppression', icon: 'flame' },
            { value: 'fire_extinguishers', label: 'eq_fire_extinguishers', icon: 'flame' },
            { value: 'gas_detector', label: 'eq_gas_detector', icon: 'alert-triangle' },
            { value: 'smoke_detector', label: 'eq_smoke_detector', icon: 'alert-triangle' },
            { value: 'bilge_pump_auto', label: 'eq_bilge_pump_auto', icon: 'droplet' },
            { value: 'high_water_alarm', label: 'eq_high_water_alarm', icon: 'alert-triangle' },
            { value: 'anchor_alarm', label: 'eq_anchor_alarm', icon: 'anchor' },
            { value: 'first_aid', label: 'eq_first_aid', icon: 'plus' },
            { value: 'flares', label: 'eq_flares', icon: 'flame' },
            { value: 'aed', label: 'eq_aed', icon: 'heart-pulse' },
            { value: 'remote_monitoring', label: 'eq_remote_monitoring', icon: 'smartphone' },
        ],
    },
    {
        id: 'drugo',
        label: 'eq_group_drugo',
        icon: 'plus-circle',
        categories: ['all'],
        items: [
            { value: 'Kadilski',       label: 'eq_smoking', icon: 'cigarette' },
            { value: 'Taxi',           label: 'eq_taxi', icon: 'taxi' },
            { value: 'DrivingSchool',  label: 'eq_driving_school', icon: 'graduation-cap' },
        ],
    }
];

// ── Attribute Icons ───────────────────────────────────────────────────────────
// Icons for common vehicle attributes (fuel, transmission, etc.)
export const ATTRIBUTE_ICONS = {
    // Fuel
    'Petrol': 'fuel',
    'Dizel':  'fuel',
    'Hibrid': 'battery-charging',
    'Elektrika': 'zap',
    'LPG': 'flame',
    'CNG': 'flame',
    'Vodik': 'droplets',
    
    // Transmission
    'Ročni': 'settings-2',
    'Avtomatski': 'box',
    'Sekvenčni': 'move-up',
    'Polavtomatski': 'workflow',
    
    // Drive
    'Spredaj': 'car-front',
    'Zadaj': 'car-front',
    'Štirikolesni (4x4)': 'navigation',
    'FWD (sprednji)': 'arrow-up',
    'RWD (zadnji)': 'arrow-down',
    'AWD / 4x4': 'move',
    '4x4': 'move',
    '4WD': 'move',
    
    // Condition
    'Novo': 'sparkles',
    'Rabljeno': 'history',
    'Testno': 'test-tube-2',
    'Poškodovano': 'alert-triangle',
    'V okvari': 'wrench',
    'Starodobnik': 'calendar',
    'Razstavno vozilo': 'eye',
    'Za dele': 'wrench',
    
    // Color
    'Bela': 'palette',
    'Črna': 'palette',
    'Srebrna': 'palette',
    'Siva': 'palette',
    'Modra': 'palette',
    'Rdeča': 'palette',
    'Zelena': 'palette',
    'Rumena': 'palette',
    'Rjava': 'palette',
    'Oranžna': 'palette',
    'Vijolična': 'palette',
    'Zlata': 'palette',
    'Bronasta': 'palette',
    'Druga': 'palette',

    // Color Type
    'solid': 'palette',
    'metallic': 'sparkles',
    'matte': 'droplet',
    'pearl': 'circle',
    
    // Body types
    'Limuzina': 'car',
    'SUV / Terensko': 'mountain',
    'Karavan': 'layout-template',
    'Kombilimuzina': 'car',
    'Kabriolet': 'sun',
    'Coupe': 'zap',
    'Enoprostorec': 'users',
    'Pick-up': 'truck',
    'Oldtimer': 'history',

    // Euro class
    'Euro 4': 'leaf',
    'Euro 5': 'leaf',
    'Euro 6': 'leaf',
    'Euro 6d': 'leaf',
    'Euro 6d-temp': 'leaf',

    // Owners
    '1. lastnik': 'user-check',
    '2. lastnik': 'user-check',
    '3. lastnik': 'user-check',
    '4. lastnik': 'user-check',
    '5 ali več': 'users',

    // Hybrid Types
    'PetrolHybrid': 'battery-charging',
    'DizelHibrid': 'battery-charging',
    'PlugIn': 'plug-zap',
    'MildHibrid': 'zap',

    // Months
    '01': 'calendar', '02': 'calendar', '03': 'calendar', '04': 'calendar',
    '05': 'calendar', '06': 'calendar', '07': 'calendar', '08': 'calendar',
    '09': 'calendar', '10': 'calendar', '11': 'calendar', '12': 'calendar',
    
    // Numbers (Doors, Seats)
    '2': 'door-closed', '3': 'door-closed', '4': 'door-closed', '5': 'door-closed', '6': 'door-closed',
    '2 ': 'armchair', '3 ': 'armchair', '4 ': 'armchair', '5 ': 'armchair', '6 ': 'armchair', '7 ': 'armchair', '8 ': 'armchair', '9 ': 'armchair',
    
    // Misc
    'firstRegistration': 'calendar',
    'mileage': 'gauge',
    'power': 'zap',
    'seats': 'armchair',
    'doors': 'door-closed',
    'co2': 'cloud',
    'emission': 'leaf',
    'vin': 'fingerprint',
    'price': 'banknote',
    'brand': 'car-front',
    'model': 'car',
    'variant': 'file-text',
    'year': 'calendar',
    'engine': 'cpu',
    'cc': 'cpu',
    'transmission': 'settings-2',
    'drive': 'navigation',
    'color': 'palette',
    'registeredUntil': 'calendar-check',
    'towing': 'anchor',
    'battery': 'battery',
    'range': 'map-pin',
    'abs': 'shield',
    'esp': 'activity',
    'airbag': 'user-check',
    'tempomat': 'timer',
    'kamera': 'video',
    'usnje': 'layers',
    'klima': 'thermometer-snowflake',
    'luči': 'sun',
    'nekadilski': 'cigarette-off',
    'kadilski': 'cigarette',
    'servis': 'book-open',
    'garancija': 'badge-check',
    'navigacija': 'map',
};

/**
 * Robust icon lookup for any attribute or equipment item.
 * Searches in ATTRIBUTE_ICONS first, then falls back to EQUIPMENT_GROUPS.
 */
export function getAttributeIcon(key, value) {
    const v = String(value || '').trim();
    const k = String(key || '').trim();

    // 1. Direct match in attribute icons (by value)
    if (ATTRIBUTE_ICONS[v]) return ATTRIBUTE_ICONS[v];
    
    // 2. Direct match in attribute icons (by key)
    if (ATTRIBUTE_ICONS[k]) return ATTRIBUTE_ICONS[k];

    // 3. Search in Equipment Groups (by value or label)
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => 
            i.value === v || 
            i.label === v || 
            i.value === k || 
            i.label === k ||
            i.value.toLowerCase() === v.toLowerCase() ||
            i.label.toLowerCase() === v.toLowerCase()
        );
        if (item && item.icon) return item.icon;
    }

    // 4. Heuristic fallbacks (Slovenian keywords)
    const lowerV = v.toLowerCase();
    const lowerK = k.toLowerCase();

    if (lowerV.includes('km') || lowerK.includes('mileage')) return 'gauge';
    if (lowerV.includes('kw') || lowerV.includes('km (moč)') || lowerK.includes('power')) return 'zap';
    if (lowerV.includes('€') || lowerK.includes('price')) return 'banknote';
    if (lowerV.includes('kamera')) return 'video';
    if (lowerV.includes('tempomat')) return 'timer';
    if (lowerV.includes('usnje')) return 'layers';
    if (lowerV.includes('luči') || lowerV.includes('žarometi')) return 'sun';
    if (lowerV.includes('abs')) return 'shield';
    if (lowerV.includes('esp')) return 'activity';
    if (lowerV.includes('klima')) return 'thermometer-snowflake';
    if (lowerV.includes('nekadilsk')) return 'cigarette-off';
    if (lowerV.includes('kadilsk')) return 'cigarette';
    if (lowerV.includes('servis')) return 'book-open';
    if (lowerV.includes('garancija')) return 'badge-check';
    if (lowerV.includes('navigacija')) return 'map';
    if (lowerV.includes('sedež')) return 'armchair';
    if (lowerV.includes('volan')) return 'circle-dot';
    if (lowerV.includes('vrat')) return 'door-closed';
    if (lowerV.includes('motor')) return 'cpu';
    if (lowerV.includes('radio') || lowerV.includes('avdio') || lowerV.includes('zvok')) return 'speaker';
    if (lowerV.includes('parkirn') || lowerV.includes('senz')) return 'radar';
    if (lowerV.includes('bluetooth')) return 'bluetooth';
    if (lowerV.includes('paket')) return 'package';
    if (lowerV.includes('streha') || lowerV.includes('okno')) return 'layout';

    return 'check';
}


// Get equipment items for a specific category (avto/moto/etc.)
export function getEquipmentForCategory(category) {
    const cat = (category || 'avto').toLowerCase();
    return EQUIPMENT_GROUPS.filter(g =>
        g.categories.includes(cat) || g.categories.includes('all')
    );
}

// ── Advanced-search chip rendering ────────────────────────────────────────────
// Renders the equipment accordion's chip groups straight from EQUIPMENT_GROUPS so
// the search filter and the create-listing form can never drift. Each group keeps
// a data-eq-group hook so admin-approved custom equipment chips still attach.
//
// `translate` is the i18n t() function (label key → localized text). `opts.exclude`
// is a Set of values that have bespoke UI elsewhere and must NOT be auto-rendered
// (e.g. the moto SportExhaust tag input and the IMU sub-chips).
const _escEq = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderEquipmentChipsHtml(category, translate, opts = {}) {
    const t = typeof translate === 'function' ? translate : (k, f) => f || k;
    const exclude = opts.exclude instanceof Set ? opts.exclude : new Set(opts.exclude || []);
    const fieldName = opts.name || 'features';
    const groups = getEquipmentForCategory(category)
        .filter(g => !(opts.skipGroups || []).includes(g.id));

    return groups.map(g => {
        const chips = g.items
            .filter(i => !exclude.has(i.value))
            .map(i => `<label class="adv-chip"><input type="checkbox" name="${_escEq(fieldName)}" value="${_escEq(i.value)}"> ${_escEq(t(i.label, i.value))}</label>`)
            .join('\n');
        if (!chips) return '';
        return `<p class="adv-sub-label"><i data-lucide="${g.icon}"></i> ${_escEq(t(g.label, g.id))}</p>\n` +
            `<div class="adv-chip-group" data-eq-group="${g.id}" style="margin-bottom:1.5rem;">\n${chips}\n</div>`;
    }).filter(Boolean).join('\n');
}

// Flat list of all values (for search filtering)
export const ALL_EQUIPMENT_VALUES = EQUIPMENT_GROUPS.flatMap(g => g.items.map(i => i.value));

// Lookup: value → label
export function getEquipmentLabel(value) {
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => i.value === value);
        if (item) return item.label;
    }
    return value;
}

// Lookup: value → icon
export function getEquipmentIcon(value) {
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => i.value === value);
        if (item) return item.icon;
    }
    return 'check';
}
