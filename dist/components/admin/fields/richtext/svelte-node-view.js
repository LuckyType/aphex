import { mount, unmount } from 'svelte';
import PortableTextObjectView from './PortableTextObjectView.svelte';
import PortableTextImageView from './PortableTextImageView.svelte';
export function SvelteNodeViewRenderer(onEdit, onDelete, 
/**
 * Look up a block type's schema (its entry in the field's `of`) so the card can
 * honour that type's `preview` config instead of guessing a title/subtitle from
 * the raw data. Optional — without it the card falls back to the old heuristic.
 */
resolveSchema, 
/**
 * Resolve a custom preview component for a block type. When one exists it's mounted
 * instead of the generic card, so the author sees the real block inline. It receives
 * the same props (including `onEdit`/`onDelete`), so editing still works.
 */
resolveComponent) {
    return (props) => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-portable-text-object', '');
        wrapper.setAttribute('data-node-view-wrapper', '');
        wrapper.contentEditable = 'false';
        let nodeAttrs = props.node.attrs;
        // Built-ins and app-registered previews share BlockPreviewProps, so all three
        // mount through one call site.
        function getViewComponent() {
            // An app-registered preview wins — it renders the real block inline.
            const custom = resolveComponent?.(nodeAttrs._type);
            if (custom)
                return custom;
            return nodeAttrs._type === 'image' ? PortableTextImageView : PortableTextObjectView;
        }
        function mountView() {
            return mount(getViewComponent(), {
                target: wrapper,
                props: {
                    type: nodeAttrs._type,
                    nodeKey: nodeAttrs._key,
                    data: nodeAttrs.data,
                    schema: resolveSchema?.(nodeAttrs._type),
                    selected: false,
                    onEdit: () => {
                        onEdit({
                            _type: nodeAttrs._type,
                            _key: nodeAttrs._key,
                            data: nodeAttrs.data
                        });
                    },
                    onDelete: () => {
                        onDelete(nodeAttrs._key);
                    }
                }
            });
        }
        let currentComponent = mountView();
        return {
            dom: wrapper,
            update(node) {
                if (node.type.name !== 'portableTextObject')
                    return false;
                const prevType = nodeAttrs._type;
                const prevRef = nodeAttrs.data?.asset?._ref;
                nodeAttrs = node.attrs;
                const nextType = nodeAttrs._type;
                const nextRef = nodeAttrs.data?.asset?._ref;
                // Image views re-fetch their asset on mount, so a blind remount makes the
                // thumbnail flash (or briefly disappear) on every keystroke/selection. Skip
                // the remount when the image is visually unchanged — alt edits don't touch the
                // thumbnail. Other block types still remount so their content stays in sync.
                if (prevType === 'image' && nextType === 'image' && prevRef === nextRef) {
                    return true;
                }
                unmount(currentComponent);
                currentComponent = mountView();
                return true;
            },
            selectNode() {
                wrapper.classList.add('ProseMirror-selectednode');
            },
            deselectNode() {
                wrapper.classList.remove('ProseMirror-selectednode');
            },
            destroy() {
                unmount(currentComponent);
            },
            stopEvent() {
                return true;
            },
            ignoreMutation() {
                return true;
            }
        };
    };
}
