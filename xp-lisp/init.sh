#! /usr/bin/env bash
set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
deno add jsr:@std/assert
deno add jsr:@std/fs
deno add jsr:@deno/dnt
