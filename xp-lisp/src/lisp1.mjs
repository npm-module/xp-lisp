import {
  ast2oml as _ast2oml,
  astequal as _astequal,
  oml2ast,
} from "./oml2ast.mjs";
import { OMLCommon } from "./omlcommon.mjs";
//import jsBeautify from "npm:js-beautify@1.15.4";

const common = new OMLCommon();

function compile_number(ast) {
  return compile_ast(ast);
}

function compile_string(ast) {
  return `String(${compile_ast(ast)})`;
}

function compile_body_helper(body) {
  if (body.length === 0) return null;
  let result = "(";
  for (let i = 0; i < body.length; i++) {
    if (i > 0) {
      result += ",";
    }
    const def = common.to_def(body[i]);
    if (def !== null) {
      const let_ast = [
        common.id("let"),
        [[def[1], def[2]]],
        ...body.slice(i + 1),
      ];
      return result + compile_ast(let_ast) + ")";
    }
    result += compile_ast(body[i]);
  }
  return result + ")";
}

function compile_body(ast, start) {
  const body = [];
  for (let i = start; i < ast.length; i++) {
    body.push(ast[i]);
  }
  return compile_body_helper(body);
}

function _cond_builder_helper(rest) {
  if (rest.length === 0) {
    return null;
  }
  let condition = rest.shift();
  condition = common.to_id(condition);
  const action = rest.shift();
  switch (condition) {
    case true:
    case "else":
    case "otherwise":
      return action;
  }
  return [common.id("if"), condition, action, _cond_builder_helper(rest)];
}

