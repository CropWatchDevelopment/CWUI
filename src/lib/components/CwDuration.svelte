<script lang="ts">
	interface Props {
		/** Start date/time — ISO string, epoch ms, or Date */
		from: Date | string | number;
		/** Tick interval in ms */
		tickMs?: number;
		class?: string;
	}

	let { from, tickMs = 1000, class: className = '' }: Props = $props();

	let now = $state(Date.now());

	const fromMs = $derived(
		from instanceof Date ? from.getTime() : typeof from === 'string' ? new Date(from).getTime() : from
	);

	const elapsed = $derived(Math.max(0, now - fromMs));

	const display = $derived.by(() => {
		const totalSec = Math.floor(elapsed / 1000);
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
		const interval = setInterval(() => {
			now = Date.now();
		}, tickMs);

		return () => clearInterval(interval);
	});
</script>

<time class="cw-duration {className}" datetime="PT{Math.floor(elapsed / 1000)}S" aria-live="polite" aria-atomic="true">
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
