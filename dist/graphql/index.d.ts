import type { CMSInstances } from '../hooks.js';
import type { SchemaType } from '../types/schemas.js';
import type { RequestEvent } from '@sveltejs/kit';
export interface GraphQLConfig {
    defaultPerspective?: 'draft' | 'published';
    path?: string;
    enableGraphiQL?: boolean;
    defaultQuery?: string;
}
export interface GraphQLSettings {
    endpoint: string;
    enableGraphiQL: boolean;
}
export interface GraphQLHandlerResult {
    handler: (event: RequestEvent) => Promise<Response> | Response;
    settings: GraphQLSettings;
}
/**
 * Creates a GraphQL handler for the CMS.
 * Uses dynamic imports so graphql dependencies are only loaded when GraphQL is enabled.
 */
export declare function createGraphQLHandler(cms: CMSInstances, schemaTypes: SchemaType[], options?: GraphQLConfig): Promise<GraphQLHandlerResult>;
//# sourceMappingURL=index.d.ts.map