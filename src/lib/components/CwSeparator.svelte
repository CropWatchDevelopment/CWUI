<script lang="ts">
	interface Props {
		/** Line direction. Vertical separators stretch to the height of a flex row. */
		orientation?: 'horizontal' | 'vertical';
		/**
		 * Inset along the line's own axis (margin-inline for horizontal,
		 * margin-block for vertical). Defaults to cw-space-2.
		 */
		inset?: string;
		/** @deprecated Use `inset`. */
		spacing?: string;
		/** Purely visual separators are hidden from assistive technology. */
		decorative?: boolean;
		class?: string;
	}

	let {
		orientation = 'horizontal',
		inset,
		spacing,
		decorative = false,
		class: className = ''
	}: Props = $props();

	const resolvedInset = $derived(inset ?? spacing ?? 'var(--cw-space-2)');
</script>

<div
	class="cw-separator cw-separator--{orientation} {className}"
	role={decorative ? 'none' : 'separator'}
	aria-orientation={decorative ? undefined : orientation}
	style:--cw-separator-inset={resolvedInset}
></div>

<style>
	.cw-separator {
		flex-shrink: 0;
		background-color: var(--cw-border-muted);
	}

	.cw-separator--horizontal {
		height: 1px;
		margin-block: var(--cw-space-2);
		margin-inline: var(--cw-separator-inset);
	}

	.cw-separator--vertical {
		width: 1px;
		align-self: stretch;
		min-height: 1em;
		margin-inline: var(--cw-space-2);
		margin-block: var(--cw-separator-inset);
	}
</style>
