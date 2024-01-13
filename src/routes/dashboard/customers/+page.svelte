<script lang="ts">
	import {
		Autocomplete,
		Drawer,
		getDrawerStore,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, DrawerSettings, TableSource } from '@skeletonlabs/skeleton';

	let lastName, firstName, email, phone, company: string;

	const sourceData = [
		{
			position: 1,
			name: 'John Doe',
			company: 'Rage Avenue Co.',
			email: 'johndoe@gmail.com',
			phone: '+639171234567'
		},
		{
			position: 2,
			name: 'Jane Doe',
			company: 'Rage Avenue Co.',
			email: 'janedoe@gmail.com',
			phone: '+639171234568'
		},
		{
			position: 3,
			name: 'John Smith',
			company: 'Rage Avenue Co.',
			email: 'johnsmith@gmail.com',
			phone: '+639171234569'
		},
		{
			position: 4,
			name: 'Jane Smith',
			company: 'Rage Avenue Co.',
			email: 'janesmith@gmail.com',
			phone: '+639171234560'
		}
	];

	const tableSample: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Company', 'Email', 'Phone'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['name', 'company', 'email', 'phone']),
		// Optional: The data returned when interactive is enabled and a row is clicked.
		meta: tableMapperValues(sourceData, ['position', 'name', 'company', 'email', 'phone']),
		// Optional: A list of footer labels.
		foot: ['Total', '', '<code class="code">4</code>']
	};

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

	let companyInput = '';

	const companyOptions: AutocompleteOption<string>[] = [
		{ label: 'Rage Avenue Co.', value: 'Rage Avenue Co.', keywords: 'printing, tshirt, tarpaulin' },
		{ label: 'ABC', value: 'ABC', keywords: 'sample' },
		{ label: 'XYZ', value: 'XZY', keywords: 'sample' },
		{
			label: 'Neapolitan',
			value: 'neapolitan',
			keywords: 'mix, strawberry, chocolate, vanilla',
			meta: { healthy: false }
		},
		{ label: 'Pineapple', value: 'pineapple', keywords: 'fruit', meta: { healthy: true } },
		{ label: 'Peach', value: 'peach', keywords: 'fruit', meta: { healthy: true } }
	];

	function onCompanySelection(event: CustomEvent<AutocompleteOption<string>>): void {
		companyInput = event.detail.label;
	}
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
<Table source={tableSample} />
<Drawer>
	<form
		method="POST"
		autocomplete="off"
		class="p-6"
		on:submit={(e) => {
			e.preventDefault();
		}}
	>
		<h2 class="h4">Create Customers</h2>
		<label class="label mt-4">
			<span>Last Name</span>
			<input class="input" type="text" placeholder="Dela Cruz" name="lastName" />
		</label>
		<label class="label mt-4">
			<span>First Name</span>
			<input class="input" type="text" placeholder="Juan" name="firstName" />
		</label>
		<label class="label mt-4">
			<span>Email</span>
			<input class="input" type="email" placeholder="juandelacruz@sample.com" name="email" />
		</label>
		<label class="label mt-4">
			<span>Phone</span>
			<input class="input" type="text" placeholder="+639171234567" name="phone" />
		</label>
		<label class="label mt-4">
			<span>Company</span>
			<input
				class="input"
				type="text"
				placeholder="Rage Avenue Co."
				name="company"
				bind:value={companyInput}
			/>
		</label>
		{#key company}
			{#if companyInput.length > 0 && companyOptions.length > 0}
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete
						bind:input={companyInput}
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
