<script lang="ts">
  const { props } = $props<{ props: any }>();
</script>

<div class="p-3 text-sm">
  <h3 class="font-bold">River Exe</h3>
  <pre class="text-xs">{JSON.stringify(props, null, 2)}</pre>
</div>
