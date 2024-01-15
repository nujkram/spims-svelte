<script lang="ts">
	import { onMount } from 'svelte';
	import { SHA256 } from 'crypto-js';
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

	let lastName: string,
		firstName: string,
		username: string,
		password: string,
		confirmPassword: string,
		role: string = 'Encoder',
		email: string,
		phone: string;
	let keyword: string = '';
	let isFocused: boolean = true;

	let sourceData: any = [];
	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Role', 'Username', 'Email', 'Phone'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['fullName', 'role', 'username', 'email', 'profile.phone'])
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
		table.body = tableMapperValues(paginatedData, ['fullName', 'role', 'username', 'email', 'phone']);
		table.meta = tableMapperValues(paginatedData, ['fullName', 'role', 'username', 'email', 'phone']);
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
		<h1 class="h3">Users</h1>
	</header>
	<section class="flex p-4 w-full gap-4">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerSettings)}
			>Add User</button
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
				if (password != confirmPassword) {
					toastSettings.message = 'Password and Confirm Password does not match';
					toastSettings.background = 'variant-filled-error';
					toastStore.trigger(toastSettings);
					return;
				}
				const hashedPassword = await SHA256(password).toString();
				let response = await fetch('/api/admin/user/insert', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username: username,
						lastName: lastName,
						firstName: firstName,
						password: hashedPassword,
						email: email,
						phone: phone,
						role: role
					})
				});

				let result = await response.json();

				toastSettings.message = result.message;
				toastStore.trigger(toastSettings);
				loadData();
				drawerStore.close();
			} catch (error) {
				toastSettings.message = error.message;
				toastSettings.background = 'variant-filled-error';
				toastStore.trigger(toastSettings);
				console.error(error);
			}
		}}
	>
		<h2 class="h4">Create User</h2>
		<label class="label mt-4">
			<span>Email</span>
			<input
				class="input"
				type="email"
				placeholder="juandelacruz@sample.com"
				name="email"
				bind:value={email}
				required
			/>
		</label>
		<label class="label mt-4">
			<span>Username</span>
			<input
				class="input"
				type="text"
				placeholder="juan.delacruz"
				name="username"
				bind:value={username}
				required
			/>
		</label>
		<label class="label mt-4">
			<span>Password</span>
			<input
				class="input"
				type="password"
				placeholder="must be between 8~16 characters long"
				name="password"
				bind:value={password}
				required
			/>
		</label>
		<label class="label mt-4">
			<span>Confirm Password</span>
			<input
				class="input"
				type="password"
				placeholder="confirm password"
				name="confirmPassword"
				bind:value={confirmPassword}
				required
			/>
		</label>
		<label class="label mt-4">
			<span>Role</span>
			<select class="select" bind:value={role} required>
				<option value="Encoder">Encoder</option>
				<option value="Manager">Manager</option>
				<option value="Administrator">Admin</option>
			</select>
		</label>
		<hr class="mt-4" />
		<label class="label mt-4">
			<span>Last Name</span>
			<input
				class="input"
				type="text"
				placeholder="Dela Cruz"
				name="lastName"
				bind:value={lastName}
				required
			/>
		</label>
		<label class="label mt-4">
			<span>First Name</span>
			<input
				class="input"
				type="text"
				placeholder="Juan"
				name="firstName"
				bind:value={firstName}
				required
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
				required
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
