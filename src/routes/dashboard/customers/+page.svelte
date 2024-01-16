<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Drawer,
		getDrawerStore,
		Paginator,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type {
		DrawerSettings,
		PaginationSettings,
		TableSource,
	} from '@skeletonlabs/skeleton';
	import Create from '$lib/components/forms/customer/Create.svelte';
	import { goto } from '$app/navigation';

	let keyword: string = '';

	let sourceData: any = [];
	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Addess', 'Company', 'Email', 'Phone'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['fullName', 'address', 'company', 'email', 'phone'])
	};

	async function loadData() {
		try {
			let response = await fetch('/api/admin/customer', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let result = await response.json();
			sourceData = result.response;

			if(sourceData) updateTable(sourceData);
		} catch (error) {
			console.error(error);
		}
	}

	const drawerCreate: DrawerSettings = {
		id: 'createCustomer',
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

	const filterTable = (keyword: string) => {
		paginationSettings.page = 0;
		if (keyword.length > 0) {
			let filteredData = sourceData.filter((item: any) => {
				return (
					item.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
					item.address.toLowerCase().includes(keyword.toLowerCase()) ||
					item.company.toLowerCase().includes(keyword.toLowerCase()) ||
					item.email.toLowerCase().includes(keyword.toLowerCase()) ||
					item.phone.toLowerCase().includes(keyword.toLowerCase())
				);
			});

			updateTable(filteredData);
		} else {
			updateTable(sourceData);
		}
	};

	const updateTable = (sourceData: any) => {
		paginationSettings.size = sourceData.length;
		let paginatedData = sourceData.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		table.body = tableMapperValues(paginatedData, [
			'fullName',
			'address',
			'company',
			'email',
			'phone'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'_id',
			'address',
			'company',
			'email',
			'phone'
		]);
		table.foot = ['Total', '', '', '', `<code class="code">${sourceData.length}</code>`];
	};

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: sourceData.length,
		amounts: [10, 20, 25, 30, 50, 100]
	} satisfies PaginationSettings;

	// pagination event handlers
	function onPageChange(e: CustomEvent): void {
		paginationSettings.page = e.detail;
		updateTable(sourceData);
	}

	// pagination event handlers
	function onAmountChange(e: CustomEvent): void {
		paginationSettings.limit = e.detail;
		updateTable(sourceData);
	}

	onMount(async () => {
		await loadData();
	});

	// table row select handler
	function tableSelectHandler(e: CustomEvent): void {
		goto(`/dashboard/customers/${e.detail[0]}`);
	}

	$: filterTable(keyword);
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Customers</h1>
	</header>
	<section class="flex p-4 w-full gap-4">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerCreate)}
			>Add Customer</button
		>
		<input class="input ml-auto" type="text" placeholder="Search" bind:value={keyword} />
	</section>
</div>

{#key sourceData}
	<Table source={table} interactive={true} on:selected={tableSelectHandler} />
	<Paginator
		class="mt-4"
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		showFirstLastButtons={false}
		showPreviousNextButtons={true}
	/>
{/key}
<Drawer>
	{#if $drawerStore.id === 'createCustomer'}
		<Create {drawerStore} {loadData} {sourceData} />
	{/if}
</Drawer>
