#! /usr/bin/env -S deno -A
import { lisp, version, versionNumber } from "../npm-module/esm/mod.js";

console.log(version());
console.log(versionNumber());

function add2(a, b) { return a + b; }
var $_system_$ = {
  add2:add2
};

var scope1 = lisp(globalThis, $_system_$);
scope1.run(`
(console.log ($system.add2 11 22))
`);
