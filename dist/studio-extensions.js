let current = {};
export function configureStudio(extensions) {
    current = extensions;
}
export function studioExtensions() {
    return current;
}
