#! /usr/bin/env bash
#set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
ts=`date "+%Y.%m%d.%H%M.%S"`
if ! command -v esbuild &> /dev/null; then
    npm install -g esbuild
fi
rm -rvf lib
sed -i -e "s/version [0-9]*[.][0-9]*[.][0-9]*/version ${ts}/g" standalone.js
esbuild ./standalone.js --bundle --format=esm  --outfile=lib/xp-lisp.esm.js
esbuild ./standalone.js --bundle --format=iife --outfile=lib/xp-lisp.iife.js --global-name=lisp
ls -ltrh ./lib
cp -pv lib/* ~/cmd/
