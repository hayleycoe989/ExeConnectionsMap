<script lang="ts">
  const p = $props();
</script>

<div class="p-3 text-sm space-y-3">
  <h3 class="font-bold">Possible Site of Temperate Rainforest</h3>
  <pre class="text-xs">{JSON.stringify(p, null, 2)}</pre>

  <div class="pt-2 border-t">
    <a
      href="https://map.lostrainforestsofbritain.org/#"
      target="_blank"
      rel="noopener noreferrer"
      class="text-blue-600 underline text-xs"
    >
      View on Lost Rainforests of Britain map
    </a>
  </div>
</div>
