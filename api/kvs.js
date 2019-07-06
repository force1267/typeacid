
class DBDriver { // mock db TODO connect to real db
    constructor() {
        this.vars = {
            'hello._c_': 'Javad',
            'hello._d_': 'Asadi'
        }
    }
    clone() {
        return new DBDriver;
    }
    async read(key) { return this.vars[key] }
    async write(key, value) { this.vars[key] = value; }
    async remove(key) { delete this.vars[key]; }
}

class QueryContext {
    constructor (queries, data = {}, dbdriver, calls = { max_call: 25, max_call_stack: 10 }) {
        this.data = data;
        this.queries = queries;
        this.vars = {};
        this.calls = calls;
        this.db = dbdriver;
    }
    set(variable, value) {
        this.vars[variable] = value;
    }
    get(variable) {
        return this.vars[variable];
    }
    async run(name, args) {
        var context = this;
        var bin = this.queries[name];
        var ins;
        if(typeof args == typeof []) {
            ins = {};
            for(var i = 0; i < bin.args.length; i++) {
                ins[bin.args[i]] = args[i];
            }
        } else {
            ins = args;
        }
        var mc = -- context.calls.max_call;
        var mcs = -- context.calls.max_call_stack;
        if(mc < 0) {
            throw "maximum call";
        }
        if(mcs < 0) {
            throw "maximum call stack";
        }
        if(bin.runRule(context.data)) {
            var res = await bin.runQuery(context, ins);
            context.calls.max_call_stack ++;
        } else {
            throw "access denied";
        }
        return res;
    }
    async query(name, args) {
        var context = this;
        var ncon = new QueryContext(context.queries, context.data, this.db, this.calls);
        var res = await ncon.run(name, args);
        return res;
    }
    print(...ws) {
        console.log(...ws);
    }
}

function compileQuery(query, qrs) {
    var acts = query.split("\n").map(l => (l + ";").slice(0, l.indexOf(";"))).map(l => normal(l).split(" "));
    function render(template, context) {
        var vars = context.vars;
        for(var i = 0; i < template.length; i ++) {
            if(template[i] == "{") {
                var j = i;
                var c = 0;
                for(;j <= template.length; j ++) {
                    if(template[j] == "{") c ++;
                    if(template[j] == "}") c --;
                    if(c == 0) break;
                }
                if(j > template.length) {
                    throw "variable placement error at " + template;
                }
                if(c != 0) {
                    throw "template placement error at " + template;
                }
                var ans = template.slice(0, i) + vars[render(template.slice(i + 1, j), context)] + template.slice(j + 1);
                return ans == template ? ans : render(ans, context);
            }
        }
        return template;
    }
    return async function runQuery(context, ins) {
        context.queries = qrs;
        for(var i in ins) {
            context.set(i, ins[i]);
        }
        for(var i in context.data) {
            context.set(i, context.data[i]);
        }
        for(var act of acts) {
            var op = act[0];
            if(op[0] == ";") {
                // comment line starts with `;`
            } else if(op == "get" || op == "read") {
                var key = render(act[1], context);
                // var variable = render(act[2], context);
                var ans = await context.db.read(key);
                context.set(key, ans);
            } else if(op == "set" || op == "write") {
                var key = render(act[1], context);
                var value = render(act[2], context);
                await context.db.write(key, value);
                context.set(key, value);
            } else if(op == "remove" || op == "delete") {
                var key = render(act[1], context);
                await context.db.remove(key);
            } else if(op == "put" || op == "define") {
                var key = render(act[1], context);
                var variable = render(act[2], context);
                context.set(key, variable);
            } else if(op == "print" || op == "show") {
                context.print(...act.slice(1).map(w => render(w, context)));
            } else if(op == "return") {
                return act.slice(1).map(arg => render(arg, context));
            } else if(act[0] != "") { // calling a query
                var e = op.indexOf("(");
                var name = op.slice(0, e != -1 ? e : op.length);
                var sarg = null, earg = null;
                for(var i = 0; i < act.length; i ++) {
                    if(act[i].includes('(')) {
                        sarg = sarg !== undefined ? i : sarg;
                    }
                    if(act[i].includes(')')) {
                        earg = earg !== undefined ? i : earg;
                    }
                }
                var area = act.slice(sarg, earg+1).join("");
                var args = area.slice(area.indexOf('(') + 1, area.indexOf(')'))
                .split(',').map(arg => render(normal(arg), context));
                var ans = await context.query(name, args);
                if(ans) {
                    var tmp = act.slice(earg).join(" ");
                    var rets = normal(tmp.slice(tmp.indexOf(")") + 1)).split(" ");
                    rets.map((vt, i) => [render(vt, context), ans[i]]).forEach(e => context.set(e[0], e[1]));
                }
            }
        }
    }
}

