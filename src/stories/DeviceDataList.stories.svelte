<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DeviceDataList from '$lib/components/DeviceDataList.svelte';
  import { fn } from '@storybook/test';

  // Create mock data for DeviceDataList
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
      battery: 3.8,
      co2: 450,
      pressure: 1013.25,
      ph: 6.8,
      ec: 1.2
    }
  };

  const inactiveDevice = {
    ...activeDevice,
    latest_data: {
      ...activeDevice.latest_data,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago (inactive)
    }
  };

  // Create a mock for messages since nameToJapaneseName uses it
  const mockMessages = {};
  
  // Set up the mock for $lib/paraglide/messages.js module
  const messagesModuleMock = {
    m: (key) => {
      if (mockMessages[key]) {
        return mockMessages[key]();
      }
      return key;
    }
  };

  const { Story } = defineMeta({
    title: 'CropWatch/DeviceDataList',
    component: DeviceDataList,
    tags: ['autodocs'],
    parameters: {
      // Add this to properly load the app.css with svelte-ux styles
      backgrounds: {
        default: 'light',
        values: [
          { name: 'light', value: '#f5f5f5' },
          { name: 'dark', value: '#333333' }
        ]
      },
      moduleContext: {
        '$lib/paraglide/messages.js': messagesModuleMock
      }
    }
  });
</script>

<Story 
  name="Active Device" 
  args={{
    device: activeDevice,
    isActive: true
  }}
/>

<Story 
  name="Inactive Device" 
  args={{
    device: inactiveDevice,
    isActive: false
  }}
/>

<Story 
  name="Multiple Data Points" 
  args={{
    device: {
      ...activeDevice,
      latest_data: {
        ...activeDevice.latest_data,
        // Ensure a good variety of data points for display
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      }
    },
    isActive: true
  }}
/>

<style>
  /* Add any global styles needed for the stories */
  :global(.sb-show-main) {
    padding: 1rem;
  }
</style>