#!/usr/bin/env bash
# Publishes a package's packed build as the root of a `dist/<package>` branch,
# so an app can install this fork without a registry:
#
#   "@aphexcms/cms-core": "github:<owner>/aphex#<commit on dist/cms-core>"
#
# Each run adds one commit naming the source commit it was built from, so a
# pinned commit stays reachable and its origin stays traceable.
#
# Usage: scripts/publish-dist-branch.sh <package-dir-name> [--push]
set -euo pipefail

pkg="${1:?package directory under packages/, e.g. cms-core}"
push="${2:-}"
root="$(git rev-parse --show-toplevel)"
branch="dist/${pkg}"
source_sha="$(git -C "$root" rev-parse HEAD)"
work="$(mktemp -d)"
trap 'rm -rf "$work"; git -C "$root" worktree remove --force "$work/tree" 2>/dev/null || true' EXIT

if [ -n "$(git -C "$root" status --porcelain -- "packages/${pkg}")" ]; then
	echo "packages/${pkg} has uncommitted changes; publish from a clean tree." >&2
	exit 1
fi

(cd "$root/packages/${pkg}" && pnpm build && pnpm pack --pack-destination "$work")
tarball="$(ls "$work"/*.tgz)"

if git -C "$root" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
	git -C "$root" fetch --quiet origin "$branch"
	git -C "$root" worktree add --quiet "$work/tree" "origin/$branch"
	git -C "$work/tree" checkout --quiet -B "$branch"
else
	git -C "$root" worktree add --quiet --detach "$work/tree"
	git -C "$work/tree" checkout --quiet --orphan "$branch"
fi

find "$work/tree" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
tar -xzf "$tarball" -C "$work/tree" --strip-components=1
version="$(node -p "require('$work/tree/package.json').version")"

git -C "$work/tree" add -A
if git -C "$work/tree" diff --cached --quiet; then
	echo "dist/${pkg} already matches ${source_sha}."
	exit 0
fi
git -C "$work/tree" commit --quiet -m "build(${pkg}): ${version} from ${source_sha}"
echo "dist/${pkg}: $(git -C "$work/tree" rev-parse HEAD) (${version} from ${source_sha})"

if [ "$push" = "--push" ]; then
	git -C "$work/tree" push --quiet origin "HEAD:refs/heads/${branch}"
fi
