<script lang="ts">
	interface Props {
		/** Horizontal spacing (margin-inline) — defaults to cw-space-2 */
		spacing?: string;
	}

	let { spacing = 'var(--cw-space-2)' }: Props = $props();
</script>

<div class="cw-separator" style:margin-inline={spacing}></div>

<style>
	.cw-separator {
		height: 1px;
		margin-block: var(--cw-space-2);
		background-color: var(--cw-border-muted);
	}
</style>
