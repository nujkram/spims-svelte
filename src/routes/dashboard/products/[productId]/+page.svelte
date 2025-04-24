<script lang="ts">
	import { Avatar, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import Update from '$lib/components/forms/product/Update.svelte';
	import dateToString from '$lib/utils/dateHelper';
	export let data;

	let { product, products } = data;

	// drawer settings
	const drawerUpdate: DrawerSettings = {
		id: 'updateProduct',
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
	let fullNameInitial = product?.name
		.split(' ')
		.map((name: string) => name[0])
		.join('');
</script>

<div class="card p-4">
	<header class="card-header flex justify-center">
		<Avatar initials={fullNameInitial} background="bg-primary-500" fontSize={250} width="w-28" />
	</header>
	<section class="p-4 flex flex-col items-center">
		<h1 class="h1">
			{product?.name || 'NA'} (<span class="text-success-500">{product?.price}</span>)
		</h1>
		<h2 class="h2 italic">{product?.category || 'NA'}</h2>
		<div class="flex flex-col md:flex-row w-full gap-4 justify-between mt-4">
			<div class="flex flex-col items-center">
				<h3 class="h3">Business</h3>
				<p class="p">{product?.business ? product?.business : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created At</h3>
				<p class="p">{product?.createdAt ? dateToString(product?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Created By</h3>
				<p class="p">{product?.createdBy.fullName || 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update At</h3>
				<p class="p">{product?.updatedAt ? dateToString(product?.updatedAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col items-center">
				<h3 class="h3">Update By</h3>
				<p class="p">{product?.updatedBy.fullName || 'NA'}</p>
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
	{#if $drawerStore.id === 'updateProduct'}
		<Update id={product?._id} moduleName={'products'} {product} {products} {drawerStore} />
	{/if}
</Drawer>
