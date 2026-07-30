<script lang="ts">
  // Svelte‑5 safe props extraction
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">WMS Feature</h3>
    {#if p.label}
      <p class="text-gray-600">{p.label}</p>
    {/if}
  </div>

  {#if p.comment}
    <div class="bg-gray-50 p-3 rounded border text-gray-800">
      <strong class="block mb-1">Description</strong>
      {p.comment}
    </div>
  {/if}

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Location</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.easting}<div><strong>Easting:</strong> {p.easting}</div>{/if}
      {#if p.northing}<div><strong>Northing:</strong> {p.northing}</div>{/if}
      {#if p.lat}<div><strong>Latitude:</strong> {p.lat}</div>{/if}
      {#if p.long}<div><strong>Longitude:</strong> {p.long}</div>{/if}
      {#if p.notation}<div class="col-span-2"><strong>Notation:</strong> {p.notation}</div>{/if}
    </div>
  </div>

  <div class="space-y-2">
    <h4 class="font-semibold text-base">Identifiers</h4>

    {#if p.Join_Count}<div><strong>Join Count:</strong> {p.Join_Count}</div>{/if}
    {#if p.TARGET_FID}<div><strong>Target FID:</strong> {p.TARGET_FID}</div>{/if}

    {#if p.F_id}
      <div>
        <strong>Feature ID:</strong>
        <a href={p.F_id} target="_blank" class="text-blue-600 underline">
          {p.F_id}
        </a>
      </div>
    {/if}
  </div>

</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No WMS properties found.
</div>
{/if}