<script lang="ts">
	import {
		CwButton,
		CwCard,
		CwInput,
		CwSwitch,
		CwToastContainer,
		createCwToastContext,
		useCwToast
	} from '$lib/index.js';

	const DEMO_EMAIL = 'demo@email.com';
	const DEMO_PASSWORD = 'demoPASS123!';

	createCwToastContext();
	const toast = useCwToast();

	let email = $state('');
	let password = $state('');
	let rememberDevice = $state(true);
	let touchedEmail = $state(false);
	let touchedPassword = $state(false);
	let isSubmitting = $state(false);
	let attemptCount = $state(0);
	let lastAttempt = $state<Date | null>(null);

	const normalizedEmail = $derived(email.trim().toLowerCase());

	function isValidEmail(value: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
	}

	const emailIsValid = $derived(isValidEmail(normalizedEmail));
	const hasMinLength = $derived(password.length >= 10);
	const hasUppercase = $derived(/[A-Z]/.test(password));
	const hasLowercase = $derived(/[a-z]/.test(password));
	const hasNumber = $derived(/[0-9]/.test(password));
	const hasSymbol = $derived(/[^A-Za-z0-9]/.test(password));

	const passwordChecksPassed = $derived(
		Number(hasMinLength) +
			Number(hasUppercase) +
			Number(hasLowercase) +
			Number(hasNumber) +
			Number(hasSymbol)
	);

	const passwordStrengthPercent = $derived(Math.round((passwordChecksPassed / 5) * 100));
	const passwordStrengthClass = $derived.by(() => {
		if (!password) return 'idle';
		if (passwordChecksPassed <= 2) return 'weak';
		if (passwordChecksPassed <= 4) return 'good';
		return 'strong';
	});

	const passwordStrengthLabel = $derived.by(() => {
		if (!password) return 'Not Set';
		if (passwordChecksPassed <= 2) return 'Weak';
		if (passwordChecksPassed <= 4) return 'Good';
		return 'Strong';
	});

	const emailError = $derived.by(() => {
		if (!touchedEmail) return '';
		if (!normalizedEmail) return 'Email is required.';
		if (!emailIsValid) return 'Enter a valid email address.';
		return '';
	});

	const passwordError = $derived.by(() => {
		if (!touchedPassword) return '';
		if (!password) return 'Password is required.';
		if (!hasMinLength) return 'Password must be at least 10 characters.';
		if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
			return 'Password does not meet all requirements.';
		}
		return '';
	});

	const emailValidState = $derived(touchedEmail && !emailError);
	const passwordValidState = $derived(touchedPassword && !passwordError);
	const canSubmit = $derived(
		emailIsValid && hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol
	);

	const passwordRequirements = $derived([
		{ label: 'At least 10 characters', met: hasMinLength },
		{ label: 'Uppercase and lowercase letters', met: hasUppercase && hasLowercase },
		{ label: 'At least one number', met: hasNumber },
		{ label: 'At least one symbol', met: hasSymbol }
	]);

	const lastAttemptLabel = $derived.by(() => {
		if (!lastAttempt) return '';
		return lastAttempt.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	});

	async function fakeAuthenticate(): Promise<boolean> {
		await new Promise((resolve) => setTimeout(resolve, 1400));
		return normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;
	}

	function applyDemoCredentials() {
		email = DEMO_EMAIL;
		password = DEMO_PASSWORD;
		touchedEmail = true;
		touchedPassword = true;
		toast.add({
			tone: 'info',
			message: 'Demo credentials applied. Submit to trigger a successful login.'
		});
	}

	function clearForm() {
		email = '';
		password = '';
		touchedEmail = false;
		touchedPassword = false;
	}

	function handleForgotPassword() {
		touchedEmail = true;

		if (!normalizedEmail) {
			toast.add({
				tone: 'warning',
				message: 'Enter your email first so we can send a reset link.'
			});
			return;
		}

		if (!emailIsValid) {
			toast.add({
				tone: 'danger',
				message: 'Enter a valid email before requesting a reset.'
			});
			return;
		}

		toast.add({
			tone: 'success',
			message: `Password reset instructions sent to ${normalizedEmail}.`
		});
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		touchedEmail = true;
		touchedPassword = true;

		if (!canSubmit) {
			toast.add({
				tone: 'danger',
				message: 'Please fix the highlighted fields and try again.'
			});
			return;
		}

		isSubmitting = true;
		attemptCount += 1;
		lastAttempt = new Date();

		try {
			const success = await fakeAuthenticate();

			if (success) {
				toast.add({
					tone: 'success',
					message: rememberDevice
						? 'Login successful. This device will stay signed in.'
						: 'Login successful.'
				});
				if (!rememberDevice) {
					password = '';
				}
			} else {
				toast.add({
					tone: 'danger',
					message: 'Login failed. Use the demo credentials or check your password.'
				});
			}
		} catch {
			toast.add({
				tone: 'warning',
				message: 'Request timed out. Please try again.'
			});
		} finally {
			isSubmitting = false;
		}
	}
