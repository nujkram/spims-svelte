<script lang="ts">
	import { Autocomplete, focusTrap, getToastStore, InputChip } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, ToastSettings } from '@skeletonlabs/skeleton';

	export let loadData: () => void;
	export let drawerStore = () => {};
	export let customerData: any;
	export let productData: any;

	let receipt: string, downpayment: number, amount: number, customerId: any;
	let isFocused: boolean = true;
	let customer: string = '';
	let paymentMethod: string = 'Cash';
	let customerOptions: any;
	let product: string = '';
	let productOptions: any;
	let products: string[] = [];
	let quantities: number[] = [];

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const uniqueCustomers = new Set(customerData.map((item: any) => [item.fullName, item._id]));

	customerOptions = [...uniqueCustomers].map((customer: any) => {
		return {
			label: customer[0],
			value: customer[0],
			meta: customer[1],
			keywords: customer[0]
		};
	});

	// autocomplete customer selection event handler function to update customer value on selection
	function onCustomerSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		customer = event.detail.value;
		customerId = event.detail.meta;
	}

	const uniqueProducts = new Set(productData.map((item: any) => [item.name, item._id]));

	productOptions = [...uniqueProducts].map((product: any) => {
		return {
			label: product[0],
			value: product[0],
			meta: product[1],
			keywords: product
		};
	});

	// autocomplete product selection event handler function to update product value on selection
	function onProductSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		const selectedProduct = [event.detail.value, event.detail.meta];

		products = [...products, selectedProduct];
		product = '';
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
					receipt,
					downpayment,
					paymentMethod,
					amount,
					customerId
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
	<h2 class="h4">Create Sales Order</h2>
	<label class="label mt-4">
		<span>Customer</span>
		<input
			class="input"
			type="text"
			placeholder="Juan Dela Cruz"
			name="customer"
			bind:value={customer}
			required
		/>
	</label>
	{#key customer}
		{#if customer.length > 0 && customerOptions.length > 0}
			<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
				<Autocomplete
					bind:input={customer}
					options={customerOptions}
					on:selection={onCustomerSelection}
				/>
			</div>
		{/if}
	{/key}
	<label class="label mt-4">
		<span>Receipt</span>
		<input
			class="input"
			type="text"
			placeholder="123456789"
			name="receipt"
			bind:value={receipt}
			required
		/>
	</label>
	<div class="mt-3">
		<span>Products</span>
		<InputChip
			bind:input={product}
			bind:value={products}
			name="products"
			allowUpperCase={true}
			allowDuplicates={false}
		/>
		<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
			<Autocomplete
				bind:input={product}
				options={productOptions}
				on:selection={onProductSelection}
			/>
		</div>
	</div>
	<div class="mt-3">
		<span>Quantities</span>
		<InputChip bind:value={quantities} name="quantities" allowDuplicates={true} />
	</div>
	<label class="label mt-4">
		<span>Downpayment</span>
		<input
			class="input"
			type="number"
			placeholder="0.00"
			name="downpayment"
			bind:value={downpayment}
			required
		/>
	</label>
	<label class="label">
		<span>Payment Method</span>
		<select class="select" bind:value={paymentMethod}>
			<option value="Cash">Cash</option>
			<option value="Online Payment">Online Payment</option>
			<option value="Bank Transaction">Bank Transaction</option>
		</select>
	</label>

	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>
