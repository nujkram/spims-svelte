<script lang="ts">
	import { Avatar, Drawer, getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import Update from '$lib/components/forms/customer/Update.svelte';
	import dateToString from '$lib/utils/dateHelper';
	export let data;

	let { customer, customers } = data;

	// drawer settings
	const drawerUpdate: DrawerSettings = {
		id: 'updateCustomer',
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

	// get full name initial from product.fullname
	let fullNameInitial = customer?.fullName
		.split(' ')
		.map((name: string) => name[0])
		.join('');
</script>

<div class="card p-4">
	<header class="card-header flex justify-center">
		<Avatar initials={fullNameInitial} background="bg-primary-500" fontSize={250} width="w-28" />
	</header>
	<section class="p-4 flex flex-col items-center">
		<h1 class="h1">{customer?.fullName || 'NA'}</h1>
		<h2 class="h2 italic">{customer?.company || 'NA'}</h2>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">TIN</h3>
				<p class="p">{customer?.tin || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Email</h3>
				<p class="p">{customer?.email || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Phone</h3>
				<p class="p">{customer?.phone || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Address</h3>
				<p class="p">{customer?.address || 'NA'}</p>
			</div>
		</div>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">Created At</h3>
				<p class="p">{customer?.createdAt ? dateToString(customer?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created By</h3>
				<p class="p">{customer?.createdBy.fullName || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update At</h3>
				<p class="p">{customer?.updatedAt ? dateToString(customer?.updatedAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update By</h3>
				<p class="p">{customer?.updatedBy.fullName || 'NA'}</p>
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
		<Update id={customer?._id} moduleName={'customers'} {customer} {customers} {drawerStore} />
	{/if}
</Drawer>
