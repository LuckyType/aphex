import { defineCapability, mergeCapabilityCatalog } from '../types/capabilities.js';
import { BUILT_IN_EVENT_CONSUMERS } from '../events/built-in-consumers.js';
export function createPartResolver(plugins = []) {
    // Core's own consumers come first, so a plugin declaring the same id collides in the
    // duplicate check below rather than silently shadowing erasure.
    const allParts = [
        ...BUILT_IN_EVENT_CONSUMERS,
        ...plugins.flatMap((p) => p.parts ?? [])
    ];
    // Duplicate-id validation, per extension point. Parts without an id (schema,
    // capabilities, field-component) are exempt.
    const seen = new Map();
    for (const part of allParts) {
        if ('id' in part && typeof part.id === 'string') {
            const bucket = seen.get(part.implements) ?? new Set();
            if (bucket.has(part.id)) {
                throw new Error(`Duplicate plugin part id "${part.id}" for ${part.implements}. ` +
                    `Part ids must be unique per extension point.`);
            }
            bucket.add(part.id);
            seen.set(part.implements, bucket);
        }
    }
    // Settings parts key on `pluginId` (not `id`), so guard their uniqueness separately —
    // two declarations for one plugin would fight over the same storage row.
    const settingsIds = new Set();
    for (const part of allParts) {
        if (part.implements !== 'aphex/settings')
            continue;
        if (settingsIds.has(part.pluginId)) {
            throw new Error(`Duplicate plugin settings declaration for "${part.pluginId}". ` +
                `Each plugin may declare settings once.`);
        }
        settingsIds.add(part.pluginId);
    }
    // Agent tool parts key on `definition.name` (not a top-level `id`), so guard
    // their uniqueness separately too — two tools sharing a name would collide in
    // whatever registry the agent runtime builds from this list.
    const agentToolNames = new Set();
    for (const part of allParts) {
        if (part.implements !== 'aphex/agent/tool')
            continue;
        if (agentToolNames.has(part.definition.name)) {
            throw new Error(`Duplicate agent tool name "${part.definition.name}". Tool names must be unique across all plugins.`);
        }
        agentToolNames.add(part.definition.name);
    }
    const getParts = (kind) => allParts.filter((p) => p.implements === kind);
    const hasCaps = (required, caps, overrideAccess) => overrideAccess || !required || required.length === 0 || required.every((c) => caps.includes(c));
    return {
        plugins,
        getParts,
        schemaTypes: () => getParts('aphex/schema').flatMap((p) => p.schemas),
        applySchemaTransforms: (schemas) => getParts('aphex/schema/transform').reduce((acc, part) => part.transform(acc), schemas),
        serverRoutes: () => getParts('aphex/server/route'),
        capabilities: () => {
            const set = new Set();
            for (const p of getParts('aphex/capabilities'))
                for (const c of p.capabilities)
                    set.add(typeof c === 'string' ? c : c.id);
            return [...set];
        },
        capabilityCatalog: () => {
            // Normalize each plugin-declared capability (bare id or full definition),
            // then merge with the built-in catalog — first definition of an id wins.
            const pluginDefs = [];
            for (const p of getParts('aphex/capabilities'))
                for (const c of p.capabilities)
                    pluginDefs.push(typeof c === 'string' ? defineCapability(c) : c);
            return mergeCapabilityCatalog(pluginDefs);
        },
        documentActions: ({ schemaName, capabilities = [], overrideAccess = false }) => getParts('aphex/document/action')
            .filter((a) => !a.appliesTo || a.appliesTo.includes(schemaName))
            .filter((a) => hasCaps(a.requiredCapabilities, capabilities, overrideAccess))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        adminTools: ({ capabilities = [], overrideAccess = false } = {}) => getParts('aphex/admin/tool')
            .filter((t) => hasCaps(t.requiredCapabilities, capabilities, overrideAccess))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        fieldComponent: (input) => getParts('aphex/field/component').find((f) => f.input === input),
        settingsDeclarations: () => getParts('aphex/settings'),
        settingsDeclaration: (pluginId) => getParts('aphex/settings').find((s) => s.pluginId === pluginId),
        jobHandlers: () => getParts('aphex/job/handler').reduce((acc, part) => ({ ...acc, ...part.handlers }), {}),
        eventConsumers: () => getParts('aphex/event/consumer'),
        consumersForEvent: (eventType) => getParts('aphex/event/consumer').filter((c) => c.events.includes(eventType)),
        agentToolsForCapabilities: (capabilities, overrideAccess = false) => getParts('aphex/agent/tool').filter((t) => hasCaps(t.definition.requiredCapabilities, capabilities, overrideAccess))
    };
}
