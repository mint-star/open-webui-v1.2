<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { suites } from '$lib/appSuiteList';
</script>

<div class="flex flex-wrap items-center gap-2 justify-center md:justify-start">
	{#each suites as suite}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex items-center justify-center font-primary
               py-1.5 px-2.5 sm:px-3 rounded-md text-xs sm:text-sm font-medium
               text-black hover:bg-gray-100 dark:text-white gap-1.5 sm:gap-2
               whitespace-nowrap transition-all duration-200"
				style={`background: #${suite.bg}`}
			>
				<img src={suite.icon} alt="" width="18" class="inline-flex shrink-0" />
				<span class="hidden sm:inline">{suite.suiteName}</span>
				<span class="sm:hidden" aria-label={suite.suiteName}>{suite.suiteName.split(' ')[0]}</span>
				<svg
					class="ml-0.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
               rounded shadow-lg mt-2 py-1 w-[200px] sm:w-[220px] z-999"
			>
				{#each suite.apps as app}
					<DropdownMenu.Item>
						<a
							href={app.href}
							class="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3
                     text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-700
                     transition-colors duration-150"
							aria-label={app.label}
						>
							<img src={app.icon} alt={app.label} class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
							<span class="text-xs sm:text-sm font-medium truncate" title={app.label}>
								{app.label}
							</span>
						</a>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/each}
</div>
