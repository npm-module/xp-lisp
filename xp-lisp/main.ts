import { lisp1 } from "./src/lisp1.mjs";

export function version():string {
  return "xp-lisp: version 2026.307.182027";
}

export function versionNumber():string {
  const split = version().split(" ");
  return split[2];
}

export function lisp($scope:any, $system?:any):any {
  return lisp1($scope, $system);
}

if (import.meta.main) {
  console.log(version());
  console.log(versionNumber());
  const scope = lisp(globalThis);
  scope.run(
    `
(defun add2 (a b) (+ a b))
#|@
const answer = add2(11, 22);
console.log(<string>answer={{answer}}</string>);
|#
`);
  //const answer = add2(11, 22);
  //console.log(`answer=${answer}`);
}
