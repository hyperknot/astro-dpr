#!/usr/bin/env bash

git clean -xdf

(cd packages/astro || exit
  npm pkg set name="astro"
  npm version patch --no-git-tag-version
)


pnpm install
pnpm build

(cd packages/astro || exit
  npm pkg set name="@hyperknot/astro-dpr"
  npm publish --access public --provenance false
  npm pkg set name="astro"
)

