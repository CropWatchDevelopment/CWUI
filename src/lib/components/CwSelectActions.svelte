<script lang="ts">
	/**
	 * The buttons and other content a CwDropdown or CwMultiSelect shows inside
	 * its box, just left of the arrow. Internal: use the `actions` and
	 * `rightSlot` props of those components.
	 */
	import type { Snippet } from 'svelte';
	import type { CwSelectAction, CwSize } from '../types/index.js';
	import CwButton from './CwButton.svelte';
	import CwTooltip from './CwTooltip.svelte';

	interface Props {
		actions?: CwSelectAction[];
		/** Anything else to show after the action buttons: CwCopy, a CwButton, an icon. */
		content?: Snippet;
		/** The select's size: the action buttons shrink to fit inside its box. */
		size?: CwSize;
		/** Called when the user goes to one of these controls (pointer or keyboard): the select closes its list. */
		onengage?: () => void;
	}

	let { actions = [], content, size = 'md', onengage }: Props = $props();
</script>

{#if actions.length > 0 || content}
	<!-- Clicks and keys in here belong to these controls, never to the select
	     around them: without this, pressing a button would also open the list. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="cw-select-actions cw-select-actions--{size}"
		onclick={(event) => event.stopPropagation()}
		onkeydown={(event) => event.stopPropagation()}
		onpointerdown={() => onengage?.()}
		onfocusin={() => onengage?.()}
	>
		{#each actions as action, index (index)}
			<CwTooltip value={action.label} class="cw-select-actions__item">
				<CwButton
					class="cw-select-actions__button"
					variant={action.variant ?? 'ghost'}
					size="sm"
					icon={action.icon}
					aria-label={action.label}
					disabled={action.disabled}
					onclick={(event) => action.onclick(event)}
				/>
			</CwTooltip>
		{/each}
		{@render content?.()}
	</span>
{/if}

<style>
	.cw-select-actions {
		/* A little shorter than the box it sits in, so its border stays visible. */
		--_action-size: calc(var(--cw-control-h-md) - 0.625rem);
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		flex-shrink: 0;
	}

	.cw-select-actions--sm {
		--_action-size: calc(var(--cw-control-h-sm) - 0.5rem);
	}

	.cw-select-actions--lg {
		--_action-size: calc(var(--cw-control-h-lg) - 0.75rem);
	}

	.cw-select-actions :global(.cw-select-actions__item) {
		display: inline-flex;
	}

	/* The action buttons are icon-only squares. */
	.cw-select-actions :global(.cw-select-actions__button) {
		min-height: 0;
		width: var(--_action-size);
		height: var(--_action-size);
		padding: 0;
	}
</style>
