<script lang="ts">
	import { page } from '$app/stores';
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		Drawer,
		initializeStores,
		getDrawerStore,
		LightSwitch,
		Toast,
		popup
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, PopupSettings } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import { List } from '$lib/components/icons/index';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	initializeStores();

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'left'
	};

	function handleLogout() {
		goto('auth/logout/');
	}

	const drawerSettings: DrawerSettings = {
		id: 'mobileSidebar',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[80px]',
		rounded: 'rounded-none',
		position: 'left'
	};

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open(drawerSettings);
	}
</script>

<Drawer>
	<Sidebar />
</Drawer>
<!-- App Shell -->
<AppShell slotSidebarLeft="w-0 lg:w-20">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					{#if $page.data.user}
						<button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
							<List />
						</button>
					{/if}
					<strong class="text-xl uppercase md:block hidden">RAGE AVENUE CO.</strong>
					<strong class="text-xl uppercase md:hidden block">RAC</strong>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.facebook.com/RageAvenueAdmin"
					target="_blank"
					rel="noreferrer"
				>
					Facebook
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.instagram.com/rageavenueco/"
					target="_blank"
					rel="noreferrer"
				>
					Instagram
				</a>
				<LightSwitch />
				{#if $page.data.user}
					<button class="btn variant-filled w-24" use:popup={popupClick}>Profile</button>
					<div class="card p-4 bg-gray-900" data-popup="popupClick">
						<button
							type="button"
							class="btn variant-outline-surface variant-filled-surface"
							on:click={handleLogout}>Logout</button
						>
						<div class="arrow bg-gray-900" />
					</div>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if $page.data.user}
			<Sidebar />
		{/if}
	</svelte:fragment>
	<!-- Page Route Content -->
	<div class="px-6 py-4">
		<slot />
		<Toast />
	</div>
</AppShell>