</script>

<CwToastContainer />

<section class="login-screen">
	<div class="login-screen__glow login-screen__glow--primary"></div>
	<div class="login-screen__glow login-screen__glow--accent"></div>

	<div class="login-screen__layout">
		<section class="login-hero" aria-label="Portal overview">
			<p class="login-hero__eyebrow">CropWatch Secure Portal</p>
			<h1 class="login-hero__title">Monitor crops, devices, and alerts in one place.</h1>
			<p class="login-hero__copy">
				Sign in to access live greenhouse telemetry, alarm timelines, and device-level trend analysis.
			</p>

			<div class="login-hero__chips">
				<span class="login-hero__chip">Real-time telemetry</span>
				<span class="login-hero__chip">Predictive alarms</span>
				<span class="login-hero__chip">Secure by default</span>
			</div>

			<div class="login-hero__stats">
				<article class="login-hero__stat">
					<p class="login-hero__stat-value">24/7</p>
					<p class="login-hero__stat-label">Monitoring Coverage</p>
				</article>
				<article class="login-hero__stat">
					<p class="login-hero__stat-value">128</p>
					<p class="login-hero__stat-label">Active Sensors</p>
				</article>
				<article class="login-hero__stat">
					<p class="login-hero__stat-value">99.98%</p>
					<p class="login-hero__stat-label">Platform Uptime</p>
				</article>
			</div>
		</section>

		<CwCard class="login-card" elevated padded={false}>
			<div class="login-card__header">
				<p class="login-card__eyebrow">Sign In</p>
				<h2 class="login-card__title">Welcome back</h2>
				<p class="login-card__subtitle">
					Use your CropWatch credentials to continue to your dashboard.
				</p>
			</div>

			<form class="login-form" onsubmit={handleSubmit} novalidate>
					<CwInput
						label="Email"
						type="email"
						placeholder="you@cropwatch.io"
						autocomplete="email"
						bind:value={email}
						disabled={isSubmitting}
						error={emailError || undefined}
						valid={emailValidState}
						clearable
						oninput={() => {
							touchedEmail = true;
						}}
					>
						{#snippet leftSlot()}
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M2.5 4.5h11a1 1 0 011 1v5a1 1 0 01-1 1h-11a1 1 0 01-1-1v-5a1 1 0 011-1z"
									stroke="currentColor"
									stroke-width="1.5"
								/>
								<path
									d="M3 5l5 4 5-4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/snippet}
					</CwInput>

					<CwInput
						label="Password"
						type="password"
						placeholder="Enter your password"
						autocomplete="current-password"
						bind:value={password}
						disabled={isSubmitting}
						error={passwordError || undefined}
						valid={passwordValidState}
						oninput={() => {
							touchedPassword = true;
						}}
					>
						{#snippet leftSlot()}
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<rect
									x="2.25"
									y="7"
									width="11.5"
									height="7"
									rx="1.5"
									stroke="currentColor"
									stroke-width="1.5"
								/>
								<path
									d="M5.25 7V5.25a2.75 2.75 0 015.5 0V7"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
							</svg>
						{/snippet}
					</CwInput>

					<div class="password-strength">
						<div class="password-strength__header">
							<span>Password strength</span>
							<strong>{passwordStrengthLabel}</strong>
						</div>
						<div class="password-strength__track" aria-hidden="true">
							<span
								class="password-strength__fill password-strength__fill--{passwordStrengthClass}"
								style="width: {passwordStrengthPercent}%"
							></span>
						</div>
					</div>

					<ul class="password-requirements" aria-label="Password requirements">
						{#each passwordRequirements as requirement (requirement.label)}
							<li
								class="password-requirements__item"
								class:password-requirements__item--met={requirement.met}
							>
								<span class="password-requirements__dot" aria-hidden="true"></span>
								<span>{requirement.label}</span>
							</li>
						{/each}
					</ul>

					<div class="login-form__options">
						<CwSwitch
							bind:checked={rememberDevice}
							label="Remember this device"
							description="Keep me signed in for 30 days"
							disabled={isSubmitting}
						/>
						<CwButton
							type="button"
							variant="ghost"
							size="sm"
							onclick={handleForgotPassword}
							disabled={isSubmitting}
						>
							Forgot password?
						</CwButton>
					</div>

					<CwButton type="submit" size="lg" fullWidth loading={isSubmitting}>
						Sign In Securely
					</CwButton>

					<div class="login-form__helper-actions">
						<CwButton
							type="button"
							variant="secondary"
							size="sm"
							fullWidth
							onclick={applyDemoCredentials}
							disabled={isSubmitting}
						>
							Use Demo Credentials
						</CwButton>
						<CwButton
							type="button"
							variant="ghost"
							size="sm"
							fullWidth
							onclick={clearForm}
							disabled={isSubmitting}
						>
							Clear Form
						</CwButton>
					</div>

					<p class="login-form__hint">
						<strong>Demo:</strong>
						<code>{DEMO_EMAIL}</code>
						/
						<code>{DEMO_PASSWORD}</code>
					</p>

					{#if lastAttemptLabel}
						<p class="login-form__meta">
							Attempts: {attemptCount} | Last attempt: {lastAttemptLabel}
						</p>
					{/if}
			</form>
		</CwCard>
	</div>
</section>

<style>
	.login-screen {
		position: relative;
		min-height: calc(100dvh - 10rem);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 80%, transparent);
		border-radius: var(--cw-radius-2xl);
		overflow: hidden;
		background:
			radial-gradient(
				120% 90% at 0% 0%,
				color-mix(in srgb, var(--cw-info-600) 20%, transparent),
				transparent 65%
			),
			linear-gradient(
				150deg,
				color-mix(in srgb, var(--cw-bg-surface) 84%, var(--cw-bg-base)) 0%,
				color-mix(in srgb, var(--cw-bg-surface-elevated) 88%, var(--cw-bg-base)) 100%
			);
	}

	.login-screen__layout {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr);
		gap: var(--cw-space-8);
		align-items: stretch;
		padding: clamp(1.1rem, 2.7vw, 2.5rem);
		min-height: inherit;
	}

	.login-screen__glow {
		position: absolute;
		border-radius: var(--cw-radius-full);
		filter: blur(48px);
		pointer-events: none;
		opacity: 0.32;
	}

	.login-screen__glow--primary {
		width: 22rem;
		height: 22rem;
		left: -5rem;
		top: -6rem;
		background: color-mix(in srgb, var(--cw-primary-500) 55%, transparent);
	}

	.login-screen__glow--accent {
		width: 20rem;
		height: 20rem;
		right: -5rem;
		bottom: -6rem;
		background: color-mix(in srgb, var(--cw-info-500) 42%, transparent);
	}

	.login-hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--cw-space-4);
		padding: clamp(0.8rem, 2vw, 1.4rem);
		animation: login-fade-up var(--cw-duration-slow) var(--cw-ease-out);
	}

	.login-hero__eyebrow {
		display: inline-flex;
		width: fit-content;
		padding: 0.2rem 0.55rem;
		border-radius: var(--cw-radius-full);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--cw-tone-info-text);
		background: color-mix(in srgb, var(--cw-tone-info-bg) 68%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-tone-info-border) 72%, transparent);
	}

	.login-hero__title {
		font-size: clamp(1.8rem, 2.9vw, 2.6rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--cw-text-primary);
		max-width: 22ch;
	}

	.login-hero__copy {
		font-size: clamp(var(--cw-text-sm), 1.8vw, var(--cw-text-base));
		color: var(--cw-text-secondary);
		max-width: 52ch;
	}

	.login-hero__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.login-hero__chip {
		padding: 0.3rem 0.7rem;
		border-radius: var(--cw-radius-full);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
		background: color-mix(in srgb, var(--cw-bg-elevated) 70%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 76%, transparent);
	}

	.login-hero__stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--cw-space-3);
		margin-top: var(--cw-space-2);
	}

	.login-hero__stat {
		border-radius: var(--cw-radius-xl);
		padding: var(--cw-space-3);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		background: color-mix(in srgb, var(--cw-bg-surface) 76%, transparent);
	}

	.login-hero__stat-value {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		line-height: 1;
	}

	.login-hero__stat-label {
		margin-top: var(--cw-space-1);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	:global(.login-card) {
		height: 100%;
		border-radius: var(--cw-radius-2xl);
		border-color: color-mix(in srgb, var(--cw-border-default) 86%, transparent);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface) 96%, transparent) 0%,
				color-mix(in srgb, var(--cw-bg-surface-elevated) 90%, transparent) 100%
			);
		backdrop-filter: blur(2px);
		animation: login-fade-up var(--cw-duration-slow) var(--cw-ease-out);
	}

	.login-card__header {
		padding: var(--cw-space-6) var(--cw-space-6) var(--cw-space-4);
		border-bottom: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
	}

	.login-card__eyebrow {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--cw-text-muted);
	}

	.login-card__title {
		margin-top: var(--cw-space-2);
		font-size: clamp(1.45rem, 2vw, 1.9rem);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		line-height: 1.1;
	}

	.login-card__subtitle {
		margin-top: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
		padding: var(--cw-space-6);
	}

	.password-strength {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
	}

	.password-strength__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.password-strength__header strong {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
	}

	.password-strength__track {
		height: 0.4rem;
		background: color-mix(in srgb, var(--cw-bg-muted) 76%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 70%, transparent);
		border-radius: var(--cw-radius-full);
		overflow: hidden;
	}

	.password-strength__fill {
		display: block;
		height: 100%;
		width: 0;
		background: color-mix(in srgb, var(--cw-text-muted) 72%, transparent);
		transition:
			width var(--cw-duration-slow) var(--cw-ease-default),
			background-color var(--cw-duration-slow) var(--cw-ease-default);
	}

	.password-strength__fill--weak {
		background: var(--cw-tone-danger-solid-bg);
	}

	.password-strength__fill--good {
		background: var(--cw-tone-warning-solid-bg);
	}

	.password-strength__fill--strong {
		background: var(--cw-tone-success-solid-bg);
	}

	.password-requirements {
		list-style: none;
		display: grid;
		gap: var(--cw-space-2);
	}

	.password-requirements__item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.password-requirements__item--met {
		color: var(--cw-tone-success-text);
	}

	.password-requirements__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-text-muted) 45%, transparent);
	}

	.password-requirements__item--met .password-requirements__dot {
		background: var(--cw-tone-success-solid-bg);
	}

	.login-form__options {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-3);
		flex-wrap: wrap;
	}

	.login-form__options :global(.cw-switch) {
		flex: 1;
		min-width: 14rem;
	}

	.login-form__options :global(.cw-button) {
		margin-left: auto;
	}

	.login-form__helper-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--cw-space-3);
	}

	.login-form__hint {
		padding: var(--cw-space-3);
		border-radius: var(--cw-radius-lg);
		background: color-mix(in srgb, var(--cw-tone-info-bg) 32%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-tone-info-border) 45%, transparent);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-xs);
	}

	.login-form__hint strong {
		color: var(--cw-text-primary);
	}

	.login-form__hint code {
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
	}

	.login-form__meta {
		text-align: center;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	@media (max-width: 1023px) {
		.login-screen {
			min-height: auto;
		}

		.login-screen__layout {
			grid-template-columns: 1fr;
			gap: var(--cw-space-4);
		}

		.login-hero {
			padding: var(--cw-space-4);
		}
	}

	@media (max-width: 767px) {
		.login-screen {
			border-radius: var(--cw-radius-xl);
		}

		.login-screen__layout {
			padding: var(--cw-space-3);
		}

		.login-hero__title {
			font-size: 1.6rem;
		}

		.login-hero__stats {
			grid-template-columns: 1fr;
		}

		.login-card__header {
			padding: var(--cw-space-4) var(--cw-space-4) var(--cw-space-3);
		}

		.login-form {
			padding: var(--cw-space-4);
		}

		.login-form__options {
			flex-direction: column;
			align-items: stretch;
		}

		.login-form__options :global(.cw-button) {
			width: 100%;
			margin-left: 0;
		}

		.login-form__helper-actions {
			grid-template-columns: 1fr;
		}
	}

	@keyframes login-fade-up {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
