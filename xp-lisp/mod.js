//import jsBeautify from "npm:js-beautify@1.15.4";
import { lisp1 } from "./src/lisp1.mjs";
import { beautifyCode as bc } from "./src/babel-transform.mjs";

export function version() {
  return "npm:xp-lisp: version 2026.312.5614";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system) {
  return lisp1($scope, $system, undefined /*jsBeautify*/);
}

export const beautifyCode = bc;
