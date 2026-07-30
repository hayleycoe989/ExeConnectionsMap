<script lang="ts">
  // Svelte‑5 safe props extraction
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <!-- Header -->
  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Salmon Migration</h3>
    {#if p.riverName}
      <p class="text-gray-600">{p.riverName}</p>
    {/if}
  </div>

  <!-- River Details -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">River Details</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.riverName}<div><strong>River Name:</strong> {p.riverName}</div>{/if}
      {#if p.riverType}<div><strong>River Type:</strong> {p.riverType}</div>{/if}
      {#if p.salmonStat}<div class="col-span-2"><strong>Salmon Status:</strong> {p.salmonStat}</div>{/if}
    </div>
  </div>

  <!-- Catchment & Classification -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Catchment & Classification</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.CaBACatchm}<div><strong>Catchment:</strong> {p.CaBACatchm}</div>{/if}
      {#if p.openrivers}<div><strong>Open Rivers Code:</strong> {p.openrivers}</div>{/if}
      {#if p.SAP}<div><strong>SAP:</strong> {p.SAP}</div>{/if}
      {#if p.SAC}<div><strong>SAC:</strong> {p.SAC}</div>{/if}
    </div>
  </div>

  <!-- Geometry -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Geometry</h4>

    {#if p.Shape__Len}
      <div><strong>Length:</strong> {p.Shape__Len}</div>
    {/if}
  </div>

  <!-- Identifiers -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Identifiers</h4>

    {#if p.FID_1}
      <div><strong>Feature ID:</strong> {p.FID_1}</div>
    {/if}
  </div>

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
  No Salmon Migration properties found.
</div>
{/if}