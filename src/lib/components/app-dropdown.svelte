<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import { suites } from "$lib/appSuiteList";
</script>

<div class="flex items-center gap-2">
  {#each suites as suite}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="inline-flex items-center justify-center font-primary
               py-1.5 px-3 rounded-md text-sm font-medium
               text-black hover:bg-gray-100 dark:text-white"
      >
        {suite.suiteName}
        <svg
          class="ml-2 h-4 w-4"
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
        class="bg-white border border-gray-200
               rounded shadow-lg mt-2 py-1 w-[220px] z-999"
      >
        {#each suite.apps as app}
          <DropdownMenu.Item>
            <a
              href={app.href}
              class="px-4 py-3 flex items-center gap-3
                     text-gray-900 hover:bg-indigo-50"
            >
              <img
                src={app.icon}
                alt={app.label}
                class="w-5 h-5 shrink-0"
              />
              <span class="text-sm font-medium">
                {app.label}
              </span>
            </a>
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/each}
</div>
