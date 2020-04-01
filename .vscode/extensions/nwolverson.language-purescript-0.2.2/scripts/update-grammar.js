var request = require('request');
var cson = require('cson');
var process = require('process');
var fs = require('fs');

var url = 'https://raw.githubusercontent.com/purescript-contrib/atom-language-purescript/master/grammars/purescript.cson';
request(url, function (error, response, body) {
	if (error) {
		console.error(error);
		process.exit(1);
	} else {
		var obj = cson.parse(body);
		var json = cson.createJSONString(obj);
		fs.writeFileSync('syntaxes/purescript.json', json)
	}
});
