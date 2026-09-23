// Builds the swatches, contrast ratios and samples in style-guide.html from
// the live CSS tokens. Nothing here hardcodes a token value: each colour is
// resolved by the browser inside a [data-theme] panel and read back.
(() => {
	const meta = window.CW_GUIDE ?? { version: 'dev', date: new Date().toISOString().slice(0, 10), metrics: [] };

	/* ── Colour helpers ─────────────────────────────── */
	const probeHost = document.createElement('div');
	probeHost.style.cssText = 'position:absolute;left:-9999px;top:0;';
	document.body.appendChild(probeHost);

	/** Parse a computed CSS colour ("rgb()", "rgba()", "color(srgb …)") into 0–255 RGBA. */
	function parseColor(str) {
		let m = str.match(/rgba?\(([^)]+)\)/);
		if (m) {
			const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
			return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
		}
		m = str.match(/color\(srgb\s+([^)]+)\)/);
		if (m) {
			const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
			return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] ?? 1 };
		}
		return null;
	}

	/** Resolve a colour token within a theme scope element. */
	function resolve(token, scope) {
		const el = document.createElement('div');
		el.style.backgroundColor = `var(${token})`;
		(scope ?? probeHost).appendChild(el);
		const c = parseColor(getComputedStyle(el).backgroundColor);
		el.remove();
		return c;
	}

	function rawValue(token, scope) {
		return getComputedStyle(scope ?? document.documentElement).getPropertyValue(token).trim();
	}

	const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
	const toHex = (c) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;

	function over(fg, bg) {
		const a = fg.a;
		return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
	}

	function luminance(c) {
		const f = (v) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
	}

	function contrast(a, b) {
		const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
		return (hi + 0.05) / (lo + 0.05);
	}

	function describe(c) {
		if (!c) return 'n/a';
		return c.a < 0.999 ? `${toHex(c)} · ${Math.round(c.a * 100)}%` : toHex(c);
	}

	function ratioBadge(ratio, needed) {
		const cls = ratio >= 7 ? 'aaa' : ratio >= needed ? 'aa' : 'fail';
		return `<span class="ratio ratio--${cls}">${ratio.toFixed(1)}:1</span>`;
	}

	const h = (strings, ...values) =>
		strings.reduce((out, s, i) => out + s + (i < values.length ? values[i] : ''), '');

	/* ── Meta ───────────────────────────────────────── */
	document.querySelectorAll('[data-fill]').forEach((el) => {
		el.textContent = meta[el.dataset.fill] ?? '';
	});
	document.querySelectorAll('.page').forEach((page, i) => {
		const num = page.querySelector('.page__num');
		if (num) num.textContent = String(i + 1).padStart(2, '0');
	});

	/* ── Brand swatches ─────────────────────────────── */
	const brand = [
		['CropWatch green', '--cw-brand-green', 'Light-mode header, print, company materials'],
		['Accent teal', '--cw-primary-500', 'Interactive accent in dark mode'],
		['Leaf green', null, 'Logo leaves only', '#4eba3d'],
		['Bronze', null, 'Logo tree only', '#b86b40']
	];
	document.getElementById('brand-swatches').innerHTML = brand
		.map(([name, token, use, fixed]) => {
			const hex = fixed ?? toHex(resolve(token));
			return h`<div class="brand-swatch">
				<div class="brand-swatch__chip" style="background:${hex}"></div>
				<div><strong>${name}</strong><span>${hex.toUpperCase()}${token ? ` · <code>${token}</code>` : ''}<br />${use}</span></div>
			</div>`;
		})
		.join('');

	/* ── Palette ramps ──────────────────────────────── */
	const ramps = [
		['Gray (neutrals)', 'gray', [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950]],
		['Primary (teal)', 'primary', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]],
		['Info (sky)', 'info', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]],
		['Success (emerald)', 'success', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]],
		['Warning (amber)', 'warning', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]],
		['Danger (red)', 'danger', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]]
	];
	const white = { r: 255, g: 255, b: 255, a: 1 };
	const black = { r: 2, g: 6, b: 24, a: 1 };
	document.getElementById('ramps').innerHTML = ramps
		.map(([label, key, steps]) => {
			const cells = steps
				.map((step) => {
					const c = resolve(`--cw-${key}-${step}`);
					const text = contrast(c, white) >= contrast(c, black) ? '#fff' : '#020618';
					return h`<div class="ramp__cell" style="background:${toHex(c)};color:${text}"><b>${step}</b>${toHex(c)}</div>`;
				})
				.join('');
			return h`<div><div class="ramp__name">${label} <code>--cw-${key}-*</code></div><div class="ramp__row" style="--steps:${steps.length}">${cells}</div></div>`;
		})
		.join('');

	/* ── Token lists per theme ──────────────────────── */
	const groups = {
		surfaces: [
			['Backgrounds', null],
			['--cw-bg-base', 'bg'],
			['--cw-bg-surface', 'bg'],
			['--cw-bg-surface-elevated', 'bg'],
			['--cw-bg-elevated', 'bg'],
			['--cw-bg-muted', 'bg'],
			['--cw-header-bg', 'bg'],
			['--cw-scrim', 'bg'],
			['Text', null],
			['--cw-text-primary', 'text'],
			['--cw-text-secondary', 'text'],
			['--cw-text-muted', 'text'],
			['--cw-text-disabled', 'disabled'],
			['--cw-header-fg', 'header'],
			['Borders', null],
			['--cw-border-muted', 'deco'],
			['--cw-border-default', 'deco'],
			['--cw-border-strong', 'ui'],
			['--cw-control-border', 'ui']
		],
		interaction: [
			['--cw-accent', 'ui'],
			['--cw-accent-text', 'text'],
			['--cw-focus-ring-color', 'ui'],
			['--cw-option-hover-bg', 'bg'],
			['--cw-option-selected-text', 'text']
		]
	};

	document.querySelectorAll('.token-list[data-group]').forEach((list) => {
		const scope = list.closest('[data-theme]');
		const surface = resolve('--cw-bg-surface', scope);
		const header = resolve('--cw-header-bg', scope);
		list.innerHTML = groups[list.dataset.group]
			.map(([token, kind]) => {
				if (kind === null) return `<div class="token-group-label">${token}</div>`;
				const c = resolve(token, scope);
				let ratio = '';
				if (kind === 'text' || kind === 'ui' || kind === 'disabled' || kind === 'header') {
					const back = kind === 'header' ? header : surface;
					const r = contrast(over(c, back), back);
					ratio = ratioBadge(r, kind === 'text' ? 4.5 : 3);
				}
				return h`<div class="token">
					<span class="token__chip" style="background:var(${token})"></span>
					<span class="token__name">${token}</span>
					<span class="token__meta">${describe(c)}${ratio}</span>
				</div>`;
			})
			.join('');
	});

	/* ── Layer demo ─────────────────────────────────── */
	document.querySelectorAll('.stack-demo').forEach((el) => {
		el.innerHTML = h`<div class="sd-card">
			<h5>Greenhouse A · Bay 3</h5>
			<p class="sd-sub">Air temperature · updated 2 min ago</p>
			<div class="sd-value">23.4<small>°C</small></div>
			<div class="sd-row"><span>Humidity 65%</span><span class="sd-disabled">CO₂ sensor disabled</span></div>
			<div class="sd-field">Select a sensor…</div>
			<div class="sd-popover"><div>Air temperature</div><div class="sel">✓ Humidity</div><div>Soil moisture</div></div>
		</div>`;
	});

	/* ── Tones ──────────────────────────────────────── */
	const tones = ['primary', 'secondary', 'info', 'success', 'warning', 'danger'];
	document.querySelectorAll('.tones').forEach((el) => {
		const scope = el.closest('[data-theme]');
		const surface = resolve('--cw-bg-surface', scope);
		el.innerHTML =
			`<div class="tone-row"><span></span><span class="token-group-label">Soft</span><span class="token-group-label">Outline</span><span class="token-group-label">Solid</span></div>` +
			tones
				.map((t) => {
					const text = resolve(`--cw-tone-${t}-text`, scope);
					const soft = over(resolve(`--cw-tone-${t}-bg-subtle`, scope), surface);
					const solidBg = resolve(`--cw-tone-${t}-solid-bg`, scope);
					const solidText = resolve(`--cw-tone-${t}-solid-text`, scope);
					return h`<div class="tone-row">
						<span class="tone-row__name">${t}</span>
						<span class="pill" style="background:var(--cw-tone-${t}-bg-subtle);color:var(--cw-tone-${t}-text)">${t}<small>${contrast(text, soft).toFixed(1)}:1</small></span>
						<span class="pill" style="border-color:var(--cw-tone-${t}-border);color:var(--cw-tone-${t}-text)">${t}<small>${contrast(text, surface).toFixed(1)}:1</small></span>
						<span class="pill" style="background:var(--cw-tone-${t}-solid-bg);color:var(--cw-tone-${t}-solid-text)">${t}<small>${contrast(solidText, solidBg).toFixed(1)}:1</small></span>
					</div>`;
				})
				.join('');
		el.closest('.theme-col').style.background = 'var(--cw-bg-surface)';
	});

	/* ── Status ─────────────────────────────────────── */
	const statuses = [
		['Online', '--cw-status-online'],
		['Warning', '--cw-status-warning'],
		['Alarm / error', '--cw-status-alarm'],
		['Offline', '--cw-status-offline'],
		['Loading', '--cw-status-loading']
	];
	document.querySelectorAll('.status-list').forEach((el) => {
		const scope = el.closest('[data-theme]');
		const surface = resolve('--cw-bg-surface', scope);
		el.innerHTML = statuses
			.map(([label, token]) => {
				const c = resolve(token, scope);
				return h`<div class="status" style="--dot:var(${token})">
					<span class="status__dot"></span><strong>${label}</strong>
					<span class="status__meta">${token}<br />${toHex(c)} · ${contrast(c, surface).toFixed(1)}:1 on surface</span>
				</div>`;
			})
			.join('');
	});

	/* ── Chart palette ──────────────────────────────── */
	document.querySelectorAll('.cat-list').forEach((el) => {
		const scope = el.closest('[data-theme]');
		const card = resolve('--cw-chart-card-bg', scope);
		el.closest('.theme-col').style.background = 'var(--cw-chart-card-bg)';
		el.innerHTML = Array.from({ length: 8 }, (_, i) => {
			const token = `--cw-chart-cat-${i + 1}`;
			const c = resolve(token, scope);
			return h`<div class="cat"><div class="cat__bar" style="background:var(${token})">${i + 1}</div>${toHex(c)} · ${contrast(c, card).toFixed(1)}:1</div>`;
		}).join('');
	});

	document.getElementById('metrics').innerHTML = (meta.metrics ?? [])
		.map(
			(m) => h`<div class="metric"><span class="metric__line" style="background:${m.gradient ? `linear-gradient(90deg,#3b82f6,${m.color})` : m.color}"></span>
				<div>${m.label}<small>${m.color}${m.gradient ? ' · value gradient' : ''}</small></div></div>`
		)
		.join('');

	/* ── Type scale ─────────────────────────────────── */
	const sizes = [
		['3xl', 'bold', 'Sensor readings 23.4°C'],
		['2xl', 'bold', 'Page title: Greenhouse overview'],
		['xl', 'semibold', 'Dialog title: Edit alert rule'],
		['lg', 'semibold', 'Card title: Bay 3 temperature'],
		['base', 'regular', 'Long-form body text and descriptions'],
		['sm', 'regular', 'Default UI text, table cells, form labels (medium)'],
		['xs', 'regular', 'Hints, captions, timestamps, table headers']
	];
	document.getElementById('type-scale').innerHTML =
		sizes
			.map(([step, weight, sample]) => {
				const size = rawValue(`--cw-text-${step}`);
				const px = parseFloat(size) * 16;
				return h`<div class="type-row">
					<span class="type-row__meta">--cw-text-${step} · ${px}px · ${weight}</span>
					<span class="type-row__sample" style="font-size:${px * 0.75}pt;font-weight:var(--cw-font-${weight === 'regular' ? 'normal' : weight})">${sample}</span>
				</div>`;
			})
			.join('') +
		h`<div class="type-row"><span class="type-row__meta">--cw-font-mono · IDs, code</span><span class="type-row__sample mono" style="font-size:9pt">DevEUI b0:62:2f:f0:df:a0:98:25</span></div>`;

	/* ── Spacing, radius, elevation, z-index ────────── */
	const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
	document.getElementById('spacing').innerHTML = spaces
		.map((s) => {
			const v = rawValue(`--cw-space-${s}`);
			const px = parseFloat(v) * 16;
			return h`<div class="space-row"><span>space-${s} · ${px}px</span><span class="space-row__bar" style="width:${px * 0.9}px"></span></div>`;
		})
		.join('');

	const radii = [
		['Control', '--cw-control-radius', 'buttons, inputs'],
		['Card', '--cw-card-radius', 'cards, charts'],
		['Pop-up', '--cw-popover-radius', 'menus, toasts'],
		['Pill', '--cw-radius-full', 'chips, badges']
	];
	document.getElementById('radii').innerHTML = radii
		.map(([name, token, use]) => {
			const v = rawValue(token);
			const px = v.endsWith('rem') ? `${parseFloat(v) * 16}px` : v;
			return h`<div class="radius"><div class="radius__box" style="border-radius:var(${token})"></div><b>${name}</b>${px}<br />${use}</div>`;
		})
		.join('');

	document.querySelectorAll('.elev').forEach((el) => {
		el.innerHTML = ['--cw-shadow-sm', '--cw-elevation-popover', '--cw-elevation-modal']
			.map((t) => `<div class="elev__box" style="box-shadow:var(${t})">${t.replace('--cw-', '')}</div>`)
			.join('');
	});

	const zs = [
		['--cw-z-inline-overlay', 'no-data / loading over a card'],
		['--cw-z-dropdown', 'in-flow dropdowns'],
		['--cw-z-sticky', 'sticky headers'],
		['--cw-z-overlay', 'side-nav overlay'],
		['--cw-z-popover', 'menus, list pop-ups'],
		['--cw-z-modal', 'dialogs'],
		['--cw-z-toast', 'toasts'],
		['--cw-z-tooltip', 'tooltips']
	];
	document.getElementById('zindex').innerHTML = zs
		.map(([t, use]) => `<div><span><code>${t}</code>&ensp;${use}</span><strong>${rawValue(t)}</strong></div>`)
		.join('');

	/* ── Controls ───────────────────────────────────── */
	document.querySelectorAll('#control-sizes .theme-col').forEach((col) => {
		col.style.background = 'var(--cw-bg-surface)';
		col.innerHTML = ['sm', 'md', 'lg']
			.map((s) => {
				const hv = rawValue(`--cw-control-h-${s}`);
				const px = parseFloat(hv) * 16;
				const style = `height:${px * 0.75}pt;padding:0 var(--cw-control-px-${s});font-size:${
					parseFloat(rawValue(`--cw-control-text-${s}`)) * 12
				}pt`;
				return h`<div class="ctl-row">
					<span class="ctl-row__label">${s}<br />${px}px</span>
					<span class="ctl ctl--input" style="${style}">Search…</span>
					<span class="ctl ctl--select" style="${style}">All sites <span>▾</span></span>
					<span class="ctl ctl--btn ctl--btn-secondary" style="${style}">Reset</span>
					<span class="ctl ctl--btn" style="${style}">Apply</span>
				</div>`;
			})
			.join('');
	});

	document.querySelectorAll('.field-demo').forEach((col) => {
		col.style.background = 'var(--cw-bg-surface)';
		col.innerHTML = h`
			<div class="field"><div class="field__label">Device name <span>*</span></div><div class="field__box field__box--focus">Bay 3 sensor</div><div class="field__help">Shown on cards and in alerts.</div></div>
			<div class="field"><div class="field__label">Alert threshold</div><div class="field__box field__box--error">120</div><div class="field__help field__help--error">Enter a value between −40 and 85.</div></div>
			<div class="field"><div class="field__label">DevEUI</div><div class="field__box field__box--disabled mono">b0:62:2f:f0:df:a0:98:25</div></div>`;
	});

	document.documentElement.dataset.ready = 'true';
})();
