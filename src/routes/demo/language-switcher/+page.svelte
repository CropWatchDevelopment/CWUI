<script lang="ts">
	import {
		CwButton,
		CwLanguageSwitcher,
		type CwLanguageOption
	} from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	interface PreviewCopy {
		kicker: string;
		title: string;
		body: string;
		action: string;
	}

	const liveOptions: CwLanguageOption[] = [
		{
			locale: 'en',
			label: 'English',
			shortLabel: 'EN',
			flag: '🇺🇸',
			description: 'Default dashboard copy'
		},
		{
			locale: 'es',
			label: 'Español',
			shortLabel: 'ES',
			flag: '🇪🇸',
			description: 'Spanish content pack'
		},
		{
			locale: 'fr',
			label: 'Français',
			shortLabel: 'FR',
			flag: '🇫🇷',
			description: 'French content pack'
		},
		{
			locale: 'ja',
			label: '日本語',
			shortLabel: 'JA',
			flag: '🇯🇵',
			description: 'Japanese content pack'
		}
	];

	const releaseOptions: CwLanguageOption[] = [
		{
			locale: 'en',
			label: 'English',
			shortLabel: 'EN',
			flag: '🇺🇸',
			description: 'Default product copy'
		},
		{
			locale: 'es-MX',
			label: 'Español (México)',
			shortLabel: 'ES',
			flag: '🇲🇽',
			description: 'Regional billing and support copy'
		},
		{
			locale: 'fr-CA',
			label: 'Français (Canada)',
			shortLabel: 'FR',
			flag: '🇨🇦',
			description: 'Localized onboarding flow'
		},
		{
			locale: 'de',
			label: 'Deutsch',
			shortLabel: 'DE',
			flag: '🇩🇪',
			description: 'Translation QA in progress',
			disabled: true
		}
	];

	const previewByLocale: Record<string, PreviewCopy> = {
		en: {
			kicker: 'Weekly summary',
			title: 'Your irrigation schedule is on track.',
			body: 'Sensors are stable, forecasts are favorable, and no immediate interventions are required.',
			action: 'Review schedule'
		},
		es: {
			kicker: 'Resumen semanal',
			title: 'Tu programa de riego sigue en marcha.',
			body: 'Los sensores están estables, el pronóstico es favorable y no se requieren acciones inmediatas.',
			action: 'Revisar programa'
		},
		fr: {
			kicker: 'Résumé hebdomadaire',
			title: "Votre plan d'irrigation reste sur la bonne voie.",
			body: "Les capteurs sont stables, les prévisions sont favorables et aucune intervention immédiate n'est requise.",
			action: 'Voir le planning'
		},
		ja: {
			kicker: '週間サマリー',
			title: 'かん水スケジュールは順調です。',
			body: 'センサーは安定しており、予報も良好で、今すぐの対応は必要ありません。',
			action: 'スケジュールを確認'
		}
	};

	let locale = $state('en');
	let toolbarLocale = $state('es-MX');
	let lastAppliedLocale = $state('en');

	const activePreview = $derived(previewByLocale[locale] ?? previewByLocale.en);

	async function mimicParaglideSetLocale(nextLocale: string) {
		await new Promise((resolve) => setTimeout(resolve, 180));
		lastAppliedLocale = nextLocale;
	}

	const paraglideExample = `<script lang="ts">
\timport {
\t\tCwLanguageSwitcher,
\t\ttype CwLanguageOption
\t} from '@cropwatchdevelopment/cwui';
\timport { getLocale, setLocale } from '$lib/paraglide/runtime.js';

\tconst locales: CwLanguageOption[] = [
\t\t{ locale: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
\t\t{ locale: 'es', label: 'Español', shortLabel: 'ES', flag: '🇪🇸' },
\t\t{ locale: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷' }
\t];

\tlet locale = $state(getLocale());
<\/script>

<CwLanguageSwitcher
\tlabel="Language"
\toptions={locales}
\tbind:locale={locale}
\tsetLocale={setLocale}
/>`;

	const toolbarExample = `<script lang="ts">
\tconst locales = [
\t\t{
\t\t\tlocale: 'en',
\t\t\tlabel: 'English',
\t\t\tshortLabel: 'EN',
\t\t\tflag: '🇺🇸',
\t\t\tdescription: 'Default product copy'
\t\t},
\t\t{
\t\t\tlocale: 'es-MX',
\t\t\tlabel: 'Español (México)',
\t\t\tshortLabel: 'ES',
\t\t\tflag: '🇲🇽',
\t\t\tdescription: 'Regional billing and support copy'
\t\t},
\t\t{
\t\t\tlocale: 'de',
\t\t\tlabel: 'Deutsch',
\t\t\tshortLabel: 'DE',
\t\t\tflag: '🇩🇪',
\t\t\tdescription: 'Translation QA in progress',
\t\t\tdisabled: true
\t\t}
\t];

\tlet locale = $state('es-MX');
<\/script>

<CwLanguageSwitcher
\tlabel="Content locale"
\toptions={locales}
\tbind:locale={locale}
/>`;
</script>

