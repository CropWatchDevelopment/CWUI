<script lang="ts">
    import { CwSensorCard } from "$lib/index.js";
    import type { CwStatusDotStatus, CwSensorCardDevice } from "$lib/index.js";
    import DemoCodeExample from "../_components/DemoCodeExample.svelte";

    let demoStatus = $state<CwStatusDotStatus>("online");
    let navigateTarget = $state("");
    let expiredDevice = $state("");

    function handleNavigate(target: string) {
        navigateTarget = target;
        setTimeout(() => (navigateTarget = ""), 2000);
    }

    function handleTimerExpired(deviceLabel: string) {
        expiredDevice = deviceLabel;
        setTimeout(() => (expiredDevice = ""), 4000);
    }

    const statusSequence: CwStatusDotStatus[] = [
        "online",
        "offline",
        "loading",
        "warning",
    ];

    function cycleStatus() {
        const idx = statusSequence.indexOf(demoStatus);
        demoStatus = statusSequence[(idx + 1) % statusSequence.length];
    }

    const singleDeviceExample = `<CwSensorCard
\ttitle="Greenhouse A"
\tdeviceLabel="CW-SS-TMEPNCO2-18"
\tstatus="online"
\tprimaryValue={-22.93}
\tprimaryUnit="°C"
\tsecondaryValue={79.61}
\tsecondaryUnit="%"
\tlastUpdated={new Date(Date.now() - 120_000)}
\texpectedUpdateAfterMinutes={10}
\tonTimerExpired={(label) => console.log('overdue:', label)}
/>`;

    const multiDeviceExample = `<CwSensorCard
\ttitle="Research Lab"
\tstatus="online"
\tonTimerExpired={(label) => console.log('overdue:', label)}
\tdevices={[
\t\t{ label: "CW-Temp-01", primaryValue: 21.5, lastUpdated: new Date(), expectedUpdateAfterMinutes: 10 },
\t\t{ label: "CW-Temp-02", primaryValue: 19.8, lastUpdated: new Date() },
\t]}
/>`;

    const twoDevices: CwSensorCardDevice[] = [
        {
            label: "CW-Temp-01",
            primaryValue: 21.5,
            primaryUnit: "°C",
            secondaryValue: 58.2,
            secondaryUnit: "%",
            status: "online",
            lastUpdated: new Date(Date.now() - 90_000),
            expectedUpdateAfterMinutes: 10,
        },
        {
            label: "CW-Temp-02",
            primaryValue: 19.8,
            primaryUnit: "°C",
            secondaryValue: 62.1,
            secondaryUnit: "%",
            status: "online",
            lastUpdated: new Date(Date.now() - 300_000),
        },
    ];

    const threeDevices: CwSensorCardDevice[] = [
        {
            label: "CW-Soil-A1",
            primaryValue: 14.3,
            primaryUnit: "°C",
            secondaryValue: 38.9,
            secondaryUnit: "%",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 10,  // expires after 10 minutes without update, triggering the timer alarm callback
        },
        {
            label: "CW-Soil-A2",
            primaryValue: 15.1,
            primaryUnit: "°C",
            secondaryValue: 41.2,
            secondaryUnit: "%",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 5,  // expires after 5 minutes without update, triggering the timer alarm callback
        },
        {
            label: "CW-Soil-A3",
            primaryValue: 13.7,
            primaryUnit: "°C",
            secondaryValue: 44.5,
            secondaryUnit: "%",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 1, // expires after 1 minute without update, triggering the timer alarm callback
        },
    ];

    const allOfflineDevices: CwSensorCardDevice[] = [
        {
            label: "CW-Down-01",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "offline",
            lastUpdated: new Date(Date.now() - 7_200_000),
        },
        {
            label: "CW-Down-02",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "offline",
            lastUpdated: new Date(Date.now() - 3_600_000),
        },
    ];

    const allLoadingDevices: CwSensorCardDevice[] = [
        {
            label: "CW-New-01",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "loading",
        },
        {
            label: "CW-New-02",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "loading",
        },
    ];
</script>

<h2>CwSensorCard</h2>
<p class="demo-desc">
    A sensor device card showing status, primary/secondary readings, and
    expandable detail rows. Supports single device (via props), multiple devices
    (via <code>devices</code> array), or no devices (empty state).
</p>

