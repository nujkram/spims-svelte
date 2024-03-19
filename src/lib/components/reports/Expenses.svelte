<script lang="ts">
	import { onMount } from 'svelte';
	import { Table, Paginator, tableMapperValues, filter } from '@skeletonlabs/skeleton';
	import type { PaginationSettings, TableSource } from '@skeletonlabs/skeleton';
	import { Download } from '$lib/components/icons/index';
	import {
		formatCurrency,
		formatCurrencyNoSymbol,
		stringToDecimal
	} from '$lib/utils/currencyHelper';
	import dateToString from '$lib/utils/dateHelper';

	export let expenses: any;

	let keyword: string = '';
	let startDate: string = '';
	let endDate: string = '';
	let business: string = '';
	let sourceData: any = expenses;
	let totalExpenses: number = 0;
	let businesses: any[] = [];
	let filteredData: any = [];

	let table: TableSource = {
		// A list of heading labels.
		head: [
			'Date',
			'Business',
			'Name',
			'Invoice',
			'Description',
			'Items',
			'Amount',
		],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, [
			'createdAt',
			'business',
			'name',
			'invoice',
			'description',
			'items',
			'totalAmount',
		])
	};

	const filterTable = (keyword: string) => {
		paginationSettings.page = 0;
		let tempData = sourceData;
		if (keyword.length > 0) {
			filteredData = tempData.filter((item: any) => {
				return (
					item.customer.includes(keyword.toUpperCase()) ||
					item?.address.includes(keyword.toUpperCase()) ||
					item?.company.includes(keyword.toUpperCase())
				);
			});
			updateTable(filteredData);
		} else {
			filteredData = [];
			updateTable(sourceData);
		}
	};

	// filter sourceData createdAt by date between start and end
	const filterData = (start: Date, end: Date) => {
		paginationSettings.page = 0;
		end.setHours(23, 59, 59);
		let tempData = expensesData(sourceData);

		if (business === '' && start !== null && end !== null) {
			filteredData = tempData.filter((item: any) => {
				return (
					new Date(item.createdAt) >= new Date(start) &&
					new Date(item.createdAt) <= new Date(end)
				);
			});
		} else if (business !== '' && start !== null && end !== null) {
			filteredData = tempData.filter((item: any) => {
				return (
					new Date(item.createdAt) >= new Date(start) &&
					new Date(item.createdAt) <= new Date(end)
				);
			});
			filteredData.map((item) => {
				const cart = item.cart.filter((cartItem) => cartItem.business === business);
				item.cart
			});
		} else if (business === '' && start === null && end === null) {
			filteredData = tempData;
		} else {
			filteredData = sourceData.filter((item: any) => {
				return item.business === business;
			});
			filteredData.map((item) => {
				const cart = item.cart.filter((cartItem) => cartItem.business === business);
				return {
					...item,
					cart
				};
			});
		}
		updateTable(filteredData);
	};

	const updateTable = (sourceData: any) => {
		sourceData = expensesData(sourceData);
		paginationSettings.size = sourceData.length;
		let paginatedData = sourceData.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		table.body = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'name',
			'invoice',
			'description',
			'items',
			'totalAmount',
		]);
		table.meta = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'name',
			'invoice',
			'description',
			'items',
			'totalAmount',
		]);
		table.foot = [
			'Total',
			'',
			'',
			'',
			'',
			`<code class="code">${sourceData.length}</code>`,
			`<div class="variant-filled-error px-2 rounded">${formatCurrency(totalExpenses)}</div>`
		];
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
		if (filteredData.length > 0) updateTable(filteredData);
		else updateTable(sourceData);
	};

	// pagination event handlers
	const onPageChange = (e: CustomEvent): void => {
		paginationSettings.page = e.detail;
		if (filteredData.length > 0) updateTable(filteredData);
		else updateTable(sourceData);
	};

	const expensesData = (data: any) => {
		totalExpenses = 0;
		return data.map((item: any) => {
			totalExpenses += parseFloat(stringToDecimal(item.totalAmount));

			return {
				...item,
				items: item.cart.map((cart: any) => {
					return ` [${cart.name}, ${formatCurrency(cart.amount)}, ${cart.paymentMethod}]`;
				}),
				totalAmount: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item?.totalAmount || 0))),
				createdAt: dateToString(item.createdAt)
			};
		});
	};

	onMount(() => {
		sourceData = expensesData(sourceData);
		updateTable(sourceData);
		businesses = [...new Set(expenses.map((item: any) => item.business))];
	});

	const downloadCsv = () => {
		let csvContent = 'data:text/csv;charset=utf-8';

		csvContent += ',Date,Business,Name,Invoice,Description,Items,Amount\n';

		if (filteredData.length > 0) {
			filteredData.forEach((item: any) => {
				// Convert numbers to strings and enclose fields with commas in double quotes
				const row = [
					item.createdAt,
					item.business,
					item.name,
					item.invoice,
					item.description,
					`"${item.items}"`,
					`"${item.totalAmount}"`
				];

				csvContent += row.join(',') + '\n';
			});
		} else {
			sourceData.forEach((item: any) => {
				// Convert numbers to strings and enclose fields with commas in double quotes
				const row = [
					item.createdAt,
					item.business,
					item.customer,
					item.company,
					`"${item.address}"`,
					item.receipt,
					`"${item.amount}"`,
					`"${item.downpayment}"`,
					`"${item.totalPayment}"`,
					`"${item.balance}"`,
					item.paymentMethod
				];

				csvContent += row.join(',') + '\n';
			});
		}

		const summary = [
			'\n',
			'Total Expenses',
			`"${formatCurrencyNoSymbol(totalExpenses)}"`
		];
		csvContent += summary.join(',') + '\n';

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'expenses.csv');
		document.body.appendChild(link);
		link.click();
	};
</script>

<div class="p-4">
	<section class="p-4 w-full gap-4">
		<div class="flex flex-col md:flex-row mb-4 gap-4">
			<label class="label flex-auto">
				<span>Business</span>
				<select
					class="input"
					name="business"
					bind:value={business}
					on:click={() => {
						filterData(new Date(startDate), new Date(endDate));
					}}
				>
					<option value="">All</option>
					{#each businesses as business}
						<option value={business}>{business}</option>
					{/each}
				</select></label
			>
			<label class="label flex-auto">
				<span>Search</span>
				<input
					class="input"
					type="text"
					placeholder="Search by customer, company, or address"
					name="keyword"
					bind:value={keyword}
					on:input={() => filterTable(keyword)}
				/>
			</label>
			<!-- start date field and end date field -->
			<div class="flex gap-4 flex-col md:flex-row">
				<label class="label">
					<span>Start Date</span>
					<input
						class="input"
						type="date"
						name="startDate"
						bind:value={startDate}
						on:change={() => filterData(new Date(startDate), new Date(endDate))}
					/>
				</label>
				<label class="label">
					<span>End Date</span>
					<input
						class="input"
						type="date"
						name="endDate"
						bind:value={endDate}
						on:change={() => filterData(new Date(startDate), new Date(endDate))}
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
