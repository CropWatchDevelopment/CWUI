<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DataRowItem from '$lib/components/DataRowItem.svelte';
  import { fn } from '@storybook/test';

  // Create mock data for DataRowItem
  const activeDevice = {
    dev_eui: 'device-001',
    name: 'Temperature Sensor 1',
    location_id: '123',
    cw_device_type: {
      default_upload_interval: 15,
      primary_data_v2: 'temperature',
      secondary_data_v2: 'humidity',
      primary_data_notation: '°C',
      secondary_data_notation: '%'
    },
    latest_data: {
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      temperature: 22.5,
      humidity: 65,
      soil_moisture: 42,
      light: 12000,
      battery: 3.8
    }
  };

  const inactiveDevice = {
    ...activeDevice,
    dev_eui: 'device-002',
    name: 'Temperature Sensor 2',
    latest_data: {
      ...activeDevice.latest_data,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago (inactive)
    }
  };

  const deviceWithNoData = {
    ...activeDevice,
    dev_eui: 'device-003',
    name: 'New Sensor',
    latest_data: null
  };

  // Create a mock location
  const mockLocation = {
    id: '123',
    name: 'Test Farm'
  };

  // Mock localStorage for Storybook environment
  if (typeof window !== 'undefined' && !window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
        clear: () => {},
        key: () => null,
        length: 0
      }
    });
  }

  const { Story } = defineMeta({
    title: 'CropWatch/DataRowItem',
    component: DataRowItem,
    tags: ['autodocs'],
    parameters: {
      backgrounds: {
        default: 'light',
        values: [
          { name: 'light', value: '#f5f5f5' },
          { name: 'dark', value: '#333333' }
        ]
      }
    }
  });
</script>

<Story 
  name="Active Device" 
  args={{
    device: activeDevice,
    location: null
  }}
/>

<Story 
  name="Active Device With Location" 
  args={{
    device: activeDevice,
    location: mockLocation
  }}
/>

<Story 
  name="Inactive Device" 
  args={{
    device: inactiveDevice,
    location: null
  }}
/>

<Story 
  name="Device With No Data" 
  args={{
    device: deviceWithNoData,
    location: null
  }}
/>

<style>
  :global(.sb-show-main) {
    padding: 1rem;
  }
</style>