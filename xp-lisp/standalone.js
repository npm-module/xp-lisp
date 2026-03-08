import { lisp1 } from "./src/lisp1.mjs";

export function version() {
  return "standalone:xp-lisp: version 2026.0309.0145.55.49.22.52.10.57.35.02.37.48.01.01";
}

export function versionNumber() {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope, $system, $jsBeautify) {
  return lisp1($scope, $system, $jsBeautify);
}
