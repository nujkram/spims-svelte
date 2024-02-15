<script lang="ts">
	import { focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export let drawerStore = () => {};
	export let id: string;
	export let index: number;
	export let amount: number;
	export let paymentMethod: string;
	export let createdBy: string;
	export let createdAt: Date;

	let isFocused: boolean = true;

	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
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
			let response = await fetch('/api/admin/sales/update-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: id,
					index,
					amount,
					paymentMethod,
					createdBy,
					createdAt
				})
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
	}}
>
	<div class="p-6 flex flex-col gap-4">
		<h2 class="h4">Update Payment</h2>
		<!-- dropdown business -->
		<label class="label">
			<span>Amout</span>
			<input
				class="input"
				type="text"
				placeholder="0.00"
				name="amount"
				bind:value={amount}
				required
			/>
		</label>
		<label class="label">
			<span>Payment Method</span>
			<select class="select" bind:value={paymentMethod}>
				<option value="CASH" selected={paymentMethod === 'CASH'}>Cash</option>
				<option value="BANK TRANSFER" selected={paymentMethod === 'BANK TRANSFER'}
					>Bank Transfer</option
				>
				<option value="GCASH" selected={paymentMethod === 'GCASH'}>GCash</option>
				<option value="PAYABLE" selected={paymentMethod === 'PAYABLE'}>Payable</option>
				<option value="CHEQUE" selected={paymentMethod === 'CHEQUE'}>Cheque</option>
			</select>
		</label>
	</div>
	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>
