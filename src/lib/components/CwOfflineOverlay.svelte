<script lang="ts" module>
	/** Override display labels for i18n. All fields optional; English defaults are used when omitted. */
	export interface CwOfflineOverlayLabels {
		/** Main heading shown while offline. Default: "You're offline". */
		title?: string;
		/** Body message explaining the offline state. Default describes the lost connection. */
		message?: string;
		/** Retry button label. Default: "Try again". (The `retryLabel` prop wins over this if both are set.) */
		retryLabel?: string;
		/** Footnote reassuring the user about automatic reconnection. */
		footnote?: string;
		/** Title of the "while you wait" help section. Decorative — no default; the help block is hidden unless this is provided. */
		helpTitle?: string;
		/** First help suggestion. Decorative — no default; hidden unless provided. */
		helpItemWifi?: string;
		/** Second help suggestion. Decorative — no default; hidden unless provided. */
		helpItemRouter?: string;
		/** Third help suggestion. Decorative — no default; hidden unless provided. */
		helpItemMobileData?: string;
		/** Title of the "reconnected" toast. Default: "You're back online". */
		reconnectedTitle?: string;
		/** Subtitle of the "reconnected" toast. Default: "Connection restored.". */
		reconnectedSubtitle?: string;
		/** Status shown after a retry that found no connection. Default: "Still offline. We'll keep trying.". */
		stillOffline?: string;
	}

	const DEFAULT_LABELS = {
		title: "You're offline",
		message:
			"It looks like you've lost your internet connection. CropWatch needs an active connection to sync your device data.",
		retryLabel: 'Try again',
		footnote: "Don't worry — we'll reconnect automatically when your connection is restored.",
		reconnectedTitle: "You're back online",
		reconnectedSubtitle: 'Connection restored.',
		stillOffline: "Still offline. We'll keep trying."
	} satisfies CwOfflineOverlayLabels;
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import CwButton from './CwButton.svelte';
	import { hasCwToastContext, useCwToast } from './cwToastContext.svelte.js';

	interface Props {
		/** Force offline state (useful for demo/testing). When omitted, uses real network state. */
		forceOffline?: boolean;
		/** Duration for the "back online" toast in ms */
		reconnectedDurationMs?: number;
		/**
		 * Optional retry callback (may return a promise). When omitted, Retry
		 * re-checks the connection instead of reloading the page — reloading
		 * while offline would replace the app with the browser's error page.
		 */
		onRetry?: () => unknown;
		/**
		 * Optional URL to ping (HEAD, no-cache) when retrying, to confirm the
		 * network really works beyond `navigator.onLine`.
		 */
		pingUrl?: string;
		/** Show/hide retry button */
		showRetryButton?: boolean;
		/** Retry button label (takes precedence over `labels.retryLabel`). */
		retryLabel?: string;
		/** Override display labels for i18n */
		labels?: CwOfflineOverlayLabels;
		class?: string;
	}

	let {
		forceOffline,
		reconnectedDurationMs = 4000,
		onRetry,
		pingUrl,
		showRetryButton = true,
		retryLabel,
		labels = {},
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	const resolvedRetryLabel = $derived(retryLabel ?? l.retryLabel);

	// Prefer the app's toast system for the reconnect notice when one exists.
	const useToast = hasCwToastContext();
	const toast = useCwToast();

	let isOffline = $state(false);
	let wasOffline = $state(false);
	let showReconnected = $state(false);
	let retrying = $state(false);
	let retryStatus = $state('');
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let dialogEl = $state<HTMLDialogElement | null>(null);
	let retryWrapEl = $state<HTMLElement | null>(null);

	function clearReconnectTimer() {
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function announceReconnected() {
		if (useToast) {
			toast.add({
				tone: 'success',
				title: l.reconnectedTitle,
				message: l.reconnectedSubtitle,
				duration: reconnectedDurationMs
			});
			return;
		}
		showReconnected = true;
		clearReconnectTimer();
		reconnectTimer = setTimeout(() => {
			showReconnected = false;
		}, reconnectedDurationMs);
	}

	function goOnline() {
		isOffline = false;
		retryStatus = '';
		if (wasOffline) announceReconnected();
	}

	function handleOnline() {
		if (forceOffline === true) return;
		goOnline();
	}

	function handleOffline() {
		if (forceOffline === false) return;
		isOffline = true;
		wasOffline = true;
		showReconnected = false;
		clearReconnectTimer();
	}

	onMount(() => {
		if (forceOffline === true) {
			isOffline = true;
			wasOffline = true;
		} else if (forceOffline === false) {
			isOffline = false;
		} else if (typeof navigator !== 'undefined') {
			isOffline = !navigator.onLine;
			wasOffline = isOffline;
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			clearReconnectTimer();
		};
	});

	$effect(() => {
		if (forceOffline === undefined) return;

		if (forceOffline) {
			isOffline = true;
			wasOffline = true;
			showReconnected = false;
			clearReconnectTimer();
			return;
		}

		if (isOffline) goOnline();
	});

	/* Open as a real modal: top layer, inert page behind, focus moved inside. */
	$effect(() => {
		const el = dialogEl;
		if (!el || !isOffline) return;
		if (!el.open) el.showModal();
		void tick().then(() => {
			const retryButton = retryWrapEl?.querySelector('button');
			(retryButton ?? el).focus();
		});
		return () => {
			if (el.open) el.close();
		};
	});

	function handleCancel(event: Event) {
		// Blocking notice: Escape must not dismiss it while still offline.
		event.preventDefault();
	}

	async function checkConnection(): Promise<boolean> {
		if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
		if (!pingUrl) return true;
		try {
			const response = await fetch(pingUrl, { method: 'HEAD', cache: 'no-store' });
			return response.ok || response.type === 'opaque';
		} catch {
			return false;
		}
	}

	async function retry() {
		if (retrying) return;
		retrying = true;
		retryStatus = '';
		try {
			if (onRetry) {
				await onRetry();
				// Let prop/effect updates from the consumer settle, then tell the
				// user if the retry didn't bring the connection back.
				await tick();
				if (isOffline) retryStatus = l.stillOffline;
				return;
			}
			if (forceOffline === true) {
				retryStatus = l.stillOffline;
				return;
			}
			if (await checkConnection()) {
				goOnline();
			} else {
				retryStatus = l.stillOffline;
			}
		} finally {
			retrying = false;
		}
	}
</script>

{#if isOffline}
	<dialog
		bind:this={dialogEl}
		class={['cw-offline-overlay', className]}
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="{uid}-title"
		aria-describedby="{uid}-message"
		oncancel={handleCancel}
	>
		<div class="cw-offline-card">
			<div class="cw-offline-icon-wrap">
				<div class="cw-offline-icon-ping"></div>
				<div class="cw-offline-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="cw-offline-icon__svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 3l18 18"
							class="cw-offline-icon__slash"
						/>
					</svg>
				</div>
			</div>

			<h2 class="cw-offline-title" id="{uid}-title">{l.title}</h2>
			<p class="cw-offline-message" id="{uid}-message">
				{l.message}
			</p>

			<div class="cw-offline-separator"></div>

			{#if l.helpTitle || l.helpItemWifi || l.helpItemRouter || l.helpItemMobileData}
				<div class="cw-offline-help">
					{#if l.helpTitle}
						<p class="cw-offline-help__title">{l.helpTitle}</p>
					{/if}
					<ul class="cw-offline-help__list">
						{#each [l.helpItemWifi, l.helpItemRouter, l.helpItemMobileData] as helpItem, i (i)}
							{#if helpItem}
								<li>
									<svg
										class="cw-offline-help__check"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span>{helpItem}</span>
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/if}

			{#if showRetryButton}
				<div class="cw-offline-actions" bind:this={retryWrapEl}>
					<CwButton variant="secondary" onclick={retry} loading={retrying}>
						<svg
							class="cw-offline-retry-icon"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						{resolvedRetryLabel}
					</CwButton>
				</div>
			{/if}

			<p class="cw-offline-status" role="status">{retryStatus}</p>

			<p class="cw-offline-footnote">
				{l.footnote}
			</p>
		</div>
	</dialog>
{/if}

{#if showReconnected}
	<div class="cw-reconnected-toast" role="status">
		<span class="cw-reconnected-toast__icon-wrap" aria-hidden="true">
			<svg
				class="cw-reconnected-toast__icon"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
				/>
			</svg>
		</span>
		<span class="cw-reconnected-toast__text">
			<span class="cw-reconnected-toast__title">{l.reconnectedTitle}</span>
			<span class="cw-reconnected-toast__subtitle">{l.reconnectedSubtitle}</span>
		</span>
	</div>
{/if}

<style>
	.cw-offline-overlay {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: var(--cw-space-4);
		border: none;
		background: transparent;
		color: var(--cw-text-primary);
		display: flex;
		align-items: safe center;
		justify-content: center;
		overflow-y: auto;
		animation: cw-offline-fade-in var(--cw-duration-normal) var(--cw-ease-out);
	}

	.cw-offline-overlay::backdrop {
		background: var(--cw-scrim-strong);
		backdrop-filter: blur(8px);
	}

	.cw-offline-card {
		width: min(100%, 36rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		border-radius: var(--cw-modal-radius);
		border: 1px solid var(--cw-border-default);
		background: var(--cw-overlay-bg);
		padding: var(--cw-space-8);
		box-shadow: var(--cw-elevation-modal);
		animation: cw-offline-card-in var(--cw-duration-slow) var(--cw-ease-out);
	}

	@keyframes cw-offline-fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes cw-offline-card-in {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
	}

	.cw-offline-icon-wrap {
		position: relative;
		margin-bottom: var(--cw-space-6);
	}

	.cw-offline-icon-ping {
		position: absolute;
		inset: 0;
		border-radius: var(--cw-radius-full);
		background: var(--cw-tone-warning-bg-subtle);
		animation: cw-offline-ping 1.7s var(--cw-ease-out) infinite;
	}

	.cw-offline-icon {
		position: relative;
		display: flex;
		width: 5rem;
		height: 5rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--cw-radius-full);
		background: var(--cw-tone-warning-bg-subtle);
		box-shadow: inset 0 0 0 1px var(--cw-tone-warning-border);
	}

	.cw-offline-icon__svg {
		width: 2.5rem;
		height: 2.5rem;
		color: var(--cw-tone-warning-text);
	}

	.cw-offline-icon__slash {
		color: var(--cw-tone-danger-text);
	}

	.cw-offline-title {
		margin: 0;
		font-size: clamp(1.5rem, 1.1rem + 1vw, 2rem);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-offline-message {
		margin: var(--cw-space-3) 0 0;
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
	}

	.cw-offline-separator {
		margin: var(--cw-space-6) 0;
		width: 100%;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--cw-border-strong) 70%, transparent),
			transparent
		);
	}

	.cw-offline-help {
		width: 100%;
		text-align: left;
	}

	.cw-offline-help__title {
		margin: 0 0 var(--cw-space-3);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-offline-help__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
	}

	.cw-offline-help__list li {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-offline-help__check {
		width: 1rem;
		height: 1rem;
		color: var(--cw-tone-info-text);
		flex-shrink: 0;
	}

	.cw-offline-actions {
		margin-top: var(--cw-space-8);
	}

	.cw-offline-retry-icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-offline-status {
		min-height: 1lh;
		margin: var(--cw-space-3) 0 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-tone-warning-text);
	}

	.cw-offline-status:empty {
		min-height: 0;
		margin: 0;
	}

	.cw-offline-footnote {
		margin: var(--cw-space-4) 0 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	/* Fallback reconnect notice (used only when no CwToast context exists). */
	.cw-reconnected-toast {
		position: fixed;
		top: calc(5rem + env(safe-area-inset-top, 0px) + var(--cw-space-3));
		right: max(var(--cw-space-4), env(safe-area-inset-right, 0px));
		z-index: var(--cw-z-toast);
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		max-width: calc(100vw - 2 * var(--cw-space-4));
		padding: var(--cw-space-3) var(--cw-space-4);
		border-radius: var(--cw-popover-radius);
		border: 1px solid var(--cw-popover-border);
		border-inline-start: 4px solid var(--cw-tone-success-solid-bg);
		background: var(--cw-overlay-bg);
		color: var(--cw-text-primary);
		box-shadow: var(--cw-elevation-popover);
		font-family: var(--cw-font-family);
		animation: cw-offline-card-in var(--cw-duration-normal) var(--cw-ease-out);
	}

	.cw-reconnected-toast__icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--cw-radius-full);
		background: var(--cw-tone-success-bg-subtle);
		color: var(--cw-tone-success-text);
	}

	.cw-reconnected-toast__icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-reconnected-toast__text {
		display: flex;
		flex-direction: column;
	}

	.cw-reconnected-toast__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
	}

	.cw-reconnected-toast__subtitle {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
	}

	@keyframes cw-offline-ping {
		75%,
		100% {
			transform: scale(1.35);
			opacity: 0;
		}
	}

	@media (max-width: 640px) {
		.cw-offline-card {
			padding: var(--cw-space-6);
		}

		.cw-reconnected-toast {
			top: calc(env(safe-area-inset-top, 0px) + var(--cw-space-3));
			left: var(--cw-space-3);
			right: var(--cw-space-3);
		}
	}
</style>
