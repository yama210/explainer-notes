#!/bin/sh
set -eu

# named volume の node_modules を現在の lockfile と揃える。
# pnpm --force に頼らず、不要な警告も出さないようにする。
mkdir -p node_modules
find node_modules -mindepth 1 -maxdepth 1 -exec rm -rf {} +
CI=true pnpm install --frozen-lockfile

pnpm prisma generate
pnpm prisma migrate deploy

exec pnpm dev -H 0.0.0.0 -p 3000
