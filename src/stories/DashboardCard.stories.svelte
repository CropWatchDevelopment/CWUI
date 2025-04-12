<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import { fn } from '@storybook/test';

  // Create sample data that matches the ILocation interface
  const sampleLocation = {
    location_id: '123',
    name: 'Farmland Alpha',
    cw_devices: [
      {
        cw_device_type: {
          default_upload_interval: 15
        },
        cw_rules: [],
        latest_data: {
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
        }
      },
      {
        cw_device_type: {
          default_upload_interval: 15
        },
        cw_rules: [{ id: 1 }],
        latest_data: {
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        }
      },
      {
        cw_device_type: {
          default_upload_interval: 15
        },
        cw_rules: [],
        latest_data: {
          created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 minutes ago (inactive)
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
          title.textContent = `Device ${index + 1}`;
          
          const lastUpdate = document.createElement('p');
          lastUpdate.className = 'text-xs';
          lastUpdate.textContent = `Last update: ${new Date(device.latest_data?.created_at).toLocaleTimeString()}`;
          
          deviceDiv.appendChild(title);
          deviceDiv.appendChild(lastUpdate);
          
          if (device.cw_rules.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full';
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