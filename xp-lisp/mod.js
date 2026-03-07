import { lisp1 } from "./src/lisp1.mjs";

export function version() {
  return "npm:xp-lisp: version 2026.307.181154";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system) {
  return lisp1($scope, $system);
}
