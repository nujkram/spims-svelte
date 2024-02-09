<script lang="ts">
	import {
		Avatar,
		Drawer,
		getDrawerStore,
		getToastStore,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, TableSource, ToastSettings } from '@skeletonlabs/skeleton';
	import Update from '$lib/components/forms/sales/Update.svelte';
	import Payment from '$lib/components/forms/sales/Payment.svelte';
	import dateToString from '$lib/utils/dateHelper';
	import { formatCurrency, stringToDecimal } from '$lib/utils/currencyHelper.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let data;

	let { sales } = data;
	let sourceData: any = [];
	let customerData: any = [];
	let productData: any = [];
	let cartData: any = [];
	let tableProducts: TableSource = {
		head: ['Name', 'Price', 'Quantity', 'Subtotal'],
		body: tableMapperValues(sales?.cart, ['name', 'price', 'quantity', 'subtotal'])
	};

	let tablePayments: TableSource = {
		head: ['Date', 'MOD', 'Amount'],
		body: tableMapperValues(sales?.payments || [], ['createdAt', 'paymentMethod', 'amount'])
	};

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const confirmSettings: ToastSettings = {
		message: 'This action is irreversible. Are you sure you want to delete this record?',
		background: 'bg-yellow-600',
		action: {
			label: 'Yes',
			response: () => handleDelete()
		},
		timeout: 8000
	};

	// drawer settings
	const drawerUpdate: DrawerSettings = {
		id: 'updateSalesOrder',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[1920px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerPayment: DrawerSettings = {
		id: 'paymentSalesOrder',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[480px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	// get full name initial from customer.fullname
	let fullNameInitial = sales?.customer?.fullName
		.split(' ')
		.map((name: string) => name[0])
		.join('');

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
			cartData = sourceData?.cart;
		} catch (error) {
			console.error(error);
		}
	}

	const handleDelete = async () => {
		try {
			let response = await fetch('/api/admin/sales/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ _id: sales?._id })
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			goto('/dashboard/sales');
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	};

	onMount(async () => {
		await loadData();
	});
</script>

<div class="card p-4">
	<header class="card-header flex items-center justify-between gap-4">
		<div class="flex gap-4 items-center">
			<Avatar initials={fullNameInitial} background="bg-primary-500" fontSize={250} width="w-28" />
			<h1 class="h1">{sales?.customer?.fullName || 'NA'}</h1>
		</div>
		<div>
			<div class="btn-group variant-filled overflow-auto">
				<button type="button" on:click={() => drawerStore.open(drawerPayment)}>Add Payment</button>
				<button type="button" on:click={() => drawerStore.open(drawerUpdate)}>Edit</button>
				<button type="button" on:click={() => toastStore.trigger(confirmSettings)}>Delete</button>
				<button type="button" on:click={() => window.history.back()}>Close</button>
			</div>
		</div>
	</header>
	<section class="p-4 flex flex-col md:flex-row gap-4">
		<div class="flex flex-col w-full gap-4 border-r-0 md:border-r">
			<div class="flex flex-col">
				<h4 class="h4">Date</h4>
				<p class="p text-lg">{sales?.createdAt ? dateToString(sales?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Email</h4>
				<p class="p text-lg">{sales?.customer?.email || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">TIN</h4>
				<p class="p text-lg">{sales?.customer?.tin || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Phone</h4>
				<p class="p text-lg">{sales?.customer?.phone || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Address</h4>
				<p class="p text-lg">{sales?.customer?.address || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Date Updated</h4>
				<p class="p text-lg">{sales?.updatedAt ? dateToString(sales?.updatedAt) : 'NA'}</p>
			</div>
		</div>
		<div class="flex flex-col w-full gap-4">
			<div class="flex flex-col w-full">
				<h2 class="h2 mb-4 w-full">Cart</h2>
				<Table source={tableProducts} />
			</div>
			<div class="flex flex-col w-full px-3">
				<div class="flex justify-between">
					<p>Total</p>
					<p>{formatCurrency(sales?.amount) || 0.0}</p>
				</div>
				<div class="flex justify-between">
					<p>Downpayment</p>
					<p>{formatCurrency(sales?.downpayment) || 0.0}</p>
				</div>
				<div class="flex justify-between">
					<p>Payment</p>
					<p>{formatCurrency(sales?.totalPayment) || 0.0}</p>
				</div>
				<div class="flex justify-between">
					<p>Balance</p>
					<p>{formatCurrency(sales?.balance) || 0.0}</p>
				</div>
			</div>
			<div class="flex flex-col w-full">
				<h2 class="h2 mb-4 w-full">Payments</h2>
				<Table source={tablePayments} />
			</div>
		</div>
	</section>
</div>

<Drawer>
	{#if $drawerStore.id === 'updateSalesOrder'}
		<Update
			id={sales?._id}
			moduleName={'sales'}
			{sales}
			customer={sales?.customer?.fullName}
			{drawerStore}
			{customerData}
			{productData}
		/>
	{:else if $drawerStore.id === 'paymentSalesOrder'}
		<Payment id={sales?._id} {drawerStore} />
	{/if}
</Drawer>
