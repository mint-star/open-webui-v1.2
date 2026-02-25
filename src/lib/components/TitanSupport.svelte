<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { onDestroy } from 'svelte';

	import { user } from '$lib/stores';
	import {
		PUBLIC_GRANT_TYPE,
		PUBLIC_CLIENT_ID,
		PUBLIC_CLIENT_SECRET,
		PUBLIC_MYSPACE_API_URL
	} from '$env/static/public';

	export let open = false;
	export let onClose: () => void = () => {};
	export let userEmail: string = '';

	type RequestType = 'issue' | 'question' | 'suggestion';

	interface UploadedFile {
		id: number;
		file: File;
		preview: string;
		name: string;
	}

	interface OAuthTokenResponse {
		access_token: string;
		token_type: string;
		expires_in?: number;
	}

	let requestType: RequestType = 'issue';
	let description = '';
	const maxLength = 2000;
	const maxFiles = 20;
	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

	let supportID: string = '';

	let uploadedFiles: UploadedFile[] = [];
	let isDragging = false;
	let isSubmitting = false;
	let isFetchingToken = false;
	let bearerToken = '';
	let errorMessage = '';
	let fileErrorMessage = '';
	let fileInput: HTMLInputElement;
	let dropZone: HTMLDivElement;
	let dragCounter = 0;
	let pasteSuccess = false;

	// ─── SUCCESS MODAL (only addition) ────────────────────────────────────────
	let showSuccessModal = false;

	function handleSuccessClose(): void {
		showSuccessModal = false;
		open = false;
		onClose();
	}
	// ──────────────────────────────────────────────────────────────────────────

	const requestTypeMap: Record<RequestType, string> = {
		issue: 'issue',
		question: 'question',
		suggestion: 'suggestion'
	};

	// ─── OAuth Token ───────────────────────────────────────────────────────────

	async function fetchBearerToken(): Promise<void> {
		isFetchingToken = true;
		errorMessage = '';

		try {
			const response = await fetch(`${PUBLIC_MYSPACE_API_URL}/oauth/token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					grant_type: PUBLIC_GRANT_TYPE,
					client_id: PUBLIC_CLIENT_ID,
					client_secret: PUBLIC_CLIENT_SECRET
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch token: ${response.status}`);
			}

			const data: OAuthTokenResponse = await response.json();

			if (!data.access_token) {
				throw new Error('No access token in response');
			}

			bearerToken = data.access_token;
		} catch (err) {
			console.error('Token fetch error:', err);
			errorMessage = 'Failed to authenticate. Please close and reopen the dialog.';
		} finally {
			isFetchingToken = false;
		}
	}

	// Fetch token whenever dialog opens (and we don't already have one)
	$: if (open && !bearerToken) {
		fetchBearerToken();
	}

	// ─── Paste listener ────────────────────────────────────────────────────────

	function handleGlobalPaste(e: ClipboardEvent) {
		if (!open) return;
		fileErrorMessage = '';
		pasteSuccess = false;

		const items = Array.from(e.clipboardData?.items ?? []);
		const imageItems = items.filter((item) => allowedTypes.includes(item.type));

		if (imageItems.length === 0) return;

		e.preventDefault();

		const files: File[] = imageItems.map((item) => {
			const blob = item.getAsFile()!;
			const ext = item.type.split('/')[1];
			return new File([blob], `clipboard-${Date.now()}.${ext}`, { type: item.type });
		});

		const validated = validateAndFilter(files);
		if (validated.length) {
			addFiles(validated);
			pasteSuccess = true;
			setTimeout(() => (pasteSuccess = false), 2000);
		}
	}

	$: if (open) {
		document.addEventListener('paste', handleGlobalPaste);
	} else {
		document.removeEventListener('paste', handleGlobalPaste);
	}

	// ─── Clipboard API button ──────────────────────────────────────────────────

	async function handlePasteFromClipboard(): Promise<void> {
		fileErrorMessage = '';
		pasteSuccess = false;

		if (!navigator.clipboard?.read) {
			fileErrorMessage = 'Clipboard API not supported. Use Ctrl+V / Cmd+V instead.';
			return;
		}

		try {
			const clipboardItems = await navigator.clipboard.read();
			const imageItems = clipboardItems.filter((item) =>
				item.types.some((t) => allowedTypes.includes(t))
			);

			if (imageItems.length === 0) {
				fileErrorMessage =
					'No image found in clipboard. Try Ctrl+V / Cmd+V after copying a screenshot.';
				return;
			}

			const blobs = await Promise.all(
				imageItems.map(async (item) => {
					const type = item.types.find((t) => allowedTypes.includes(t))!;
					const blob = await item.getType(type);
					const ext = type.split('/')[1];
					return new File([blob], `clipboard-${Date.now()}.${ext}`, { type });
				})
			);

			const files = validateAndFilter(blobs);
			if (files.length) {
				addFiles(files);
				pasteSuccess = true;
				setTimeout(() => (pasteSuccess = false), 2000);
			}
		} catch (err) {
			fileErrorMessage =
				"Couldn't access clipboard. Use Ctrl+V / Cmd+V to paste a screenshot directly.";
			console.error('Clipboard error:', err);
		}
	}

	// ─── Validation ────────────────────────────────────────────────────────────

	function validateAndFilter(files: File[]): File[] {
		fileErrorMessage = '';

		const invalid = files.filter((f) => !allowedTypes.includes(f.type));
		if (invalid.length > 0) {
			fileErrorMessage = `Invalid file type${invalid.length > 1 ? 's' : ''}: only PNG, JPG and JPEG are allowed.`;
		}

		const valid = files.filter((f) => allowedTypes.includes(f.type));
		const remaining = maxFiles - uploadedFiles.length;

		if (valid.length > remaining) {
			fileErrorMessage = `Maximum ${maxFiles} screenshots allowed. ${valid.length - remaining} file${
				valid.length - remaining > 1 ? 's were' : ' was'
			} skipped.`;
			return valid.slice(0, remaining);
		}

		return valid;
	}

	// ─── Drop zone ─────────────────────────────────────────────────────────────

	$: if (dropZone) {
		attachDropListeners();
	}

	function attachDropListeners(): void {
		dropZone.addEventListener('dragenter', onDragEnter);
		dropZone.addEventListener('dragleave', onDragLeave);
		dropZone.addEventListener('dragover', onDragOver);
		dropZone.addEventListener('drop', onDrop);
	}

	function detachDropListeners(): void {
		if (!dropZone) return;
		dropZone.removeEventListener('dragenter', onDragEnter);
		dropZone.removeEventListener('dragleave', onDragLeave);
		dropZone.removeEventListener('dragover', onDragOver);
		dropZone.removeEventListener('drop', onDrop);
	}

	function onDragEnter(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		dragCounter++;
		isDragging = true;
	}

	function onDragLeave(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		dragCounter--;
		if (dragCounter <= 0) {
			dragCounter = 0;
			isDragging = false;
		}
	}

	function onDragOver(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}

	function onDrop(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		dragCounter = 0;
		isDragging = false;
		const raw = Array.from(e.dataTransfer?.files ?? []);
		const files = validateAndFilter(raw);
		if (files.length) addFiles(files);
	}

	onDestroy(() => {
		detachDropListeners();
		document.removeEventListener('paste', handleGlobalPaste);
	});

	// ─── File handling ─────────────────────────────────────────────────────────

	function handleFileSelect(event: Event): void {
		const input = event.target as HTMLInputElement;
		const raw = Array.from(input.files ?? []);
		const files = validateAndFilter(raw);
		if (files.length) addFiles(files);
		input.value = '';
	}

	function addFiles(files: File[]): void {
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				uploadedFiles = [
					...uploadedFiles,
					{
						id: Date.now() + Math.random(),
						file,
						preview: e.target?.result as string,
						name: file.name
					}
				];
			};
			reader.readAsDataURL(file);
		});
	}

	function removeFile(fileId: number): void {
		uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
		fileErrorMessage = '';
	}

	// ─── Submit ────────────────────────────────────────────────────────────────

	async function handleSubmit(): Promise<void> {
		if (!description.trim()) {
			errorMessage = 'Please enter a description';
			return;
		}

		if (!bearerToken) {
			// Try re-fetching token if we don't have one
			await fetchBearerToken();
			if (!bearerToken) return; // fetchBearerToken sets errorMessage
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const formData = new FormData();
			formData.append('request_type', requestTypeMap[requestType]);
			formData.append('description', description.trim());
			formData.append("email", $user?.email || "");

			uploadedFiles.forEach((fileObj, index) => {
				formData.append(`attachments_attributes[${index}][attachment_file]`, fileObj.file);
			});

			const response = await fetch(
				`${PUBLIC_MYSPACE_API_URL}/api/external/titan/support_requests`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`
					},
					body: formData
				}
			);
			const res = await response.json();
			supportID = res.data.id;

			// If 401, token may have expired — refresh and retry once
			if (response.status === 401) {
				await fetchBearerToken();
				if (!bearerToken) return;

				const retryResponse = await fetch(
					`${PUBLIC_MYSPACE_API_URL}/api/external/titan/support_requests`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${bearerToken}`
						},
						body: formData
					}
				);

				if (!retryResponse.ok) {
					const errorData = await retryResponse.json().catch(() => ({}));
					throw new Error(
						(errorData as { message?: string }).message ||
							`Failed to submit support request: ${retryResponse.status}`
					);
				}
				const res1 = await retryResponse.json();
				supportID = res1.data.id;
				await retryResponse.json();
			} else if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					(errorData as { message?: string }).message ||
						`Failed to submit support request: ${response.status}`
				);
			}

			// Reset form
			requestType = 'issue';
			description = '';
			uploadedFiles = [];
			bearerToken = '';
			dragCounter = 0;
			isDragging = false;
			fileErrorMessage = '';
			pasteSuccess = false;
			open = false;

			// ─── Show success modal instead of alert (only change here) ───────────
			showSuccessModal = true;
			// ──────────────────────────────────────────────────────────────────────
		} catch (error) {
			console.error('Error submitting support request:', error);
			errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to submit support request. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<!-- ─── Success Modal ──────────────────────────────────────────────────────── -->
{#if showSuccessModal}
	<div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/50"
			on:click={handleSuccessClose}
			role="presentation"
		></div>

		<div
			class="relative z-10 bg-white dark:bg-gray-850 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center"
		>
			<!-- Animated tick -->
			<div
				class="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-5"
			>
				<svg class="w-10 h-10" viewBox="0 0 52 52" fill="none">
					<circle cx="26" cy="26" r="24" stroke="#bbf7d0" stroke-width="2.5" fill="none" />
					<polyline
						points="14 26 22 34 38 18"
						stroke="#22c55e"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="checkmark"
					/>
				</svg>
			</div>

			<h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 mb-2">Request Submitted!</h2>
			<p class="text-sm text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
				Your support request has been received.
			</p>

			<div
				class="w-full bg-slate-100 dark:bg-gray-500 dark:text-white text-black py-3 px-4 rounded-xl mb-7 text-sm flex items-center"
			>
				<span class="opacity-70">Ticket ID:</span> <span class="font-semibold ml-auto">{supportID}</span>
			</div>

			<button
				on:click={handleSuccessClose}
				class="w-full btn-primary bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
			>
				Done
			</button>
		</div>
	</div>
{/if}

<!-- ─── Support Modal (completely unchanged) ──────────────────────────────── -->
<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/50 z-100" />

		<Dialog.Content class="fixed inset-0 z-101 overflow-y-auto">
			<div class="flex min-h-full items-start justify-center py-10 px-4">
				<div class="w-full max-w-2xl bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-6 relative">
					<button
						class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-lg leading-none"
						on:click={() => {
							open = false;
							onClose();
						}}
					>
						✕
					</button>

					<Dialog.Title class="text-xl font-bold text-slate-900 dark:text-gray-200 mb-1">
						TITAN Support
					</Dialog.Title>
					<Dialog.Description class="text-sm text-slate-400 dark:text-gray-500 mb-5">
						If something isn't working as expected or you have a suggestion, please let us know.
						<hr class="border-slate-100 dark:border-gray-800 mt-3" />
					</Dialog.Description>

					<!-- Token loading state -->
					{#if isFetchingToken}
						<div
							class="flex items-center justify-center gap-2 py-8 text-slate-400 dark:text-gray-500 text-sm"
						>
							<svg
								class="animate-spin h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Authenticating...
						</div>
					{:else}
						<!-- Type of Request -->
						<div class="mb-6">
							<div class="text-sm font-medium text-slate-800 dark:text-gray-200">
								Type of Request <span class="text-red-500">*</span>
							</div>

							<p class="text-slate-500 dark:text-gray-500 text-[13px] mt-0.5 mb-2.5 opacity-80">
								{#if requestType === 'issue'}
									Report something that isn't working as expected.
								{:else if requestType === 'question'}
									Ask how something works.
								{:else}
									Propose a new capability or improvement.
								{/if}
							</p>

							<div class="flex gap-2 flex-wrap">
								<button
									on:click={() => (requestType = 'issue')}
									class={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-[13px] transition-all border
                  ${
										requestType === 'issue'
											? 'bg-rose-400 text-white dark:bg-rose-400/60 dark:border-rose-400'
											: 'bg-rose-50 text-rose-400 border-rose-200 hover:border-rose-300 dark:bg-gray-800 dark:border-gray-600 dark:text-rose-400'
									}`}
								>
									<svg
										class="w-[14px] h-[14px]"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M8 2l1.5 1.5" /><path d="M14.5 3.5L16 2" />
										<path d="M9 7.5C9 6.12 10.12 5 11.5 5h1C13.88 5 15 6.12 15 7.5" />
										<path d="M6.5 9H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
										<path d="M17.5 9H20a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
										<path d="M9 21v-4a3 3 0 0 1 6 0v4" />
										<rect x="9" y="7" width="6" height="14" rx="3" />
										<path d="M3 19h3" /><path d="M18 19h3" />
										<path d="M3 14h2" /><path d="M19 14h2" />
									</svg>
									Issue
								</button>

								<button
									on:click={() => (requestType = 'question')}
									class={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-[13px] transition-all border
                  ${
										requestType === 'question'
											? 'bg-indigo-500 text-white dark:bg-indigo-400/60 dark:border-indigo-400'
											: 'bg-indigo-50 text-indigo-500 border-indigo-200 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-600 dark:text-indigo-300'
									}`}
								>
									<svg
										class="w-[14px] h-[14px]"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="12" r="10" />
										<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
										<line x1="12" y1="17" x2="12.01" y2="17" />
									</svg>
									Question
								</button>

								<button
									on:click={() => (requestType = 'suggestion')}
									class={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-[13px] transition-all border
                  ${
										requestType === 'suggestion'
											? 'bg-blue-500 text-white dark:bg-blue-400/60 dark:border-blue-400'
											: 'bg-blue-50 text-blue-500 border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-blue-300'
									}`}
								>
									<svg
										class="w-[14px] h-[14px]"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path
											d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
										/>
										<path d="M9 18h6" /><path d="M10 22h4" />
									</svg>
									Suggestion
								</button>
							</div>
						</div>

						<!-- Description -->
						<div class="mb-6">
							<div class="text-sm font-medium text-slate-800 dark:text-gray-200 mb-2.5">
								Description <span class="text-red-500">*</span>
							</div>
							<div class="relative">
								<textarea
									bind:value={description}
									maxlength={maxLength}
									rows={7}
									placeholder={requestType === 'issue'
										? 'Describe what happened, what you expected, and how to reproduce it.'
										: requestType === 'question'
											? 'What would you like to know?'
											: 'Describe the improvement you have in mind and the problem it would solve.'}
									class="w-full rounded-2xl bg-white dark:bg-gray-800 border-1 border-slate-200 focus:border-slate-300 dark:border-gray-700 p-4 pb-9
                       text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500
                       focus:outline-none resize-none"
								></textarea>
								<span
									class="absolute bottom-[7px] left-[1px] right-[1px] text-xs text-slate-400 px-3 py-2 text-right bg-white rounded-b-2xl border-t-1 border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
								>
									{description.length}/{maxLength}
								</span>
							</div>
						</div>

						<!-- Screenshot Upload -->
						<div class="mb-6">
							<div class="flex items-center justify-between">
								<div class="text-sm font-medium text-slate-800 dark:text-gray-200">
									Screenshots
									<span class="text-slate-400 dark:text-gray-500 font-normal text-sm"
										>(optional)</span
									>
								</div>

								<button
									on:click={handlePasteFromClipboard}
									disabled={uploadedFiles.length >= maxFiles}
									class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                       {uploadedFiles.length >= maxFiles
										? 'text-slate-300 dark:text-gray-600 cursor-not-allowed'
										: pasteSuccess
											? 'text-green-600 dark:text-green-400'
											: 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-200'}"
									title="Paste image from clipboard (or press Ctrl+V / Cmd+V)"
								>
									{#if pasteSuccess}
										<svg
											class="w-3.5 h-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Pasted!
									{:else}
										<svg
											class="w-3.5 h-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<rect x="9" y="2" width="6" height="4" rx="1" />
											<path
												d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"
											/>
										</svg>
										Paste
									{/if}
								</button>
							</div>
							<p
								class="text-slate-500 dark:text-gray-500 text-[13px] mt-0.5 mb-2.5 opacity-80 mb-2.5"
							>
								Max 20 files · PNG, JPG only
							</p>

							<input
								type="file"
								accept=".png,.jpg,.jpeg"
								multiple
								on:change={handleFileSelect}
								class="hidden"
								bind:this={fileInput}
							/>

							<div
								bind:this={dropZone}
								on:click={() => uploadedFiles.length < maxFiles && fileInput.click()}
								role="button"
								tabindex="0"
								class="flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-6 transition-colors select-none
                     {uploadedFiles.length >= maxFiles
									? 'cursor-not-allowed opacity-50 border-slate-200 dark:border-gray-700'
									: isDragging
										? 'cursor-pointer border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
										: 'cursor-pointer border-slate-200 text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 dark:border-gray-700'}"
							>
								<svg
									class="w-5 h-5 text-slate-400 dark:text-gray-400 shrink-0 pointer-events-none"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" y1="3" x2="12" y2="15" />
								</svg>
								<p
									class="text-sm text-slate-400 dark:text-gray-400 pointer-events-none select-none"
								>
									{#if uploadedFiles.length >= maxFiles}
										Maximum of {maxFiles} screenshots reached
									{:else if isDragging}
										Release to upload
									{:else}
										Drag & drop, <span class="font-semibold text-slate-700 dark:text-gray-200"
											>click to upload</span
										>, or paste with Ctrl/Cmd + V
									{/if}
								</p>
							</div>

							{#if fileErrorMessage}
								<p class="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
									<svg
										class="w-3.5 h-3.5 shrink-0"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="12" cy="12" r="10" />
										<line x1="12" y1="8" x2="12" y2="12" />
										<line x1="12" y1="16" x2="12.01" y2="16" />
									</svg>
									{fileErrorMessage}
								</p>
							{/if}
						</div>

						<!-- File Previews -->
						{#if uploadedFiles.length > 0}
							<div class="mb-6">
								<div class="flex flex-wrap gap-3">
									{#each uploadedFiles as file (file.id)}
										<div class="relative w-[80px] h-[80px] group">
											<img
												src={file.preview}
												alt={file.name}
												class="w-full h-full object-contain rounded-lg border-2 border-slate-200 dark:border-gray-700"
											/>
											<button
												on:click={() => removeFile(file.id)}
												class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white
                             w-6 h-6 text-xs flex items-center justify-center rounded-full shadow-md
                             transition-all opacity-0 group-hover:opacity-100"
												title="Remove file"
											>
												✕
											</button>
											<div
												class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
											>
												{file.name}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Error Message -->
						{#if errorMessage}
							<div
								class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
							>
								<p class="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
							</div>
						{/if}

						<button
							on:click={handleSubmit}
							disabled={!description.trim() || isSubmitting || isFetchingToken}
							class="w-full font-semibold py-3 rounded-xl transition-colors
                   {description.trim() && !isSubmitting && !isFetchingToken
								? 'btn-primary bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
								: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}"
						>
							{#if isSubmitting}
								<span class="flex items-center justify-center gap-2">
									<svg
										class="animate-spin h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Submitting...
								</span>
							{:else}
								Send to Support
							{/if}
						</button>
					{/if}
					<!-- end isFetchingToken -->
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.checkmark {
		stroke-dasharray: 40;
		stroke-dashoffset: 40;
		animation: draw 0.45s ease-out 0.1s forwards;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
