<script lang="ts">
	import { models } from '$lib/stores';
	import { DropdownMenu, Dialog } from 'bits-ui';
	import { suites, type AppSuite, type AppItem } from '$lib/appSuiteList';
	import XMark from './icons/XMark.svelte';

	let showNoAccessModal = false;

	const updateSuiteAccess = (
		suites: AppSuite[],
		userAccess: { id: string; [key: string]: any }[]
	): AppSuite[] => {
		const accessibleModelIds = new Set(userAccess.map((item) => item.id));

		return suites.map((suite) => ({
			...suite,
			apps: suite.apps.map((app) => ({
				...app,
				access: !app.model || accessibleModelIds.has(app.model)
			}))
		}));
	};

	const handleAppClick = (e: MouseEvent, app: AppItem) => {
		if (!app.access) {
			e.preventDefault();
			showNoAccessModal = true;
		}
	};

	$: apps = updateSuiteAccess(suites, $models);
</script>

<div class="flex lg:hidden items-center">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="inline-flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium bg-gray-100 text-black hover:bg-gray-200 whitespace-nowrap suites-btn"
		>
			Suites
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
			class="bg-white border border-gray-200 rounded shadow-lg mt-2 py-1 w-[250px] z-[999] dark:bg-gray-850 dark:border-gray-700"
		>
			{#each apps as suite}
				<div
					class="px-4 py-2 text-sm font-semibold uppercase flex items-center gap-2 suites-btn"
					style="background: #{suite.bg}"
				>
					<span class="text-black dark:text-white">{suite.suiteName}</span>
				</div>

				{#each suite.apps as app}
					<DropdownMenu.Item>
						<a
							href={app.href}
							on:click={(e) => handleAppClick(e, app)}
              target={!app.model ? "_blank" : "_self"}
							class="px-4 py-3 flex items-center gap-3 text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-gray-800 {!app.access
								? 'opacity-60'
								: ''}"
						>
							<img src={app.icon} alt={app.label} class="w-5 h-5 shrink-0" />
							<span class="text-sm font-medium">{app.label}</span>
							{#if !app.access}
								<svg class="w-3 h-3 ml-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</a>
					</DropdownMenu.Item>
				{/each}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<div class="hidden lg:flex items-center gap-2">
	{#each apps as suite}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex items-center justify-center font-primary py-1.5 px-3 rounded-md text-sm font-medium text-black hover:bg-gray-100 gap-2 suites-btn"
				style="background: #{suite.bg}"
			>
				<img src={suite.icon} alt="" width="18" class="inline-flex" />
				{suite.suiteName}
				<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				class="bg-white border border-gray-200 rounded shadow-lg mt-2 py-1 w-[250px] z-[999] dark:bg-gray-850 dark:border-gray-700"
			>
				{#each suite.apps as app}
					<DropdownMenu.Item>
						<a
							href={app.href}
              target={!app.model ? "_blank" : "_self"}
							on:click={(e) => handleAppClick(e, app)}
							class="px-4 py-3 flex items-center gap-3 text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-gray-800 {!app.access
								? 'opacity-60'
								: ''}"
						>
							<img src={app.icon} alt={app.label} class="w-5 h-5 shrink-0" />
							<span class="text-sm font-medium">{app.label}</span>
							{#if !app.access}
								<span class="ml-auto text-xs">🔒</span>
							{/if}
						</a>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/each}
</div>

<Dialog.Root bind:open={showNoAccessModal}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[1000] bg-black/50" />

		<Dialog.Content
			class="fixed z-[1001] top-1/2 left-1/2 w-[90vw] max-w-sm
             -translate-x-1/2 -translate-y-1/2
             bg-white rounded-lg shadow-xl p-6 text-center"
		>
			<Dialog.Title class="text-lg font-bold text-red-600 mb-2">RESTRICTED ACCESS</Dialog.Title>

			<Dialog.Description class="text-gray-800 mb-4 text-sm">
				For access, kindly contact
				<a href="mailto:titan.support@jiostar.com" class="font-medium">titan.support@jiostar.com</a
				>.
			</Dialog.Description>
			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
			>
				<div>
					<XMark className="w-5 h-5"></XMark>
					<span class="sr-only">Close</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
