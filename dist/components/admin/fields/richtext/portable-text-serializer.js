let keyCounter = 0;
function genKey() {
    return (++keyCounter).toString(36) + Math.random().toString(36).slice(2, 6);
}
const DECORATOR_MAP = {
    bold: 'strong',
    italic: 'em',
    underline: 'underline',
    strike: 'strike-through',
    code: 'code'
};
const DECORATOR_MAP_REVERSE = Object.fromEntries(Object.entries(DECORATOR_MAP).map(([k, v]) => [v, k]));
function extractMarksFromNode(node, markDefs) {
    const marks = [];
    if (!node.marks)
        return marks;
    for (const mark of node.marks) {
        const markType = typeof mark === 'string' ? mark : mark.type;
        const markAttrs = typeof mark === 'string' ? {} : mark.attrs || {};
        if (markType === 'link') {
            const key = genKey();
            markDefs.push({
                _type: 'link',
                _key: key,
                href: markAttrs.href || ''
            });
            marks.push(key);
        }
        else if (markType?.startsWith('annotation_')) {
            const annotationType = markType.slice('annotation_'.length);
            const key = markAttrs._key || genKey();
            const existing = markDefs.find((d) => d._key === key);
            if (existing) {
                Object.assign(existing, { _type: annotationType, ...(markAttrs.data || {}) });
            }
            else {
                markDefs.push({
                    _type: annotationType,
                    _key: key,
                    ...(markAttrs.data || {})
                });
            }
            if (!marks.includes(key))
                marks.push(key);
        }
        else if (DECORATOR_MAP[markType]) {
            marks.push(DECORATOR_MAP[markType]);
        }
    }
    return marks;
}
function prosemirrorBlockToPortableText(node, listItem, level) {
    const markDefs = [];
    const children = [];
    if (node.content) {
        for (const child of node.content) {
            if (child.type === 'text') {
                const marks = extractMarksFromNode(child, markDefs);
                children.push({
                    _type: 'span',
                    _key: genKey(),
                    text: child.text || '',
                    marks: marks.length > 0 ? marks : undefined
                });
            }
            else if (child.type === 'hardBreak') {
                children.push({
                    _type: 'span',
                    _key: genKey(),
                    text: '\n'
                });
            }
            else if (child.type === 'portableTextInlineObject') {
                const { _type, _key, data } = child.attrs || {};
                children.push({ _type, _key: _key || genKey(), ...data });
            }
        }
    }
    if (children.length === 0) {
        children.push({ _type: 'span', _key: genKey(), text: '' });
    }
    let style = 'normal';
    if (node.type === 'heading') {
        style = `h${node.attrs?.level || 1}`;
    }
    else if (node.type === 'blockquote') {
        style = 'blockquote';
    }
    const block = {
        _type: 'block',
        _key: genKey(),
        style,
        children,
        markDefs: markDefs.length > 0 ? markDefs : undefined
    };
    if (listItem) {
        block.listItem = listItem;
        block.level = level;
    }
    return block;
}
function flattenListItems(node, listType, level, result) {
    if (!node.content)
        return;
    for (const listItem of node.content) {
        if (listItem.type !== 'listItem')
            continue;
        for (const child of listItem.content || []) {
            if (child.type === 'paragraph' || child.type === 'heading') {
                result.push(prosemirrorBlockToPortableText(child, listType, level));
            }
            else if (child.type === 'bulletList' || child.type === 'orderedList') {
                const nestedType = child.type === 'bulletList' ? 'bullet' : 'number';
                flattenListItems(child, nestedType, level + 1, result);
            }
        }
    }
}
export function tiptapToPortableText(doc) {
    const blocks = [];
    if (!doc.content)
        return blocks;
    for (const node of doc.content) {
        if (node.type === 'paragraph' || node.type === 'heading') {
            blocks.push(prosemirrorBlockToPortableText(node));
        }
        else if (node.type === 'blockquote') {
            for (const child of node.content || []) {
                if (child.type === 'paragraph') {
                    const block = prosemirrorBlockToPortableText(child);
                    block.style = 'blockquote';
                    blocks.push(block);
                }
            }
        }
        else if (node.type === 'bulletList' || node.type === 'orderedList') {
            const listType = node.type === 'bulletList' ? 'bullet' : 'number';
            flattenListItems(node, listType, 1, blocks);
        }
        else if (node.type === 'codeBlock') {
            const text = node.content?.[0]?.text ?? '';
            blocks.push({
                _type: 'block',
                _key: genKey(),
                style: 'code',
                children: [{ _type: 'span', _key: genKey(), text }],
                markDefs: undefined
            });
        }
        else if (node.type === 'portableTextObject') {
            const { _type, _key, data } = node.attrs || {};
            blocks.push({ _type, _key: _key || genKey(), ...data });
        }
    }
    return blocks;
}
function buildMarkLookup(markDefs) {
    const map = new Map();
    if (markDefs) {
        for (const def of markDefs) {
            map.set(def._key, def);
        }
    }
    return map;
}
function spansToTiptapContent(children, markDefs) {
    const markLookup = buildMarkLookup(markDefs);
    const result = [];
    for (const child of children) {
        if (child._type !== 'span') {
            const { _type, _key, ...data } = child;
            result.push({
                type: 'portableTextInlineObject',
                attrs: { _type, _key, data }
            });
            continue;
        }
        const span = child;
        if (span.text === '\n') {
            result.push({ type: 'hardBreak' });
            continue;
        }
        // ProseMirror rejects empty text nodes
        if (!span.text)
            continue;
        const marks = [];
        if (span.marks) {
            for (const markRef of span.marks) {
                const def = markLookup.get(markRef);
                if (def && def._type === 'link') {
                    // Only supply `href` and let the Link extension fill target/rel/class from its
                    // own schema defaults — so a link rebuilt on load is byte-identical to one created
                    // by typing or pasting. Hand-setting nulls here diverges from the extension's
                    // defaults (e.g. `class: 'richtext-link'`), which left loaded links rendering inert
                    // until the content was re-parsed via cut/paste.
                    marks.push({ type: 'link', attrs: { href: def.href } });
                }
                else if (def) {
                    const { _type, _key, ...data } = def;
                    marks.push({
                        type: `annotation_${_type}`,
                        attrs: { _key, data }
                    });
                }
                else if (DECORATOR_MAP_REVERSE[markRef]) {
                    marks.push({ type: DECORATOR_MAP_REVERSE[markRef] });
                }
            }
        }
        result.push({
            type: 'text',
            text: span.text,
            ...(marks.length > 0 ? { marks } : {})
        });
    }
    return result;
}
export function portableTextToTiptap(value) {
    const doc = { type: 'doc', content: [] };
    if (!value || value.length === 0) {
        doc.content = [{ type: 'paragraph' }];
        return doc;
    }
    let i = 0;
    while (i < value.length) {
        const node = value[i];
        if (node._type !== 'block') {
            const { _type, _key, ...data } = node;
            doc.content.push({
                type: 'portableTextObject',
                attrs: { _type, _key, data }
            });
            i++;
            continue;
        }
        const block = node;
        if (block.listItem) {
            const listType = block.listItem === 'number' ? 'orderedList' : 'bulletList';
            const listNode = buildListNode(value, i, listType, block.level || 1);
            doc.content.push(listNode.node);
            i = listNode.nextIndex;
            continue;
        }
        if (block.style === 'code') {
            const text = block.children
                .filter((c) => c._type === 'span')
                .map((c) => c.text)
                .join('');
            doc.content.push({
                type: 'codeBlock',
                attrs: { language: null },
                content: text ? [{ type: 'text', text }] : []
            });
        }
        else if (block.style === 'blockquote') {
            const content = spansToTiptapContent(block.children, block.markDefs);
            doc.content.push({
                type: 'blockquote',
                content: [{ type: 'paragraph', content: content.length > 0 ? content : undefined }]
            });
        }
        else if (block.style?.startsWith('h')) {
            const level = parseInt(block.style.slice(1), 10);
            const content = spansToTiptapContent(block.children, block.markDefs);
            doc.content.push({
                type: 'heading',
                attrs: { level },
                content: content.length > 0 ? content : undefined
            });
        }
        else {
            const content = spansToTiptapContent(block.children, block.markDefs);
            doc.content.push({
                type: 'paragraph',
                content: content.length > 0 ? content : undefined
            });
        }
        i++;
    }
    return doc;
}
function buildListNode(blocks, startIndex, listType, level) {
    const items = [];
    let i = startIndex;
    while (i < blocks.length) {
        const node = blocks[i];
        if (node._type !== 'block')
            break;
        const block = node;
        if (!block.listItem)
            break;
        const blockLevel = block.level || 1;
        if (blockLevel < level)
            break;
        if (blockLevel === level) {
            const content = spansToTiptapContent(block.children, block.markDefs);
            const itemContent = [{ type: 'paragraph', content }];
            i++;
            const next = i < blocks.length ? blocks[i] : null;
            if (next &&
                next._type === 'block' &&
                next.listItem &&
                (next.level || 1) > level) {
                const nestedType = next.listItem === 'number' ? 'orderedList' : 'bulletList';
                const nested = buildListNode(blocks, i, nestedType, blockLevel + 1);
                itemContent.push(nested.node);
                i = nested.nextIndex;
            }
            items.push({ type: 'listItem', content: itemContent });
        }
        else {
            break;
        }
    }
    const nodeType = listType === 'orderedList' ? 'orderedList' : 'bulletList';
    return {
        node: { type: nodeType, content: items },
        nextIndex: i
    };
}
