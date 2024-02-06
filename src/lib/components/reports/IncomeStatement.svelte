<script lang="ts">
	import { onMount } from 'svelte';
	import { Table, Paginator, tableMapperValues } from '@skeletonlabs/skeleton';
	import type { PaginationSettings, TableSource } from '@skeletonlabs/skeleton';
	import { Download } from '$lib/components/icons/index';
	import {
		formatCurrencyNoSymbol,
		stringToDecimal
	} from '$lib/utils/currencyHelper';
	export let salesSummary: any[];
	export let expensesSummary: any[];

	let sourceData = salesSummary.map((item: any) => {
		let expenses = expensesSummary.find((expense: any) => expense._id === item._id);
		return {
			...item,
			totalExpenses: expenses?.totalExpenses || 0
		};
	});

	let keyword: string = '';
	let startDate: string = '';
	let endDate: string = '';
	let business: string = '';
	let totalSales: number = 0;
	let totalIncome: number = 0;
	let businesses: any[] = [];

	let table: TableSource = {
		// A list of heading labels.
		head: [
			'Date',
			'Sales Order',
			'Downpayment',
			'Payment',
			'Income',
			'Sales Balance',
			'Expenses',
			'Net Income'
		],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, [
			'_id',
			'totalAmount',
			'totalDownpayment',
			'totalPayments',
			'totalSales',
			'totalBalance',
			'totalExpenses',
			'totalIncome'
		])
	};

	// filter sourceData createdAt by date between start and end
	const filterByDate = (start: Date, end: Date) => {
		sourceData = incomeData(sourceData);
		paginationSettings.page = 0;
		let tempData = sourceData;
		let filteredData = tempData.filter((item: any) => {
			return new Date(item._id) >= start && new Date(item._id) <= end;
		});
		updateTable(filteredData);
	};

	// const filterByBusiness = (business: string) => {
	// 	sourceData = incomeData(sourceData);
	// 	paginationSettings.page = 0;
	// 	let tempData = sourceData;
	// 	if (business === '') return updateTable(sourceData);
	// 	let filteredData = tempData.filter((item: any) => {
	// 		return item.business === business;
	// 	});
	// 	updateTable(filteredData);
	// };

	const updateTable = (sourceData: any) => {
		sourceData = incomeData(sourceData);
		paginationSettings.size = sourceData.length;
		let paginatedData = sourceData.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		table.body = tableMapperValues(paginatedData, [
			'_id',
			'totalAmount',
			'totalDownpayment',
			'totalPayments',
			'totalSales',
			'totalBalance',
			'totalExpenses',
			'totalIncome'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'_id',
			'totalAmount',
			'totalDownpayment',
			'totalPayments',
			'totalSales',
			'totalBalance',
			'totalExpenses',
			'totalIncome'
		]);
	};

	let paginationSettings = {
		page: 0,
		limit: 100,
		size: sourceData.length,
		amounts: [10, 20, 25, 30, 50, 100]
	} satisfies PaginationSettings;

	// pagination event handlers
	const onAmountChange = (e: CustomEvent): void => {
		paginationSettings.limit = e.detail;
		updateTable(sourceData);
	};

	// pagination event handlers
	const onPageChange = (e: CustomEvent): void => {
		paginationSettings.page = e.detail;
		updateTable(sourceData);
	};

	const incomeData = (data: any) => {
		totalIncome = 0;
		totalSales = 0;

		return data.map((item: any) => {
			totalSales =
				parseFloat(stringToDecimal(item.totalDownpayment)) +
				parseFloat(stringToDecimal(item.totalPayments));
			totalIncome =
				parseFloat(stringToDecimal(totalSales)) -
				parseFloat(stringToDecimal(item.totalExpenses));

			return {
				...item,
				totalAmount: formatCurrencyNoSymbol(stringToDecimal(item.totalAmount)),
				totalDownpayment: formatCurrencyNoSymbol(stringToDecimal(item.totalDownpayment)),
				totalPayments: formatCurrencyNoSymbol(stringToDecimal(item.totalPayments)),
				totalSales: formatCurrencyNoSymbol(stringToDecimal(totalSales)),
				totalBalance: formatCurrencyNoSymbol(stringToDecimal(item.totalBalance)),
				totalExpenses: formatCurrencyNoSymbol(stringToDecimal(item.totalExpenses)),
				totalIncome: formatCurrencyNoSymbol(stringToDecimal(totalIncome))
			};
		});
	};

	onMount(() => {
		sourceData = incomeData(sourceData);
		updateTable(sourceData);
		businesses = [...new Set(sourceData.map((item: any) => item.business))];
	});

	const downloadCsv = () => {
		let csvContent = 'data:text/csv;charset=utf-8';

		csvContent += ',Date,Sales,Downpayment,Payment,Income,Balance,Expenses,Net Income\n';

        sourceData.forEach((item: any) => {
			// Convert numbers to strings and enclose fields with commas in double quotes
			const row = [
				item._id,
				`"${item.totalAmount}"`,
				`"${item.totalDownpayment}"`,
				`"${item.totalPayments}"`,
				`"${item.totalSales}"`,
				`"${item.totalBalance}"`,
				`"${item.totalExpenses}"`,
				`"${item.totalIncome}"`
			];

			csvContent += row.join(',') + '\n';
		});

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'net-income.csv');
		document.body.appendChild(link);
		link.click();
	};
</script>

<div class="p-4">
	<section class="p-4 w-full gap-4">
		<div class="flex flex-col md:flex-row mb-4 gap-4">
			<!-- <label class="label flex-auto">
				<span>Business</span>
				<select
					class="input"
					name="business"
					bind:value={business}
					on:click={() => {
						filterByBusiness(business);
					}}
				>
					<option value="">All</option>
					{#each businesses as business}
						<option value={business}>{business}</option>
					{/each}
				</select></label
			> -->
			<!-- start date field and end date field -->
			<div class="flex gap-4 flex-col md:flex-row">
				<label class="label">
					<span>Start Date</span>
					<input
						class="input"
						type="date"
						name="startDate"
						bind:value={startDate}
						on:change={() => filterByDate(new Date(startDate), new Date(endDate))}
					/>
				</label>
				<label class="label">
					<span>End Date</span>
					<input
						class="input"
						type="date"
						name="endDate"
						bind:value={endDate}
						on:change={() => filterByDate(new Date(startDate), new Date(endDate))}
					/>
				</label>
			</div>
			<div class="flex justify-end">
				<button class="btn variant-filled h-8 my-auto" on:click={downloadCsv} title="Download Data"
					><Download /></button
				>
			</div>
		</div>

		{#key sourceData}
			<Table source={table} interactive={true} />
			<Paginator
				class="mt-4"
				bind:settings={paginationSettings}
				on:page={onPageChange}
				on:amount={onAmountChange}
				showFirstLastButtons={false}
				showPreviousNextButtons={true}
			/>
		{/key}
	</section>
</div>