// ;comment
// set key value
// print value...
// read key
// write key value
// query(value, ...) key...
// return value...

// {key} -> value
// string == typeof key
// string == typeof value

// example:
// set idx 2
// write name{idx} force
// print {name2}
// ;force

var mockquery = `return query_body_ok`

var mockins = {
    a: '_a_',
    b: '_b_',
    c: '_c_',
    d: '_d_',
}

function compileRule(rule) {
    const nearley = require("nearley"); // TODO can it be out ? memory ?
    function id(x) { return x[0]; }
    function jn(x) { return x.join(""); }
    return function runRule(data) {
        const grammar = {
            Lexer: undefined,
            ParserRules: [
            {"name": "main", "symbols": ["_", "AS", "_"], "postprocess": function(d) {return d[1]; }},
            {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess": function(d) {return d[2]; }},
            {"name": "P", "symbols": ["float"], "postprocess": id},
            {"name": "CON$string$1", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "CON", "symbols": ["CON", "_", "CON$string$1", "_", "P"], "postprocess": function(d) {return d[0]==d[4]; }},
            {"name": "CON$string$2", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "CON", "symbols": ["CON", "_", "CON$string$2", "_", "P"], "postprocess": function(d) {return d[0]==d[4]; }},
            {"name": "CON$string$3", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "CON", "symbols": ["CON", "_", "CON$string$3", "_", "P"], "postprocess": function(d) {return d[0]<=d[4]; }},
            {"name": "CON$string$4", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "CON", "symbols": ["CON", "_", "CON$string$4", "_", "P"], "postprocess": function(d) {return d[0]>=d[4]; }},
            {"name": "CON", "symbols": ["CON", "_", {"literal":"<"}, "_", "P"], "postprocess": function(d) {return d[0]<d[4]; }},
            {"name": "CON", "symbols": ["CON", "_", {"literal":">"}, "_", "P"], "postprocess": function(d) {return d[0]>d[4]; }},
            {"name": "CON", "symbols": ["P"], "postprocess": id},
            {"name": "LOG$string$1", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "LOG", "symbols": ["LOG", "_", "LOG$string$1", "_", "CON"], "postprocess": function(d) {return d[0]&&d[4]; }},
            {"name": "LOG$string$2", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
            {"name": "LOG", "symbols": ["LOG", "_", "LOG$string$2", "_", "CON"], "postprocess": function(d) {return d[0]||d[4]; }},
            {"name": "LOG", "symbols": ["_", {"literal":"!"}, "_", "CON"], "postprocess": function(d) {return !d[3]; }},
            {"name": "LOG", "symbols": ["CON"], "postprocess": id},
            {"name": "MD", "symbols": ["MD", "_", {"literal":"*"}, "_", "LOG"], "postprocess": function(d) {return d[0]*d[4]; }},
            {"name": "MD", "symbols": ["MD", "_", {"literal":"/"}, "_", "LOG"], "postprocess": function(d) {return d[0]/d[4]; }},
            {"name": "MD", "symbols": ["LOG"], "postprocess": id},
            {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "MD"], "postprocess": function(d) {return d[0]+d[4]; }},
            {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "MD"], "postprocess": function(d) {return d[0]-d[4]; }},
            {"name": "AS", "symbols": ["MD"], "postprocess": id},
            {"name": "float", "symbols": ["int", {"literal":"."}, "int"], "postprocess": function(d) {return parseFloat(d[0] + d[1] + d[2])}},
            {"name": "float", "symbols": ["int"], "postprocess": function(d) {return parseInt(d[0])}},
            {"name": "float", "symbols": ["prop"], "postprocess": function(d) {return d[0]}},
            {"name": "int$ebnf$1", "symbols": [/[0-9]/]},
            {"name": "int$ebnf$1", "symbols": ["int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
            {"name": "int", "symbols": ["int$ebnf$1"], "postprocess": function(d) {return d[0].join(""); }},
            {"name": "prop$ebnf$1", "symbols": [/[a-z]/]},
            {"name": "prop$ebnf$1", "symbols": ["prop$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
            {"name": "prop", "symbols": ["prop$ebnf$1"], "postprocess": function(d) { return data[d[0].join("")]; }},
            {"name": "prop$ebnf$2", "symbols": [/[a-z]/]},
            {"name": "prop$ebnf$2", "symbols": ["prop$ebnf$2", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
            {"name": "prop$ebnf$3", "symbols": [/[a-z]/]},
            {"name": "prop$ebnf$3", "symbols": ["prop$ebnf$3", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
            {"name": "prop", "symbols": ["prop$ebnf$2", {"literal":"."}, "prop$ebnf$3"], "postprocess": function(d) { return data[jn(d[0])][jn(d[2])]}},
            {"name": "_$ebnf$1", "symbols": []},
            {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
            {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null; }}
        ]
        , ParserStart: "main"
        }
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        parser.feed(rule);
        var res = parser.results[0];
        parser.finish(); // TODO what ?! can be reused ?
        return res;
    }
}

function read(file, cb) {
    const fs = require('fs');
    fs.readFile(file, (err, data) => {
        if(err) {
            return cb(err, null);
        }
        var defs = [];
        var lines = data.toString().split("\n").map(normal);
        var s = 0; // state = 0: name, 1: args, 2: rule, 3: body
        var name = null;
        var args = null;
        var rls, rle;
        var rule = null;
        var c = 0;
        var body = null;
        for(var i = 0; i < lines.length; i ++) {
            var line = lines[i];
            if(s == 0) { // first not empty not comment line
                if(line != "" && line[0] != ";") {
                    name = normal(line.slice(0, line.indexOf("(")));
                    s = 1; // args
                }
            }
            if(s == 1) { // must be after name in the same line
                args = normal(line.slice(line.indexOf("(") + 1, line.indexOf(")")))
                .split(",").map(normal).filter(arg => arg !== "");
                s = 2; // rule
                rls = i;
            }
            if(s == 2) { // starts at `)` and ends with `{`
                if(rle == undefined && line.indexOf("{") != -1) {
                    rle = i;
                    var ls = lines.slice(rls, rle + 1);
                    var last = ls.length - 1;
                    ls[0] = ls[0].slice(ls[0].indexOf(")") + 1);
                    ls[last] = ls[last].slice(0, ls[last].indexOf("{"));
                    rule = normal(ls.join("\n"));
                    rule = rule == "" ? "1" : rule;
                    rls = null;
                    s = 3; // body
                }
            }
            if(s == 3) { // starts at first `{` ends at `}` next query must be in a diffrent line
                var e = 0;
                for(var j = 0; j < line.length; j ++) {
                    if(line[j] == "{") {
                        c ++;
                    }
                    if(line[j] == "}") {
                        c --;
                        if (c == 0) {
                            e = j;
                            break;
                        }
                    }
                }
                if(c == 0) {
                    var bd = lines.slice(rle, i + 1);
                    var last = bd.length - 1;
                    bd[last] = bd[last].slice(0, e);
                    bd[0] = bd[0].slice(bd[0].indexOf("{") + 1);
                    body = bd.join("\n").split("\\n").join("\n");
                    rls = rle = undefined;
                    c = 0;
                    s = 0; // name
                    defs.push({name, args, rule, body});
                }
            }
        }
        return cb(err, defs);
    })
}


async function compile(fileName) { // {name: {name, runQuery, runRule, getContext}}
    return await new Promise((resolve, reject) => {
        read(fileName, (err, defs) => {
            if(err) {
                reject(err);
            } else {
                var qrs = {};
                defs.forEach(def => {
                    def.runQuery = compileQuery(def.body, qrs); // (context, ins = {}) => {}
                    def.runRule = compileRule(def.rule); // (data) => {}
                    def.queries = qrs;
                    qrs[def.name] = def;
                })
                resolve(qrs);
            }
        })
    })
}

// utils
function normal(str) {
    var ans = str.split("\n").join(" ").split("\t").join(" ").split("  ").join(" ");
    return ans != str ? normal(ans) : ans[0] == " " ? normal(ans.slice(1)) : ans[ans.length - 1] == " " ? ans.slice(0, ans.length - 1) : ans;
}


// compile("./.database").then(qrs =>
//     (new QueryContext(qrs, {user: 1, access: 12}, new DBDriver, {max_call:355, max_call_stack: 7}))
//     .run("query1", ["2"]))
// .then(console.log)
// .catch(console.error);


module.exports = {compile, QueryContext};