import { isActive } from "@layerstack/utils/routing";
import moment from "moment";

export const sampleLocations = [
    {
        location_id: 1,
        name: 'テストデバイス',
        lat: 0.0,
        long: 0.0,
        description: null,
        created_at: '2025-03-22T13:27:37.915548+00:00',
        owner_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
        map_zoom: 18,
        cw_devices: [
            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B002',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.5, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },


            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B003',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.3, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },

            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B004',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.5, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },


            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B005',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.3, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },
        ],
        cw_location_owners: [
            {
                id: 445,
                user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                owner_id: 445,
                is_active: true,
                description: null,
                location_id: 127,
                permission_level: 1
            }
        ]
    },
    {
        location_id: 2,
        name: 'テストデバイス',
        lat: 0.0,
        long: 0.0,
        description: null,
        created_at: '2025-03-22T13:27:37.915548+00:00',
        owner_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
        map_zoom: 18,
        cw_devices: [
            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B004',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.5, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },


            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B003',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(9.3, 'minutes').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: 10,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: 10,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B004',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },
        ],
        cw_location_owners: [
            {
                id: 445,
                user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                owner_id: 445,
                is_active: true,
                description: null,
                location_id: 127,
                permission_level: 1
            }
        ]
    },

    {
        location_id: 8,
        name: 'テストデバイス',
        lat: 0.0,
        long: 0.0,
        description: null,
        created_at: '2025-03-22T13:27:37.915548+00:00',
        owner_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
        map_zoom: 18,
        cw_devices: [
            {
                
                lat: 0,
                long: 0,
                name: 'テスト2',
                type: 2,
                dev_eui: 'AC1F09FFFE16B008',
                user_id: null,
                cw_rules: [],
                ai_provider: null,
                location_id: 127,
                installed_at: '2025-03-23',
                serial_number: null,
                latest_data: {
                    created_at: moment().subtract(0.9, 'hours').toDate(),
                    temperatureC: 25.0,
                    humidity: 60.0,
                    soilMoisture: 30.0,
                    light: 500.0,
                    batteryVoltage: 3.7
                },
                cw_device_type: {
                    id: 2,
                    name: '[CROPWATCH] Air Temperature, Humidity Sensor',
                    model: 'CW-air-thvd',
                    decoder: '1.0',
                    isActive: true,
                    created_at: '2023-12-31T13:16:05.592979+00:00',
                    data_table: 'cw_air_thvd',
                    device_app: null,
                    manufacturer: 'CropWatch',
                    primary_data: 'temperatureC',
                    data_table_v2: 'cw_air_data',
                    secondary_data: 'humidity',
                    primary_data_v2: 'temperature_c',
                    primary_divider: 1,
                    secondary_data_v2: 'humidity',
                    secondary_divider: 1,
                    TTI_application_id: 'cw-air-th',
                    primary_multiplier: 1,
                    secondary_multiplier: 1,
                    primary_data_notation: '°C',
                    default_upload_interval: null,
                    secondary_data_notation: '%'
                },
                report_endpoint: null,
                upload_interval: null,
                cw_device_owners: [
                    {
                        id: 696,
                        dev_eui: 'AC1F09FFFE16B088',
                        user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                        owner_id: 695,
                        permission_level: 1
                    }
                ],
                battery_changed_at: '2025-03-22',
                warranty_start_date: null
            },
        ],
        cw_location_owners: [
            {
                id: 445,
                user_id: 'fd140e81-7640-4f42-ab52-dff1b5635723',
                owner_id: 445,
                is_active: true,
                description: null,
                location_id: 127,
                permission_level: 1
            }
        ]
    }
];