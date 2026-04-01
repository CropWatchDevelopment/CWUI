<script lang="ts">
	import type { CwTimeValue } from '../types/index.js';
	import {
		addHours,
		addMinutes,
		format12HourTime,
		format24HourTime,
		formatTimeSegment,
		isSameTimeValue,
		normalizeMinuteStep,
		sanitizeTimeValue
	} from './cwTimePickerUtils.js';

	type Segment = 'hours' | 'minutes';

	interface Props {
		value?: CwTimeValue;
		name?: string;
		required?: boolean;
		disabled?: boolean;
		label?: string;
		error?: string;
		minuteStep?: number;
		onchange?: (value: CwTimeValue) => void;
		class?: string;
	}

	let {
		value = $bindable<CwTimeValue>({ hours: 0, minutes: 0 }),
		name,
		required = false,
		disabled = false,
		label,
		error,
		minuteStep = 1,
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();

	const safeMinuteStep = $derived(normalizeMinuteStep(minuteStep));
	const describedBy = $derived.by(() => {
		const ids = [`${uid}-display`];
		if (error) ids.push(`${uid}-error`);
		return ids.join(' ');
	});

	let selectedTime = $state<CwTimeValue>({ hours: 0, minutes: 0 });
	let hoursText = $state('');
	let minutesText = $state('');

	const formatted24Hour = $derived(format24HourTime(selectedTime));
	const formatted12Hour = $derived(format12HourTime(selectedTime));

	$effect(() => {
		const externalValue = sanitizeTimeValue(value, safeMinuteStep);
		if (!isSameTimeValue(selectedTime, externalValue)) {
			selectedTime = externalValue;
		}
	});

	$effect(() => {
		const nextHoursText = formatTimeSegment(selectedTime.hours);
		const nextMinutesText = formatTimeSegment(selectedTime.minutes);

		if (hoursText !== nextHoursText) hoursText = nextHoursText;
		if (minutesText !== nextMinutesText) minutesText = nextMinutesText;
		if (!isSameTimeValue(value, selectedTime)) value = selectedTime;
	});

	function emit(nextValue: CwTimeValue) {
		const sanitized = sanitizeTimeValue(nextValue, safeMinuteStep);
		const changed = !isSameTimeValue(selectedTime, sanitized);

		selectedTime = sanitized;
		if (!isSameTimeValue(value, sanitized)) value = sanitized;
		if (changed) onchange?.(sanitized);
	}

	function handleSegmentInput(segment: Segment, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const sanitized = input.value.replace(/\D/g, '').slice(0, 2);
		input.value = sanitized;

		if (segment === 'hours') {
			hoursText = sanitized;
			return;
		}

		minutesText = sanitized;
	}

	function commitSegment(segment: Segment) {
		if (disabled) return;

		const rawValue = segment === 'hours' ? hoursText : minutesText;
		const fallbackValue = segment === 'hours' ? selectedTime.hours : selectedTime.minutes;
		const parsedValue = rawValue === '' ? fallbackValue : Number(rawValue);

		if (!Number.isFinite(parsedValue)) {
			selectedTime = { ...selectedTime };
			return;
		}

		if (segment === 'hours') {
			emit({ ...selectedTime, hours: parsedValue });
			return;
		}

		emit({ ...selectedTime, minutes: parsedValue });
	}

	function handleSegmentKeydown(segment: Segment, event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (segment === 'hours') {
				emit(addHours(selectedTime, 1));
			} else {
				emit(addMinutes(selectedTime, 1, safeMinuteStep));
			}
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (segment === 'hours') {
				emit(addHours(selectedTime, -1));
			} else {
				emit(addMinutes(selectedTime, -1, safeMinuteStep));
			}
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			commitSegment(segment);
		}
	}
</script>

<div
	class="cw-time-picker {className}"
	class:cw-time-picker--disabled={disabled}
	class:cw-time-picker--error={!!error}
