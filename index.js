const express = require('express');
const serveIndex = require('serve-index');

const fs = require('fs');

var http = require("http");
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

const { readFileSync } = require('fs');
const { join } = require('path');
const path = require('path');

const app = express();

var bodyParser = require('body-parser')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.engine('.ejs', require('ejs').__express);

app.use((req, res, next) => {
  //console.log('Time: ', Date.now());
  next();
});

app.use('/request-type', (req, res, next) => {
  console.log('Request type: ', req.method);
  next();
});

app.use(express.static(__dirname + '/public'));

app.use('/public', express.static('public'));
app.use('/public', serveIndex('public'));

app.use('/dist', express.static('dist'));
app.use('/dist', serveIndex('dist'));

app.get('/', (req, res) => {

  var folder = './config.json';

  try {
    if (!fs.existsSync(folder)) {
      console.log('CRIA ARQUIVO!');
      fs.writeFile('config.json', '{}', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }
  } catch (err) {
    console.error(err)
  }

  var file = readFileSync(join(__dirname, './', 'config.json'), 'utf8')

  obj = JSON.parse(file);

  if (obj.password == undefined) {
    res.render('config.html.ejs');
  } else {
    res.render('content.html.ejs');
  }

  //res.send('Successful response RAIZ !.');
});

app.get('/teste', function (req, res) {
  //res.sendFile(path.join(__dirname, '/public/index.html'));
  res.render('content.html.ejs');
});

app.get('/catalogo', function (req, res) {
  //res.sendFile(path.join(__dirname, '/public/index.html'));
  res.render('catalogo.html.ejs');
});

app.use(express.json());

app.post('/config', function (request, response) {

  fs.readFile('./config.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      body = request.body;

      fs.writeFile("./config.json", JSON.stringify(body), function (err) {
        if (err) throw err;
        //console.log('complete');
      }
      );
    }
  });

  response.send(request.body);
});

app.post('/delete', function (request, response) {

  fs.readFile('./films.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      filmId = request.body.id;

      data = JSON.parse(data);

      if (data.films != undefined) {
        //data.films.push({ nome: film.nome, data: film.data, url: film.url });
        data.films.splice(filmId, 1);
      }

      fs.writeFile("./films.json", JSON.stringify(data), function (err) {
        if (err) throw err;
        //console.log('complete');
      }
      );
    }
  });

  response.send(request.body);
});

app.post('/play', function (req, response) {
  var data = req.body;

  console.log(data);

  var file = readFileSync(join(__dirname, './', 'config.json'), 'utf8')

  obj = JSON.parse(file);

  var endereco = obj.ip.split(':');

  http.get({
    host: endereco[0],
    port: endereco[1],
    path: '/requests/status.xml?command=pl_play&id=' + data.id,
    auth: ':' + obj.password
  }, resp => {

    let xml_data = '';

    resp.on('data', (stream) => {
      xml_data = xml_data + stream;
    });

    resp.on('end', () => {
      parser.parseString(xml_data, (error, result) => {
        if (error === null) {
          response.send(result);
        } else {
          console.log(error);
        }
      });
    });

  }).on('error', err => console.log(err));
});

app.get('/catalogs', function (req, response) {
  var file = readFileSync(join(__dirname, './', 'config.json'), 'utf8')

  obj = JSON.parse(file);

  //var url = 'http://' + obj.ip + '/requests/playlist_jstree.xml';

  var endereco = obj.ip.split(':');

  http.get({
    host: endereco[0],
    port: endereco[1],
    path: '/requests/playlist_jstree.xml',
    auth: ':' + obj.password
  }, resp => {

    let xml_data = '';

    resp.on('data', (stream) => {
      xml_data = xml_data + stream;
    });

    resp.on('end', () => {
      parser.parseString(xml_data, (error, result) => {
        if (error === null) {
          var blibliotecas = result.root.item[0].item;

          var dlnas = null;

          for (const bl of blibliotecas) {
            if (bl.content[0].name == "Plug'n'Play Universal") {
              dlnas = bl;
            }
          }

          response.send(dlnas.item);
        } else {
          console.log(error);
        }
      });
    });

  }).on('error', err => console.log(err));
});

app.get('/films', function (request, response) {

  var folder = './films.json';

  try {
    if (!fs.existsSync(folder)) {
      console.log('CRIA ARQUIVO!');
      fs.writeFile('films.json', '{"films": []}', function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
    }
  } catch (err) {
    console.error(err)
  }

  var file = readFileSync(join(__dirname, './', 'films.json'), 'utf8')

  obj = JSON.parse(file);
  json = JSON.stringify(obj);
  response.send(json);
});

app.listen(process.env.PORT || 3000, () => console.log('VLC APP is listening on port ' + (process.env.PORT || 3000)));