<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { Box, Cart, FileBarGraph, Home, People, Tag, Wallet } from '$lib/components/icons/index';
	import dateToString from '$lib/utils/dateHelper';
	export let data;

	let { customers, sales, expenses, users } = data;

	onMount(() => {
		// sales order chart
		const salesDate = sales.map((s) => dateToString(s.createdAt, 'MMM dd yyyy'));
		const salesAmount = sales.map((s) => s.amount);
		const salesCtx = document.getElementById('salesOrderChart');

		// expenses chart
		const expensesDate = expenses.map((s) => dateToString(s.createdAt, 'MMM dd yyyy'));
		const expensesAmount = expenses.map((s) => s.totalAmount);
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
						backgroundColor: 'rgb(75, 192, 192)',
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

<div class="grid grid-cols-2 w-full gap-4">
	<div class="card mb-4">
		<header class="flex card-header gap-2 items-center">
            <Cart />
			<h1 class="h3">Sales Order</h1>
		</header>
		<section class="flex p-4 w-full gap-4">
			<canvas id="salesOrderChart"></canvas>
		</section>
	</div>
	<div class="card mb-4">
		<header class="flex card-header gap-2 items-center">
            <Wallet />
			<h1 class="h3">Expenses</h1>
		</header>
		<section class="flex p-4 w-full gap-4">
			<canvas id="expensesChart"></canvas>
		</section>
	</div>
</div>
