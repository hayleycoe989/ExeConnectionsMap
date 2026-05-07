<script lang="ts">
	import { Popup } from 'svelte-maplibre-gl';
	import type { Component } from 'svelte';

	let {
		lnglat,
		onclose,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: PopupComponent,
		props,
		offset = 10,
	}: {
		lnglat: [number, number];
		onclose: () => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: Component<any>;
		props: Record<string, unknown>;
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
	<PopupComponent {...props} />
</Popup>
