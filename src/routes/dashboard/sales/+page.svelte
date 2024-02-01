<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Drawer,
		getDrawerStore,
		Paginator,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, PaginationSettings, TableSource } from '@skeletonlabs/skeleton';
	import Create from '$lib/components/forms/sales/Create.svelte';
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
	let customerData: any = [];
	let productData: any = [];
	let totalSales: number = 0;
	let totalDownpayment: number = 0;
	let totalPayment: number = 0;
	let totalBalance: number = 0;

	let table: TableSource = {
		// A list of heading labels.
		head: [
			'Date',
			'Business',
			'Customer',
			'Company',
			'Addess',
			'OR No',
			'Amount',
			'DP',
			'Payment',
			'Balance',
			'MOD'
		],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, [
			'createdAt',
			'business',
			'customer',
			'company',
			'address',
			'receipt',
			'amount',
			'downpayment',
			'totalPayment',
			'balance',
			'paymentMethod'
		])
	};

	async function loadData() {
		try {
			let response = await fetch('/api/admin/sales', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let result = await response.json();
			sourceData = result.response.sales;
			customerData = result.response.customers;
			productData = result.response.products;

			salesData(sourceData);
			if (sourceData) updateTable(sourceData);
		} catch (error) {
			console.error(error);
		}
	}

	const drawerCreate: DrawerSettings = {
		id: 'createSalesOrder',
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
		let tempData = salesData(sourceData);
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
		let tempData = salesData(sourceData);
		let filteredData = tempData.filter((item: any) => {
			return new Date(item.createdAt) >= start && new Date(item.createdAt) <= end;
		});
		updateTable(filteredData);
	};

	const updateTable = (sourceData: any) => {
		sourceData = salesData(sourceData);
		paginationSettings.size = sourceData.length;
		let paginatedData = sourceData.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		table.body = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'customer',
			'company',
			'address',
			'receipt',
			'amount',
			'downpayment',
			'totalPayment',
			'balance',
			'paymentMethod'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'_id',
			'company',
			'address',
			'receipt',
			'amount',
			'downpayment',
			'totalPayment',
			'balance',
			'paymentMethod'
		]);

		if ($page.data.user.role == 'ADMINISTRATOR') {
			table.foot = [
				'Total',
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(
					totalDownpayment + totalPayment
				)}</div>`,
				'',
				'',
				'',
				'',
				`<div class="variant-filled-secondary px-2 rounded">${formatCurrency(totalSales)}</div>`,
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(
					totalDownpayment
				)}</div>`,
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(totalPayment)}</div>`,
				`<div class="variant-filled-error px-2 rounded">${formatCurrency(totalBalance)}</div>`,
				`<code class="code">${sourceData.length}</code>`
			];
		}
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
		goto(`/dashboard/sales/${e.detail[2]}`);
	}

	const salesData = (data: any) => {
		totalSales = 0;
		totalDownpayment = 0;
		totalPayment = 0;
		totalBalance = 0;
		return data.map((item: any) => {
			totalSales += parseFloat(stringToDecimal(item.amount));
			totalDownpayment += parseFloat(stringToDecimal(item.downpayment));
			totalPayment += parseFloat(stringToDecimal(item?.totalPayment || 0));
			totalBalance +=
				parseFloat(stringToDecimal(item.amount)) -
				(parseFloat(stringToDecimal(item.downpayment)) +
					parseFloat(stringToDecimal(item.totalPayment || 0)));

			return {
				...item,
				customer:
					customerData.find((customer: any) => customer._id === item.customerId).fullName || '',
				address:
					customerData.find((customer: any) => customer._id === item.customerId).address || '',
				company:
					customerData.find((customer: any) => customer._id === item.customerId).company || '',
				description: item.cart.map((cart: any) => {
					return ` [${cart.name}, ${cart.price} x ${cart.quantity} = ${cart.subtotal || 0.0}]`;
				}),
				amount: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item.amount))),
				downpayment: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item.downpayment))),
				totalPayment: formatCurrencyNoSymbol(parseFloat(item.totalPayment)),
				balance: formatCurrencyNoSymbol(stringToDecimal(item.balance)),
				createdAt: dateToString(item.createdAt)
			};
		});
	};

	$: filterTable(keyword);
	$: filterByDate(new Date(startDate), new Date(endDate));
	$: user = $page.data.user;
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Sales Order</h1>
	</header>
	<section class="flex p-4 w-full gap-4">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerCreate)}
			>Add <br />Sales Order</button
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
	{#if $drawerStore.id === 'createSalesOrder'}
		<Create {drawerStore} {loadData} {customerData} {productData} />
	{/if}
</Drawer>
