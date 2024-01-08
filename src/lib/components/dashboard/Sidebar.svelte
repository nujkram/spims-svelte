<script lang="ts">
	import { AppRail, AppRailAnchor, AppRailTile } from '@skeletonlabs/skeleton';
	import { Box, Cart, FileBarGraph, Home, People } from '$lib/components/icons/index';
	import { goto } from '$app/navigation';

	let currentTile: number = 0;

	// dictionary of urls
	const urls: any = {
		0: '/dashboard',
		1: '/dashboard/orders',
		2: '/dashboard/inventory',
        3: '/dashboard/customers',
        4: '/dashboard/reports'
	};
	const handleTileClick = () => {
		goto(urls[currentTile]);
	};
</script>

<AppRail>
	<AppRailTile
		bind:group={currentTile}
		name="Home"
		value={0}
		title="Home"
		on:click={handleTileClick}
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
		on:click={handleTileClick}
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
		name="Inventory"
		value={2}
		title="Inventory"
		on:click={handleTileClick}
	>
		<svelte:fragment slot="lead">
            <div class="flex items-center justify-center">
				<Box />
			</div>
        </svelte:fragment>
		<span>Inventory</span>
	</AppRailTile>
	<AppRailTile
		bind:group={currentTile}
		name="Customers"
		value={3}
		title="Customers"
		on:click={handleTileClick}
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
		name="Reports"
		value={4}
		title="Reports"
		on:click={handleTileClick}
	>
		<svelte:fragment slot="lead">
            <div class="flex items-center justify-center">
				<FileBarGraph />
			</div>
        </svelte:fragment>
		<span>Reports</span>
	</AppRailTile>
</AppRail>
