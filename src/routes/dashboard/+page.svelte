<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { Box, Cart, FileBarGraph, Home, People, Tag, Wallet } from '$lib/components/icons/index';
	import dateToString from '$lib/utils/dateHelper';
	export let data;

	let { customers, users, salesSummary, expensesSummary } = data;

	onMount(() => {
		if(user?.role !== 'ADMINISTRATOR') return;
		// sales order chart
		const salesDate = salesSummary.map((s) => dateToString(s._id, 'MMM dd yyyy'));
		const salesIncome = salesSummary.map(
			(s) => parseFloat(s.totalDownpayment) + parseFloat(s.totalPayments)
		);
		const salesAmount = salesSummary.map((s) => parseFloat(s.totalAmount));
		const salesBalance = salesSummary.map((s) => parseFloat(s.totalBalance));
		// get sales amount from sales order with the same createdAt date
		const salesCtx = document.getElementById('salesOrderChart');

		// expenses chart
		const expensesDate = expensesSummary.map((s) => dateToString(s._id, 'MMM dd yyyy'));
		const expensesAmount = expensesSummary.map((s) => s.totalExpenses);
		const expensesCtx = document.getElementById('expensesChart');

		new Chart(salesCtx, {
			type: 'line',
			data: {
				labels: salesDate,
				datasets: [
					{
						label: 'Sales',
						data: salesAmount,
						fill: false,
						backgroundColor: 'rgb(204, 204, 204)',
						tension: 0.1
					},
					{
						label: 'Income',
						data: salesIncome,
						fill: false,
						backgroundColor: 'rgb(75, 192, 192)',
						tension: 0.1
					},
					{
						label: 'Balance',
						data: salesBalance,
						fill: false,
						backgroundColor: 'rgb(212, 22, 60)',
						tension: 0.1
					}
				]
			}
		});

		new Chart(expensesCtx, {
			type: 'bar',
			data: {
				labels: expensesDate,
				datasets: [
					{
						label: 'Expenses',
						data: expensesAmount,
						fill: false,
						backgroundColor: 'rgb(212, 22, 60)',
						tension: 0.1
					}
				]
			}
		});
	});

	$: user = $page.data.user;
</script>

<div class="flex gap-4 justify-end">
	<div class="card mb-4 w-52">
		<header class="card-header flex gap-2 items-center">
			<People />
			<h1 class="h3">Customers</h1>
		</header>
		<section class="flex p-4 w-full gap-4 text-4xl justify-center">
			{customers.length || 0}
		</section>
	</div>
	<div class="card mb-4 w-52">
		<header class="card-header flex gap-2 items-center">
			<People />
			<h1 class="h3">Users</h1>
		</header>
		<section class="flex p-4 w-full gap-4 text-4xl justify-center">
			{users.length || 0}
		</section>
	</div>
</div>

{#if user?.role === 'ADMINISTRATOR'}
	<div class="grid grid-cols-2 w-full gap-4">
		<div class="card mb-4 col-span-2 md:col-span-1">
			<header class="flex card-header gap-2 items-center">
				<Cart />
				<h1 class="h3">Sales Order</h1>
			</header>
			<section class="flex p-4 w-full gap-4">
				<canvas id="salesOrderChart"></canvas>
			</section>
		</div>
		<div class="card mb-4 col-span-2 md:col-span-1">
			<header class="flex card-header gap-2 items-center">
				<Wallet />
				<h1 class="h3">Expenses</h1>
			</header>
			<section class="flex p-4 w-full gap-4">
				<canvas id="expensesChart"></canvas>
			</section>
		</div>
	</div>
{/if}
