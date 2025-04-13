<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DashboardCard from '$lib/components/DashboardCard.svelte';
  import DataRowItem from '$lib/components/DataRowItem.svelte';
  import { fn } from '@storybook/test';

  // Simple mock data for the stories
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
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          temperature: 22.5,
          humidity: 65
        }
      }
    ]
  };

  const emptyLocation = {
    ...sampleLocation,
    cw_devices: []
  };

  const { Story } = defineMeta({
    title: 'CropWatch/DashboardCard',
    component: DashboardCard,
    tags: ['autodocs'],
    args: {
      onNavigate: fn()
    }
  });
</script>

<Story name="Default" args={{ location: sampleLocation }} />

<Story name="No Devices" args={{ location: emptyLocation }} />

<!-- For the story with custom DataRowItem components -->
<Story name="With Custom Items">
  <DashboardCard location={sampleLocation}>
    <div class="mb-2">
      <DataRowItem device={sampleLocation.cw_devices[0]} />
    </div>
  </DashboardCard>
</Story>
