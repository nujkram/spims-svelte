<script lang="ts">
	import Expenses from '$lib/components/reports/Expenses.svelte';

	export let data;

	let { expenses } = data;
</script>

<div class="card mb-4">
	<Expenses {expenses} />
</div>
