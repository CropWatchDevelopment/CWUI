<script lang="ts">
    import { CwSensorCard } from "$lib/index.js";
    import type { CwStatusDotStatus, CwSensorCardDevice, CwSensorCardDetailRow } from "$lib/index.js";

    function makeRows(dev: {
        label: string;
        primaryValue?: number;
        primaryUnit?: string;
        secondaryValue?: number;
        secondaryUnit?: string;
        lastUpdated?: Date;
        expectedUpdateAfterMinutes?: number;
    }): CwSensorCardDetailRow[] {
        const rows: CwSensorCardDetailRow[] = [];
        if (dev.secondaryValue != null) {
            rows.push({
                id: `${dev.label}-humidity`,
                label: "Humidity",
                value: dev.secondaryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                unit: dev.secondaryUnit ?? "%",
                icon: "drop",
            });
        }
        if (dev.primaryValue != null) {
            rows.push({
                id: `${dev.label}-temp`,
                label: "Temperature",
                value: dev.primaryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                unit: dev.primaryUnit ?? "°C",
                icon: "thermo",
            });
        }
        if (dev.lastUpdated) {
            rows.push({
                id: `${dev.label}-updated`,
                label: "Last Update",
                icon: "timer",
                lastUpdated: dev.lastUpdated,
                expectedUpdateAfter: dev.expectedUpdateAfterMinutes,
            });
        }
        return rows;
    }
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
            primary_icon: "🌡️",
            secondaryValue: 58.2,
            secondaryUnit: "%",
            secondary_icon: "💧",
            status: "online",
            lastUpdated: new Date(Date.now() - 90_000),
            expectedUpdateAfterMinutes: 10,
            detailRows: makeRows({ label: "CW-Temp-01", primaryValue: 21.5, primaryUnit: "°C", secondaryValue: 58.2, secondaryUnit: "%", lastUpdated: new Date(Date.now() - 90_000), expectedUpdateAfterMinutes: 10 }),
        },
        {
            label: "CW-Temp-02",
            primaryValue: 19.8,
            primaryUnit: "°C",
            primary_icon: "🌡️",
            secondaryValue: 62.1,
            secondaryUnit: "%",
            secondary_icon: "💧",
            status: "online",
            lastUpdated: new Date(Date.now() - 300_000),
            detailRows: makeRows({ label: "CW-Temp-02", primaryValue: 19.8, primaryUnit: "°C", secondaryValue: 62.1, secondaryUnit: "%", lastUpdated: new Date(Date.now() - 300_000) }),
        },
    ];

    const threeDevices: CwSensorCardDevice[] = [
        {
            label: "CW-Soil-A1",
            primaryValue: 14.3,
            primaryUnit: "°C",
            secondaryValue: 38.9,
            secondaryUnit: "%",
            secondary_icon: "💧",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 10,
            detailRows: makeRows({ label: "CW-Soil-A1", primaryValue: 14.3, primaryUnit: "°C", secondaryValue: 38.9, secondaryUnit: "%", lastUpdated: new Date(Date.now()), expectedUpdateAfterMinutes: 10 }),
        },
        {
            label: "CW-Soil-A2",
            primaryValue: 1525.1,
            primaryUnit: "°C",
            primary_icon: "🌡️",
            secondaryValue: 41.2,
            secondaryUnit: "%",
            secondary_icon: "💧",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 5,
            detailRows: makeRows({ label: "CW-Soil-A2", primaryValue: 1525.1, primaryUnit: "°C", secondaryValue: 41.2, secondaryUnit: "%", lastUpdated: new Date(Date.now()), expectedUpdateAfterMinutes: 5 }),
        },
        {
            label: "CW-Soil-A3",
            primaryValue: 13.7,
            primaryUnit: "°C",
            primary_icon: "🌡️",
            secondaryValue: 44.5,
            secondaryUnit: "%",
            secondary_icon: "💧",
            status: "online",
            lastUpdated: new Date(Date.now()),
            expectedUpdateAfterMinutes: 1,
            detailRows: makeRows({ label: "CW-Soil-A3", primaryValue: 13.7, primaryUnit: "°C", secondaryValue: 44.5, secondaryUnit: "%", lastUpdated: new Date(Date.now()), expectedUpdateAfterMinutes: 1 }),
        },
    ];

    const allOfflineDevices: CwSensorCardDevice[] = [
        {
            label: "CW-Down-01",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "offline",
            lastUpdated: new Date(Date.now() - 7_200_000),
            detailRows: makeRows({ label: "CW-Down-01", primaryValue: 0, primaryUnit: "°C", lastUpdated: new Date(Date.now() - 7_200_000) }),
        },
        {
            label: "CW-Down-02",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "offline",
            lastUpdated: new Date(Date.now() - 3_600_000),
            detailRows: makeRows({ label: "CW-Down-02", primaryValue: 0, primaryUnit: "°C", lastUpdated: new Date(Date.now() - 3_600_000) }),
        },
    ];

    const allLoadingDevices: CwSensorCardDevice[] = [
        {
            label: "CW-New-01",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "loading",
            detailRows: makeRows({ label: "CW-New-01", primaryValue: 0, primaryUnit: "°C" }),
        },
        {
            label: "CW-New-02",
            primaryValue: 0,
            primaryUnit: "°C",
            status: "loading",
            detailRows: makeRows({ label: "CW-New-02", primaryValue: 0, primaryUnit: "°C" }),
        },
    ];

    const weatherStation: CwSensorCardDevice = {
        label: "CW-Weather-01",
        primaryValue: 22.4,
        primaryUnit: "°C",
        primary_icon: "thermo",
        secondaryValue: 67.3,
        secondaryUnit: "%",
        secondary_icon: "drop",
        status: "online",
        lastUpdated: new Date(Date.now() - 60_000),
        expectedUpdateAfterMinutes: 10,
        detailRows: [
            { id: "w01-temp",     label: "Temperature", value: "22.40",   unit: "°C",   icon: "thermo" },
            { id: "w01-humidity", label: "Humidity",    value: "67.30",   unit: "%",    icon: "drop" },
            { id: "w01-rain",     label: "Rain Amount", value: "3.20",    unit: "mm",   icon: "🌧️" },
            { id: "w01-wind",     label: "Wind Speed",  value: "12.50",   unit: "km/h", icon: "💨" },
            { id: "w01-lux",      label: "Lux Level",   value: "48500",   unit: "lx",   icon: "☀️" },
            { id: "w01-pressure", label: "Air Pressure", value: "1013.25", unit: "hPa", icon: "🔵" },
            { id: "w01-relay",    label: "Relay State",  value: "On",                   icon: "⚡" },
            { id: "w01-updated",  label: "Last Update",  icon: "timer",
              lastUpdated: new Date(Date.now() - 60_000), expectedUpdateAfter: 10 },
        ],
    };

    const waterLevelSensor: CwSensorCardDevice = {
        label: "CW-Tank-01",
        primaryValue: 74.5,
        primaryUnit: "%",
        primary_icon: "drop",
        status: "online",
        lastUpdated: new Date(Date.now() - 300_000),
        expectedUpdateAfterMinutes: 15,
        detailRows: [
            { id: "tank01-level",   label: "Water Level", value: "74.50", unit: "%", icon: "drop" },
            { id: "tank01-updated", label: "Last Update",  icon: "timer",
              lastUpdated: new Date(Date.now() - 300_000), expectedUpdateAfter: 15 },
        ],
    };
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
            detailRows={makeRows({ label: "CW-SS-TMEPNCO2-18", primaryValue: -22.93, primaryUnit: "°C", secondaryValue: 79.61, secondaryUnit: "%", lastUpdated: new Date(Date.now() - 120_000), expectedUpdateAfterMinutes: 10 })}
            onNavigate={handleNavigate}
            onTimerExpired={handleTimerExpired}
        >
        {#snippet primary_icon()}
            🌡️
        {/snippet} 
        {#snippet secondary_icon()}
            💧
        {/snippet}
    </CwSensorCard>
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
        >
        {#snippet primary_icon()}
            😔
        {/snippet}
    </CwSensorCard>
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
                    detailRows: makeRows({ label: "CW-Freeze-007", primaryValue: -40.12, primaryUnit: "°C", secondaryValue: 95.0, secondaryUnit: "%", lastUpdated: new Date(Date.now() - 10_800_000) }),
                },
            ]}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">Many data points — weather station</span>
    <div class="demo-center">
        <CwSensorCard
            title="Weather Station Alpha"
            status="online"
            devices={[weatherStation]}
            defaultExpanded={true}
        />
    </div>
