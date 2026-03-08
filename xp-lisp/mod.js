import jsBeautify from "npm:js-beautify@1.15.4";
import { lisp1 } from "./src/lisp1.mjs";

export function version() {
  return "npm:xp-lisp: version 2026.309.03141";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system) {
  return lisp1($scope, $system, jsBeautify);
}
