# DashboardCard Component

The DashboardCard is a reusable component for displaying location information and associated devices in a card format.

## Installation

```bash
# Using pnpm
pnpm add cwui

# Using npm
npm install cwui

# Using yarn
yarn add cwui
```

## Basic Usage

```svelte
<script>
  import { DashboardCard } from 'cwui';
  import { goto } from '$app/navigation';
  
  // Your location data
  const location = {
    location_id: '123',
    name: 'Farm Location',
    cw_devices: [
      // Device data
    ]
  };
  
  function handleNavigate(locationId) {
    goto(`/app/location/${locationId}`);
  }
</script>

<DashboardCard location={location} onNavigate={handleNavigate} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `ILocation` | Required | Location data object with the fields defined in the ILocation interface |
| `onNavigate` | `(locationId: string \| number) => void` | `() => {}` | Function called when the navigation button is clicked |
| `customDeviceContent` | `boolean` | `false` | Enable custom device content rendering |
| `renderDeviceItems` | `function` | `null` | Render function for custom device content (used with Svelte 5's `{@render ...}` syntax) |

## Using Custom Device Content (Svelte 5)

You can customize how devices are displayed using the new Svelte 5 `{@render ...}` syntax:

```svelte
<script>
  import { DashboardCard, DataRowItem } from 'cwui';
  
  // Your location data
  const location = {
    // ...location data
  };
  
  function handleNavigate(locationId) {
    // Navigation logic
  }
  
  // Create render function for custom device items
  function renderCustomDevices() {
    return {
      c() {
        const fragment = document.createDocumentFragment();
        
        location.cw_devices.forEach((device, i) => {
          const deviceRow = DataRowItem({
            device,
            customContent: true,
            renderContent: () => ({
              c() {
                const div = document.createElement('div');
                div.className = 'p-2 border rounded';
                
                const title = document.createElement('h3');
                title.textContent = 'Custom Device Display';
                
                const text = document.createElement('p');
                text.textContent = `Device Status: ${device.status}`;
                
                div.appendChild(title);
                div.appendChild(text);
                
                return div;
              }
            })
          });
          
          fragment.appendChild(deviceRow);
        });
        
        return fragment;
      }
    };
  }
</script>

<DashboardCard 
  location={location} 
  onNavigate={handleNavigate}
  customDeviceContent={true}
  renderDeviceItems={renderCustomDevices}
/>
```

## DataRowItem Component

The DataRowItem component is used for displaying individual device information within the DashboardCard.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `device` | `ICWDevice` | Required | Device data object |
| `customContent` | `boolean` | `false` | Enable custom content rendering |
| `renderContent` | `function` | `null` | Render function for custom content (used with Svelte 5's `{@render ...}` syntax) |

## TypeScript Interfaces

The package exports the following TypeScript interfaces:

```typescript
export interface ICWDeviceType {
  default_upload_interval: number;
}

export interface ICWRule {
  // Add relevant properties as needed
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
```