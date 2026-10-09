export function isBlockArray(field) {
    return (field.of ?? []).some((ref) => ref.type === 'block');
}
