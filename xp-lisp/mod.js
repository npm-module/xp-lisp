//import jsBeautify from "npm:js-beautify@1.15.4";
import { lisp1 } from "./src/lisp1.mjs";
import { beautifyCode as _beautifyCode } from "./src/babel-transform.mjs";

export function version() {
  return "npm:xp-lisp: version 2026.312.11005";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system) {
  return lisp1($scope, $system, undefined /*jsBeautify*/);
}

export function beautifyCode() {
  return _beautifyCode(...arguments);
}
