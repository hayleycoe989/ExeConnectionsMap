<script lang="ts">
  // Svelte‑5 safe props extraction
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <!-- Header -->
  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Wetland Feature</h3>
    {#if p.WB_NAME}
      <p class="text-gray-600">{p.WB_NAME}</p>
    {/if}
  </div>

  <!-- Identifiers -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Identifiers</h4>

    {#if p.WB_ID}<div><strong>WB ID:</strong> {p.WB_ID}</div>{/if}
    {#if p.WB_CAT}<div><strong>WB Category:</strong> {p.WB_CAT}</div>{/if}
    {#if p.OPCAT_ID}<div><strong>OPCAT ID:</strong> {p.OPCAT_ID}</div>{/if}
    {#if p.MANCAT_ID}<div><strong>MANCAT ID:</strong> {p.MANCAT_ID}</div>{/if}
    {#if p.version}<div><strong>Version:</strong> {p.version}</div>{/if}
  </div>

  <!-- Names & Categories -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Names & Categories</h4>

    {#if p.MNCAT_NAME}<div><strong>Main Category Name:</strong> {p.MNCAT_NAME}</div>{/if}
    {#if p.OPCAT_NAME}<div><strong>OPCAT Name:</strong> {p.OPCAT_NAME}</div>{/if}
    {#if p.RBD_NAME}<div><strong>River Basin District:</strong> {p.RBD_NAME}</div>{/if}
    {#if p.hydromorph}<div><strong>Hydromorphology:</strong> {p.hydromorph}</div>{/if}
  </div>

  <!-- Reference -->
  {#if p.url}
    <div class="space-y-1">
      <h4 class="font-semibold text-base">Reference</h4>
      <a href={p.url} target="_blank" class="text-blue-600 underline">
        {p.url}
      </a>
    </div>
  {/if}

  <!-- Raw JSON -->
  <details class="mt-3">
    <summary class="cursor-pointer text-gray-600">Raw properties</summary>
    <pre class="text-xs mt-2 bg-gray-100 p-2 rounded border">
{JSON.stringify(p, null, 2)}
    </pre>
  </details>

</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No Wetland properties found.
</div>
{/if}