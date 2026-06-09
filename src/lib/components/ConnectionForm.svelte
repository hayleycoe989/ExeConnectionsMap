<script lang="ts">
    import { X, TriangleAlert, LoaderCircle } from "@lucide/svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Checkbox } from "$lib/components/ui/checkbox";

    import { store } from "$lib/store.svelte";
    import { scale, fade } from "svelte/transition";
    import { tick } from "svelte";
    import { z } from "zod";
    import { CONNECTION_CATEGORIES, type ConnectionCategory } from "$lib/types";

    const schema = z.object({
        name: z.string().min(1, "Name or organisation is required").max(200),
        role: z.string().min(1, "Role is required").max(150),
        link: z.string().max(500).optional(),
    });

    let formData = $state({ name: "", role: "", link: "" });
    let selectedCategories = $state<ConnectionCategory[]>([]);
    let disclaimerAccepted = $state(false);
    let errors = $state<{
        name?: string;
        role?: string;
        link?: string;
        categories?: string;
        disclaimer?: string;
    }>({});
    let isSubmitting = $state(false);
    let disclaimerRef = $state<HTMLDivElement | undefined>();

    $effect(() => {
        if (store.mode.type === "form") {
            formData = { name: "", role: "", link: "" };
            selectedCategories = [];
            disclaimerAccepted = false;
            errors = {};
            isSubmitting = false;
        }
    });

    function toggleCategory(cat: ConnectionCategory) {
        if (selectedCategories.includes(cat)) {
            selectedCategories = selectedCategories.filter((c) => c !== cat);
        } else {
            selectedCategories = [...selectedCategories, cat];
        }
    }

    // Accessible modal: focus the first field on open, keep Tab within the dialog,
    // and return focus to whatever opened it (the "Add a connection" button) on close.
    function trapFocus(node: HTMLElement) {
        const selector =
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = () =>
            Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(
                (el) => el.offsetParent !== null,
            );
        const previouslyFocused = document.activeElement as HTMLElement | null;

        (
            node.querySelector<HTMLElement>("input, textarea") ?? focusable()[0]
        )?.focus();

        function onKeydown(e: KeyboardEvent) {
            if (e.key !== "Tab") return;
            const items = focusable();
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        node.addEventListener("keydown", onKeydown);
        return {
            destroy() {
                node.removeEventListener("keydown", onKeydown);
                previouslyFocused?.focus?.();
            },
        };
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        if (!disclaimerAccepted) {
            errors = {
                ...errors,
                disclaimer: "You must accept the disclaimer to continue.",
            };
            await tick();
            disclaimerRef?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            return;
        }

        const result = schema.safeParse(formData);
        if (!result.success) {
            const flat = z.flattenError(result.error).fieldErrors;
            errors = {
                name: flat.name?.[0],
                role: flat.role?.[0],
                link: flat.link?.[0],
            };
            return;
        }

        const linkVal = formData.link.trim();
        if (linkVal) {
            try {
                new URL(
                    linkVal.startsWith("http") ? linkVal : `https://${linkVal}`,
                );
            } catch {
                errors = { ...errors, link: "Please enter a valid URL." };
                return;
            }
        }

        if (selectedCategories.length === 0) {
            errors = { ...errors, categories: "Select at least one category." };
            return;
        }

        isSubmitting = true;
        errors = {};
        await store.submitConnection({
            ...result.data,
            link: linkVal,
            categories: selectedCategories,
            disclaimerAccepted,
        });
        isSubmitting = false;
    }
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") store.closeForm();
    }}
/>

<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="form-title"
    transition:fade={{ duration: 150 }}
