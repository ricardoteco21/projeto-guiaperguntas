const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//database
connection 
    .authenticate()
    .then (() => {
        console.log("Conexão feita com o banco de dados");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })
//estou dizendo parea o express usar o EJS como view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded ({extend: false}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    Pergunta.findAll({ raw: true, order:[
        ['id', 'DESC']
    ]}).then(perguntas =>{
        res.render("index", {
       perguntas: perguntas
         });
    });
});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
    });
});

app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined){

            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order: [
                    ['id', 'DESC']
                ]
            }).then(respostas => {
            res.render("pergunta", {
                pergunta: pergunta,
                respostas: respostas
                });
            });
        }else {
            res.redirect("/")
        }
    })
})

app.post("/responder",(req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo, 
        perguntaId: perguntaId
    }).then(() => {
        res.redirect("/pergunta/"+perguntaId);
    })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{ console.log(`App rodando ${PORT}`)})
