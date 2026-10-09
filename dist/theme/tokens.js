/**
 * Theme token *types* — the shape of a design-system token.
 *
 * cms-core owns the machinery (turn a token list into a schema + scoped CSS); the
 * consuming app owns the concrete token list, its default colors, and font choices
 * (that's design opinion, not engine concern). See ./derive.ts and ./css.ts for
 * the functions that operate on these, and the app's own `theme/tokens.ts` for a
 * concrete set.
 */
export {};
