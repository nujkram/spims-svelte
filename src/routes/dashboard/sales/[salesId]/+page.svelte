<script lang="ts">
	import { Avatar, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Update from '$lib/components/forms/sales/Update.svelte';
	import dateToString from '$lib/utils/dateHelper';
	import { formatCurrency, stringToDecimal } from '$lib/utils/currencyHelper.js';
	import { onMount } from 'svelte';
	export let data;

	let { sales } = data;
	let sourceData: any = [];
	let customerData: any = [];
	let productData: any = [];
	let cart = sales?.cart;

	// drawer settings
	const drawerUpdate: DrawerSettings = {
		id: 'updateCustomer',
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

	// get full name initial from product.fullname
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
		} catch (error) {
			console.error(error);
		}
	}

	onMount(async () => {
		await loadData();
	});
</script>

<div class="card p-4">
	<header class="card-header flex justify-center">
		<Avatar initials={fullNameInitial} background="bg-primary-500" fontSize={250} width="w-28" />
	</header>
	<section class="p-4 flex flex-col items-center">
		<h1 class="h1">{sales?.customer?.fullName || 'NA'}</h1>
		<h2 class="h2 italic">{sales?.customer?.company || 'NA'}</h2>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">TIN</h3>
				<p class="p">{sales?.customer?.tin || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Email</h3>
				<p class="p">{sales?.customer?.email || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Phone</h3>
				<p class="p">{sales?.customer?.phone || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Address</h3>
				<p class="p">{sales?.customer?.address || 'NA'}</p>
			</div>
		</div>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">Created At</h3>
				<p class="p">{sales?.createdAt ? dateToString(sales?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created By</h3>
				<p class="p">{sales?.createdBy.fullName || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update At</h3>
				<p class="p">{sales?.updatedAt ? dateToString(sales?.updatedAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update By</h3>
				<p class="p">{sales?.updatedBy.fullName || 'NA'}</p>
			</div>
		</div>
		<h2 class="h2 border-t-2 pt-4 mt-6 w-full text-center">
			{formatCurrency(stringToDecimal(sales?.amount) - stringToDecimal(sales?.downpayment)) || 0.0}
		</h2>
		<p class="p text-xl">Balance</p>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">Official Receipt</h3>
				<p class="p">{sales?.receipt || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Downpayment</h3>
				<p class="p w-full text-right">{formatCurrency(sales?.downpayment) || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Total Amount</h3>
				<p class="p w-full text-right">{formatCurrency(sales?.amount) || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Payment Method</h3>
				<p class="p">{sales?.paymentMethod || 'NA'}</p>
			</div>
		</div>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">Created At</h3>
				<p class="p">{sales?.createdAt ? dateToString(sales?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created By</h3>
				<p class="p">{sales?.createdBy.fullName || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update At</h3>
				<p class="p">{sales?.updatedAt ? dateToString(sales?.updatedAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update By</h3>
				<p class="p">{sales?.updatedBy.fullName || 'NA'}</p>
			</div>
		</div>
	</section>
	<footer class="card-footer flex justify-end border-t-2 p-4">
		<div class="btn-group variant-filled overflow-auto">
			<button type="button" on:click={() => drawerStore.open(drawerUpdate)}>Edit</button>
			<button type="button" on:click={() => window.history.back()}>Close</button>
		</div>
	</footer>
</div>

<Drawer>
	{#if $drawerStore.id === 'updateCustomer'}
		<Update
			id={sales?._id}
			moduleName={'sales'}
			{sales}
			customer={sales?.customer?.fullName}
			{drawerStore}
			{customerData}
			{productData}
			{loadData}
		/>
	{/if}
</Drawer>