<div class="demo-section">
    <span class="demo-label">Interactive demo (single device)</span>
    <p class="demo-hint">
        Click the chevron on each device to expand/collapse independently. State
        is persisted to localStorage.
        {#if navigateTarget}
            <strong>Navigate event: "{navigateTarget}"</strong>
        {/if}
        {#if expiredDevice}
            <strong style="color: var(--cw-danger-500);"
                >Timer expired: "{expiredDevice}"</strong
            >
        {/if}
    </p>
    <div class="demo-center">
        <CwSensorCard
            title="Greenhouse A"
            deviceLabel="CW-SS-TMEPNCO2-18"
            status={demoStatus}
            primaryValue={-22.93}
            primaryUnit="°C"
            secondaryValue={79.61}
            secondaryUnit="%"
            lastUpdated={new Date(Date.now() - 120_000)}
            expectedUpdateAfterMinutes={10}
            onNavigate={handleNavigate}
            onTimerExpired={handleTimerExpired}
        />
    </div>
    <div class="demo-controls">
        <button class="demo-btn" onclick={cycleStatus}>
            Cycle Status (current: {demoStatus})
        </button>
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">All online — green dot</span>
    <div class="demo-center">
        <CwSensorCard
            title="Research Lab"
            status="online"
            devices={twoDevices}
            onTimerExpired={handleTimerExpired}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">Mixed online + offline — yellow (warning) dot</span
    >
    <div class="demo-center">
        <CwSensorCard
            title="Soil Station Array"
            status="online"
            devices={threeDevices}
            onTimerExpired={handleTimerExpired}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">All offline — red dot</span>
    <div class="demo-center">
        <CwSensorCard
            title="Warehouse B (down)"
            status="online"
            devices={allOfflineDevices}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">All loading — blue dot</span>
    <div class="demo-center">
        <CwSensorCard
            title="Provisioning Bay"
            status="online"
            devices={allLoadingDevices}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">One device (offline) — red dot</span>
    <div class="demo-center">
        <CwSensorCard
            title="Cold Storage Unit"
            status="offline"
            devices={[
                {
                    label: "CW-Freeze-007",
                    primaryValue: -40.12,
                    primaryUnit: "°C",
                    secondaryValue: 95.0,
                    secondaryUnit: "%",
                    status: "offline",
                    lastUpdated: new Date(Date.now() - 10_800_000),
                },
            ]}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">No devices — empty dot (no indicator)</span>
    <div class="demo-center">
        <CwSensorCard title="New Location (unassigned)" status="loading" />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">All statuses (collapsed)</span>
    <div class="demo-grid">
        <CwSensorCard
            title="Field Station 1"
            deviceLabel="CW-Sensor-001"
            status="online"
            primaryValue={24.5}
            secondaryValue={65.2}
            lastUpdated={new Date()}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Warehouse B"
            deviceLabel="CW-Sensor-042"
            status="offline"
            primaryValue={-5.1}
            secondaryValue={88.0}
            lastUpdated={new Date(Date.now() - 10_800_000)}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Rooftop Array"
            deviceLabel="CW-Sensor-077"
            status="loading"
            primaryValue={0}
            secondaryValue={0}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Lab Freezer"
            deviceLabel="CW-Sensor-099"
            status="warning"
            primaryValue={-18.25}
            secondaryValue={72.4}
            lastUpdated={new Date(Date.now() - 600_000)}
            defaultExpanded={false}
        />
    </div>
</div>

<DemoCodeExample
    code={singleDeviceExample}
    title="Single device (props shorthand)"
/>
<DemoCodeExample
    code={multiDeviceExample}
    title="Multiple devices (devices array)"
/>

<style>
    h2 {
        font-size: var(--cw-text-xl);
        font-weight: var(--cw-font-bold);
        margin-bottom: var(--cw-space-2);
    }
    .demo-desc {
        color: var(--cw-text-muted);
        font-size: var(--cw-text-sm);
        margin-bottom: var(--cw-space-4);
    }
    .demo-section {
        margin-bottom: var(--cw-space-6);
    }
    .demo-label {
        display: block;
        font-size: var(--cw-text-xs);
        color: var(--cw-text-muted);
        margin-bottom: var(--cw-space-2);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .demo-hint {
        font-size: var(--cw-text-sm);
        color: var(--cw-text-secondary);
        margin-bottom: var(--cw-space-3);
    }
    .demo-hint strong {
        color: var(--cw-accent-text);
    }
    .demo-center {
        display: flex;
        justify-content: center;
        padding: var(--cw-space-4) 0;
    }
    .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(390px, 100%), 1fr));
        gap: var(--cw-space-4);
        justify-items: center;
    }
    .demo-controls {
        display: flex;
        gap: var(--cw-space-2);
        justify-content: center;
        margin-top: var(--cw-space-3);
    }
    .demo-btn {
        padding: var(--cw-space-2) var(--cw-space-4);
        font-size: var(--cw-text-sm);
        font-family: var(--cw-font-family);
        border-radius: var(--cw-radius-xl);
        border: 1px solid var(--cw-border-default);
        background: var(--cw-bg-elevated);
        color: var(--cw-text-primary);
        cursor: pointer;
        transition: background var(--cw-duration-fast) var(--cw-ease-default);
    }
    .demo-btn:hover {
        background: var(--cw-bg-subtle);
    }
</style>
