<script lang="ts">
	import {
		Avatar,
		Drawer,
		getDrawerStore,
		getToastStore,
		Table,
		tableMapperValues
	} from '@skeletonlabs/skeleton';
	import type { DrawerSettings, TableSource, ToastSettings } from '@skeletonlabs/skeleton';
	import Update from '$lib/components/forms/sales/Update.svelte';
	import Payment from '$lib/components/forms/sales/Payment.svelte';
	import UpdatePayment from '$lib/components/forms/sales/UpdatePayment.svelte';
	import dateToString from '$lib/utils/dateHelper';
	import { formatCurrency } from '$lib/utils/currencyHelper.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let data;

	let { sales } = data;
	let sourceData: any = [];
	let customerData: any = [];
	let productData: any = [];
	let cartData: any = [];
	let tableProducts: TableSource = {
		head: ['Business', 'Name', 'Description', 'Price', 'Quantity', 'Subtotal'],
		body: tableMapperValues(sales?.cart, ['business', 'name', 'description', 'price', 'quantity', 'subtotal'])
	};
	let isReady: Boolean = false;
	let paymentIndex: number;
	let amount: number;
	let paymentMethod: string = 'Cash';

	let tablePayments: TableSource = {
		head: ['Date', 'MOD', 'Amount', 'Actions'],
		body: tableMapperValues(sales?.payments || [], [
			'createdAt',
			'paymentMethod',
			'amount',
			'updateButton'
		])
	};

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	const confirmDeletionSettings: ToastSettings = {
		message: 'This action is irreversible. Are you sure you want to delete this record?',
		background: 'bg-yellow-600',
		action: {
			label: 'Yes',
			response: () => handleDelete()
		},
		timeout: 8000
	};

	const confirmPaymentDeletionSettings: ToastSettings = {
		message: 'This action is irreversible. Are you sure you want to delete this record?',
		background: 'bg-yellow-600',
		action: {
			label: 'Yes',
			response: () => handlePaymentDelete(paymentIndex)
		},
		timeout: 8000
	};



	// drawer settings
	const drawerUpdate: DrawerSettings = {
		id: 'updateSalesOrder',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[1920px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerPayment: DrawerSettings = {
		id: 'paymentSalesOrder',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[480px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right'
	};

	const drawerUpdatePayment: DrawerSettings = {
		id: 'updatePayment',
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

	// get full name initial from customer.fullname
	let fullNameInitial = sales?.customer?.fullName
		.split(' ')
		.map((name: string) => name[0])
		.join('');

	async function loadData() {
		try {
			isReady = false;
			let response = await fetch('/api/admin/sales', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let result = await response.json();
			sourceData = result.response.sales;
			customerData = result.response.customers;
			productData = result.response.products;
			cartData = sourceData?.cart;

			// set update button for each payment
			if (sales?.payments) {
				sales.payments.forEach((item: any, i) => {
					const updateButton = createButton('button', 'Update', i, 'updateButtons');
					const deleteButton = createButton('button', 'Delete', i, 'deleteButtons');
					item.updateButton = updateButton;
					item.deleteButton = deleteButton;
				});
				updateEventListener();
				deletePaymentEventListener();
				sales?.payments.map((item: any) => {
					item.actions = `
					<div class="btn-group variant-filled overflow-auto">
						${item.updateButton}
						${item.deleteButton}
					</div>
					`;
				});
				tablePayments.body = tableMapperValues(sales?.payments || [], [
					'createdAt',
					'paymentMethod',
					'amount',
					'actions'
				]);
			}

			isReady = true;
		} catch (error) {
			console.error(error);
		}
	}

	const createButton = (
		type: 'button' | 'submit' | 'reset',
		textContent: string,
		index: number,
		id: string,
	) => {
		const button = document.createElement('button');
		button.type = type;
		button.id = id;
		button.dataset.index = index.toString();
		button.textContent = textContent;

		return button.outerHTML;
	};

	const updateEventListener = () => {
		setTimeout(() => {
			const updateButtons = document.querySelectorAll('[id="updateButtons"]');
			updateButtons.forEach((input) => {
				input.addEventListener('click', (event) => {
					paymentIndex = event?.target?.dataset?.index;
					amount = sales.payments[paymentIndex].amount;
					paymentMethod = sales.payments[paymentIndex].paymentMethod;
					drawerStore.open(drawerUpdatePayment);
				});
			});
		}, 1000);
	};

	const deletePaymentEventListener = () => {
		setTimeout(() => {
			const deleteButtons = document.querySelectorAll('[id="deleteButtons"]');
			deleteButtons.forEach((input) => {
				input.addEventListener('click', (event) => {
					paymentIndex = event?.target?.dataset?.index;
					toastStore.trigger(confirmPaymentDeletionSettings)
				});
			});
		}, 1000);
	};

	const handleDelete = async () => {
		try {
			let response = await fetch('/api/admin/sales/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ _id: sales?._id })
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			goto('/dashboard/sales');
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	};

	const handlePaymentDelete = async (paymentIndex: number) => {
		try {
			let response = await fetch('/api/admin/sales/payment/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ _id: sales?._id, paymentIndex })
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			window.location.reload();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	};

	

	onMount(async () => {
		await loadData();
	});
</script>

<div class="card p-4">
	<header class="card-header flex items-center justify-between gap-4">
		<div class="flex gap-4 items-center">
			<Avatar initials={fullNameInitial} background="bg-primary-500" fontSize={250} width="w-28" />
			<h1 class="h1">{sales?.customer?.fullName || 'NA'}</h1>
		</div>
		<div>
			<div class="btn-group variant-filled overflow-auto">
				<button type="button" on:click={() => drawerStore.open(drawerPayment)}>Add Payment</button>
				<button type="button" on:click={() => drawerStore.open(drawerUpdate)}>Edit</button>
				<button type="button" on:click={() => toastStore.trigger(confirmDeletionSettings)}>Delete</button>
				<button type="button" on:click={() => window.history.back()}>Close</button>
			</div>
		</div>
	</header>
	<section class="p-4 flex flex-col md:flex-row gap-4">
		<div class="flex flex-col w-full gap-4 border-r-0 md:border-r">
			<div class="flex flex-col">
				<h4 class="h4">Date</h4>
				<p class="p text-lg">{sales?.createdAt ? dateToString(sales?.createdAt) : 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Email</h4>
				<p class="p text-lg">{sales?.customer?.email || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">TIN</h4>
				<p class="p text-lg">{sales?.customer?.tin || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Phone</h4>
				<p class="p text-lg">{sales?.customer?.phone || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Address</h4>
				<p class="p text-lg">{sales?.customer?.address || 'NA'}</p>
			</div>
			<div class="flex flex-col">
				<h4 class="h4">Date Updated</h4>
				<p class="p text-lg">{sales?.updatedAt ? dateToString(sales?.updatedAt) : 'NA'}</p>
			</div>
		</div>
		<div class="flex flex-col w-full gap-4">
			<div class="flex flex-col w-full">
				<h2 class="h2 mb-4 w-full">Cart</h2>
				<Table source={tableProducts} />
			</div>
			{#key isReady}
				{#if isReady}
					<div class="flex flex-col w-full px-3">
						<div class="flex justify-between">
							<p>Total</p>
							<p>{formatCurrency(sales?.amount) || 0.0}</p>
						</div>
						<div class="flex justify-between">
							<p>Downpayment</p>
							<p>{formatCurrency(sales?.downpayment) || 0.0}</p>
						</div>
						<div class="flex justify-between">
							<p>Payment</p>
							<p>{formatCurrency(sales?.totalPayment) || 0.0}</p>
						</div>
						<div class="flex justify-between">
							<p>Balance</p>
							<p>{formatCurrency(sales?.balance) || 0.0}</p>
						</div>
					</div>
					<div class="flex flex-col w-full">
						<h2 class="h2 mb-4 w-full">Payments</h2>

						<Table source={tablePayments} />
					</div>
				{:else}
					<div class="flex flex-col w-full px-3">
						<div class="flex justify-between">
							<p>Total</p>
							<p class="placeholder w-52 animate-pulse"></p>
						</div>
						<div class="flex justify-between">
							<p>Downpayment</p>
							<p class="placeholder w-52 animate-pulse"></p>
						</div>
						<div class="flex justify-between">
							<p>Payment</p>
							<p class="placeholder w-52 animate-pulse"></p>
						</div>
						<div class="flex justify-between">
							<p>Balance</p>
							<p class="placeholder w-52 animate-pulse"></p>
						</div>
					</div>
					<div class="flex flex-col w-full">
						<h2 class="h2 mb-4 w-full">Payments</h2>

						<table class="table">
							<thead>
								<tr>
									<th>Date</th>
									<th>MOD</th>
									<th>Amount</th>
									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								<tr>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
								</tr>
								<tr>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
									<td><div class="placeholder w-18 animate-pulse"></div></td>
								</tr>
								<!-- Add more rows as needed -->
							</tbody>
						</table>
					</div>
				{/if}
			{/key}
		</div>
	</section>
</div>

<Drawer>
	{#if $drawerStore.id === 'updateSalesOrder'}
		<Update
			id={sales?._id}
			moduleName={'sales'}
			{sales}
			customer={sales?.customer?.fullName}
			{drawerStore}
			{customerData}
			{productData}
		/>
	{:else if $drawerStore.id === 'paymentSalesOrder'}
		<Payment id={sales?._id} {drawerStore} />
	{:else if $drawerStore.id === 'updatePayment'}
		<UpdatePayment
			id={sales?._id}
			index={paymentIndex}
			{amount}
			{paymentMethod}
			{drawerStore}
			createdAt={sales?.payments[paymentIndex]?.createdAt}
			createdBy={sales?.payments[paymentIndex]?.createdBy}
		/>
	{/if}
</Drawer>
