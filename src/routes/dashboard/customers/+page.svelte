<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Autocomplete,
		Drawer,
		focusTrap,
		getDrawerStore,
		getToastStore,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type {
		AutocompleteOption,
		DrawerSettings,
		TableSource,
		ToastSettings
	} from '@skeletonlabs/skeleton';

	let lastName: string, firstName: string, email: string, phone: string;
	let company: string = '';
	let isFocused: boolean = true;

	let sourceData: any = [];
	let companyOptions;
	let customerTable: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Company', 'Email', 'Phone'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['fullName', 'company', 'email', 'phone'])
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
			customerTable.body = tableMapperValues(sourceData, ['fullName', 'company', 'email', 'phone']);
			customerTable.meta = tableMapperValues(sourceData, ['fullName', 'company', 'email', 'phone']);
			customerTable.foot = ['Total', '', `<code class="code">${sourceData.length}</code>`];
			const uniqueCompanies = new Set(sourceData.map(item => item.company));

			companyOptions = [...uniqueCompanies].map(company => {
			return {
				label: company,
				value: company,
				keywords: company
			}
			});
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

	function onCompanySelection(event: CustomEvent<AutocompleteOption<string>>): void {
		company = event.detail.label;
	}

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	onMount(async () => {
		await loadData();
	});
</script>

<div class="card mb-4">
	<header class="card-header">
		<h1 class="h3">Customers</h1>
	</header>
	<section class="flex p-4 w-full">
		<button class="btn variant-filled-primary" on:click={() => drawerStore.open(drawerSettings)}
			>Add Customer</button
		>
	</section>
</div>
{#key sourceData}
	<Table source={customerTable} />
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
		{#key company}
			{#if company.length > 0 && companyOptions.length > 0}
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete
						bind:input={company}
						options={companyOptions}
						on:selection={onCompanySelection}
					/>
				</div>
			{/if}
		{/key}

		<div class="flex gap-4 place-content-end w-full">
			<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
			<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
				>Cancel</button
			>
		</div>
	</form>
</Drawer>