>
    <div
        use:trapFocus
        class="w-full max-w-sm bg-popover border border-rule shadow-lg rounded-sm overflow-hidden flex flex-col max-h-[92vh]"
        transition:scale={{ start: 0.97, duration: 150 }}
    >
        <!-- Header -->
        <div
            class="flex items-center justify-between px-5 py-4 border-b border-rule"
        >
            <h2 id="form-title" class="font-serif text-base text-ink">
                Add a connection
            </h2>
            <button
                type="button"
                onclick={store.closeForm}
                class="p-1 rounded-sm text-muted-ink hover:text-ink hover:bg-accent transition-colors
				       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Close"
            >
                <X class="w-4 h-4" />
            </button>
        </div>

        <!-- Body -->
        <form
            id="connection-form"
            onsubmit={handleSubmit}
            class="flex-1 overflow-y-auto px-5 py-5 space-y-4"
            novalidate
        >
            <!-- Disclaimer -->
            <div
                bind:this={disclaimerRef}
                class="p-3 border border-destructive/30 rounded-sm bg-destructive/5"
            >
                <div class="flex gap-2.5">
                    <TriangleAlert
                        class="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5"
                    />
                    <p class="text-xs leading-relaxed text-ink">
                        Data you enter is stored on a Cloudflare server and may
                        be accessed by the research team. Do not enter sensitive
                        personal information.
                    </p>
                </div>
                <div
                    class="flex items-center gap-2 mt-3 pt-3 border-t border-destructive/20"
                >
                    <Checkbox
                        id="disclaimer"
                        bind:checked={disclaimerAccepted}
                        class="border-destructive/50 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                    />
                    <Label
                        for="disclaimer"
                        class="text-xs text-ink cursor-pointer leading-relaxed"
                    >
                        I understand and wish to proceed
                    </Label>
                </div>
                {#if errors.disclaimer}
                    <p class="text-[10px] text-destructive mt-1">
                        {errors.disclaimer}
                    </p>
                {/if}
            </div>

            <div class="space-y-1.5">
                <label
                    for="s-name"
                    class="block font-serif text-xs text-muted-ink"
                    >Name or organisation</label
                >
                <Input
                    id="s-name"
                    type="text"
                    autocomplete="off"
                    bind:value={formData.name}
                    placeholder="e.g. Jane Smith, Devon Wildlife Trust"
                    class={errors.name ? "border-destructive" : ""}
                />
                {#if errors.name}
                    <p class="text-[10px] text-destructive">{errors.name}</p>
                {/if}
            </div>

            <div class="space-y-1.5">
                <label
                    for="s-role"
                    class="block font-serif text-xs text-muted-ink"
                    >Role or interest</label
                >
                <Textarea
                    id="s-role"
                    bind:value={formData.role}
                    rows={2}
                    placeholder="e.g. Environmental officer, local resident, researcher…"
                    class={`resize-none${errors.role ? " border-destructive" : ""}`}
                />
                {#if errors.role}
                    <p class="text-[10px] text-destructive">{errors.role}</p>
                {/if}
            </div>

            <div class="space-y-1.5">
                <label
                    for="s-link"
                    class="block font-serif text-xs text-muted-ink"
                >
                    Website <span class="font-sans text-muted-ink"
                        >(optional)</span
                    >
                </label>
                <Input
                    id="s-link"
                    type="url"
                    autocomplete="off"
                    bind:value={formData.link}
                    placeholder="https://example.org"
                    class={errors.link ? "border-destructive" : ""}
                />
                {#if errors.link}
                    <p class="text-[10px] text-destructive">{errors.link}</p>
                {/if}
            </div>

            <!-- Categories -->
            <div class="space-y-1.5">
                <p class="font-serif text-xs text-muted-ink">
                    Interest categories
                </p>
                <div class="flex flex-wrap gap-1.5">
                    {#each CONNECTION_CATEGORIES as cat}
                        {@const active = selectedCategories.includes(cat)}
                        <button
                            type="button"
                            onclick={() => toggleCategory(cat)}
                            aria-pressed={active}
                            class="px-2.5 py-1 rounded-sm text-[11px] border transition-colors
							       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
							       {active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-paper text-muted-ink border-rule hover:border-ink/40 hover:text-ink'}"
                        >
                            {cat}
                        </button>
                    {/each}
                </div>
                {#if errors.categories}
                    <p class="text-[10px] text-destructive">
                        {errors.categories}
                    </p>
                {/if}
            </div>
        </form>

        <!-- Footer -->
        <div class="flex gap-2 px-5 py-4 border-t border-rule">
            <button
                type="button"
                onclick={store.closeForm}
                class="flex-1 py-2 text-sm font-serif border border-rule rounded-sm text-muted-ink
				       hover:bg-accent hover:text-ink transition-colors disabled:opacity-40
				       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button
                type="submit"
                form="connection-form"
                class="flex-1 py-2 text-sm font-serif rounded-sm bg-primary text-primary-foreground
				       hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2
				       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                disabled={isSubmitting}
            >
                {#if isSubmitting}
                    <LoaderCircle class="w-3.5 h-3.5 animate-spin" />
                {/if}
                Add connection
            </button>
        </div>
    </div>
</div>
