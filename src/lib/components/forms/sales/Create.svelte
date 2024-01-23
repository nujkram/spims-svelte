<script lang="ts">
	import {
		Autocomplete,
		focusTrap,
		getToastStore,
		InputChip,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, TableSource, ToastSettings } from '@skeletonlabs/skeleton';

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
	let productDict: string[] = [];
	let quantities: number[] = [];
	let sourceData: any = [];
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Price', 'Quantity', 'Subtotal'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['name', 'price', 'quantity', 'subtotal'])
	};

	const updateTable = (sourceData: any) => {
		if (!sourceData.length) {
			table.body = [];
			table.meta = [];
			table.foot = [];
			sourceData = [];
			return;
		}
		table.body = tableMapperValues(sourceData, ['name', 'price', 'quantity', 'subtotal']);
		table.meta = tableMapperValues(sourceData, ['_id', 'price', 'quantity', 'subtotal']);
		table.foot = ['Total', '', '', `<code class="code">${sourceData.length}</code>`];
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
	const onCustomerSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		customer = event.detail.value;
		customerId = event.detail.meta;
	};

	const uniqueProducts = new Set(productData.map((item: any) => [item.name, item._id, item.price]));

	productOptions = [...uniqueProducts].map((product: any) => {
		return {
			label: product[0],
			value: product[0],
			meta: { id: product[1], price: product[2] },
			keywords: product
		};
	});

	// autocomplete product selection event handler function to update product value on selection
	const onProductSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		const selectedProduct: any[] = [event.detail.value, event.detail.meta];
		products = [...products, selectedProduct[0]];
		let dict: any = {}
		let key = selectedProduct[1].id;
		let value = {
			name: selectedProduct[0],
			price: selectedProduct[1].price
		}
		dict[key] = value;
		productDict.push(dict);
		product = '';

		// update cart table
		let maxId = Math.max(...Object.keys(sourceData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		sourceData[newId] = {
			_id: selectedProduct[1].id,
			name: selectedProduct[0],
			price: selectedProduct[1].price,
			quantity: `
					<input 
						class="input w-[80px] h-[30px]"
						type="number"
						name="quantities"
						value=1
					/>
					`,
			subtotal: selectedProduct[1].price
		};
		updateTable(sourceData);
	};

	// product input chip event handler
	const onRemoveProduct = (e: { detail: { chipIndex: number } }) => {
		sourceData.splice(e.detail.chipIndex, 1);
		productDict.splice(e.detail.chipIndex, 1);
		updateTable(sourceData);
	};
</script>

<form
	id="salesForm"
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			const form = document.getElementById('salesForm');
			let formData = new FormData(form);
			const inputs = document.querySelectorAll('[name]');

			// TODO: Get all quantities from input field
			inputs.forEach((input) => {
				console.log(input.name, input.value);
				formData.append(input.name, input.value);
			});

			console.log('formData', formData);
			let response = await fetch('/api/admin/sales/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					receipt,
					downpayment,
					paymentMethod,
					amount,
					customerId,
					productDict,
					quantities,
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
	<div class="grid md:grid-cols-3 grid-cols-1">
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Create Sales Order</h2>
			<label class="label">
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
			<label class="label">
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
			<label class="label">
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
		</div>
		<div class="col-span-2 p-6 flex flex-col gap-4">
			<h2 class="h4">Cart</h2>
			<Table class="mt-4" source={table} />
			<div class="mt-3">
				<span>Products</span>
				<InputChip
					bind:input={product}
					bind:value={products}
					name="products"
					allowUpperCase={true}
					allowDuplicates={false}
					on:remove={onRemoveProduct}
				/>
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete
						bind:input={product}
						options={productOptions}
						on:selection={onProductSelection}
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>