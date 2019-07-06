main -> _ AS _ {% function(d) {return d[1]; } %}

# PEMDAS!
# We define each level of precedence as a nonterminal.

# Parentheses
P -> "(" _ AS _ ")" {% function(d) {return d[2]; } %}
    | float          {% id %}

# Conditions
CON -> CON _ "==" _ P {% function(d) {return d[0]==d[4]; } %}
     | CON _ "!=" _ P {% function(d) {return d[0]==d[4]; } %}
     | CON _ "<=" _ P       {% function(d) {return d[0]<=d[4]; } %}
     | CON _ ">=" _ P       {% function(d) {return d[0]>=d[4]; } %}
     | CON _ "<" _ P       {% function(d) {return d[0]<d[4]; } %}
     | CON _ ">" _ P       {% function(d) {return d[0]>d[4]; } %}
	 | P             {% id %}

# Logicals
LOG -> LOG _ "&&" _ CON {% function(d) {return d[0]&&d[4]; } %}
      | LOG _ "||" _ CON {% function(d) {return d[0]||d[4]; } %}
      | _ "!" _ CON       {% function(d) {return !d[3]; } %}
	  | CON              {% id %}

# Multiplication and division
MD -> MD _ "*" _ LOG  {% function(d) {return d[0]*d[4]; } %}
    | MD _ "/" _ LOG  {% function(d) {return d[0]/d[4]; } %}
    | LOG             {% id %}

# Addition and subtraction
AS -> AS _ "+" _ MD {% function(d) {return d[0]+d[4]; } %}
    | AS _ "-" _ MD {% function(d) {return d[0]-d[4]; } %}
    | MD            {% id %}

# I use `float` to basically mean a number with a decimal point in it
float ->
      int "." int   {% function(d) {return parseFloat(d[0] + d[1] + d[2])} %}
	| int           {% function(d) {return parseInt(d[0])} %}
	#| truth           {% function(d) {return d[0]} %}
	| prop             {% function(d) {return d[0]} %}

int -> [0-9]:+        {% function(d) {return d[0].join(""); } %}

#truth -> "true"		{% function() { return true; }%}
#	| "false"       {% function() { return false; }%}
	
prop -> [a-z]:+			{% function(d) { return data[d[0].join("")]; }%}
    | [a-z]:+ "." [a-z]:+ {% function(d) { const jn = e => e.join(""); return data[jn(d[0])][jn(d[2])]} %}

# Whitespace. The important thing here is that the postprocessor
# is a null-returning function. This is a memory efficiency trick.
_ -> [\s]:* {% function(d) {return null; } %}
#_ -> " " {% function(d) {return null; } %}
#   | "" {% function(d) {return null; } %}
#   | "  " {% function(d) {return null; } %}