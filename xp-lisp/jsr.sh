#! /usr/bin/env bash
set -uvx
set -e
cwd=`pwd`
ts=`date "+%Y.%-m%d.%-H%M%S"`
version=${ts}
./init.sh
sed -i -e "s/version [0-9]*[.][0-9]*[.][0-9]*/version ${version}/g" mod.js
sed -i -e "s/[0-9]*[.][0-9]*[.][0-9]*/${version}/g" jsr.json
rm -rf ../npm-module
deno run --allow-all ./mk-jsr.ts $version
rm -rf $cwd/../npm-module/esm/tmp
rm -rf $cwd/../npm-module/script/tmp
cp jsr.json $cwd/../npm-module/
rmdir npm
cd $cwd/../npm-module
npx jsr publish
