import { xpLisp } from "./src/xp-lisp.mjs";

//const glob = xpLisp(globalThis);
const glob = xpLisp();
glob.run(`
#lang lisp
# 行コメント(1)
##行コメント(2)
;行コメント(3)
#|
xyz();
|#
#|@
console.log("XXX");
|#
(console.log $@answerA={{11+22}}@)
(console.log ("$@" "answerB={{110+220}}"))
(console.log $@
answer1={{110+220}}
answer2={{330+440}}
@)
(console.log "abc
def")
(console.log {
  "abc" "xyz"
  "bbb" (11 undefined "ハロー©")
})
(console.log #|@ 111+222 |#)
(console.log ("@" "777+888"))
(console.log #|@ 1111+2222 |#)
(console.log @
1111
+
2222
@)
(console.log "str")
(console.log "ハロー©")
(define xyz 777)
(console.log $g.xyz)
(console.log 123)
(console.log (+ 11 22]

(define x 123)
(begin
  (set! $g.x (+ 1 $g.x))
  (set! $g.x (+ 2 $g.x))
  (console.log $g.x]

;(Deno.exit 0)
[dotimes (i 3) (console.log i]
[dotimes (i 3) (dotimes (j 2) (console.log (list i j]
(define x 11)
(define y 22)
(console.log (+ $g.x $g.y]
[let ((a 33) (b 44)) (console.log (+ a b]
[let* ((a 55) (b (+ 1 a))) (console.log (list a b]
[let* [(a 55) (b (+ 1 a] (console.log (list a b]
(define (fact n)
  (let ((factorial 1.0))
    (if (< n 0)
        -1
      (begin
        [dotimes (i n)
          (set! factorial (* factorial (+ 1 i]
        factorial]
(console.log ($g.fact 4))
(define (fact2 x)
  (do ((n 2 (+ 1 n)) (result 1))
      ((< x n) result)
      (set! result (* result n))))
(console.log ($g.fact2 4))
(console.log (&& (< 2 4) (< 3 4]
(console.log (&& (< 2 4) (> 3 4]
  (try (throw 123)
  (catch ex (console.log ex]
`);

console.log(glob.fact2(4));
