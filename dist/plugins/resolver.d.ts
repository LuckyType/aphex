/**
 * Part resolver — indexes a plugin list by extension point and answers the
 * queries core needs (schemas to merge, routes to mount, document actions for a
 * given type, a field component for an `input` key). Built once at boot from
 * `config.plugins` and exposed on the engine so both server and admin consult the
 * same resolved model. Validates duplicate part ids up front — no silent overrides.
 */
import type { AdminToolPart, AgentToolPart, CMSPlugin, DocumentActionPart, EventConsumerPart, FieldComponentPart, PartKind, PluginPart, ServerRoutePart, SettingsPart } from './types.js';
import type { SchemaType } from '../types/schemas.js';
import type { JobHandlerMap } from '../jobs/types.js';
import { type CapabilityDefinition } from '../types/capabilities.js';
type PartOf<K extends PartKind> = Extract<PluginPart, {
    implements: K;
}>;
export interface PartResolver {
    readonly plugins: CMSPlugin[];
    /** All parts implementing a given extension point, typed to that part kind. */
    getParts<K extends PartKind>(kind: K): PartOf<K>[];
    /** Flattened schema contributions, ready to merge into `schemaTypes`. */
    schemaTypes(): SchemaType[];
    /** Apply every `aphex/schema/transform` part, in order, to a schema list. */
    applySchemaTransforms(schemas: SchemaType[]): SchemaType[];
    /** Server-route parts to mount under `/api`. */
    serverRoutes(): ServerRoutePart[];
    /** Deduplicated capability id strings declared by plugins. */
    capabilities(): string[];
    /** The full capability catalog — built-in definitions plus plugin-declared ones,
     *  deduped by id. This is the registry the roles UI renders. */
    capabilityCatalog(): CapabilityDefinition[];
    /** Document actions applicable to a document type, capability- and order-filtered. */
    documentActions(args: {
        schemaName: string;
        capabilities?: string[];
        overrideAccess?: boolean;
    }): DocumentActionPart[];
    /** Admin tools, capability- and order-filtered. */
    adminTools(args?: {
        capabilities?: string[];
        overrideAccess?: boolean;
    }): AdminToolPart[];
    /** The field component registered for a given `input` key, if any. */
    fieldComponent(input: string): FieldComponentPart | undefined;
    /** All plugin settings declarations, in registration order. */
    settingsDeclarations(): SettingsPart[];
    /** The settings declaration for a given plugin id, if any. */
    settingsDeclaration(pluginId: string): SettingsPart | undefined;
    /**
     * All plugin-contributed job handlers, merged into one map (later parts win on a
     * type collision). The runner layers this between core built-ins and the app's
     * `config.jobs.handlers`.
     */
    jobHandlers(): JobHandlerMap;
    /** All registered event consumers, in registration order. The runner turns these into delivery job handlers. */
    eventConsumers(): EventConsumerPart[];
    /** Event consumers subscribed to a given event type — the relay's fan-out list. */
    consumersForEvent(eventType: string): EventConsumerPart[];
    /**
     * Tools visible to a caller with the given capability set — the advertisement
     * filter. Execution must separately re-check `requiredCapabilities` against the
     * actual invoking caller; never trust that a tool was only reachable because it
     * was listed.
     */
    agentToolsForCapabilities(capabilities: string[], overrideAccess?: boolean): AgentToolPart[];
}
export declare function createPartResolver(plugins?: CMSPlugin[]): PartResolver;
export {};
//# sourceMappingURL=resolver.d.ts.map