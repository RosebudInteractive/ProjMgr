var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /
app.get('/', function(req, res){
    res.render('index.html');
});

app.post("/admin/:what", function(req, res) {

    function execCommand(command) {
        res.write('$ '+command+'<br>');
        var output = shell.exec(command).output;
        output = output.replace(new RegExp("https://(.*?)@(.*)",'g'), 'https://$2');
        output = output?output:'Ok';
        res.write(output+'<br>');
    }

    var shell = require('shelljs');
    res.writeHead(200,{"Content-Type" : "text/html"});
    switch (req.params.what){
        case 'branch':
        case 'checkout':
        case 'merge':
            var projectPath = null;
            var branchName = req.body.branchName;
            var gitCmd = req.params.what;
            switch (req.body.branchProject){
                case 'TestProject':
                    projectPath = '/var/www/sites/node/MatrixExample/';
                    break;
                case 'Uccello':
                    projectPath = '/var/www/sites/node/Uccello/';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/';
                    break;
            }
            if (projectPath && branchName) {
                var cmd = 'cd '+projectPath+'; git '+gitCmd+' '+branchName;
                execCommand(cmd);
                // publish branch
                if (req.params.what == 'branch') {
                    cmd = 'cd '+projectPath+'; git push -u origin '+branchName;
                    execCommand(cmd);
                }
            } else {
                res.write('Error: не задан проект или название ветки');
            }
            break;
        case 'update':
            var projectPath = null;
            switch (req.body.serverProject){
                case 'Uccello':
                    projectPath = '/var/www/sites/node/Uccello/';
                    break;
                case 'ProtoOneNginx':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/';
                    break;
            }
            if (projectPath) {
                var cmd = 'cd '+projectPath+'; git pull';
                execCommand(cmd);
            } else {
                res.write('Error: метод не поддерживается');
            }
            break;
        case 'restart':
            var projectPath = null;
            var projectFile = null;
            switch (req.body.serverProject){
                case 'ProtoOneNginx':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    projectFile = 'memservernginx.js';
                    break;
                case 'ProtoOne':
                    projectPath = '/var/www/sites/node/ProtoOne/';
                    projectFile = 'memserver.js';
                    break;
                case 'Genetix':
                    projectPath = '/var/www/sites/genetix/Genetix/web/';
                    projectFile = 'genetixSrv.js';
                    break;
            }
            if (projectPath && projectFile) {
                var cmd = 'cd '+projectPath+'; forever restart '+projectFile;
                execCommand(cmd);
            } else {
                res.write('Error: метод не поддерживается');
            }
            break;
        case 'add':
            var fs = require('fs');
            var rootFolder = '/var/www/sites/node/projects/';
            var projectPath = null, projectGit = null, projectServer = null,
                uccelloGit='github.com/RosebudInteractive/Uccello.git',
                projectBranch = req.body.addBranchName, uccelloBranch = req.body.addUccelloName;

            if (!projectBranch || projectBranch == '') projectBranch = 'master';
            if (!uccelloBranch || uccelloBranch == '') uccelloBranch = 'master';

            for(var projectId=0;projectId<100;projectId++) {
                projectPath = rootFolder+'project'+projectId;
                if (!fs.existsSync(projectPath)) {
                    fs.mkdirSync(projectPath);
                    break;
                }
            }
            if (!projectPath) {
                res.write('Error: не могу создать дирректорию');
                break;
            }

            switch (req.body.addProject){
                case 'ProtoOne':
                    projectServer = 'ProtoOne/memserver.js';
                    projectGit = 'github.com/RosebudInteractive/ProtoOne.git';
                    break;
                case 'Genetix':
                    projectServer = 'Genetix/web/genetixSrv.js';
                    projectGit = 'github.com/RosebudInteractive/Genetix.git';
                    break;
            }
            if (projectServer) {
                var cmd = 'cd '+projectPath+'; git clone -b '+projectBranch+' https://rudserg:rud850502@'+projectGit;
                execCommand(cmd);
                var cmd = 'cd '+projectPath+'; git clone -b '+uccelloBranch+' https://rudserg:rud850502@'+uccelloGit;
                execCommand(cmd);
                var cmd = 'forever --uid "project'+projectId+'" start '+projectPath+projectServer+' Uccello '+req.body.addPortWeb+' '+req.body.addPortWs;
                execCommand(cmd);
                fs.writeFileSync(projectPath+'.info', JSON.stringify({project:req.body.addProject,path:'project'+projectId, projectBranch:projectBranch, uccelloBranch:uccelloBranch, portWeb:req.body.addPortWeb, portWs:req.body.addPortWs, date:Date.now()}));
            } else {
                res.write('Error: проект не найден');
            }

            break;
    }
    res.end();
});

// компрессия статики
var compress = require('compression');
app.use(compress());
// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));

// запускаем http сервер
http.createServer(app).listen(1330);
console.log('Сервер запущен на http://127.0.0.1:1330/');