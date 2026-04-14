<script lang="ts">
	import type { Snippet } from 'svelte';

	type IconContent = string | Snippet;

	interface Props {
		icon?: IconContent;
	}

	let { icon }: Props = $props();

	function isSnippetIcon(value: IconContent | undefined): value is Snippet {
		return typeof value === 'function';
	}
</script>

{#if isSnippetIcon(icon)}
	{@render icon()}
{:else if icon === 'drop'}
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="currentColor"
			d="M12 3c-.3 0-.6.1-.8.4l-4 5c-.8 1-1.2 2.3-1.2 3.6C6 15.9 8.7 18.5 12 18.5s6-2.6 6-6c0-1.3-.4-2.6-1.2-3.6l-4-5c-.2-.3-.5-.4-.8-.4Z"
		/>
	</svg>
{:else if icon === 'thermo'}
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path fill="currentColor" d="M14 14.76V5a2 2 0 1 0-4 0v9.76a3.5 3.5 0 1 0 4 0Z" />
	</svg>
{:else if icon === 'timer'}
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path fill="currentColor" d="M12 7v5l4.3 2.6-.8 1.3L11 13V7h1Z" />
	</svg>
{:else if icon}
	{icon}
{/if}
