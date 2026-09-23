<script lang="ts">
	import '../lib/styles/base.css';
	import { page } from '$app/state';

	const title = $derived(page.status === 404 ? 'Page not found' : 'Something went wrong');
	const detail = $derived(
		page.status === 404
			? "The page you're looking for doesn't exist or has moved."
			: (page.error?.message ?? 'An unexpected error occurred.')
	);
</script>

<svelte:head>
	<title>{page.status} · {title} · CropWatch UI</title>
</svelte:head>

<main class="cw-error-page">
	<div class="cw-error-page__card">
		<p class="cw-error-page__status">Error {page.status}</p>
		<h1 class="cw-error-page__title">{title}</h1>
		<p class="cw-error-page__detail">{detail}</p>
		<a class="cw-error-page__link" href="/demo">Back to components</a>
	</div>
</main>

<style>
	.cw-error-page {
		display: grid;
		place-items: center;
		min-height: 100dvh;
		padding: var(--cw-space-4);
	}

	.cw-error-page__card {
		width: min(28rem, 100%);
		padding: var(--cw-space-8) var(--cw-space-6);
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
		text-align: center;
	}

	.cw-error-page__status {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.cw-error-page__title {
		margin-top: var(--cw-space-2);
		font-size: var(--cw-text-2xl);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
	}

	.cw-error-page__detail {
		margin-top: var(--cw-space-3);
		color: var(--cw-text-secondary);
		overflow-wrap: anywhere;
	}

	.cw-error-page__link {
		display: inline-flex;
		align-items: center;
		min-height: var(--cw-control-h-md);
		margin-top: var(--cw-space-6);
		padding-inline: var(--cw-space-4);
		border: 1px solid var(--cw-border-strong);
		border-radius: var(--cw-control-radius);
		color: var(--cw-text-primary);
		font-weight: var(--cw-font-medium);
		text-decoration: none;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-error-page__link:hover {
		background: var(--cw-bg-muted);
	}
</style>
