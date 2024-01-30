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
	import Update from '$lib/components/forms/expenses/Update.svelte';
	import dateToString from '$lib/utils/dateHelper';
	import { formatCurrency, stringToDecimal } from '$lib/utils/currencyHelper.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let data;

	let { expenses } = data;
	let sourceData: any = [];
	let cartData: any = [];
	let table: TableSource = {
		head: ['Name', 'Amount', 'MOD'],
		body: tableMapperValues(expenses?.cart, ['name', 'amount', 'paymentMethod']),
		foot: ['Total', formatCurrency(expenses?.totalAmount)]
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
		id: 'updateExpenses',
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

	// get full name initial from name
	let fullNameInitial = expenses?.name
		.split(' ')
		.map((name: string) => name[0])
		.join('');

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
			cartData = sourceData?.cart;
		} catch (error) {
			console.error(error);
		}
	}

	const handleDelete = async () => {
		try {
			let response = await fetch('/api/admin/expenses/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ _id: expenses?._id })
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			goto('/dashboard/expenses');
		}
		catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
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
		<h1 class="h1">{expenses?.name || 'NA'}</h1>
		<h2 class="h2 italic">{expenses?.description || 'NA'}</h2>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
            <div class="flex flex-col items-center">
				<h3 class="h3">Invoice No</h3>
				<p class="p">{expenses?.invoice || 'NA'}</p>
			</div>
            <div class="flex flex-col items-center">
				<h3 class="h3">Business</h3>
				<p class="p">{expenses?.business || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created At</h3>
				<p class="p">{expenses?.createdAt ? dateToString(expenses?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created By</h3>
				<p class="p">{expenses?.createdBy.fullName || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update At</h3>
				<p class="p">{expenses?.updatedAt ? dateToString(expenses?.updatedAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update By</h3>
				<p class="p">{expenses?.updatedBy.fullName || 'NA'}</p>
			</div>
		</div>
		<h2 class="h2 border-t-2 pt-4 mt-6 w-full text-center">
			{formatCurrency(stringToDecimal(expenses?.totalAmount)) || 0.0}
		</h2>
		<p class="p text-xl">Total</p>
		
		<div class="flex w-full mt-6">
			<Table source={table} />
		</div>
	</section>
	<footer class="card-footer flex justify-end border-t-2 p-4">
		<div class="btn-group variant-filled overflow-auto">
			<button type="button" on:click={() => drawerStore.open(drawerUpdate)}>Edit</button>
			<button type="button" on:click={() => toastStore.trigger(confirmSettings)}>Delete</button>
			<button type="button" on:click={() => window.history.back()}>Close</button>
		</div>
	</footer>
</div>

<Drawer>
	{#if $drawerStore.id === 'updateExpenses'}
		<Update
			id={expenses?._id}
			moduleName={'expenses'}
			{expenses}
			{drawerStore}
            {sourceData}
		/>
	{/if}
</Drawer>
