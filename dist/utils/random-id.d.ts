/**
 * A v4 UUID that also works outside a secure context.
 *
 * `crypto.randomUUID` is only defined on HTTPS or `localhost`. The dev server
 * runs `vite dev --host`, so opening the Network URL it prints
 * (`http://192.168.x.x:5173`) — from a phone, another machine, or through a
 * plain-HTTP tunnel — leaves it `undefined`, and every call site throws
 * `TypeError: crypto.randomUUID is not a function`.
 *
 * `crypto.getRandomValues` is *not* gated that way, so the fallback is still
 * cryptographically random; only the convenience wrapper is missing. The final
 * `Math.random` branch exists for non-browser contexts with no WebCrypto at all
 * and is **not** suitable for anything security-sensitive — use `node:crypto` on
 * the server, where `randomUUID` is always available.
 */
export declare function randomId(): string;
//# sourceMappingURL=random-id.d.ts.map