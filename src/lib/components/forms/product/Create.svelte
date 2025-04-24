<script lang="ts">
	import { Autocomplete, focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, ToastSettings } from '@skeletonlabs/skeleton';

	export let loadData: () => void;
	export let drawerStore = () => {};
	export let sourceData: any;

	let name: string, price: string, status: number;
	let isFocused: boolean = true;
	let category: string = '';
	let categoryOptions: any;
	let business: string = 'RAC';

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const uniqueCategory = new Set(sourceData.map((item: any) => item.category));

	categoryOptions = [...uniqueCategory].map((category) => {
		return {
			label: category,
			value: category,
			keywords: category
		};
	});

	// autocomplete category selection event handler function to update category value on selection
	const onCategorySelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		category = event.detail.label;
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			let response = await fetch('/api/admin/product/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					price,
					status,
					category,
					business
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
	<h2 class="h4">Create Product</h2>
	<label class="label">
		<span>Business</span>
		<select class="select" bind:value={business}>
			<option value="RAC">RAC</option>
			<option value="DTF">DTF</option>
			<option value="RAC-DTF">RAC-DTF</option>
		</select>
	</label>
	<label class="label mt-4">
		<span>Name</span>
		<input
			class="input"
			type="text"
			placeholder="Tarp 2X3"
			name="name"
			bind:value={name}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Unit Price</span>
		<input
			class="input"
			type="text"
			placeholder="100.00"
			name="number"
			bind:value={price}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Category</span>
		<input
			class="input"
			type="text"
			placeholder="Tarpaulin Printing"
			name="category"
			bind:value={category}
			required
		/>
	</label>
	{#key category}
		{#if category.length > 0 && categoryOptions.length > 0}
			<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
				<Autocomplete
					bind:input={category}
					options={categoryOptions}
					on:selection={onCategorySelection}
				/>
			</div>
		{/if}
	{/key}
	<label class="label">
		<span>Status</span>
		<select class="select" bind:value={status}>
			<option value="1">Active</option>
			<option value="2">Inactive</option>
		</select>
	</label>

	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>
