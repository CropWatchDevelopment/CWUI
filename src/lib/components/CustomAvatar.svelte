<script lang="ts">
	import { Icon } from 'svelte-ux';
	
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
	export let isSuccess = false;
	export let isWarning = false;
	export let isDanger = false;
	export let iconPath: string | undefined = undefined;
	
	// Map of sizes to classes
	const sizeClasses = {
		'xs': 'h-6 w-6',
		'sm': 'h-8 w-8',
		'md': 'h-10 w-10',
		'lg': 'h-12 w-12',
		'xl': 'h-16 w-16',
		'2xl': 'h-20 w-20'
	};
	
	// Define the class based on size
	let sizeClass = sizeClasses[size];
	
	// Construct status class
	$: statusClass = isSuccess ? 'bg-success' : 
	                 isWarning ? 'bg-warning-600' : 
	                 isDanger ? 'bg-danger-500' : '';
</script>

<div class={`flex items-center justify-center ${sizeClass} ${statusClass} ${$$props.class || ''}`}>
	{#if iconPath}
		<Icon class="text-3xl text-white" path={iconPath} />
	{/if}
	<slot></slot>
</div>

<style>
	/* Add any specific styles you need */
</style>