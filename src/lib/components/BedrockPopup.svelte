<script lang="ts">
  const p = $props();
</script>

{#if p}
<div class="p-4 text-sm space-y-4">

  <div class="border-b pb-2">
    <h3 class="font-bold text-lg tracking-wide">Bedrock Geology</h3>
    {#if p.LEX_D}
      <p class="text-gray-600">{p.LEX_D}</p>
    {/if}
  </div>

  <!-- etc… all references must be p.* -->
</div>
{:else}
<div class="p-3 bg-red-200 text-red-900">
  No Bedrock properties found.
</div>
{/if}