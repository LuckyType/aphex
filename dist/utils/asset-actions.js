import * as i18n from '../i18n/index.js';
import { toast } from 'svelte-sonner';
/**
 * Copy a URL to the clipboard, showing a toast on success/failure.
 */
export async function copyUrlToClipboard(url) {
    try {
        const shareableUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(shareableUrl);
        toast.success(i18n.t('URL copied to clipboard'));
        return true;
    }
    catch {
        toast.error(i18n.t('Failed to copy URL'));
        return false;
    }
}
/**
 * Download a file by programmatically creating and clicking an anchor element.
 */
export function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
