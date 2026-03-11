#! /usr/bin/env bash
#set -uvx
set -e
cd "$(dirname "$0")"
cwd=`pwd`
ts=`date "+%Y.%-m%d.%-H%M%S" | sed -e 's/[.]0/./g'`
if ! command -v esbuild &> /dev/null; then
    npm install -g esbuild
fi
rm -rvf lib
sed -i -e "s/version [0-9]*[.][0-9]*[.][0-9]*/version ${ts}/g" standalone.js
esbuild ./mod.js --bundle --format=esm  --outfile=lib/xp-lisp.esm.js
esbuild ./mod.js --bundle --format=iife --outfile=lib/xp-lisp.iife.js --global-name=lisp
ls -ltrh ./lib
cp -pv lib/* ~/cmd/
cp -pv lib/* ~/util/lisp/
cp -pv lib/* ~/@sub/open-lisp/open-lisp/lib/
