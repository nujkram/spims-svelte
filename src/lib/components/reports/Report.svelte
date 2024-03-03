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

	export let sales: any[];

	let keyword: string = '';
	let startDate: string = '';
	let endDate: string = '';
	let business: string = '';
	let sourceData: any = sales;
	let totalSales: number = 0;
	let totalDownpayment: number = 0;
	let totalPayment: number = 0;
	let totalBalance: number = 0;
	let payments: number = 0;
	let businesses: any[] = [];
	let filteredData: any = [];

	let table: TableSource = {
		// A list of heading labels.
		head: [
			'Date',
			'Business',
			'Customer',
			'Company',
			'OR No',
			'Description',
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
			'receipt',
			'description',
			'amount',
			'downpayment',
			'payment',
			'balance',
			'paymentMethod'
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
	const filterByDate = (start: Date, end: Date) => {
		paginationSettings.page = 0;
		let tempData = salesData(sourceData);
		business = '';
		let filteredData = tempData.filter((item: any) => {
			return new Date(item.createdAt) >= start && new Date(item.createdAt) <= end;
		});
		updateTable(filteredData);
	};

	const filterByBusiness = (business: string) => {
		sourceData = salesData(sourceData);
		paginationSettings.page = 0;
		let tempData = sourceData;
		if (business === '') {
			filteredData = [];
			return updateTable(sourceData);
		}
		filteredData = tempData.filter((item: any) => {
			// Check if any item in the cart array has the same business value as the provided business variable
			return item.business === business;
		});

		filteredData = filteredData.map((item) => {
			const cart = item.cart.filter((cartItem) => cartItem.business === business);
			return {
				...item,
				cart
			};
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
			'receipt',
			'description',
			'amount',
			'downpayment',
			'payment',
			'balance',
			'paymentMethod'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'createdAt',
			'business',
			'customer',
			'company',
			'receipt',
			'description',
			'amount',
			'downpayment',
			'payment',
			'balance',
			'paymentMethod'
		]);
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
			`<div class="variant-filled-success px-2 rounded">${formatCurrency(totalDownpayment)}</div>`,
			`<div class="variant-filled-success px-2 rounded">${formatCurrency(totalPayment)}</div>`,
			`<div class="variant-filled-error px-2 rounded">${formatCurrency(totalBalance)}</div>`,
			`<code class="code">${sourceData.length}</code>`
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
		updateTable(sourceData);
	};

	// pagination event handlers
	const onPageChange = (e: CustomEvent): void => {
		paginationSettings.page = e.detail;
		updateTable(sourceData);
	};

	const salesData = (data: any) => {
		totalSales = 0;
		totalDownpayment = 0;
		totalPayment = 0;
		totalBalance = 0;
		payments = 0;

		return data.map((item: any) => {
			item.amount = 0;
			item.cart.forEach((cart: any) => {
				item.amount += parseFloat(stringToDecimal(cart.subtotal));
			});
			totalSales += parseFloat(stringToDecimal(item.amount));
			totalDownpayment += parseFloat(stringToDecimal(item.downpayment));
			totalPayment += parseFloat(stringToDecimal(item?.totalPayment || 0));
			totalBalance +=
				parseFloat(stringToDecimal(item.amount)) -
				(parseFloat(stringToDecimal(item.downpayment)) +
					parseFloat(stringToDecimal(item.totalPayment || 0)));

			payments = 0;
			if (item && item?.payments) {
				item.payments.forEach((payment: any) => {
					payments += parseFloat(stringToDecimal(payment.amount));
				});
			}
		

			return {
				...item,
				customer: item.customer.fullName || item.customer,
				address: item?.customer?.address || item.address || '',
				company: item?.customer?.company || item.company || '',
				description: item.cart.map((cart: any) => {
					return ` [${cart.name}, ${cart.price} x ${cart.quantity} = ${cart.subtotal || 0.0}]`;
				}),
				amount: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item.amount))),
				downpayment: formatCurrencyNoSymbol(parseFloat(stringToDecimal(item.downpayment))),
				totalPayment: item.totalPayment,
				payment: formatCurrencyNoSymbol(payments),
				balance: formatCurrencyNoSymbol(stringToDecimal(item.balance)),
				createdAt: dateToString(item.createdAt)
			};
		});
	};

	onMount(() => {
		sourceData = salesData(sourceData);
		updateTable(sourceData);
		businesses = [...new Set(sales.map((item: any) => item.business))];
	});

	const downloadCsv = () => {
		let csvContent = 'data:text/csv;charset=utf-8';

		csvContent +=
			',Date,Business,Customer,Company,OR No,Description,Amount,DP,Payment,Balance,MOD\n';

		if (filteredData.length > 0) {
			filteredData.forEach((item: any) => {
				// Convert numbers to strings and enclose fields with commas in double quotes
				const row = [
					item.createdAt,
					item.business,
					item.customer,
					item.company,
					item.receipt,
					`"${item.description}"`,
					`"${item.amount}"`,
					`"${item.downpayment}"`,
					`"${item.totalPayment}"`,
					`"${item.balance}"`,
					item.paymentMethod
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
			'Estimated Income',
			`"${formatCurrencyNoSymbol(totalSales)}"`,
			'BALANCE',
			`"${formatCurrencyNoSymbol(totalBalance)}"\n`,
			'Downpayment',
			`"${formatCurrencyNoSymbol(totalDownpayment)}"\n`,
			'Payment',
			`"${formatCurrencyNoSymbol(totalPayment)}"\n`,
			'Income',
			`"${formatCurrencyNoSymbol(
				stringToDecimal(totalDownpayment) + stringToDecimal(totalPayment)
			)}"\n`
		];
		csvContent += summary.join(',') + '\n';

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'sales.csv');
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
						filterByBusiness(business);
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
