// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
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
    {"name": "prop", "symbols": ["prop$ebnf$2", {"literal":"."}, "prop$ebnf$3"], "postprocess": function(d) { const gt = e => e.join("").split("."); return data[gt(dt[0])][gt(dt[2])]}},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null; }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
