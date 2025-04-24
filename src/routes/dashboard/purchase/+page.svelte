<div class="flex flex-col w-full items-center justify-center align-middle h-screen">
	<h1 class="h1">Purchase Order</h1>
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
	<h2 class="h2">Coming Soon...</h2>
</div>

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
