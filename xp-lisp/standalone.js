import { lisp1 } from "./src/lisp1.mjs";

export function version() {
  return "standalone:xp-lisp: version 2026.310.61449";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system, $jsBeautify) {
  return lisp1($scope, $system, $jsBeautify);
}