<svelte:head>
	<title>CwLanguageSwitcher | CropWatch UI Demo</title>
</svelte:head>

<h2>CwLanguageSwitcher</h2>
<p class="demo-desc">
	Paraglide-ready locale picker that accepts an array of language options and calls the
	consumer's <code>setLocale</code> runtime function.
</p>
<p class="demo-note">
	This demo app does not ship with Paraglide, so the live example below uses a stub callback
	that behaves like the runtime setter. The copy-paste example shows the real Paraglide import.
</p>

<section class="demo-section demo-section--hero">
	<div class="demo-panel">
		<div class="demo-panel__copy">
			<span class="demo-eyebrow">Live locale handoff</span>
			<h3>Bind the current locale and hand in Paraglide's setter.</h3>
			<p>
				The component updates its selected state immediately, then awaits the consumer
				callback so your app can swap messages, routes, or persisted preferences.
			</p>
		</div>

		<CwLanguageSwitcher
			label="Language"
			options={liveOptions}
			bind:locale={locale}
			setLocale={mimicParaglideSetLocale}
		/>
	</div>

	<article class="demo-preview" aria-label="Localized content preview">
		<span class="demo-preview__eyebrow">{activePreview.kicker}</span>
		<h3>{activePreview.title}</h3>
		<p>{activePreview.body}</p>

		<div class="demo-preview__meta">
			<span>Current locale <strong>{locale}</strong></span>
			<span>Last applied <strong>{lastAppliedLocale}</strong></span>
		</div>

		<CwButton variant="primary">{activePreview.action}</CwButton>
	</article>
</section>

<DemoCodeExample code={paraglideExample} title="Paraglide runtime wiring" />

<section class="demo-section">
	<div class="demo-toolbar">
		<div class="demo-toolbar__copy">
			<span class="demo-eyebrow">Toolbar pattern</span>
			<h3>Keep planned languages visible.</h3>
			<p>
				Use <code>description</code> for regional context and <code>disabled</code> for
				locales that are staged but not ready for selection.
			</p>
		</div>

		<CwLanguageSwitcher label="Content locale" options={releaseOptions} bind:locale={toolbarLocale} />
	</div>

	<p class="demo-hint">
		Selected toolbar locale: <strong>{toolbarLocale}</strong>. Disabled entries stay visible so
		users can see what is coming next.
	</p>

	<DemoCodeExample code={toolbarExample} title="Rich option array" />
</section>

<style>
	h2 {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
	}

	h3 {
		margin: 0;
		font-size: clamp(1rem, 1.6vw, 1.15rem);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-desc,
	.demo-note,
	.demo-panel__copy p,
	.demo-toolbar__copy p,
	.demo-preview p {
		font-size: var(--cw-text-sm);
		line-height: 1.65;
		color: var(--cw-text-secondary);
	}

	.demo-desc {
		margin: 0 0 var(--cw-space-2);
	}

	.demo-note {
		margin: 0 0 var(--cw-space-6);
		max-width: 68ch;
	}

	.demo-desc code,
	.demo-toolbar__copy code {
		padding: 0.1rem 0.35rem;
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		font-size: var(--cw-text-xs);
	}

	.demo-section {
		margin-bottom: var(--cw-space-7);
	}

	.demo-section--hero {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--cw-space-4);
		align-items: stretch;
	}

	.demo-panel,
	.demo-preview,
	.demo-toolbar {
		display: grid;
		gap: var(--cw-space-4);
		padding: clamp(1rem, 2vw, 1.4rem);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 80%, transparent);
		border-radius: var(--cw-radius-xl);
		box-shadow: var(--cw-shadow-sm);
	}

	.demo-panel,
	.demo-toolbar {
		background:
			linear-gradient(
				145deg,
				color-mix(in srgb, var(--cw-bg-elevated) 92%, white),
				color-mix(in srgb, var(--cw-bg-muted) 78%, white)
			);
	}

	.demo-preview {
		align-content: start;
		background:
			radial-gradient(circle at top right, color-mix(in srgb, var(--cw-accent) 18%, transparent), transparent 48%),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 94%, white),
				color-mix(in srgb, var(--cw-bg-base) 96%, white)
			);
	}

	.demo-panel__copy,
	.demo-toolbar__copy {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-eyebrow,
	.demo-preview__eyebrow {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		padding: 0.18rem 0.55rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-accent) 14%, var(--cw-bg-muted));
		color: var(--cw-accent);
		font-size: 0.7rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-preview__meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.demo-preview__meta strong,
	.demo-hint strong {
		color: var(--cw-text-primary);
	}

	.demo-toolbar {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}

	.demo-hint {
		margin: var(--cw-space-3) 0 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	@media (max-width: 720px) {
		.demo-toolbar {
			grid-template-columns: 1fr;
		}
	}
</style>
