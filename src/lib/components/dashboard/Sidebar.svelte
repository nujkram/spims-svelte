<script lang="ts">
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton';
	import { Box, Cart, FileBarGraph, Home, People, Tag } from '$lib/components/icons/index';
	import { goto } from '$app/navigation';

	let currentTile: number = 0;

	const urls: any = {
		0: '/dashboard',
		1: '/dashboard/sales',
		2: '/dashboard/purchase',
		3: '/dashboard/products',
		4: '/dashboard/customers',
		5: '/dashboard/users',
		6: '/dashboard/reports'
	};

	const handleTileClick = (i: number) => {
		goto(urls[i]);
	};
	$: currentTile && handleTileClick(currentTile);
	
</script>

<AppRail>
	<AppRailTile
		bind:group={currentTile}
		name="Home"
		value={0}
		title="Home"
		on:click={() => handleTileClick(0)}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Home />
			</div>
		</svelte:fragment>
		<span>Home</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Sales Order"
		value={1}
		title="Sales Order"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Cart />
			</div>
		</svelte:fragment>
		<span>Sales Order</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Purchase Order"
		value={2}
		title="Purchase Order"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Tag />
			</div>
		</svelte:fragment>
		<span>Purchase Order</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Products"
		value={3}
		title="Products"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Box />
			</div>
		</svelte:fragment>
		<span>Products</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Customers"
		value={4}
		title="Customers"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<People />
			</div>
		</svelte:fragment>
		<span>Customers</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Users"
		value={5}
		title="Users"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<People />
			</div>
		</svelte:fragment>
		<span>Users</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Reports"
		value={6}
		title="Reports"
		on:click={() => currentTile + 1}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<FileBarGraph />
			</div>
		</svelte:fragment>
		<span>Reports</span>
	</AppRailTile>
</AppRail>
