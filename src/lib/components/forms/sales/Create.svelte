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
	import {
		formatCurrency,
		formatCurrencyNoSymbol,
		stringToDecimal
	} from '$lib/utils/currencyHelper';

	export let loadData: () => void;
	export let drawerStore = () => {};
	export let customerData: any;
	export let productData: any;

	let receipt: string, downpayment: number, customerId: any;
	let isFocused: boolean = true;
	let customer: string = '';
	let paymentMethod: string = 'Cash';
	let customerOptions: any;
	let product: string = '';
	let amount: number = 0;
	let productOptions: any;
	let products: string[] = [];
	let description: string = '';
	let cart: string[] = [];
	let sourceData: any = [];
	let business: string = 'RAC';

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Description', 'Price', 'Quantity', 'Subtotal'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(sourceData, ['name', 'description', 'price', 'quantity', 'subtotal'])
	};

	const updateTable = (sourceData: any) => {
		amount = sourceData.reduce(
			(a: any, b: any) => parseFloat(a) + parseFloat(stringToDecimal(b.subtotal)),
			0
		);
		if (!sourceData.length) {
			table.body = [];
			table.meta = [];
			table.foot = [];
			sourceData = [];
			return;
		}
		table.body = tableMapperValues(sourceData, [
			'name',
			'description',
			'price',
			'quantity',
			'subtotal'
		]);
		table.meta = tableMapperValues(sourceData, [
			'_id',
			'description',
			'price',
			'quantity',
			'subtotal'
		]);
		table.foot = [
			'Total',
			'',
			`<code class="code">${sourceData.length}</code>`,
			`${formatCurrency(amount)}`
		];
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

	const uniqueProducts = new Set(
		productData.map((item: any) => [item.name, item._id, item.price, item.business])
	);

	productOptions = [...uniqueProducts].map((product: any) => {
		return {
			label: product[0],
			value: product[0],
			meta: { id: product[1], price: product[2], business: product[3] },
			keywords: product
		};
	});

	// autocomplete product selection event handler function to update product value on selection
	const onProductSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		const selectedProduct: any[] = [event.detail.value, event.detail.meta];
		products = [...products, selectedProduct[0]];
		let dict: any = {};
		let value = {
			id: selectedProduct[1].id,
			name: selectedProduct[0],
			description: description,
			price: selectedProduct[1].price,
			subtotal: selectedProduct[1].price,
			business: selectedProduct[1].business,
			quantity: 1
		};
		dict = value;
		cart.push(dict);
		product = '';

		// update cart table
		let maxId = Math.max(...Object.keys(sourceData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputQuantity = document.createElement('input');
		inputQuantity.setAttribute('class', 'input w-[80px] h-[30px]');
		inputQuantity.setAttribute('id', `quantities[${newId}]`);
		inputQuantity.setAttribute('type', 'number');
		inputQuantity.setAttribute('name', 'quantities');
		inputQuantity.setAttribute('step', '.01');
		inputQuantity.setAttribute('value', '1');

		const inputAmount = document.createElement('input');
		inputAmount.setAttribute('class', 'input w-[80px] h-[30px]');
		inputAmount.setAttribute('id', `amounts[${newId}]`);
		inputAmount.setAttribute('type', 'number');
		inputAmount.setAttribute('name', 'amounts');
		inputAmount.setAttribute('value', selectedProduct[1].price);

		sourceData[newId] = {
			_id: selectedProduct[1].id,
			name: selectedProduct[0],
			description: description,
			price: inputAmount.outerHTML,
			quantity: inputQuantity.outerHTML,
			subtotal: formatCurrencyNoSymbol(stringToDecimal(selectedProduct[1].price))
		};
		updateTable(sourceData);
		quantityEventListener();
		amountEventListener();
	};

	// product input chip event handler
	const onRemoveProduct = (e: { detail: { chipIndex: number } }) => {
		sourceData.splice(e.detail.chipIndex, 1);
		cart.splice(e.detail.chipIndex, 1);
		updateTable(sourceData);
	};

	const quantityEventListener = () => {
		setTimeout(() => {
			const inputQuantities = document.querySelectorAll('[name="quantities"]');
			inputQuantities.forEach((input) => {
				input.addEventListener('change', (event) => {
					// get event target value
					const value = event.target.value;
					const id = event.target.id;
					const index = id.replace('quantities[', '').replace(']', '');
					const price = stringToDecimal(cart[index].price);
					const subtotal = formatCurrencyNoSymbol(parseFloat(price) * parseFloat(value));
					sourceData[index].subtotal = subtotal;

					// set the subtotal to the cart
					cart[index].quantity = value;
					cart[index].subtotal = subtotal;

					updateTable(sourceData);
				});
			});
		}, 1000);
	};

	const amountEventListener = () => {
		setTimeout(() => {
			const inputAmounts = document.querySelectorAll('[name="amounts"]');
			inputAmounts.forEach((input) => {
				input.addEventListener('change', (event) => {
					// get event target value
					const value = event.target.value;
					const id = event.target.id;
					const index = id.replace('amounts[', '').replace(']', '');
					const subtotal = formatCurrencyNoSymbol(
						parseFloat(value) * stringToDecimal(cart[index].quantity)
					);
					sourceData[index].subtotal = subtotal;

					// set the subtotal to the cart
					cart[index].price = value;
					cart[index].subtotal = subtotal;

					updateTable(sourceData);
				});
			});
		}, 1000);
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

			// Add the quantities to the form data
			const quantities = Array.from(inputs)
				.map((input) => {
					formData.append(input.name, input.value);
					return input.name === 'quantities' ? input.value : null;
				})
				.filter((value) => value !== null);

			// Add quantity to each product
			cart = cart.map((product, index) => {
				const quantity = quantities[index];
				// Add the quantity to the product
				product.quantity = quantity;
				return product;
			});

			let response = await fetch('/api/admin/sales/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					customerId,
					customer,
					receipt,
					downpayment,
					paymentMethod,
					amount,
					cart,
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
	<div class="grid md:grid-cols-4 grid-cols-1">
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Create Sales Order</h2>
			<label class="label">
				<span>Business</span>
				<select class="select" bind:value={business}>
					<option value="RAC">RAC</option>
					<option value="DTF">DTF</option>
					<option value="RAC-DTF">RAC-DTF</option>
				</select>
			</label>
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
					<option value="Bank Transfer">Bank Transfer</option>
					<option value="GCash">GCash</option>
					<option value="Payable">Payable</option>
					<option value="Cheque">Cheque</option>
				</select>
			</label>
		</div>
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Products</h2>
			<div class="mt-3">
				<label class="label">
					<span>Description</span>
					<input class="input" type="text" name="description" bind:value={description} />
				</label>
				<div class="mt-4">Products</div>
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
		<div class="col-span-2 p-6 flex flex-col gap-4">
			<h2 class="h4">Cart</h2>
			<Table class="mt-4" source={table} />
		</div>
	</div>
	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>