function compile_ast(ast) {
  if (ast === null) {
    return "null";
  }
  if (ast === undefined) {
    return "undefined";
  }
  if (typeof ast === "string") {
    return JSON.stringify(ast);
  }
  if (!(ast instanceof Array)) {
    return ast.toString();
  }
  if (ast.length === 0) {
    return "[]";
  }
  if (common.is_variable(ast)) {
    return common.to_id(ast);
  }
  if (common.is_script(ast)) {
    let script = ast[1];
    script = script.replace(/<string>/g, "`");
    script = script.replace(/<[/]string>/g, "`");
    script = script.replace(/({{)/g, "${");
    script = script.replace(/(}})/g, "}");
    return script;
  }
  if (common.is_template(ast)) {
    let template = ast[1];
    template = template.replace(/(`)/g, "\\`");
    template = template.replace(/({{)/g, "${");
    template = template.replace(/(}})/g, "}");
    template = "`" + template + "`";
    return template;
  }
  if (common.is_id(ast[0]) && common.to_id(ast[0]) === "?") {
    return compile_ast([common.id("list"), ...ast]);
  }
  if (!common.is_callable(ast)) {
    return compile_ast([common.id("list"), ...ast]);
  }
  switch (common.to_id(ast[0])) {
    case "<script>": {
      let fcall = ast[0][1] + "(";
      for (let i = 1; i < ast.length; i++) {
        if (i > 1) {
          fcall += ",";
        }
        fcall += compile_ast(ast[i]);
      }
      fcall += ")";
      return fcall;
    }
    case "begin":
      return compile_body(ast, 1);
    case "case": {
      const cond_ast = [common.id("cond")];
      for (let i = 2; i < ast.length; i++) {
        const e = ast[i];
        if (common.is_id(e[0], "else") || common.is_id(e[0], "otherwise")) {
          cond_ast.push(e);
        } else {
          cond_ast.push([
            [common.id("equal"), common.id("__case__"), e[0]],
            ...e.slice(1),
          ]);
        }
      }
      const new_ast = [
        common.id("let*"),
        [[common.id("__case__"), ast[1]]],
        cond_ast,
      ];
      return compile_ast(new_ast);
    }
    case "_cond": {
      return compile_ast(_cond_builder_helper(ast.slice(1)));
    }
    case "cond": {
      const new_ast = [];
      ast.slice(1).forEach((x) => {
        new_ast.push(x[0]);
        new_ast.push([["#", "begin"]].concat(x.slice(1)));
      });
      new_ast.unshift(["#", "_cond"]);
      return compile_ast(new_ast);
    }
    case "dec!":
    case "inc!": {
      const sign = common.to_id(ast[0]) === "dec!" ? "-" : "+";
      const val = ast.length < 3 ? 1 : compile_ast(ast[2]);
      return compile_ast(ast[1]) + sign + "=" + val;
    }
    case "def": {
      ast = common.to_def(ast);
      return "$scope." + common.to_id(ast[1]) + "=" + compile_ast(ast[2]);
    }
    case "define":
    case "defun":
    case "defvar": {
      ast = common.to_def(ast);
      return compile_ast(ast);
    }
    case "do":
    case "do*":
      return compile_do(ast);
    case "fn":
    case "lambda": {
      let args = "(";
      for (let i = 0; i < ast[1].length; i++) {
        if (i > 0) {
          args += ",";
        }
        args += common.to_id(ast[1][i]);
      }
      args += ")";
      if (ast.length < 3) {
        return "function" + args + "{}";
      }
      return "function" + args + "{return " + compile_body(ast, 2) + "}";
    }
    case "dotimes": {
      let ast1 = ast[1];
      if (!common.is_array(ast1) || common.is_quoted(ast1)) {
        ast1 = [common.id("$index"), ast1];
      } else if (ast1.length < 2) {
        throw new Error("syntax error");
      }
      const result_exp = ast1.length < 3 ? common.id("null") : ast1[2];
      const bind = [
        [common.id("__dotimes_cnt__"), ast1[1]],
        [common.id("__dotimes_idx__"), 0, [
          common.id("+"),
          common.id("__dotimes_idx__"),
          1,
        ]],
        [ast1[0], common.id("__dotimes_idx__"), common.id("__dotimes_idx__")],
      ];
      const exit = [[
        common.id(">="),
        common.id("__dotimes_idx__"),
        common.id("__dotimes_cnt__"),
      ], result_exp];
      ast = [common.id("do*"), bind, exit].concat(ast.slice(2));
      return compile_ast(ast);
    }
    case "length": {
      if (ast.length != 2) return new Error("syntax error");
      return "(" + compile_ast(ast[1]) + ").length";
    }
    case "prop-get": {
      if (ast.length != 3) return new Error("syntax error");
      return compile_ast(ast[1]) + "[" + compile_ast(ast[2]) + "]";
    }
    case "prop-set!": {
      if (ast.length != 4) return new Error("syntax error");
      return compile_ast(ast[1]) + "[" + compile_ast(ast[2]) + "]=" +
        compile_ast(ast[3]);
    }
    case "dolist": {
      let ast1 = ast[1];
      if (
        common.is_variable(ast1) || !common.is_array(ast1) ||
        common.is_quoted(ast1)
      ) {
        ast1 = [common.id("$item"), ast1];
      } else if (ast1.length < 2) {
        throw new Error("syntax error");
      }
      const result_exp = ast1.length < 3 ? common.id("null") : ast1[2];
      const bind = [
        [common.id("__dolist_list__"), ast1[1]],
        [common.id("__dolist_cnt__"), [
          common.id("length"),
          common.id("__dolist_list__"),
        ]],
        [common.id("__dolist_idx__"), 0, [
          common.id("+"),
          common.id("__dolist_idx__"),
          1,
        ]],
        [ast1[0], [
          common.id("prop-get"),
          common.id("__dolist_list__"),
          common.id("__dolist_idx__"),
        ], [
          common.id("prop-get"),
          common.id("__dolist_list__"),
          common.id("__dolist_idx__"),
        ]],
      ];
      const exit = [[
        common.id(">="),
        common.id("__dolist_idx__"),
        common.id("__dolist_cnt__"),
      ], result_exp];
      ast = [common.id("do*"), bind, exit].concat(ast.slice(2));
      return compile_ast(ast);
    }
    case "if":
      return ("(" +
        compile_ast(ast[1]) +
        "?" +
        compile_ast(ast[2]) +
        ":" +
        compile_body(ast, 3) +
        ")");
    case "let":
    case "let*": {
      const ast1 = ast[1];
      const new_ast1 = [];
      for (const x of ast1) {
        if (typeof x === "string") {
          new_ast1.push(x);
          new_ast1.push(undefined);
        } else {
          new_ast1.push(x[0]);
          new_ast1.push(x[1]);
        }
      }
      return compile_ast(
        [common.id("_" + common.to_id(ast[0])), new_ast1].concat(ast.slice(2)),
      );
    }
    case "_let":
    case "_let*": {
      let vars = "(";
      let vals = "(";
      let assigns = "";
      for (let i = 1; i < ast[1].length; i += 2) {
        if (i > 1) {
          vars += ",";
        }
        vars += common.to_id(ast[1][i - 1]);
        const val = compile_ast(ast[1][i]);
        if (i > 1) {
          vals += ",";
        }
        vals += val;
        assigns += common.to_id(ast[1][i - 1]) + "=" + val + ";";
      }
      vars += ")";
      vals += ")";
      if (common.to_id(ast[0]) === "_let") {
        return ("((function" +
          vars +
          "{return " +
          compile_body(ast, 2) +
          "})" +
          vals +
          ")");
      } else {
        return ("((function" +
          vars +
          "{" +
          assigns +
          "return " +
          compile_body(ast, 2) +
          "})())");
      }
    }
    case "list": {
      ast = ast.slice(1);
      let found = -1;
      for (let i = 0; i < ast.length; i++) {
        const e = ast[i];
        if (common.is_id(e) && common.to_id(e) === "?") {
          found = i;
          break;
        }
      }
      let list;
      let dict;
      if (found === -1) {
        list = ast;
        dict = [];
      } else if (found === 0) {
        list = [];
        dict = ast.slice(1);
      } else {
        list = ast.slice(0, found);
        dict = ast.slice(found + 1);
      }
      const body = [];
      for (let i = 0; i < list.length; i++) {
        body.push([common.id("prop-set!"), common.id("__obj__"), i, list[i]]);
      }
      for (let i = 0; i < dict.length; i++) {
        let pair = dict[i];
        if (common.is_string(pair)) pair = [pair, true];
        body.push([
          common.id("prop-set!"),
          common.id("__obj__"),
          pair[0],
          pair[1],
        ]);
      }
      body.push(common.id("__obj__"));
      ast = [common.id("let*"), [[common.id("__obj__"), ["@", "[]"]]], ...body];
      return compile_ast(ast);
    }
    case "dict": {
      if ((ast.length % 2) !== 1) throw new Error("synatx error");
      const body = [];
      for (let i = 1; i < ast.length; i += 2) {
        body.push([
          common.id("prop-set!"),
          common.id("__dict__"),
          ast[i],
          ast[i + 1],
        ]);
      }
      body.push(common.id("__dict__"));
      ast = [
        common.id("let*"),
        [[common.id("__dict__"), ["@", "{}"]]],
        ...body,
      ];
      return compile_ast(ast);
    }
    case "set!":
    case "setq":
      return compile_ast(ast[1]) + "=" + compile_ast(ast[2]);
    case "throw": {
      return "(function(){throw " + compile_ast(ast[1]) + "})()";
    }
    case "try": {
      let result = "(function(){try{return " + compile_ast(ast[1]) + "}catch(";
      if (common.to_id(ast[2][0]) != "catch") throw "try without catch clause";
      result += common.to_id(ast[2][1]) + "){return " +
        compile_body(ast[2], 2) + "}";
      result += "})()";
      return result;
    }
    case "until":
    case "while": {
      let condition = compile_ast(ast[1]);
      if (common.to_id(ast[0]) === "until") {
        condition = "!" + condition;
      }
      return ("((function(){while(" +
        condition +
        "){" +
        compile_body(ast, 2) +
        "}})(),null)");
    }
    case ".": {
      const op = "+";
      const rest = ast.slice(1);
      const result = [];
      for (let i = 0; i < rest.length; i++) {
        if (i > 0) result.push(op);
        result.push(compile_string(rest[i]));
      }
      return result.join("");
    }
    case "=":
      return "(" + compile_ast(ast[1]) + "===" + compile_ast(ast[2]) + ")";
    case "%":
    case "==":
    case "===":
    case "!=":
    case "!==":
    case "<":
    case ">":
    case "<=":
    case ">=":
      return "(" + compile_number(ast[1]) + common.to_id(ast[0]) +
        compile_number(ast[2]) + ")";
    case "&&":
    case "||":
    case "&":
    case "|":
    case "+":
    case "-":
    case "*":
    case "**":
    case "/": {
      return "(" + insert_op(common.to_id(ast[0]), ast.slice(1)) + ")";
    }
    default: {
      let fcall = common.to_id(ast[0]) + "(";
      for (let i = 1; i < ast.length; i++) {
        if (i > 1) {
          fcall += ",";
        }
        fcall += compile_ast(ast[i]);
      }
      fcall += ")";
      return fcall;
    }
  }
}

function insert_op(op, rest) {
  if (rest.length === 1) {
    return op + compile_number(rest[0]);
  }
  const result = [];
  for (let i = 0; i < rest.length; i++) {
    if (i > 0) result.push(op);
    result.push(compile_number(rest[i]));
  }
  return result.join("");
}

function compile_do(ast) {
  const ast1 = ast[1];
  const parallel = ast[0] === "do";
  const ast1_len = ast1.length;
  const ast1_vars = [];
  if (parallel) {
    ast1_vars.push("__do__");
    ast1_vars.push("new Array(" + ast1_len + ").fill(null)");
  }
  ast1.forEach((x) => {
    ast1_vars.push(x[0]);
    ast1_vars.push(x[1]);
  });
  let ast2 = ast[2];
  if (ast2.length < 2) {
    ast2 = [ast2[0], null];
  }
  const until_ast = [common.id("until"), ast2[0]].concat(ast.slice(3));
  if (parallel) {
    ast1.forEach((x, i) => {
      if (x.length < 3) {
        return;
      }
      const next_step = [common.id("set!"), "__do__[" + i + "]", x[2]];
      until_ast.push(next_step);
    });
    ast1.forEach((x, i) => {
      if (x.length < 3) {
        return;
      }
      const next_step = [common.id("set!"), x[0], "__do__[" + i + "]"];
      until_ast.push(next_step);
    });
  } else {
    ast1.forEach((x) => {
      if (x.length < 3) {
        return;
      }
      const next_step = [common.id("set!"), x[0], x[2]];
      until_ast.push(next_step);
    });
  }
  const new_ast = [parallel ? common.id("_let") : common.id("_let*"), ast1_vars]
    .concat([until_ast]);
  new_ast.push(ast2[1]);
  return compile_ast(new_ast);
}

// deno-lint-ignore no-unused-vars
export function lisp1($scope, $system, $jsBeautify) {
  if (!$scope) $scope = {};
  if (!$jsBeautify) {
    $jsBeautify = function (code) {
      return code;
    };
  }
  $scope.evalJS = (code) => {
    return eval(code);
  };
  $scope.compile_ast = (ast, debug) => {
    if (debug) {
      console.error(" [AST] " + JSON.stringify(ast));
    }
    const code = compile_ast(ast);
    if (debug) {
      console.error("<SCRIPT>\n" + $jsBeautify(code) + "\n</SCRIPT>");
    }
    return code;
  };
  $scope.compile = (text, debug) => {
    const steps = oml2ast(text);
    let result = "";
    for (const step of steps) {
      const exp = step[0];
      const ast = step[1];
      if (debug) {
        console.error("[LISP] " + exp);
      }
      if (debug) {
        console.error(" [AST] " + JSON.stringify(ast));
      }
      const code = compile_ast(ast);
      if (debug) {
        console.error("<SCRIPT>\n" + $jsBeautify(code) + "\n</SCRIPT>");
      }
      result += code + ";\n";
    }
    return result;
  };
  $scope.exec_d = (exp) => $scope.exec(exp, true);
  $scope.exec = (exp, debug) => {
    const src = exp;
    const steps = oml2ast(src);
    let last;
    let text = "";
    const tm1 = new Date().getTime();
    for (const step of steps) {
      const exp = step[0];
      const ast = step[1];
      try {
        if (debug) {
          console.error("[LISP] " + exp);
        }
        if (debug) {
          console.error(" [AST] " + JSON.stringify(ast));
        }
        text = compile_ast(ast);
        if (debug) {
          console.error("<SCRIPT>\n" + $jsBeautify(text) + "\n</SCRIPT>");
        }
        const val = eval(text);
        last = val;
        let output;
        if (typeof val === "function") {
          output = "function";
        } else if (
          !(val instanceof Array) &&
          val instanceof Object &&
          Object.prototype.toString.call(val) !== "[object Object]"
        ) {
          try {
            output = Object.prototype.toString.call(val) + " " +
              JSON.stringify(val);
          } catch (_e) {
            // ignore
          }
        } else {
          try {
            output = JSON.stringify(val);
          } catch (_e) {
            // ignore
          }
        }
        const tm2 = new Date().getTime();
        if (debug) {
          if (output === undefined) {
            console.error("==> (" + (tm2 - tm1) + " ms)");
            console.error(val);
          } else {
            console.error("==> " + output + " (" + (tm2 - tm1) + " ms)");
          }
        }
      } catch (e) {
        if (!debug) {
          console.error("[LISP] " + exp);
        }
        if (!debug) {
          console.error(" [AST] " + JSON.stringify(ast));
        }
        if (!debug) {
          console.error("<SCRIPT>\n" + $jsBeautify(text) + "\n</SCRIPT>");
        }
        console.error("[EXCEPTION]");
        if (e.stack) {
          console.error(e.stack);
        } else {
          console.error(e);
        }
        throw e;
      }
    }
    return last;
  };
  $scope.run = (exp) => $scope.exec(exp, true);
  $scope.execAll = (exp, debug) => {
    const text = $scope.compile(exp, debug);
    try {
      return eval(text);
    } catch (e) {
      if (e.stack) {
        console.error(e.stack);
      } else {
        console.error(e);
      }
      throw e;
    }
  };
  $scope.runAll = (exp) => {
    return $scope.execAll(exp, true);
  };
  $scope.execFile = (path, debug) => {
    const text = Deno.readTextFileSync(path);
    return $scope.execAll(text, debug);
  };
  $scope.runFile = (path) => {
    return $scope.execFile(path, true);
  };
  $scope.async_execURL = async (url, debug) => {
    const res = await fetch(url);
    const text = await res.text();
    return $scope.execAll(text, debug);
  };
  $scope.async_runURL = async (url) => {
    return await $scope.async_execURL(url, true);
  };
  return $scope;
}
