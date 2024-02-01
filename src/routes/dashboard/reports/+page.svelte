<script lang="ts">
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { Box, Cart, CashStack, FileBarGraph, Home, People, Tag, Wallet } from '$lib/components/icons/index';
	import Report from '$lib/components/reports/Report.svelte';
	import IncomeStatement from '$lib/components/reports/IncomeStatement.svelte';

	export let data;

	let { customers, expenses, users, sales, salesSummary, expensesSummary } = data;
	let tabSet: number = 0;
	let incomeStatement: any = {
		sales: sales,
		expenses: expenses
	};

</script>

<div class="card mb-4">
	<TabGroup
		active="variant-filled-primary"
		hover="hover:variant-soft-primary"
		flex="flex-1 lg:flex-none"
		rounded=""
		border=""
		class="bg-surface-100-800-token w-full"
	>
		<Tab bind:group={tabSet} name="sales" value={0} class="flex justify-center text-center">
			<svelte:fragment slot="lead">
				<FileBarGraph />
			</svelte:fragment>
			<span>Report</span>
		</Tab>
		<Tab bind:group={tabSet} name="net-income" value={1}>
			<svelte:fragment slot="lead">
				<CashStack />
			</svelte:fragment>
			<span>Net Income</span>
		</Tab>
		<Tab bind:group={tabSet} name="expenses" value={2}>
			<svelte:fragment slot="lead">
				<Wallet />
			</svelte:fragment>
			<span>Expenses</span>
		</Tab>

		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				<Report {sales} {expenses} />
			{:else if tabSet === 1}
				<IncomeStatement {incomeStatement} />
			{:else if tabSet === 2}
				<div class="p-4">Coming soon...</div>
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>
