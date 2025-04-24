<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { Box, Cart, FileBarGraph, Home, People, Tag, Wallet } from '$lib/components/icons/index';
	import dateToString from '$lib/utils/dateHelper';
	import { goto, invalidate } from '$app/navigation';
	import { browser } from '$app/environment';

	interface SummaryItem {
		_id: string;
		totalAmount: string;
		totalDownpayment: string;
		totalPayments: number;
		totalBalance: number;
	}

	interface ExpenseSummary {
		_id: string;
		totalExpenses: number;
	}

	interface PageData {
		customers: any[];
		users: any[];
		salesSummary: SummaryItem[];
		expensesSummary: ExpenseSummary[];
		currentYear: number; // This is the year the data *is* for
	}

	export let data: PageData;

	// selectedYear is bound to the dropdown, reflects user's choice
	let selectedYear = data.currentYear;
	let chartInstance: Chart | null = null;
	let expensesChartInstance: Chart | null = null;

	// Generate the list of years for the dropdown options based on the actual current year
	const actualCurrentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => actualCurrentYear - i);

	$: user = $page.data.user;

	async function handleYearChange() {
		const url = `?year=${selectedYear}`;
		await goto(url, { replaceState: true, keepFocus: true });
		// Invalidate the specific data dependency for the current page
		await invalidate((depUrl) => depUrl.href === $page.url.href);
	}

	function updateCharts(chartData: PageData) {
		if (!browser) return;

		// Use passed data directly
		const {
			salesSummary: currentSalesSummary,
			expensesSummary: currentExpensesSummary,
			currentYear: dataYear
		} = chartData;

		if (chartInstance) {
			chartInstance.destroy();
		}
		if (expensesChartInstance) {
			expensesChartInstance.destroy();
		}

		const salesCtx = document.getElementById('salesOrderChart') as HTMLCanvasElement;
		const expensesCtx = document.getElementById('expensesChart') as HTMLCanvasElement;

		if (!salesCtx || !expensesCtx || !currentSalesSummary || !currentExpensesSummary) {
			return;
		}

		// sales order chart
		const salesDate = currentSalesSummary.map((s: SummaryItem) =>
			dateToString(new Date(s._id), 'MMM dd yyyy')
		);
		const salesIncome = currentSalesSummary.map(
			(s: SummaryItem) => parseFloat(s.totalDownpayment) + s.totalPayments
		);
		const salesAmount = currentSalesSummary.map((s: SummaryItem) => parseFloat(s.totalAmount));
		const salesBalance = currentSalesSummary.map((s: SummaryItem) => s.totalBalance);

		// expenses chart
		const expensesDate = currentExpensesSummary.map((s: ExpenseSummary) =>
			dateToString(new Date(s._id), 'MMM dd yyyy')
		);
		const expensesAmount = currentExpensesSummary.map((s: ExpenseSummary) => s.totalExpenses);

		chartInstance = new Chart(salesCtx, {
			type: 'line',
			data: {
				labels: salesDate,
				datasets: [
					{
						label: 'Sales',
						data: salesAmount,
						fill: false,
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.1
					},
					{
						label: 'Income',
						data: salesIncome,
						fill: false,
						borderColor: 'rgb(54, 162, 235)',
						tension: 0.1
					},
					{
						label: 'Balance',
						data: salesBalance,
						fill: false,
						borderColor: 'rgb(255, 99, 132)',
						tension: 0.1
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: `Sales Overview - ${dataYear}` // Use dataYear from passed data
					},
					tooltip: {
						mode: 'index',
						intersect: false
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		expensesChartInstance = new Chart(expensesCtx, {
			type: 'bar',
			data: {
				labels: expensesDate,
				datasets: [
					{
						label: 'Expenses',
						data: expensesAmount,
						backgroundColor: 'rgba(255, 99, 132, 0.5)',
						borderColor: 'rgb(255, 99, 132)',
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: `Expenses Overview - ${dataYear}` // Use dataYear from passed data
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	onMount(() => {
		if (user?.role !== 'ADMINISTRATOR') return;
		// Initial chart rendering
		updateCharts(data);
	});

	// Reactive statement to update charts when the main 'data' prop changes
	$: {
		if (browser && data) {
			updateCharts(data);
		}
	}

	// Reactive statement to trigger data reload ONLY when selectedYear is changed by the user
	// And it's different from the year the current data is for (data.currentYear)
	$: if (browser && selectedYear !== data.currentYear) {
		handleYearChange(); // This will fetch data for selectedYear
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold">Dashboard Overview</h1>
		<div class="flex items-center gap-2">
			<span class="text-gray-600">Year:</span>
			<select bind:value={selectedYear} class="select" disabled={!data}>
				{#each yearOptions as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="card">
			<header class="card-header flex gap-2 items-center">
				<People />
				<h1 class="h3">Customers</h1>
			</header>
			<section class="flex p-4 w-full gap-4 text-4xl justify-center">
				{data.customers?.length || 0}
			</section>
		</div>
		<div class="card">
			<header class="card-header flex gap-2 items-center">
				<People />
				<h1 class="h3">Users</h1>
			</header>
			<section class="flex p-4 w-full gap-4 text-4xl justify-center">
				{data.users?.length || 0}
			</section>
		</div>
		<div class="card">
			<header class="card-header flex gap-2 items-center">
				<Cart />
				<h1 class="h3">Total Sales</h1>
			</header>
			<section class="flex p-4 w-full gap-4 text-4xl justify-center">
				{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(
					data.salesSummary?.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0) || 0
				)}
			</section>
		</div>
		<div class="card">
			<header class="card-header flex gap-2 items-center">
				<Wallet />
				<h1 class="h3">Total Expenses</h1>
			</header>
			<section class="flex p-4 w-full gap-4 text-4xl justify-center">
				{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(
					data.expensesSummary?.reduce((acc, curr) => acc + curr.totalExpenses, 0) || 0
				)}
			</section>
		</div>
	</div>

	{#if user?.role === 'ADMINISTRATOR'}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<div class="card">
				<header class="flex card-header gap-2 items-center">
					<Cart />
					<h1 class="h3">Sales Order</h1>
				</header>
				<section class="flex p-4 w-full gap-4">
					<canvas id="salesOrderChart"></canvas>
				</section>
			</div>
			<div class="card">
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
</div>

<style>
	canvas {
		width: 100% !important;
		height: 300px !important;
	}
</style>
