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
	export let sourceData: string[] = [];

	let isFocused: boolean = true;
	let invoice: string = '';
	let description: string = '';
	let business: string = '';
	let name: string = '';
	let nameOptions: any;
	let item: string = '';
	let amount: number = 0;
	let totalAmount: number = 0;
	let itemOptions: any;
	let cartData: string[] = [];
	let items: string[] = [];
	let cart: string[] = [];
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	let table: TableSource = {
		// A list of heading labels.
		head: ['Name', 'Amount', 'MOD'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(cartData, ['name', 'amount', 'paymentMethod'])
	};

	const updateTable = (cartData: any) => {
		amount = cartData.reduce(
			(a: any, b: any) => parseFloat(a) + parseFloat(stringToDecimal(b.subtotal)),
			0
		);
		if (!cartData.length) {
			table.body = [];
			table.meta = [];
			table.foot = [];
			cartData = [];
			return;
		}
		table.body = tableMapperValues(cartData, ['name', 'amount', 'paymentMethod']);
		table.meta = tableMapperValues(cartData, ['name', 'amount', 'paymentMethod']);
		table.foot = [
			'Total',
			`${formatCurrency(totalAmount)}`,
			`<code class="code">${cartData.length}</code>`
		];
	};

	const uniqueNames = new Set(sourceData.map((data: any) => data.name));
	nameOptions = [...uniqueNames].map((name: any) => {
		return {
			label: name,
			value: name,
			meta: name,
			keywords: name
		};
	});

	// autocomplete name selection event handler function to update name value on selection
	const onNameSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		name = event.detail.value;
	};

	const uniqueItems = new Set(
		sourceData.flatMap((item: any) => item.cart.map((cart) => cart.name))
	);
	if (uniqueItems.size > 0) {
		itemOptions = [...uniqueItems].map((item: any) => {
			return {
				label: item,
				value: item,
				keywords: item
			};
		});
	}

	const onItemAdd = () => {
		let name = items[items.length - 1].toUpperCase();
		let dict: any = {};
		let value = {
			name,
			amount: 0,
			paymentMethod: 'Cash'
		};
		dict = value;
		cart.push(dict);
		item = '';

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputAmount = document.createElement('input');
		inputAmount.setAttribute('class', 'input w-[80px] h-[30px]');
		inputAmount.setAttribute('id', `amounts[${newId}]`);
		inputAmount.setAttribute('type', 'number');
		inputAmount.setAttribute('name', 'amounts');
		inputAmount.setAttribute('placeholder', '0.00');

		// create select element for payment method
		const selectPaymentMethod = document.createElement('select');
		selectPaymentMethod.setAttribute('class', 'select w-[120px] h-[40px]');
		selectPaymentMethod.setAttribute('id', `paymentMethods[${newId}]`);
		selectPaymentMethod.setAttribute('name', 'paymentMethods');
		selectPaymentMethod.innerHTML = `
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="GCash">GCash</option>
            <option value="Payable">Payable</option>
            <option value="Cheque">Cheque</option>
        `;

		cartData[newId] = {
			name,
			amount: inputAmount.outerHTML,
			paymentMethod: selectPaymentMethod.outerHTML
		};
		updateTable(cartData);
		amountEventListener();
		paymentMethodEventListener();
	};

	// autocomplete item selection event handler function to update item value on selection
	const onItemSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		const selectedItem: any[] = [event.detail.value, event.detail.meta];
		items = [...items, selectedItem[0]];
		let dict: any = {};
		let value = {
			name: selectedItem[0].toUpperCase(),
			amount: 0,
			paymentMethod: 'Cash'
		};
		dict = value;
		cart.push(dict);
		item = '';

		// update cart table
		let maxId = Math.max(...Object.keys(cartData).map((key) => parseInt(key)));
		let newId = Number.isFinite(maxId) ? maxId + 1 : 0;

		const inputAmount = document.createElement('input');
		inputAmount.setAttribute('class', 'input w-[80px] h-[30px]');
		inputAmount.setAttribute('id', `amounts[${newId}]`);
		inputAmount.setAttribute('type', 'number');
		inputAmount.setAttribute('name', 'amounts');
		inputAmount.setAttribute('placeholder', '0.00');

		// create select element for payment method
		const selectPaymentMethod = document.createElement('select');
		selectPaymentMethod.setAttribute('class', 'select w-[120px] h-[40px]');
		selectPaymentMethod.setAttribute('id', `paymentMethods[${newId}]`);
		selectPaymentMethod.setAttribute('name', 'paymentMethods');
		selectPaymentMethod.innerHTML = `
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="GCash">GCash</option>
            <option value="Payable">Payable</option>
            <option value="Cheque">Cheque</option>
        `;

		cartData[newId] = {
			name: selectedItem[0].toUpperCase(),
			amount: inputAmount.outerHTML,
			paymentMethod: selectPaymentMethod.outerHTML
		};
		updateTable(cartData);
		amountEventListener();
		paymentMethodEventListener();
	};

	// item input chip event handler
	const onRemoveitem = (e: { detail: { chipIndex: number } }) => {
		cartData.splice(e.detail.chipIndex, 1);
		cart.splice(e.detail.chipIndex, 1);
		updateTable(cartData);
	};

	const amountEventListener = () => {
		setTimeout(() => {
			const inputAmount = document.querySelectorAll('[name="amounts"]');
			inputAmount.forEach((input) => {
				input.addEventListener('change', (event) => {
					// get event target value
					const value = event.target.value;
					const id = event.target.id;
					const index = id.replace('amounts[', '').replace(']', '');

					// set the subtotal to the cart
					cart[index].amount = value;
					totalAmount = cart.reduce(
						(a: any, b: any) => parseFloat(a) + parseFloat(stringToDecimal(b.amount)),
						0
					);

					updateTable(cartData);
				});
			});
		}, 1000);
	};

	const paymentMethodEventListener = () => {
		setTimeout(() => {
			const inputPaymentMethod = document.querySelectorAll('[name="paymentMethods"]');
			inputPaymentMethod.forEach((input) => {
				input.addEventListener('change', (event) => {
					// get event target value
					const value = event.target.value;
					const id = event.target.id;
					const index = id.replace('paymentMethods[', '').replace(']', '');

					// set the subtotal to the cart
					cart[index].paymentMethod = value;

					updateTable(cartData);
				});
			});
		}, 1000);
	};
