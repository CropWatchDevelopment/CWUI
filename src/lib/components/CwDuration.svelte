<script lang="ts">
	interface Props {
		/** Start date/time — ISO string, epoch ms, or Date */
		from: Date | string | number;
		/** Show remaining time to `from` when true. Defaults to elapsed mode (false). */
		countDown?: boolean;
		/** Tick interval in ms */
		tickMs?: number;
		class?: string;
		/** Trigger alarm once when elapsed minutes reaches/exceeds this threshold. */
		alarmAfterMinutes?: number;
		/** Called once when the alarm threshold is reached. */
		alarmCallback?: () => void;
		/** Called when elapsed drops back under the alarm threshold. */
		alarmResetCallback?: () => void;
	}

	let {
		from,
		countDown = false,
		tickMs = 1000,
		class: className = '',
		alarmAfterMinutes,
		alarmCallback,
		alarmResetCallback
	}: Props = $props();

	let now = $state(Date.now());

	const fromMs = $derived(
		from instanceof Date ? from.getTime() : typeof from === 'string' ? new Date(from).getTime() : from
	);

	const elapsed = $derived.by(() => {
		const diff = now - fromMs;
		return Number.isFinite(diff) ? Math.max(0, diff) : 0;
	});

	const remaining = $derived.by(() => {
		const diff = fromMs - now;
		return Number.isFinite(diff) ? Math.max(0, diff) : 0;
	});

	const durationMs = $derived(countDown ? remaining : elapsed);
	const alarmAfterMs = $derived(
		typeof alarmAfterMinutes === 'number' && Number.isFinite(alarmAfterMinutes) && alarmAfterMinutes >= 0
			? alarmAfterMinutes * 60_000
			: null
	);
	let alarmTriggered = $state(false);

	const display = $derived.by(() => {
		const totalSec = Math.floor(durationMs / 1000);
		const sec = totalSec % 60;
		const totalMin = Math.floor(totalSec / 60);
		const min = totalMin % 60;
		const totalHr = Math.floor(totalMin / 60);
		const hr = totalHr % 24;
		const days = Math.floor(totalHr / 24);

		if (totalSec < 60) {
			return `${totalSec}s`;
		}
		if (totalMin < 60) {
			return `${totalMin}m ${pad(sec)}s`;
		}
		if (totalHr < 24) {
			return `${totalHr}h ${pad(min)}m`;
		}
		return `${days}d ${pad(hr)}h`;
	});

	function pad(n: number): string {
		return n.toString().padStart(2, '0');
	}

	$effect(() => {
		if (alarmAfterMs === null) {
			if (alarmTriggered) {
				alarmTriggered = false;
				alarmResetCallback?.();
			}
			return;
		}

		const isOverThreshold = elapsed >= alarmAfterMs;

		if (isOverThreshold && !alarmTriggered) {
			alarmTriggered = true;
			alarmCallback?.();
		} else if (!isOverThreshold && alarmTriggered) {
			alarmTriggered = false;
			alarmResetCallback?.();
		}
	});

	$effect(() => {
		const interval = setInterval(() => {
			const nextNow = Date.now();
			if (countDown && Number.isFinite(fromMs) && nextNow >= fromMs) {
				now = fromMs;
				clearInterval(interval);
				return;
			}
			now = nextNow;
		}, tickMs);

		return () => clearInterval(interval);
	});
</script>

<time class="cw-duration {className}" datetime="PT{Math.floor(durationMs / 1000)}S" aria-live="polite" aria-atomic="true">
	{display}
</time>

<style>
	.cw-duration {
		font-family: var(--cw-font-mono);
		font-size: inherit;
		color: inherit;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
