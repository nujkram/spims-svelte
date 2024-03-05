<script lang="ts">
	import Report from '$lib/components/reports/Report.svelte';

	export let data;

	let { sales } = data;
	console.log(sales)
</script>

<div class="card mb-4">
	<Report {sales} />
</div>
