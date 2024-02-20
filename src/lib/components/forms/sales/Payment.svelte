<script lang="ts">
	import { focusTrap, getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	export let drawerStore = () => {};
	export let id: string;

	let isFocused: boolean = true;
	let amount: number;
	let paymentMethod: string = 'Cash';

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
			let response = await fetch('/api/admin/sales/payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: id,
					amount,
					paymentMethod
				})
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastStore.trigger(toastSettings);
			drawerStore.close();
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
		<h2 class="h4">Create Sales Order Payment</h2>
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
				<option value="Cash">Cash</option>
				<option value="Bank Transfer">Bank Transfer</option>
				<option value="GCash">GCash</option>
				<option value="Payable">Payable</option>
				<option value="Cheque">Cheque</option>
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
