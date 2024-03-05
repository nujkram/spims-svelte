<script lang="ts">
	import IncomeStatement from '$lib/components/reports/IncomeStatement.svelte';

	export let data;

	let { salesSummary, expensesSummary } = data;

</script>

<div class="card mb-4">
<IncomeStatement {salesSummary} {expensesSummary} />
</div>
