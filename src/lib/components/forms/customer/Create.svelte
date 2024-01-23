<script lang="ts">
	import {
		Autocomplete,
		focusTrap,
		getToastStore,
	} from '@skeletonlabs/skeleton';
	import type {
		AutocompleteOption,
		ToastSettings
	} from '@skeletonlabs/skeleton';

	export let loadData: () => void;
	export let drawerStore = () => {};
	export let sourceData: any;

	let lastName: string,
		firstName: string,
		address: string,
		email: string,
		phone: string,
		tin: string;
	let isFocused: boolean = true;
	let company: string = '';
	let companyOptions: any;

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const uniqueCompanies = new Set(sourceData.map((item: any) => item.company));

	companyOptions = [...uniqueCompanies].map((company) => {
		return {
			label: company,
			value: company,
			keywords: company
		};
	});

	// autocomplete company selection event handler function to update company value on selection
	const onCompanySelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		company = event.detail.label;
	}
</script>

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
					lastName,
					firstName,
					address,
					email,
					phone,
					tin,
					company
				})
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			loadData();
			drawerStore.close();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}}
>
	<h2 class="h4">Create Customer</h2>
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
		<span>Address</span>
		<input
			class="input"
			type="text"
			placeholder="Roxas City"
			name="address"
			bind:value={address}
			required
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
	<label class="label mt-4">
		<span>TIN</span>
		<input
			class="input"
			type="text"
			placeholder="000-123-456-001"
			name="tin"
			bind:value={tin}
			required
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
			required
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
