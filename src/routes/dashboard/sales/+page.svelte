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

	// Define a basic Customer interface
	interface Customer {
		_id: string;
		fullName?: string; // Make properties optional if they might not exist
		address?: string;
		company?: string;
		// Add other relevant customer properties if needed
	}

	let isReady: Boolean = false;
	let keyword: string = '';
	let startDate: string = '';
	let endDate: string = '';

	// --- Year Filter State ---
	const actualCurrentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => actualCurrentYear - i);
	let selectedYear = actualCurrentYear; // Default to current year
	// ------------------------

	let allSalesData: any = []; // Store the raw data fetched for the selected year
	let filteredSalesData: any = []; // Store data after client-side filtering (keyword, date)
	let customerData: Customer[] = []; // Use the Customer interface
	let productData: any = [];
	let totalSales: number = 0;
	let totalDownpayment: number = 0;
	let totalPayment: number = 0;
	let totalBalance: number = 0;
	let currentLoadedYear: number | null = null; // Track which year's data is currently loaded

	let table: TableSource = {
		head: [
			'Date',
			'Business',
			'Customer',
			'Description',
			'Amount',
			'DP',
			'Payment',
			'Balance',
			'MOD',
			'Status'
		],
		body: [], // Start empty
		meta: [], // Start empty
		foot: [] // Start empty
	};

	// Fetch data based on the selected year
	async function loadDataForYear(year: number) {
		if (currentLoadedYear === year) return; // Skip if we already have this year's data

		isReady = false; // Show loading state
		try {
			let response = await fetch(`/api/admin/sales?year=${year}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.statusText}`);
			}

			let result = await response.json();
			allSalesData = result.response.sales || []; // Store fetched data
			customerData = result.response.customers || [];
			productData = result.response.products || [];
			currentLoadedYear = year; // Update the currently loaded year

			applyFiltersAndCalculateTotals(); // Apply client-side filters and update table
		} catch (error) {
			console.error('Failed to load sales data:', error);
			allSalesData = []; // Clear data on error
			applyFiltersAndCalculateTotals(); // Update table with empty data
		} finally {
			isReady = true; // Hide loading state
		}
	}

	const drawerCreate: DrawerSettings = {
		id: 'createSalesOrder',
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[1920px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	// --- Client-Side Filtering & Table Update Logic ---
	function applyFiltersAndCalculateTotals() {
		let dataToFilter = [...allSalesData]; // Work on a copy of the fetched data

		// 1. Apply keyword filter
		if (keyword.trim().length > 0) {
			const upperKeyword = keyword.trim().toUpperCase();
			// Pre-process customer lookups for efficiency
			const customerMap = new Map<string, Customer>(customerData.map((c) => [c._id, c])); // Specify types for Map
			dataToFilter = dataToFilter.filter((item: any) => {
				const customer = customerMap.get(item.customerId);
				if (!customer) return false; // Skip if customer not found
				return (
					customer.fullName?.toUpperCase().includes(upperKeyword) ||
					customer.address?.toUpperCase().includes(upperKeyword) ||
					customer.company?.toUpperCase().includes(upperKeyword)
				);
			});
		}

		// 2. Apply date range filter (if start or end date is set)
		if (startDate || endDate) {
			const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
			const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

			dataToFilter = dataToFilter.filter((item: any) => {
				const itemDate = new Date(item.createdAt).getTime();
				const afterStart = start ? itemDate >= start : true;
				const beforeEnd = end ? itemDate <= end : true;
				return afterStart && beforeEnd;
			});
		}

		// 3. Process data for display (formatting, calculations)
		filteredSalesData = processSalesDataForDisplay(dataToFilter);

		// 4. Update table with filtered and processed data
		updateTable(filteredSalesData);
	}

	const processSalesDataForDisplay = (data: any[]) => {
		// Reset totals before recalculating based on *filtered* data
		totalSales = 0;
		totalDownpayment = 0;
		totalPayment = 0;
		totalBalance = 0;

		return data.map((item: any) => {
			const itemAmount = parseFloat(stringToDecimal(item.amount));
			const itemDP = parseFloat(stringToDecimal(item.downpayment));
			const itemTotalPayment = parseFloat(stringToDecimal(item?.totalPayment || 0)); // Already calculated in API
			let itemBalance = itemAmount - (itemDP + itemTotalPayment);
			if (itemBalance < 0.01 && itemBalance > -0.01) itemBalance = 0; // Handle floating point issues near zero

			totalSales += itemAmount;
			totalDownpayment += itemDP;
			totalPayment += itemTotalPayment; // Sum up the pre-calculated total payment
			totalBalance += itemBalance;

			let displayPayments = 0;
			if (item.payments && Array.isArray(item.payments)) {
				displayPayments = item.payments.reduce((acc: number, payment: any) => {
					return acc + parseFloat(stringToDecimal(payment.amount));
				}, 0);
			}

			let status =
				itemBalance <= 0
					? '<div class="variant-soft-success text-center px-2 rounded">Paid</div>'
					: '<div class="variant-soft-warning text-center px-2 rounded">Unpaid</div>';

			const customer = customerData.find((c: any) => c._id === item.customerId);

			return {
				...item,
				customer: customer?.fullName || 'N/A',
				description:
					item.cart
						?.map((cart: any) => {
							return ` [${cart.name} ${cart?.description || ''}, ${cart.price} x ${
								cart.quantity
							} = ${cart.subtotal || 0.0}] <br>`;
						})
						.join('') || 'N/A',
				amount: formatCurrencyNoSymbol(itemAmount),
				downpayment: formatCurrencyNoSymbol(itemDP),
				payment: formatCurrencyNoSymbol(displayPayments), // Show sum of individual payments
				balance: formatCurrencyNoSymbol(itemBalance),
				createdAt: dateToString(item.createdAt, 'yyyy-MM-dd'), // Simpler date format
				status
			};
		});
	};

	const updateTable = (processedData: any[]) => {
		paginationSettings.size = processedData.length;
		// Ensure page number is valid after filtering
		if (paginationSettings.page * paginationSettings.limit >= paginationSettings.size) {
			paginationSettings.page = Math.max(
				0,
				Math.ceil(paginationSettings.size / paginationSettings.limit) - 1
			);
		}

		let paginatedData = processedData.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		table.body = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'customer',
			'description',
			'amount',
			'downpayment',
			'payment',
			'balance',
			'paymentMethod',
			'status'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'_id', // Keep ID for row click
			'description',
			'amount',
			'downpayment',
			'payment',
			'balance',
			'paymentMethod',
			'status'
		]);

		if ($page.data.user?.role == 'ADMINISTRATOR') {
			// Totals are now calculated based on the FILTERED data
			table.foot = [
				'Total',
				'',
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(
					totalDownpayment + totalPayment
				)}</div>`, // Income
				'', // Desc
				`<div class="variant-filled-secondary px-2 rounded">${formatCurrency(totalSales)}</div>`, // Amount
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(
					totalDownpayment
				)}</div>`, // DP
				`<div class="variant-filled-success px-2 rounded">${formatCurrency(totalPayment)}</div>`, // Payment
				`<div class="variant-filled-warning px-2 rounded">${formatCurrency(totalBalance)}</div>`, // Balance
				'', // MOD
				`<code class="code">${processedData.length} / ${allSalesData.length}</code>` // Show filtered / total for year
			];
		} else {
			table.foot = [];
		}
	};

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: 0, // Start with 0
		amounts: [10, 20, 25, 30, 50, 100]
	} satisfies PaginationSettings;

	function onPageChange(e: CustomEvent): void {
		paginationSettings.page = e.detail; // Corrected typo
		updateTable(filteredSalesData); // Update table with current filtered data
	}

	function onAmountChange(e: CustomEvent): void {
		paginationSettings.limit = e.detail; // Corrected typo
		paginationSettings.page = 0; // Corrected typo & reset to first page on limit change
		updateTable(filteredSalesData); // Update table with current filtered data
	}

	onMount(async () => {
		await loadDataForYear(selectedYear); // Load initial data for default year
	});

	function tableSelectHandler(e: CustomEvent): void {
		const selectedId = e.detail[2]; // Get ID from meta
		if (selectedId) {
			goto(`/dashboard/sales/${selectedId}`);
		}
	}

	// --- Reactive Triggers ---
	$: if (isReady) {
		// This block now correctly depends on keyword, startDate, and endDate.
		// It will re-run whenever any of these change *after* the initial load.
		applyFiltersAndCalculateTotals();
		// Explicitly mentioning them ensures reactivity
		keyword;
		startDate;
		endDate;
	}

	$: if (selectedYear && isReady && currentLoadedYear !== selectedYear) {
		// Load new data when selectedYear changes (after initial mount)
		loadDataForYear(selectedYear);
	}
