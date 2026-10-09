export default function elementEvents(node, { events, enabled = true }) {
    if (events && enabled) {
        for (const e of events) {
            node.addEventListener(e.name, e.handler, e.options);
        }
    }
    return {
        destroy() {
            if (events && enabled) {
                for (const e of events) {
                    node.removeEventListener(e.name, e.handler, e.options);
                }
            }
        }
    };
}
