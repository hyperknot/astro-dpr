#/usr/bin/env bash

git clean -xdf

pnpm install
pnpm build

(cd packages/astro || exit
  npm publish --access public
)

