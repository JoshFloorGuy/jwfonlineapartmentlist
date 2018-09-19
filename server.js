var server_port = 80
var server_ip_address = '10.147.18.41'

var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var listFile;
function updateJSON() {
	fs.writeFile('lists.json',JSON.stringify(listFile), function(err) {
		if(err) {
			console.log(err);
		}
	});
}
fs.readFile('lists.json', function(err,data) {
	listFile = JSON.parse(data)
})
var server = http.createServer(function (req,res) {
	var q = url.parse(req.url,true);
	if(q.pathname!="/") {
		if(q.pathname=="/login") {
			fs.readFile('login.html', function(err,data) {
				if(err) {
					res.end(err);
				} else {
					res.writeHead(200);
					res.write(data);
					res.end();
				}
			});
		} else if(req.method=="POST") {
			let body = "";
			req.on('data', function(chunk) {
				body += chunk.toString(); // convert Buffer to string
			});
			req.on('end', function() {
				if(q.pathname=="/action") {
					var info = qs.parse(body);
					var item = {type:info.type,name:info.name}
					var inList = -1;
					if(info.action!="add"){for(i in listFile.items) {if(listFile.items[i].name==item.name) {inList = i;break;}}}
					switch(info.action) {
						case "delete":
							listFile.items.splice(inList,1);
							break;
						case "add":
							listFile.items.push(item);
							break;
						case "move":
							item.type=info.moveTo;
							listFile.items[inList]=item;
							break;
					}
					updateJSON();
					res.end('<head><script>window.location = window.location.origin</script></head>');
				} else {
					if(body=="pass="+listFile.password) {
						res.end('<script>var d = new Date();d.setTime(d.getTime()+86400000);document.cookie = "logged=in; expires="+d.toUTCString()+";path=/";window.location = window.location.origin</script>');
					} else {
						res.end('<head><script>window.location = window.location.origin+"/login?incorrect"</script></head>');
					}
				}
			});
		} else {
			fs.readFile('.'+q.pathname, function(err,data) {
				if(err==null) {
					res.write(data);
					res.end();
				}
			});
		}
	} else {
		fs.readFile('start.html', function(err,data) {
			res.writeHead(200);
			res.write(data);
			res.end();
		});
	}
})
server.listen(server_port,server_ip_address);