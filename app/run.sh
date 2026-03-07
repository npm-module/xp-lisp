#! /usr/bin/env bash
set -uvx
set -e
rm -rf node_modules
npm install
deno run --allow-all ./app-deno.js a b "c ハロー©"
node ./app-require.js a b "c ハロー©"
node ./app-import.mjs a b "c ハロー©"
