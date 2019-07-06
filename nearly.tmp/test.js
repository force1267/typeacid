var nearley = require("nearley");

function data(x) { return {access: 12} }
var cond = {
    myvar: 12,
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["_", "AS", "_"], "postprocess": function(d) { var inps = {user: {access: 12}}; return d[1]; }},
    {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess": function(d) {return d[2]; }},
    {"name": "P", "symbols": ["float"], "postprocess": x=>x[0]},
    {"name": "LOG$string$1", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LOG", "symbols": ["LOG", "_", "LOG$string$1", "_", "P"], "postprocess": function(d) {return d[0]&&d[4]; }},
    {"name": "LOG$string$2", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LOG", "symbols": ["LOG", "_", "LOG$string$2", "_", "P"], "postprocess": function(d) {return d[0]||d[4]; }},
    {"name": "LOG", "symbols": ["_", {"literal":"!"}, "_", "P"], "postprocess": function(d) {return !d[3]; }},
    {"name": "LOG", "symbols": ["P"], "postprocess": x=>x[0]},
    {"name": "CON$string$1", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CON", "symbols": ["CON", "_", "CON$string$1", "_", "LOG"], "postprocess": function(d) {return d[0]==d[4]; }},
    {"name": "CON$string$2", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CON", "symbols": ["CON", "_", "CON$string$2", "_", "LOG"], "postprocess": function(d) {return d[0]==d[4]; }},
    {"name": "CON$string$3", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CON", "symbols": ["CON", "_", "CON$string$3", "_", "LOG"], "postprocess": function(d) {return d[0]<=d[4]; }},
    {"name": "CON$string$4", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CON", "symbols": ["CON", "_", "CON$string$4", "_", "LOG"], "postprocess": function(d) {return d[0]>=d[4]; }},
    {"name": "CON", "symbols": ["CON", "_", {"literal":"<"}, "_", "LOG"], "postprocess": function(d) {return d[0]<d[4]; }},
    {"name": "CON", "symbols": ["CON", "_", {"literal":">"}, "_", "LOG"], "postprocess": function(d) {return d[0]>d[4]; }},
    {"name": "CON", "symbols": ["LOG"], "postprocess": x=>x[0]},
    {"name": "MD", "symbols": ["MD", "_", {"literal":"*"}, "_", "CON"], "postprocess": function(d) {return d[0]*d[4]; }},
    {"name": "MD", "symbols": ["MD", "_", {"literal":"/"}, "_", "CON"], "postprocess": function(d) {return d[0]/d[4]; }},
    {"name": "MD", "symbols": ["CON"], "postprocess": x=>x[0]},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "MD"], "postprocess": function(d) {return d[0]+d[4]; }},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "MD"], "postprocess": function(d) {return d[0]-d[4]; }},
    {"name": "AS", "symbols": ["MD"], "postprocess": x=>x[0]},
    {"name": "float", "symbols": ["int", {"literal":"."}, "int"], "postprocess": function(d) {return parseFloat(d[0] + d[1] + d[2])}},
    {"name": "float", "symbols": ["int"], "postprocess": function(d) {return parseInt(d[0])}},
    {"name": "float", "symbols": ["obj"], "postprocess": function(d) {return d[0]}},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1"], "postprocess": function(d) {return d[0].join(""); }},
    {"name": "obj", "symbols": ["obj", {"literal":"."}, "prop"], "postprocess": function(d) { return d[0][d[2]]; }},
    {"name": "obj$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "obj$ebnf$1", "symbols": ["obj$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "obj", "symbols": ["obj$ebnf$1"], "postprocess": function(d) { return data(d[0]); }},
    {"name": "prop$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "prop$ebnf$1", "symbols": ["prop$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "prop", "symbols": ["prop$ebnf$1"], "postprocess": function(d) { return d[0].join(""); }},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null; }}
]
  , ParserStart: "main"
}


var parser = new nearley.Parser(nearley.Grammar.fromCompiled(cond));


function parse(text) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(cond));
    parser.feed(text);
    var res = parser.results[0];
    parser.finish();
    return res;
}

console.log(parse("a.access"));