import type { DatabaseAdapter } from '../db/index.js';
import type { PartResolver } from '../plugins/resolver.js';
import type { SettingsPart } from '../plugins/types.js';
/** Placeholder shown to the client for a secret that has a stored value. */
export declare const SECRET_MASK = "\u2022\u2022\u2022\u2022\u2022\u2022";
/**
 * The persistence this service needs — the settings slice of `DatabaseAdapter`, which
 * satisfies it structurally. Declaring the narrow dependency rather than the whole
 * adapter keeps the service honest about its reach (config values only, never content)
 * and lets it be constructed against a stub.
 */
export type PluginSettingsStore = Pick<DatabaseAdapter, 'getPluginSettings' | 'setPluginSettings'>;
/** Likewise the resolver slice: this service only ever looks up settings declarations. */
export type SettingsDeclarationSource = Pick<PartResolver, 'settingsDeclaration'>;
/** A declared settings section plus whether the plugin registered one at all. */
export interface ResolvedSettings {
    /** The plugin's settings declaration, or `null` if it declared none. */
    declaration: SettingsPart | null;
    /** Declared defaults merged with the org's stored values (secrets masked). */
    values: Record<string, unknown>;
    /** Whether an encryption key is configured — the UI flags secret fields read-only if not. */
    secretsEnabled: boolean;
}
/** Raised when a submitted value doesn't match its declared field type. */
export declare class PluginSettingsValidationError extends Error {
    readonly issues: string[];
    constructor(issues: string[]);
}
export declare class PluginSettingsService {
    /** Narrowed to the two methods this service uses — the full adapter satisfies it. */
    private db;
    /** Likewise: settings resolution is the only part of the resolver needed here. */
    private resolver;
    /** Key for encrypting `secret` fields; when absent, secrets are disabled (fail safe). */
    private encryptionKey;
    constructor(
    /** Narrowed to the two methods this service uses — the full adapter satisfies it. */
    db: PluginSettingsStore, 
    /** Likewise: settings resolution is the only part of the resolver needed here. */
    resolver: SettingsDeclarationSource, 
    /** Key for encrypting `secret` fields; when absent, secrets are disabled (fail safe). */
    encryptionKey?: string | null);
    /** Whether secret fields can be stored/read (an encryption key is configured). */
    get secretsEnabled(): boolean;
    private secretFieldNames;
    /**
     * Effective values for injection into plugin **server** code: declared defaults
     * overlaid with stored values, with secrets **decrypted** to plaintext. Secrets
     * that can't be decrypted (no key, or a bad envelope) are omitted, never returned
     * as ciphertext. This is the sensitive read — never send its result to a client.
     */
    get(organizationId: string, pluginId: string): Promise<Record<string, unknown>>;
    /**
     * Effective values for the **client/API**: same merge, but secrets are **masked** —
     * a stored secret becomes {@link SECRET_MASK}, an unset one an empty string. Plaintext
     * secrets never cross this boundary.
     */
    getMasked(organizationId: string, pluginId: string): Promise<Record<string, unknown>>;
    /**
     * Resolve for the admin surface: the declaration plus masked values plus whether
     * secrets are enabled. `declaration: null` when the plugin declares no settings.
     */
    resolve(organizationId: string, pluginId: string): Promise<ResolvedSettings>;
    /**
     * Persist a partial edit. Only declared field names are accepted, and each value is
     * type-checked against its declaration — an invalid patch is rejected whole, never
     * applied in part, so a failed save can't leave settings half-written. Secret fields
     * are encrypted; a blank or still-masked secret submission means "leave unchanged"
     * (so the client never has to echo the real value back). Returns the new **masked**
     * values — a save response never leaks a plaintext secret.
     *
     * @throws {PluginSettingsValidationError} when a value doesn't match its field type.
     */
    save(organizationId: string, pluginId: string, patch: Record<string, unknown>): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=plugin-settings-service.d.ts.map