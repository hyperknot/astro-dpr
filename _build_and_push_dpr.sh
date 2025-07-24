#!/usr/bin/env bash

git clean -xdf

(cd packages/astro || exit
  pnpm pkg set name="astro"
  pnpm version patch --no-git-tag-version  --workspaces-update=false
)


pnpm install
pnpm build


(cd packages/astro || exit
  pnpm pkg set name="@hyperknot/astro-dpr"
  pnpm publish --access public --provenance false --no-git-checks
  pnpm pkg set name="astro"
)

git restore --staged --worktree pnpm-lock.yaml
