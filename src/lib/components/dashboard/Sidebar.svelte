<script lang="ts">
	import { page } from '$app/stores';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import {
		Box,
		Cart,
		CashStack,
		FileBarGraph,
		Home,
		People,
		Tag,
		Wallet
	} from '$lib/components/icons/index';
	export let user: any;
</script>

<AppRail>
	<AppRailAnchor title="Home" href="/dashboard" selected={$page.url.pathname === '/dashboard'}>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Home />
			</div>
		</svelte:fragment>
		<span>Home</span>
	</AppRailAnchor>
	<AppRailAnchor
		title="Sales Order"
		href="/dashboard/sales"
		selected={$page.url.pathname === '/dashboard/sales'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Cart />
			</div>
		</svelte:fragment>
		<span>Sales Order</span>
	</AppRailAnchor>
	<!-- <AppRailAnchor
		title="Purchase Order"
		href="/dashboard/purchase"
		selected={$page.url.pathname === '/dashboard/purchase'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Tag />
			</div>
		</svelte:fragment>
		<span>Purchase Order</span>
	</AppRailAnchor> -->
	<AppRailAnchor
		title="Expenses"
		href="/dashboard/expenses"
		selected={$page.url.pathname === '/dashboard/expenses'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Wallet />
			</div>
		</svelte:fragment>
		<span>Expenses</span>
	</AppRailAnchor>
	<AppRailAnchor
		title="Products"
		href="/dashboard/products"
		selected={$page.url.pathname === '/dashboard/products'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<Box />
			</div>
		</svelte:fragment>
		<span>Products</span>
	</AppRailAnchor>
	<AppRailAnchor
		title="Customers"
		href="/dashboard/customers"
		selected={$page.url.pathname === '/dashboard/customers'}
	>
		<svelte:fragment slot="lead">
			<div class="flex items-center justify-center">
				<People />
			</div>
		</svelte:fragment>
		<span>Customers</span>
	</AppRailAnchor>
	{#if user?.role === 'ADMINISTRATOR'}
		<AppRailAnchor
			title="Users"
			href="/dashboard/users"
			selected={$page.url.pathname === '/dashboard/users'}
		>
			<svelte:fragment slot="lead">
				<div class="flex items-center justify-center">
					<People />
				</div>
			</svelte:fragment>
			<span>Users</span>
		</AppRailAnchor>
		<AppRailAnchor
			title="Reports"
			href="/dashboard/reports"
			selected={$page.url.pathname === '/dashboard/reports'}
		>
			<svelte:fragment slot="lead">
				<div class="flex items-center justify-center">
					<FileBarGraph />
				</div>
			</svelte:fragment>
			<span>Reports</span>
		</AppRailAnchor>
		<AppRailAnchor
			title="Net Income"
			href="/dashboard/reports/net-income"
			selected={$page.url.pathname === '/dashboard/reports/net-income'}
		>
			<svelte:fragment slot="lead">
				<div class="flex items-center justify-center">
					<CashStack />
				</div>
			</svelte:fragment>
			<span>Net Income</span>
		</AppRailAnchor>
		<AppRailAnchor
			title="Expenses"
			href="/dashboard/reports/expenses"
			selected={$page.url.pathname === '/dashboard/reports/expenses'}
		>
			<svelte:fragment slot="lead">
				<div class="flex items-center justify-center">
					<Wallet />
				</div>
			</svelte:fragment>
			<span>Expenses</span>
		</AppRailAnchor>
	{/if}
</AppRail>
