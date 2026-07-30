<script lang="ts">
  // Svelte‑5 safe props extraction
  const p = $props();
  const data = p.props as Record<string, any>;
</script>

{#if data}
<div class="p-4 text-sm space-y-4">

  <!-- Header -->
  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Exe River</h3>
    {#if data.WB_NAME}
      <p class="text-gray-600">{data.WB_NAME}</p>
    {/if}
  </div>

  <!-- Water Body -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Water Body</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if data.WB_NAME}<div><strong>Name:</strong> {data.WB_NAME}</div>{/if}
      {#if data.WB_ID}<div><strong>ID:</strong> {data.WB_ID}</div>{/if}
      {#if data.version}<div class="col-span-2"><strong>Version:</strong> {data.version}</div>{/if}
    </div>
  </div>

  <!-- Basin & Categories -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Basin & Categories</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if data.RBD_NAME}<div><strong>River Basin District:</strong> {data.RBD_NAME}</div>{/if}
      {#if data.RBD_ID}<div><strong>RBD ID:</strong> {data.RBD_ID}</div>{/if}

      {#if data.MNCAT_NAME}<div><strong>Main Category:</strong> {data.MNCAT_NAME}</div>{/if}
      {#if data.MANCAT_ID}<div><strong>Main Category ID:</strong> {data.MANCAT_ID}</div>{/if}

      {#if data.OPCAT_NAME}<div><strong>Operational Category:</strong> {data.OPCAT_NAME}</div>{/if}
      {#if data.OPCAT_ID}<div><strong>Operational Category ID:</strong> {data.OPCAT_ID}</div>{/if}

      {#if data.hydromorph}<div class="col-span-2"><strong>Hydromorphology:</strong> {data.hydromorph}</div>{/if}
    </div>
  </div>

  <!-- Reference -->
  {#if data.url}
    <div class="space-y-1">
      <h4 class="font-semibold text-base">Reference</h4>
      <a href={data.url} target="_blank" class="text-blue-600 underline">
        {data.url}
      </a>
    </div>
  {/if}

  <!-- Raw JSON -->
  <details class="mt-3">
    <summary class="cursor-pointer text-gray-600">Raw properties</summary>
    <pre class="text-xs mt-2 bg-gray-100 p-2 rounded border">
{JSON.stringify(data, null, 2)}
    </pre>
  </details>

</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No Exe Rivers properties found.
</div>
{/if}
