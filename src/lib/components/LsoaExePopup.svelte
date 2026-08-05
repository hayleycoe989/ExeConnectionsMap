<script lang="ts">
  const p = $props();

  const areaKm2 = p.Shape__Are ? (p.Shape__Are / 1_000_000).toFixed(2) : null;
</script>

<div class="p-4 text-sm space-y-3 min-w-[220px]">
  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">{p.LSOA21NM ?? 'LSOA'}</h3>
    {#if p.LSOA21CD}
      <p class="text-gray-500 text-xs font-mono">{p.LSOA21CD}</p>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-2">
    {#if p.Urban_rura}
      <div>
        <span class="block text-gray-500 text-xs">Classification</span>
        <span class="font-medium">{p.Urban_rura}</span>
      </div>
    {/if}

    {#if areaKm2}
      <div>
        <span class="block text-gray-500 text-xs">Area</span>
        <span class="font-medium">{areaKm2} km²</span>
      </div>
    {/if}
  </div>

  {#if p.RUC21NM}
    <div class="pt-2 border-t">
      <span class="block text-gray-500 text-xs">Rural-Urban Classification</span>
      <span>{p.RUC21NM}</span>
    </div>
  {/if}
</div>