</script>

<form
	id="expensesForm"
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			const form = document.getElementById('expensesForm');
			let formData = new FormData(form);
			const inputs = document.querySelectorAll('[name]');

			// Add the amounts to the form data
			const amounts = Array.from(inputs)
				.map((input) => {
					formData.append(input.name, input.value);
					return input.name === 'amounts' ? input.value : null;
				})
				.filter((value) => value !== null);

			// Add amount to each item
			cart = cart.map((item, index) => {
				const amount = amounts[index];
				// Add the amount to the item
				item.amount = amount;
				return item;
			});

			// Add the paymentMethods to the form data
			const paymentMethods = Array.from(inputs)
				.map((input) => {
					formData.append(input.name, input.value);
					return input.name === 'paymentMethods' ? input.value : null;
				})
				.filter((value) => value !== null);

			// Add payment method to each item
			cart = cart.map((item, index) => {
				const paymentMethod = paymentMethods[index];
				// Add the payment method to the item
				item.paymentMethod = paymentMethod;
				return item;
			});

			let response = await fetch('/api/admin/expenses/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					invoice,
					business,
					name,
					description,
					totalAmount,
					cart
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
			<h2 class="h4">Create Expenses</h2>
			<label class="label">
				<span>Invoice</span>
				<input
					class="input"
					type="text"
					placeholder="12345678"
					name="invoice"
					bind:value={invoice}
					required
				/>
			</label>
			<label class="label">
				<span>Business</span>
				<select class="select" bind:value={business}>
					<option value="RAC">RAC</option>
					<option value="DTF">DTF</option>
				</select>
			</label>
			<label class="label">
				<span>Description</span>
				<input
					class="input"
					type="text"
					placeholder="Tarpaulin Printing"
					name="description"
					bind:value={description}
					required
				/>
			</label>
			<label class="label">
				<span>Name</span>
				<input
					class="input"
					type="text"
					placeholder="Juan Dela Cruz"
					name="name"
					bind:value={name}
					required
				/>
			</label>
			{#key name}
				{#if name.length > 0 && nameOptions.length > 0}
					<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
						<Autocomplete bind:input={name} options={nameOptions} on:selection={onNameSelection} />
					</div>
				{/if}
			{/key}
		</div>
		<div class="col-span-1 p-6 flex flex-col gap-4">
			<h2 class="h4">Items</h2>
			<div class="mt-3">
				<span>Items</span>
				<InputChip
					bind:input={item}
					bind:value={items}
					name="items"
					allowUpperCase={true}
					allowDuplicates={false}
					on:remove={onRemoveitem}
					on:add={onItemAdd}
				/>
				<div class="card w-full max-w-sm max-h-48 p-4 my-4 overflow-y-auto" tabindex="-1">
					<Autocomplete bind:input={item} options={itemOptions} on:selection={onItemSelection} />
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
