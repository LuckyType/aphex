import { mount, unmount } from 'svelte';
import PortableTextInlineView from './PortableTextInlineView.svelte';
export function SvelteInlineNodeViewRenderer(onEdit, onDelete) {
    return (props) => {
        const wrapper = document.createElement('span');
        wrapper.setAttribute('data-portable-text-inline', '');
        wrapper.setAttribute('data-node-view-wrapper', '');
        wrapper.contentEditable = 'false';
        wrapper.style.display = 'inline';
        let nodeAttrs = props.node.attrs;
        function mountView() {
            return mount(PortableTextInlineView, {
                target: wrapper,
                props: {
                    type: nodeAttrs._type,
                    nodeKey: nodeAttrs._key,
                    data: nodeAttrs.data,
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
                if (node.type.name !== 'portableTextInlineObject')
                    return false;
                nodeAttrs = node.attrs;
                unmount(currentComponent);
                currentComponent = mountView();
                return true;
            },
            selectNode() {
                wrapper.classList.add('ProseMirror-selectednode');
                onEdit({
                    _type: nodeAttrs._type,
                    _key: nodeAttrs._key,
                    data: nodeAttrs.data
                });
            },
            deselectNode() {
                wrapper.classList.remove('ProseMirror-selectednode');
            },
            destroy() {
                unmount(currentComponent);
            },
            stopEvent(event) {
                if (event.type === 'mousedown' || event.type === 'click')
                    return true;
                return false;
            },
            ignoreMutation() {
                return true;
            }
        };
    };
}
