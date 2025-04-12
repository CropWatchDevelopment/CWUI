export interface ICWDeviceType {
  default_upload_interval: number;
}

export interface ICWRule {
  // Add any properties needed for rules
}

export interface ICWDevice {
  cw_device_type: ICWDeviceType;
  cw_rules: ICWRule[];
  latest_data?: {
    created_at: string;
  };
}

export interface ILocation {
  location_id: string | number;
  name: string;
  cw_devices: ICWDevice[];
}