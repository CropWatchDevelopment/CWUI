<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import { fn } from '@storybook/test';
  
  // Mock the utility functions if they're not already available in Storybook
  import { nameToEmoji } from '$lib/utilities/NameToEmoji';
  import { nameToNotation } from '$lib/utilities/NameToNotation';
  import { nameToJapaneseName } from '$lib/utilities/nameToJapanese';
  import { convertObject } from '$lib/utilities/ConvertSensorDataObject';
  
  // Mock paraglide messages
  import { m } from '$lib/paraglide/messages';
  if (!m.component_dataRowItem_detail_button) {
    m.component_dataRowItem_detail_button = () => 'Details';
  }

  // Create sample data that matches the updated component requirements
  const sampleLocation = {
    location_id: '123',
    name: 'Farmland Alpha',
    cw_devices: [
      {
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
        cw_rules: [],
        latest_data: {
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          temperature: 22.5,
          humidity: 65,
          soil_moisture: 42,
          light: 12000,
          battery: 3.8
        }
      },
      {
        dev_eui: 'device-002',
        name: 'Soil Monitor',
        location_id: '123',
        cw_device_type: {
          default_upload_interval: 15,
          primary_data_v2: 'soil_moisture',
          secondary_data_v2: 'light',
          primary_data_notation: '%',
          secondary_data_notation: 'lux'
        },
        cw_rules: [{ id: 1 }],
        latest_data: {
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          soil_moisture: 38,
          light: 15000,
          battery: 3.6
        }
      },
      {
        dev_eui: 'device-003',
        name: 'Weather Station',
        location_id: '123',
        cw_device_type: {
          default_upload_interval: 15,
          primary_data_v2: 'temperature',
          secondary_data_v2: 'pressure',
          primary_data_notation: '°C',
          secondary_data_notation: 'hPa'
        },
        cw_rules: [],
        latest_data: {
          created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago (inactive)
          temperature: 19.8,
          humidity: 72,
          pressure: 1013,
          battery: 3.2
        }
      }
    ]
  };

  const emptyLocation = {
    ...sampleLocation,
    cw_devices: []
  };

  // Function to create a render function for custom device items
  function createRenderDeviceItems() {
    return () => ({
      c() {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-devices';
        
        sampleLocation.cw_devices.forEach((device, index) => {
          const deviceDiv = document.createElement('div');
          deviceDiv.className = 'p-2 bg-surface-200 rounded mb-2';
          
          const title = document.createElement('strong');
          title.textContent = `${device.name}`;
          
          const lastUpdate = document.createElement('p');
          lastUpdate.className = 'text-xs';
          lastUpdate.textContent = `Last update: ${new Date(device.latest_data?.created_at).toLocaleTimeString()}`;
          
          const primaryData = document.createElement('div');
          primaryData.className = 'flex items-center mt-2';
          primaryData.innerHTML = `
            <span class="mr-1">${nameToEmoji(device.cw_device_type.primary_data_v2)}</span>
            <span>${device.latest_data[device.cw_device_type.primary_data_v2]}</span>
            <small><sup class="text-accent-300">${device.cw_device_type.primary_data_notation}</sup></small>
          `;
          
          deviceDiv.appendChild(title);
          deviceDiv.appendChild(lastUpdate);
          deviceDiv.appendChild(primaryData);
          
          if (device.cw_rules.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mt-2';
            badge.textContent = 'Has rules';
            deviceDiv.appendChild(badge);
          }
          
          wrapper.appendChild(deviceDiv);
        });
        
        return wrapper;
      }
    });
  }

  const { Story } = defineMeta({
    title: 'CropWatch/DashboardCard',
    component: DashboardCard,
    tags: ['autodocs'],
    argTypes: {
      onNavigate: { action: 'navigated' }
    },
    args: {
      onNavigate: fn()
    }
  });
</script>

<Story 
  name="Default" 
  args={{
    location: sampleLocation
  }}
/>

<Story 
  name="No Devices" 
  args={{
    location: emptyLocation
  }}
/>

<Story 
  name="With Custom Device Content" 
  args={{
    location: sampleLocation,
    customDeviceContent: true,
    renderDeviceItems: createRenderDeviceItems()
  }}
/>