<script lang="ts">
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Exe Boundary</h3>
    {#if p.WB_NAME}
      <p class="text-gray-600">{p.WB_NAME}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Water Body</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.WB_NAME}<div><strong>Name:</strong> {p.WB_NAME}</div>{/if}
      {#if p.WB_ID}<div><strong>ID:</strong> {p.WB_ID}</div>{/if}
      {#if p.WB_CAT}<div><strong>Category:</strong> {p.WB_CAT}</div>{/if}
      {#if p.version}<div class="col-span-2"><strong>Version:</strong> {p.version}</div>{/if}
    </div>
  </div>

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Basin & Categories</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.RBD_NAME}<div><strong>River Basin District:</strong> {p.RBD_NAME}</div>{/if}
      {#if p.RBD_ID}<div><strong>RBD ID:</strong> {p.RBD_ID}</div>{/if}

      {#if p.MNCAT_NAME}<div><strong>Main Category:</strong> {p.MNCAT_NAME}</div>{/if}
      {#if p.MANCAT_ID}<div><strong>Main Category ID:</strong> {p.MANCAT_ID}</div>{/if}

      {#if p.OPCAT_NAME}<div><strong>Operational Category:</strong> {p.OPCAT_NAME}</div>{/if}
      {#if p.OPCAT_ID}<div><strong>Operational Category ID:</strong> {p.OPCAT_ID}</div>{/if}

      {#if p.hydromorph}<div class="col-span-2"><strong>Hydromorphology:</strong> {p.hydromorph}</div>{/if}
    </div>
  </div>

  {#if p.url}
    <div class="space-y-1">
      <h4 class="font-semibold text-base">Reference</h4>
      <a href={p.url} target="_blank" class="text-blue-600 underline">
        {p.url}
      </a>
    </div>
  {/if}

  <details class="mt-3">
    <summary class="cursor-pointer text-gray-600">Raw properties</summary>
    <pre class="text-xs mt-2 bg-gray-100 p-2 rounded border">
{JSON.stringify(p, null, 2)}
    </pre>
  </details>

</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No Exe Boundary properties found.
</div>
{/if}