</div>

<div class="demo-section">
    <span class="demo-label">Few data points — water level sensor</span>
    <div class="demo-center">
        <CwSensorCard
            title="Tank Monitor"
            status="online"
            devices={[waterLevelSensor]}
            defaultExpanded={true}
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
            detailRows={makeRows({ label: "CW-Sensor-001", primaryValue: 24.5, secondaryValue: 65.2, lastUpdated: new Date() })}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Warehouse B"
            deviceLabel="CW-Sensor-042"
            status="offline"
            primaryValue={-5.1}
            secondaryValue={88.0}
            lastUpdated={new Date(Date.now() - 10_800_000)}
            detailRows={makeRows({ label: "CW-Sensor-042", primaryValue: -5.1, secondaryValue: 88.0, lastUpdated: new Date(Date.now() - 10_800_000) })}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Rooftop Array"
            deviceLabel="CW-Sensor-077"
            status="loading"
            primaryValue={0}
            secondaryValue={0}
            detailRows={makeRows({ label: "CW-Sensor-077", primaryValue: 0, secondaryValue: 0 })}
            defaultExpanded={false}
        />
        <CwSensorCard
            title="Lab Freezer"
            deviceLabel="CW-Sensor-099"
            status="warning"
            primaryValue={-18.25}
            secondaryValue={72.4}
            lastUpdated={new Date(Date.now() - 600_000)}
            detailRows={makeRows({ label: "CW-Sensor-099", primaryValue: -18.25, secondaryValue: 72.4, lastUpdated: new Date(Date.now() - 600_000) })}
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
