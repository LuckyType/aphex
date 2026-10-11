<script lang="ts">
	// The close button `@aphexcms/ui`'s Dialog.Content draws, with its screen
	// reader name in Studio text. Pair it with `showCloseButton={false}`.
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import * as i18n from '../../i18n/index';
</script>

<DialogPrimitive.Close
	class="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
>
	<XIcon />
	<span class="sr-only">{i18n.t('Close')}</span>
</DialogPrimitive.Close>
