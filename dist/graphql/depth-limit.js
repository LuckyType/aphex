import { GraphQLError, Kind } from 'graphql';
export function depthLimit(maxDepth, options = {}) {
    return (validationContext) => {
        const { definitions } = validationContext.getDocument();
        const fragments = getFragments(definitions);
        const queries = getQueriesAndMutations(definitions);
        for (const name in queries) {
            determineDepth(queries[name], fragments, 0, maxDepth, validationContext, name, options);
        }
        return validationContext;
    };
}
function getFragments(definitions) {
    const map = {};
    for (const def of definitions) {
        if (def.kind === Kind.FRAGMENT_DEFINITION) {
            map[def.name.value] = def;
        }
    }
    return map;
}
function getQueriesAndMutations(definitions) {
    const map = {};
    for (const def of definitions) {
        if (def.kind === Kind.OPERATION_DEFINITION) {
            map[def.name ? def.name.value : ''] = def;
        }
    }
    return map;
}
function determineDepth(node, fragments, depthSoFar, maxDepth, context, operationName, options) {
    if (depthSoFar > maxDepth) {
        context.reportError(new GraphQLError(`'${operationName}' exceeds maximum operation depth of ${maxDepth}`, {
            nodes: [node]
        }));
        return depthSoFar;
    }
    switch (node.kind) {
        case Kind.FIELD: {
            const shouldIgnore = /^__/.test(node.name.value) || seeIfIgnored(node.name.value, options.ignore);
            if (shouldIgnore || !node.selectionSet) {
                return 0;
            }
            return (1 +
                Math.max(...node.selectionSet.selections.map((selection) => determineDepth(selection, fragments, depthSoFar + 1, maxDepth, context, operationName, options))));
        }
        case Kind.FRAGMENT_SPREAD: {
            const fragment = fragments[node.name.value];
            if (!fragment)
                return 0;
            return determineDepth(fragment, fragments, depthSoFar, maxDepth, context, operationName, options);
        }
        case Kind.INLINE_FRAGMENT:
        case Kind.FRAGMENT_DEFINITION:
        case Kind.OPERATION_DEFINITION:
            return Math.max(...node.selectionSet.selections.map((selection) => determineDepth(selection, fragments, depthSoFar, maxDepth, context, operationName, options)));
        default:
            throw new Error('Depth crawler cannot handle: ' + node.kind);
    }
}
function seeIfIgnored(fieldName, ignore) {
    if (!ignore)
        return false;
    for (const rule of ignore) {
        if (typeof rule === 'function') {
            if (rule(fieldName))
                return true;
        }
        else if (typeof rule === 'string') {
            if (fieldName.match(rule))
                return true;
        }
        else if (rule instanceof RegExp) {
            if (rule.test(fieldName))
                return true;
        }
    }
    return false;
}
