<script lang="ts" module>
	/** Built-in glyphs. Any other string is rendered as text (e.g. an emoji). */
	export type CwDataIconName = 'drop' | 'thermo' | 'timer' | 'relay' | 'co2';

	const ICONS: Record<CwDataIconName, { viewBox: string; paths: string[] }> = {
		drop: {
			viewBox: '0 0 24 24',
			paths: [
				'M12 3c-.3 0-.6.1-.8.4l-4 5c-.8 1-1.2 2.3-1.2 3.6C6 15.9 8.7 18.5 12 18.5s6-2.6 6-6c0-1.3-.4-2.6-1.2-3.6l-4-5c-.2-.3-.5-.4-.8-.4Z'
			]
		},
		thermo: {
			viewBox: '0 0 24 24',
			paths: ['M14 14.76V5a2 2 0 1 0-4 0v9.76a3.5 3.5 0 1 0 4 0Z']
		},
		timer: {
			viewBox: '0 0 24 24',
			paths: [
				// Clock face (ring) + hands.
				'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z',
				'M12 7v5l4.3 2.6-.8 1.3L11 13V7h1Z'
			]
		},
		relay: {
			viewBox: '0 0 24 24',
			paths: ['M9 2v4H7v3a5 5 0 0 0 4 4.9V22h2v-8.1A5 5 0 0 0 17 9V6h-2V2h-2v4h-2V2H9Z']
		},
		co2: {
			viewBox: '0 -960 960 960',
			paths: [
				'M440-360q-17 0-28.5-11.5T400-400v-160q0-17 11.5-28.5T440-600h120q17 0 28.5 11.5T600-560v160q0 17-11.5 28.5T560-360H440Zm20-60h80v-120h-80v120Zm-300 60q-17 0-28.5-11.5T120-400v-160q0-17 11.5-28.5T160-600h120q17 0 28.5 11.5T320-560v40h-60v-20h-80v120h80v-20h60v40q0 17-11.5 28.5T280-360H160Zm520 120v-100q0-17 11.5-28.5T720-380h80v-40H680v-60h140q17 0 28.5 11.5T860-440v60q0 17-11.5 28.5T820-340h-80v40h120v60H680Z'
			]
		}
	};

	function isBuiltIn(value: string): value is CwDataIconName {
		return Object.hasOwn(ICONS, value);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type IconContent = CwDataIconName | (string & {}) | Snippet;

	interface Props {
		icon?: IconContent;
		/**
		 * Rendered width/height. Defaults to `1em` so the glyph scales with the
		 * surrounding text; parent CSS that sizes the svg still wins.
		 */
		size?: string;
		/**
		 * Accessible name. When omitted the icon is decorative and hidden from
		 * assistive technology.
		 */
		label?: string;
	}

	let { icon, size = '1em', label }: Props = $props();

	const glyph = $derived(typeof icon === 'string' && isBuiltIn(icon) ? ICONS[icon] : undefined);
</script>

{#if typeof icon === 'function'}
	{@render icon()}
{:else if glyph}
	<svg
		viewBox={glyph.viewBox}
		width={size}
		height={size}
		role={label ? 'img' : undefined}
		aria-label={label}
		aria-hidden={label ? undefined : 'true'}
		focusable="false"
	>
		{#each glyph.paths as d (d)}
			<path fill="currentColor" fill-rule="evenodd" {d} />
		{/each}
	</svg>
{:else if icon}
	<span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}
		>{icon}</span
	>
{/if}
