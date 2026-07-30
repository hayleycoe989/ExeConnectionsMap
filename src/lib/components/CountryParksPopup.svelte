<script lang="ts">
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Country Park</h3>
    {#if p.name}
      <p class="text-gray-600">{p.name}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Details</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.name}<div><strong>Name:</strong> {p.name}</div>{/if}
      {#if p.status}<div><strong>Status:</strong> {p.status}</div>{/if}
      {#if p.theme}<div><strong>Theme:</strong> {p.theme}</div>{/if}
      {#if p.measure}<div><strong>Measure:</strong> {p.measure}</div>{/if}
      {#if p.gridref}<div class="col-span-2"><strong>Grid Reference:</strong> {p.gridref}</div>{/if}
    </div>
  </div>

  {#if p.label}
    <div class="space-y-1">
      <h4 class="font-semibold text-base">Label</h4>
      <div>{p.label}</div>
    </div>
  {/if}

  {#if p.hyperlink}
    <div class="space-y-1">
      <h4 class="font-semibold text-base">Reference</h4>
      <a href={p.hyperlink} target="_blank" class="text-blue-600 underline">
        {p.hyperlink}
      </a>
    </div>
  {/if}

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Identifiers</h4>
    {#if p.ref_code}
      <div><strong>Reference Code:</strong> {p.ref_code}</div>
    {/if}
  </div>

  <details class="mt-3">
    <summary class="cursor-pointer text-gray-600">Raw properties</summary>
    <pre class="text-xs mt-2 bg-gray-100 p-2 rounded border">
{JSON.stringify(p, null, 2)}
    </pre>
  </details>

</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No Country Park properties found.
</div>
{/if}