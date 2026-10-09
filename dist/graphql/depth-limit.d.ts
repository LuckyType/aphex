import type { ValidationContext } from 'graphql';
type IgnoreRule = string | RegExp | ((fieldName: string) => boolean);
interface DepthLimitOptions {
    ignore?: IgnoreRule[];
}
export declare function depthLimit(maxDepth: number, options?: DepthLimitOptions): (validationContext: ValidationContext) => ValidationContext;
export {};
//# sourceMappingURL=depth-limit.d.ts.map