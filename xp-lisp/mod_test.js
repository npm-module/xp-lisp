#! /usr/bin/env -S deno test -A
import { assert } from "@std/assert";
import { lisp } from "./mod.js";

Deno.test("test#01", async () => {
  try {
    const scope = lisp(globalThis);
    scope.run(
      `
(defun add2 (a b) (+ a b))
`);
    const answer = add2(11, 22);
    console.log(`answer=${answer}`);
    assert(answer == 33);
  } finally {
    ;
  }
});

Deno.test("test#02", async () => {
  try {
    const scope = lisp(globalThis);
    scope.run(
      `
#|@
globalThis.xyz = 123;
|#

(defun add2 (a b) (+ a b xyz))
`);
    const answer = add2(11, 22);
    console.log(`answer=${answer}`);
    assert(answer == 156);
  } finally {
    ;
  }
});
