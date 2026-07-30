<script lang="ts">
  // Svelte‑5 safe props extraction
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <!-- Header -->
  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Temperate Rainforest</h3>
    {#if p.name}
      <p class="text-gray-600">{p.name}</p>
    {/if}
  </div>

  <!-- Location & Site Info -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Site Information</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.site_name}<div><strong>Site Name:</strong> {p.site_name}</div>{/if}
      {#if p.status}<div><strong>Status:</strong> {p.status}</div>{/if}
      {#if p.district}<div><strong>District:</strong> {p.district}</div>{/if}
      {#if p.parish}<div><strong>Parish:</strong> {p.parish}</div>{/if}
      {#if p.antiquity}<div class="col-span-2"><strong>Antiquity:</strong> {p.antiquity}</div>{/if}
    </div>
  </div>

  <!-- Environmental Metrics -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Environmental Metrics</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.tmp_rf}<div><strong>Temp RF:</strong> {p.tmp_rf}</div>{/if}
      {#if p.hygrotherm}<div><strong>Hygrotherm:</strong> {p.hygrotherm}</div>{/if}
      {#if p.rainfall_a}<div><strong>Annual Rainfall:</strong> {p.rainfall_a}</div>{/if}
      {#if p.temp_avera}<div><strong>Average Temperature:</strong> {p.temp_avera}</div>{/if}
      {#if p.tsr_area_h}<div class="col-span-2"><strong>Area (ha):</strong> {p.tsr_area_h}</div>{/if}
    </div>
  </div>

  <!-- NBN Records -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">NBN Records</h4>

    <div class="grid grid-cols-2 gap-2">
      {#if p.has_nbn_li}<div><strong>Has NBN Lichen:</strong> {p.has_nbn_li}</div>{/if}
      {#if p.n_nbn_lich}<div><strong>Lichen Count:</strong> {p.n_nbn_lich}</div>{/if}

      {#if p.has_nbn__1}<div><strong>Has NBN Liverwort:</strong> {p.has_nbn__1}</div>{/if}
      {#if p.n_nbn_live}<div><strong>Liverwort Count:</strong> {p.n_nbn_live}</div>{/if}

      {#if p.has_nbn_mo}<div><strong>Has NBN Moss:</strong> {p.has_nbn_mo}</div>{/if}
      {#if p.n_nbn_moss}<div><strong>Moss Count:</strong> {p.n_nbn_moss}</div>{/if}
    </div>
  </div>

  <!-- Identifiers -->
  <div class="space-y-2">
    <h4 class="font-semibold text-base">Identifiers</h4>

    <div class="space-y-1">
      {#if p.id}<div><strong>ID:</strong> {p.id}</div>{/if}
      {#if p.tsr_id}<div><strong>TSR ID:</strong> {p.tsr_id}</div>{/if}
      {#if p.unique_id}<div><strong>Unique ID:</strong> {p.unique_id}</div>{/if}
      {#if p.layer}<div><strong>Layer:</strong> {p.layer}</div>{/if}
    </div>
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
  No Temperate Rainforest properties found.
</div>
{/if}