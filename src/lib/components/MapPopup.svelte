<script lang="ts">
  import { Popup } from 'svelte-maplibre-gl';
  import type { Component } from 'svelte';

  let {
    lnglat,
    onclose,
    component,
    props,
    offset = 10
  }: {
    lnglat: [number, number];
    onclose?: () => void;
    component: Component;
    props?: Record<string, unknown>;
    offset?: number;
  } = $props();
</script>

<Popup
  {lnglat}
  {onclose}
  {offset}
  closeButton={false}
  closeOnClick={false}
  maxWidth="none"
  class="z-20 modern-popup"
>
  {#if props}
    {@const PopupComponent = component}
    <PopupComponent {...props} />
  {:else}
    <div class="p-3 bg-red-200 text-red-900">
      No properties passed to popup renderer.
    </div>
  {/if}
</Popup>