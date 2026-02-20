<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import CwButton from './CwButton.svelte';

	interface Props {
		/** Force offline state (useful for demo/testing). When omitted, uses real network state. */
		forceOffline?: boolean;
		/** Duration for the "back online" toast in ms */
		reconnectedDurationMs?: number;
		/** Optional retry callback. Falls back to page reload when omitted. */
		onRetry?: () => void;
		/** Show/hide retry button */
		showRetryButton?: boolean;
		/** Retry button label */
		retryLabel?: string;
		class?: string;
	}

	let {
		forceOffline,
		reconnectedDurationMs = 3000,
		onRetry,
		showRetryButton = true,
		retryLabel = 'Try Again',
		class: className = ''
	}: Props = $props();

	let isOffline = $state(false);
	let wasOffline = $state(false);
	let showReconnected = $state(false);
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	function clearReconnectTimer() {
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function queueReconnectHide() {
		clearReconnectTimer();
		reconnectTimer = setTimeout(() => {
			showReconnected = false;
		}, reconnectedDurationMs);
	}

	function handleOnline() {
		if (forceOffline === true) return;
		isOffline = false;
		if (wasOffline) {
			showReconnected = true;
			queueReconnectHide();
		}
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

		if (typeof window === 'undefined') {
			return () => clearReconnectTimer();
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

		if (isOffline || wasOffline) {
			isOffline = false;
			showReconnected = true;
			queueReconnectHide();
		}
	});

	function retry() {
		onRetry?.();
		if (!onRetry && typeof window !== 'undefined') {
			window.location.reload();
		}
	}
</script>

{#if isOffline}
	<div
		transition:fade={{ duration: 200 }}
		class="cw-offline-overlay {className}"
	>
		<div
			transition:scale={{ duration: 300, easing: backOut, start: 0.95 }}
			class="cw-offline-card"
		>
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

			<h1 class="cw-offline-title">You're Offline</h1>
			<p class="cw-offline-message">
				It looks like you've lost your internet connection. CropWatch needs an active connection to sync your device data.
			</p>

			<div class="cw-offline-separator"></div>

			<div class="cw-offline-help">
				<p class="cw-offline-help__title">While you wait, you can try:</p>
				<ul class="cw-offline-help__list">
					<li>
						<svg class="cw-offline-help__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Checking if your WiFi is connected</span>
					</li>
					<li>
						<svg class="cw-offline-help__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Moving closer to your router</span>
					</li>
					<li>
						<svg class="cw-offline-help__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Switching to mobile data if available</span>
					</li>
				</ul>
			</div>

			{#if showRetryButton}
				<div class="cw-offline-actions">
					<CwButton variant="secondary" onclick={retry}>
						<svg class="cw-offline-retry-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						{retryLabel}
					</CwButton>
				</div>
			{/if}

			<p class="cw-offline-footnote">
				Don't worry — we'll automatically reconnect when your connection is restored.
			</p>
		</div>
	</div>
{/if}

{#if showReconnected}
	<div
		transition:fade={{ duration: 200 }}
		class="cw-reconnected-toast-wrap"
	>
		<div
			transition:scale={{ duration: 300, easing: backOut, start: 0.9 }}
			class="cw-reconnected-toast"
		>
			<div class="cw-reconnected-toast__icon-wrap">
				<svg class="cw-reconnected-toast__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
				</svg>
			</div>
			<div class="cw-reconnected-toast__text">
				<p>You're back online!</p>
				<p>Connection restored successfully.</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.cw-offline-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-4);
		background: color-mix(in srgb, var(--cw-bg-base) 94%, transparent);
		backdrop-filter: blur(8px);
	}

	.cw-offline-card {
		width: min(100%, 36rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		border-radius: var(--cw-radius-xl);
		border: 1px solid var(--cw-border-default);
		background: var(--cw-bg-surface);
		padding: var(--cw-space-8);
		box-shadow: var(--cw-shadow-xl);
	}

	.cw-offline-icon-wrap {
		position: relative;
		margin-bottom: var(--cw-space-6);
	}

	.cw-offline-icon-ping {
		position: absolute;
		inset: 0;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-warning-500) 20%, transparent);
		animation: cw-offline-ping 1.7s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	.cw-offline-icon {
		position: relative;
		display: flex;
		width: 5rem;
		height: 5rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-warning-500) 10%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cw-warning-500) 30%, transparent);
	}

	.cw-offline-icon__svg {
		width: 2.5rem;
		height: 2.5rem;
		color: var(--cw-warning-500);
	}

	.cw-offline-icon__slash {
		color: color-mix(in srgb, var(--cw-warning-500) 75%, var(--cw-danger-500));
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
		color: var(--cw-info-400);
		flex-shrink: 0;
	}

	.cw-offline-actions {
		margin-top: var(--cw-space-8);
	}

	.cw-offline-retry-icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-offline-footnote {
		margin: var(--cw-space-4) 0 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-disabled);
	}

	.cw-reconnected-toast-wrap {
		position: fixed;
		left: 50%;
		bottom: var(--cw-space-6);
		transform: translateX(-50%);
		z-index: 9999;
		padding: 0 var(--cw-space-4);
	}

	.cw-reconnected-toast {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		border-radius: var(--cw-radius-lg);
		border: 1px solid color-mix(in srgb, var(--cw-success-500) 30%, transparent);
		background: color-mix(in srgb, var(--cw-success-500) 10%, var(--cw-bg-surface));
		box-shadow: var(--cw-shadow-lg);
		backdrop-filter: blur(6px);
	}

	.cw-reconnected-toast__icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-success-500) 20%, transparent);
	}

	.cw-reconnected-toast__icon {
		width: 1rem;
		height: 1rem;
		color: var(--cw-success-400);
	}

	.cw-reconnected-toast__text p {
		margin: 0;
	}

	.cw-reconnected-toast__text p:first-child {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-success-300);
	}

	.cw-reconnected-toast__text p:last-child {
		font-size: var(--cw-text-xs);
		color: color-mix(in srgb, var(--cw-success-300) 75%, var(--cw-text-muted));
	}

	@keyframes cw-offline-ping {
		75%, 100% {
			transform: scale(1.35);
			opacity: 0;
		}
	}

	@media (max-width: 640px) {
		.cw-offline-card {
			padding: var(--cw-space-6);
		}
	}
</style>
