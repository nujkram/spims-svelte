<script lang="ts">
	import { Drawer, getDrawerStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { DrawerSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SHA256 } from 'crypto-js';

	export let data;
	const { user } = data;

	let username = '';
	let password = '';
	let error = '';
	let loggingIn = false;
	let hasAccess = false;
	$: {
		if (user) {
			hasAccess = true;
			redirect();
		} else {
			setTimeout(() => {
				hasAccess = false;
			}, 500);
		}
	}

	const redirect = () => {
		goto('/dashboard');
	}

	const handleLogin = async () => {
		const securePassword = await SHA256(password).toString();
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ username, password: securePassword })
		});
		const data = await response.json();

		if (data.error) {
			error = data.errorMessage || 'An error occured';
			loggingIn = false;

			toastSettings.message = 'Invalid username or password';
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
		} else {
			page.subscribe((value) => {
				value.data.user = {
					_id: data.user._id,
					profile: {
						email: data.user.email,
						firstName: data.user.firstName,
						lastName: data.user.lastName,
						phone: data.user.phone,
						fullName: data.user.fullName
					},
					email: data.user.email
				};
			});

			toastSettings.message = `Welcome back ${data.user.firstName}!`;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);

			drawerStore.close();
			goto('/dashboard');
		}
	};

	// drawer settings
	const drawerLogin: DrawerSettings = {
		id: 'login',
		// Provide your property overrides:
		bgDrawer: 'bg-gradient-to-t from-slate-900 via-gray-950 to-zinc-950 text-white',
		bgBackdrop: 'bg-gradient-to-tr from-slate-900/50 via-gray-950/50 to-zinc-950/50',
		width: 'w-[280px] md:w-[480px]',
		padding: 'p-4',
		rounded: 'rounded-xl',
		position: 'right',
	};

	const drawerStore = getDrawerStore();
	drawerStore.close();

	// toats settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};
</script>

<div class="container h-full mx-auto flex justify-center items-center lg:pr-64  pr-0">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="md:h2 h4">Welcome to Rage Avenue Co.</h2>
		<!-- Animated Logo -->
		<figure>
			<section class="img-bg" />
			<svg
				id="Layer_1"
				data-name="Layer 1"
				class="fill-token"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1000 288"
			>
				<defs>
					<style>
						.cls-2 {
							font-size: 294.45px;
							font-family: Game-Battles-2, 'Game Battles 2';
						}
					</style>
				</defs>
				<path
					fill-rule="evenodd"
					class="cls-1"
					d="M25.89,76.36V234.07h3.87c23.73,0,43-21.09,43-47V29.35H68.94C45.2,29.35,25.89,50.44,25.89,76.36ZM65.07,37.72V187.06c0,19.92-13.67,36.51-31.44,38.64V76.36C33.63,56.44,47.29,39.85,65.07,37.72Z"
				/>
				<path
					fill-rule="evenodd"
					class="cls-1"
					d="M111.6,29.11h-4.09v78.1h0V184.8c0,26,19.41,47.24,43.26,47.24h4.09v-78.1h0V76.36C154.86,50.31,135.45,29.11,111.6,29.11Zm35.09,97.83c-7.1-10.77-18.21-18.17-30.95-19.5,0-.25-.06-.49-.06-.75V38c17.54,2.25,31,18.72,31,38.38Zm0,27.52v68.71c-17.54-2.24-31-18.71-31-38.37V134.22c7.1,10.77,18.21,18.17,30.94,19.5C146.63,154,146.69,154.21,146.69,154.46Zm-29.75-38.08c13.94,2.37,25,13.72,28.49,28.39C131.49,142.41,120.42,131.06,116.94,116.38Z"
				/>
				<path
					fill-rule="evenodd"
					class="cls-1"
					d="M232.61,27.08c-23.73,0-43.05,21.09-43.05,47V231.81h3.87c23.74,0,43-21.09,43-47V27.08Zm-3.87,8.37V184.8c0,19.92-13.66,36.5-31.44,38.64V74.1C197.3,54.17,211,37.59,228.74,35.45Z"
				/>
				<g class="cls-2">
					<path
						fill-rule="evenodd"
						class="cls-1"
						d="M402.58,219.69,281.31,98.49h138.6L402.58,81.16H272.68v-52H428.53l69.3,69.3v52H411.21l69.3,69.23Z"
					/>
					<path
						fill-rule="evenodd"
						class="cls-1"
						d="M688.33,219.69V150.46H567.06v69.23h-51.9V98.49h129.9L627.73,81.16H515.16v-52H653.68l86.63,86.62V271.59Z"
					/>
					<path
						fill-rule="evenodd"
						class="cls-1"
						d="M844.18,219.69l-86.55-86.55V29.19H982.78v52H809.53v26l60.68,60.68H982.78v51.9Z"
					/>
				</g>
			</svg>
		</figure>
		<!-- / -->
		<div class="flex justify-center space-x-2">
			<button
				type="button"
				class="btn variant-filled"
				on:click={() => drawerStore.open(drawerLogin)}>Login</button
			>
		</div>
	</div>
</div>

<Drawer>
	<h1 class="h1 mx-6 pt-4">Login</h1>
	<form
		method="POST"
		autocomplete="off"
		class="p-6"
		on:submit={(e) => {
			e.preventDefault();
			if (!loggingIn) {
				loggingIn = true;
				handleLogin();
			}
		}}
	>
		<label class="label mt-4">
			<span>Username</span>
			<input class="input" type="text" placeholder="username" name="username" bind:value={username} />
		</label>
		<label class="label mt-4">
			<span>Password</span>
			<input class="input" type="password" placeholder="password" name="password" bind:value={password} />
		</label>

		<button type="submit" class="btn variant-filled mt-4">Login</button>
	</form>
</Drawer>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
