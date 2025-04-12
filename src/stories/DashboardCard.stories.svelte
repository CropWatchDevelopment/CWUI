<script>
  import { Meta, Story } from '@storybook/addon-svelte-csf';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import { mdiArrowRight } from '@mdi/js';

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
</script>

<Meta
  title="CropWatch/DashboardCard"
  component={DashboardCard}
  argTypes={{
    location: { control: 'object' },
    onNavigate: { action: 'navigated' }
  }}
/>

<Story 
  name="Default"
  args={{
    location: sampleLocation,
    onNavigate: (id) => console.log(`Navigate to: ${id}`)
  }}
>
  <div class="p-4 max-w-md bg-surface-100">
    <DashboardCard 
      location={sampleLocation} 
      onNavigate={(id) => console.log(`Navigate to: ${id}`)}
    />
  </div>
</Story>

<Story 
  name="No Devices"
  args={{
    location: {...sampleLocation, cw_devices: []},
    onNavigate: (id) => console.log(`Navigate to: ${id}`)
  }}
>
  <div class="p-4 max-w-md bg-surface-100">
    <DashboardCard 
      location={{...sampleLocation, cw_devices: []}}
      onNavigate={(id) => console.log(`Navigate to: ${id}`)}
    />
  </div>
</Story>