>
	{#if label}
		<div class="cw-time-picker__label-row">
			<label class="cw-time-picker__label" id="{uid}-label" for="{uid}-hours">{label}</label>
			<span class="cw-time-picker__meta">24-hour clock</span>
		</div>
	{/if}

	{#if name}
		<input
			class="cw-time-picker__native-input"
			type="text"
			{name}
			value={formatted24Hour}
			required={required && !disabled}
			{disabled}
			readonly
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}

	<div
		class="cw-time-picker__shell"
		role="group"
		aria-labelledby={label ? `${uid}-label` : undefined}
		aria-label={label ? undefined : 'Time picker'}
		aria-describedby={describedBy}
		aria-disabled={disabled}
	>
		<div class="cw-time-picker__segment">
			<span class="cw-time-picker__segment-label">Hour</span>
			<div class="cw-time-picker__segment-controls">
				<button
					type="button"
					class="cw-time-picker__stepper"
					aria-label="Decrease hour"
					{disabled}
					onclick={() => emit(addHours(selectedTime, -1))}
				>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>

				<input
					id="{uid}-hours"
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					maxlength="2"
					class="cw-time-picker__input"
					value={hoursText}
					{disabled}
					aria-label="Hour in 24-hour format"
					oninput={(event) => handleSegmentInput('hours', event)}
					onblur={() => commitSegment('hours')}
					onkeydown={(event) => handleSegmentKeydown('hours', event)}
				/>

				<button
					type="button"
					class="cw-time-picker__stepper"
					aria-label="Increase hour"
					{disabled}
					onclick={() => emit(addHours(selectedTime, 1))}
				>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M8 4v8M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>

		<div class="cw-time-picker__separator" aria-hidden="true">:</div>

		<div class="cw-time-picker__segment">
			<span class="cw-time-picker__segment-label">Minute</span>
			<div class="cw-time-picker__segment-controls">
				<button
					type="button"
					class="cw-time-picker__stepper"
					aria-label="Decrease minute"
					{disabled}
					onclick={() => emit(addMinutes(selectedTime, -1, safeMinuteStep))}
				>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>

				<input
					id="{uid}-minutes"
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					maxlength="2"
					class="cw-time-picker__input"
					value={minutesText}
					{disabled}
					aria-label="Minute in 24-hour format"
					oninput={(event) => handleSegmentInput('minutes', event)}
					onblur={() => commitSegment('minutes')}
					onkeydown={(event) => handleSegmentKeydown('minutes', event)}
				/>

				<button
					type="button"
					class="cw-time-picker__stepper"
					aria-label="Increase minute"
					{disabled}
					onclick={() => emit(addMinutes(selectedTime, 1, safeMinuteStep))}
				>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M8 4v8M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>
	</div>

	<div id="{uid}-display" class="cw-time-picker__display" aria-live="polite" aria-atomic="true">
		<span class="cw-time-picker__display-label">12-hour display</span>
		<strong class="cw-time-picker__display-value">{formatted12Hour}</strong>
	</div>

	{#if error}
		<p id="{uid}-error" class="cw-time-picker__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.cw-time-picker {
		position: relative;
		display: grid;
		gap: var(--cw-space-2);
		width: 100%;
	}

	.cw-time-picker__label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
	}

	.cw-time-picker__label,
	.cw-time-picker__meta,
	.cw-time-picker__segment-label,
	.cw-time-picker__display-label,
	.cw-time-picker__error {
		font-size: var(--cw-text-xs);
	}

	.cw-time-picker__label {
		color: var(--cw-text-secondary);
		font-weight: var(--cw-font-medium);
	}

	.cw-time-picker__meta,
	.cw-time-picker__display-label {
		color: var(--cw-text-muted);
	}

	.cw-time-picker__native-input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
	}

	.cw-time-picker__shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: end;
		gap: var(--cw-space-2);
		padding: var(--cw-space-3);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface) 84%, var(--cw-bg-elevated)) 0%,
				var(--cw-bg-elevated) 100%
			);
		box-shadow: var(--cw-shadow-sm);
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-time-picker__shell:focus-within {
		border-color: var(--cw-focus-ring-color);
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 24%, transparent);
	}

	.cw-time-picker__segment {
		display: grid;
		gap: var(--cw-space-1);
	}

	.cw-time-picker__segment-label {
		color: var(--cw-text-muted);
		font-weight: var(--cw-font-medium);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.cw-time-picker__segment-controls {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr) 2.25rem;
		align-items: stretch;
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		background-color: color-mix(in srgb, var(--cw-bg-surface) 68%, var(--cw-bg-base));
		overflow: hidden;
	}

	.cw-time-picker__stepper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		background: color-mix(in srgb, var(--cw-bg-muted) 62%, transparent);
		color: var(--cw-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-time-picker__stepper:hover:not(:disabled) {
		background: color-mix(in srgb, var(--cw-accent-bg) 68%, var(--cw-bg-muted));
		color: var(--cw-text-primary);
	}

	.cw-time-picker__stepper svg {
		width: 0.95rem;
		height: 0.95rem;
	}

	.cw-time-picker__stepper:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.cw-time-picker__input {
		min-width: 0;
		padding: var(--cw-space-2) 0;
		border: 0;
		background: transparent;
		color: var(--cw-text-primary);
		text-align: center;
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.04em;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.cw-time-picker__input::-webkit-inner-spin-button,
	.cw-time-picker__input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.cw-time-picker__input:disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
	}

	.cw-time-picker__separator {
		height: 100%;
		align-content: end;
		align-self: center;
		padding-bottom: var(--cw-space-2);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-muted);
	}

	.cw-time-picker__display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		background: color-mix(in srgb, var(--cw-bg-muted) 62%, transparent);
	}

	.cw-time-picker__display-value {
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
	}

	.cw-time-picker__error {
		color: var(--cw-tone-danger-text);
	}

	.cw-time-picker--error .cw-time-picker__shell {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-time-picker--disabled .cw-time-picker__shell,
	.cw-time-picker--disabled .cw-time-picker__display {
		opacity: 0.72;
	}

	@media (max-width: 480px) {
		.cw-time-picker__shell {
			grid-template-columns: 1fr;
		}

		.cw-time-picker__separator {
			display: none;
		}

		.cw-time-picker__display {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
