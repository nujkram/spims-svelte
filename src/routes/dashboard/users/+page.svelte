<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Autocomplete,
		Drawer,
		focusTrap,
		getDrawerStore,
		getToastStore,
		Paginator,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type {
		AutocompleteOption,
		DrawerSettings,
		PaginationSettings,
		TableSource,
		ToastSettings
	} from '@skeletonlabs/skeleton';

	let lastName: string, firstName: string, address: string, email: string, phone: string;
	let company: string = '';
	let keyword: string = '';
	let isFocused: boolean = true;

	let sourceData: any = [];
	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Username', 'Email', 'Phone'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, [
			'fullName',
			'username',
			'email',
			'profile.phone'
		])
	};

	async function loadData() {
		try {
			let response = await fetch('/api/admin/user', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let result = await response.json();
			sourceData = result.response;

			updateTable(sourceData);
		} catch (error) {
			console.error(error);
		}
	}

	const drawerSettings: DrawerSettings = {
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

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const filterTable = (keyword: string) => {
		paginationSettings.page = 0;
		if (keyword.length > 0) {
			let filteredData = sourceData.filter((item: any) => {
				return (
					item.displayName.toLowerCase().includes(keyword.toLowerCase()) ||
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
			'username',
			'email',
			'phone'
		]);
		table.meta = tableMapperValues(paginatedData, [
			'fullName',
			'username',
			'email',
			'phone'
		]);
		table.foot = ['Total', '', '', `<code class="code">${sourceData.length}</code>`];
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

	$: filterTable(keyword);
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Customers</h1>
	</header>
	<section class="flex p-4 w-full gap-4">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerSettings)}
			>Add Customer</button
		>
		<input class="input ml-auto" type="text" placeholder="Search" bind:value={keyword} />
	</section>
</div>

{#key sourceData}
	<Table source={table} />
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
	<form
		method="POST"
		autocomplete="off"
		class="p-6"
		use:focusTrap={isFocused}
		on:submit|preventDefault={async () => {
			try {
				let response = await fetch('/api/admin/customer/insert', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						lastName: lastName,
						firstName: firstName,
						address: address,
						email: email,
						phone: phone,
						company: company
					})
				});

				let result = await response.json();

				toastSettings.message = result.message;
				toastStore.trigger(toastSettings);
				loadData();
				drawerStore.close();
			} catch (error) {
				console.error(error);
			}
		}}
	>
		<h2 class="h4">Create Customers</h2>
		<label class="label mt-4">
			<span>Last Name</span>
			<input
				class="input"
				type="text"
				placeholder="Dela Cruz"
				name="lastName"
				bind:value={lastName}
			/>
		</label>
		<label class="label mt-4">
			<span>First Name</span>
			<input class="input" type="text" placeholder="Juan" name="firstName" bind:value={firstName} />
		</label>
		<label class="label mt-4">
			<span>Address</span>
			<input
				class="input"
				type="text"
				placeholder="Roxas City"
				name="address"
				bind:value={address}
			/>
		</label>
		<label class="label mt-4">
			<span>Email</span>
			<input
				class="input"
				type="email"
				placeholder="juandelacruz@sample.com"
				name="email"
				bind:value={email}
			/>
		</label>
		<label class="label mt-4">
			<span>Phone</span>
			<input
				class="input"
				type="text"
				placeholder="+639171234567"
				name="phone"
				bind:value={phone}
			/>
		</label>
		<label class="label mt-4">
			<span>Company</span>
			<input
				class="input"
				type="text"
				placeholder="Rage Avenue Co."
				name="company"
				bind:value={company}
			/>
		</label>

		<div class="flex gap-4 place-content-end w-full">
			<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
			<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
				>Cancel</button
			>
		</div>
	</form>
</Drawer>