</script>

<div class="card mb-4">
	<header class="card-header flex justify-between items-center">
		<h1 class="h3">Sales Order</h1>
		<!-- Year Selector -->
		<div class="flex items-center gap-2">
			<span class="text-surface-500">Year:</span>
			<select bind:value={selectedYear} class="select" disabled={!isReady}>
				{#each yearOptions as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>
	</header>
	{#if !isReady}
		<section class="p-4">
			<p>Loading sales data...</p>
			<!-- Optional: Add skeleton loaders here -->
		</section>
	{:else}
		<section class="flex p-4 w-full gap-4 flex-wrap">
			<button
				class="btn variant-filled-primary self-end"
				on:click={() => drawerStore.open(drawerCreate)}
			>
				Add Sales Order
			</button>
			<label class="label flex-auto min-w-[300px]">
				<span>Search</span>
				<input
					class="input"
					type="search"
					placeholder="Search Customer, Company, Address..."
					name="keyword"
					bind:value={keyword}
				/>
			</label>
			<!-- Date Range Filter -->
			<div class="flex gap-4 flex-wrap self-end">
				<label class="label">
					<span>Start Date</span>
					<input class="input" type="date" name="startDate" bind:value={startDate} />
				</label>
				<label class="label">
					<span>End Date</span>
					<input class="input" type="date" name="endDate" bind:value={endDate} />
				</label>
			</div>
		</section>
	{/if}
</div>

{#key allSalesData}
	<!-- Re-render table section when data changes -->
	{#if isReady && filteredSalesData.length > 0}
		<Table source={table} interactive={true} on:selected={tableSelectHandler} />
		<Paginator
			class="mt-4"
			bind:settings={paginationSettings}
			on:page={onPageChange}
			on:amount={onAmountChange}
			showFirstLastButtons={false}
			showPreviousNextButtons={true}
		/>
	{:else if isReady}
		<div class="card p-4 text-center">
			<p>No sales records found for the selected criteria.</p>
		</div>
	{/if}
{/key}

<Drawer>
	{#if $drawerStore.id === 'createSalesOrder'}
		<Create {drawerStore} {loadDataForYear} bind:selectedYear {customerData} {productData} />
	{/if}
</Drawer>
