import type { SchemaType } from '../../../types/schemas.js';
import { type JsonSchema } from './json-schema.js';
export interface OpenApiOptions {
    /** Document types drive the per-collection request bodies. */
    schemaTypes?: SchemaType[];
    /** Server URL to advertise, e.g. `https://cms.example.com`. */
    serverUrl?: string;
    title?: string;
    version?: string;
}
/** Build the full OpenAPI document. */
export declare function generateOpenApiDocument(options?: OpenApiOptions): JsonSchema;
//# sourceMappingURL=generate.d.ts.map