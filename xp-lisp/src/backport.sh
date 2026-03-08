#! /usr/bin/env bash
set -uvx
set -e
cd "$(dirname "$0")"
cwd=$(pwd)
ts=$(date "+%Y.%m%d.%H%M.%S")

cp -v *.mjs  ~/@sub/open-lisp/lisp1/src/
