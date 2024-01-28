<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Drawer,
		getDrawerStore,
		Paginator,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, PaginationSettings, TableSource } from '@skeletonlabs/skeleton';
	import Create from '$lib/components/forms/expenses/Create.svelte';
	import { goto } from '$app/navigation';
	import {
		formatCurrency,
		formatCurrencyNoSymbol,
		stringToDecimal
	} from '$lib/utils/currencyHelper';
	import dateToString from '$lib/utils/dateHelper';

	let keyword: string = '';
	let startDate: string = '';
	let endDate: string = '';

	let sourceData: any = [];
	let cartData: any = [];
	let totalExpenses: number = 0;

	let table: TableSource = {
		// A list of heading labels.
		head: [
			'Date',
			'Name',
            'Invoice',
            'Description',
            'Items',
            'Amount',
		],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, [
			'createdAt',
			'name',
			'invoice',
			'description',
			'items',
			'amount',
		])
	};

	async function loadData() {
		try {
			let response = await fetch('/api/admin/expenses', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let result = await response.json();
			sourceData = result.response;
			expensesData(sourceData);
			if (sourceData) updateTable(sourceData);
			// get all cart data
			cartData = sourceData.map((item: any) => {
				// return item.cart objects inside the array
				return Object.values(item.cart);
			});
		} catch (error) {
			console.error(error);
		}
	}

	const drawerCreate: DrawerSettings = {
		id: 'createExpenses',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[1920px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	const filterTable = (keyword: string) => {
		paginationSettings.page = 0;
		let tempData = expensesData(sourceData);
		if (keyword.length > 0) {
			let filteredData = tempData.filter((item: any) => {
				return (
					item.customer.includes(keyword.toUpperCase()) ||
					item.address.includes(keyword.toUpperCase()) ||
					item.company.includes(keyword.toUpperCase())
				);
			});

			updateTable(filteredData);
		} else {
			updateTable(sourceData);
		}
	};

	// filter sourceData createdAt by date between start and end
	const filterByDate = (start: Date, end: Date) => {
		paginationSettings.page = 0;
		let tempData = expensesData(sourceData);
		let filteredData = tempData.filter((item: any) => {
			return new Date(item.createdAt) >= start && new Date(item.createdAt) <= end;
		});
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
			'name',
			'invoice',
			'description',
			'items',
			'totalAmount',
		]);
		table.meta = tableMapperValues(paginatedData, [
			'createdAt',
			'_id',
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
			`<code class="code">${sourceData.length}</code>`,
			`<div class="variant-filled-error px-2 rounded">${formatCurrency(totalExpenses)}</div>`
		];
	};

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: sourceData.length,
		amounts: [10, 20, 25, 30, 50, 100]
	} satisfies PaginationSettings;

	// pagination event handlers
	function onPageChange(e: CustomEvent): void {
		paginationSettings.page = e.detail;
		updateTable(sourceData);
	}

	// pagination event handlers
	function onAmountChange(e: CustomEvent): void {
		paginationSettings.limit = e.detail;
		updateTable(sourceData);
	}

	onMount(async () => {
		await loadData();
	});

	// table row select handler
	function tableSelectHandler(e: CustomEvent): void {
		goto(`/dashboard/expenses/${e.detail[1]}`);
	}

	const expensesData = (data: any) => {
		totalExpenses = 0;
		return data.map((item: any) => {
			totalExpenses += parseFloat(stringToDecimal(item.totalAmount));
			console.log('item', item)
			return {
				...item,
				items: item.cart.map((cart: any) => {
					return ` [${cart.name}, ${formatCurrency(cart.amount)}, ${cart.paymentMethod}]`;
				}),
				totalAmount: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item.totalAmount))),
				createdAt: dateToString(item.createdAt)
			};
		});
	};

	$: filterTable(keyword);
	$: filterByDate(new Date(startDate), new Date(endDate));
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Expenses</h1>
	</header>
	<section class="flex p-4 w-full gap-4">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerCreate)}
			>Add <br />Expenses</button
		>
		<label class="label flex-auto">
			<span>Search</span>
			<input
				class="input"
				type="text"
				placeholder="Search"
				name="keyword"
				bind:value={keyword}
				on:input={() => filterTable(keyword)}
			/>
		</label>
		<!-- start date field and end date field -->
		<div class="flex gap-4">
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
	</section>
</div>

{#key sourceData}
	<Table source={table} interactive={true} on:selected={tableSelectHandler} />
	<Paginator
		class="mt-4"
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		showFirstLastButtons={false}
		showPreviousNextButtons={true}
	/>
{/key}
<Drawer>
	{#if $drawerStore.id === 'createExpenses'}
		<Create {drawerStore} {loadData} {sourceData} />
	{/if}
</Drawer>
