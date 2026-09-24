const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

let viewsPath = path.join(__dirname, 'views');
if (!fs.existsSync(viewsPath)) viewsPath = path.join(__dirname, 'Remix-app-panel', 'views');
if (!fs.existsSync(viewsPath)) viewsPath = path.join(__dirname, 'remix-app-panel', 'views');

app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({secret:'remix2026',resave:false,saveUninitialized:true}));

let db={credits:50,users:[]};
const USER='Remix22';
const PASS='2212';

app.get('/',(req,res)=>res.render('login'));

app.post('/login',(req,res)=>{
 if(req.body.username===USER && req.body.password===PASS){
  req.session.user=USER;
  return res.redirect('/dashboard');
 }
 res.send('Clave mal <a href="/">Volver</a>');
});

app.get('/dashboard',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 db.users=db.users.filter(u=>!u.expiraEn || u.expiraEn>Date.now());
 res.render('dashboard',{
  username:req.session.user,
  db:db,
  total:db.users.length,
  premium:db.users.filter(u=>u.tipo==='Premium').length,
  demos:db.users.filter(u=>u.tipo==='Demo').length
 });
});

app.get('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 res.render('agregar-usuario',{db:db});
});

app.post('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 let esDemo = req.body.tipo && req.body.tipo.toLowerCase().includes('demo');
 let fecha = esDemo ? new Date(Date.now()+60*60*1000) : new Date(Date.now()+30*24*60*60*1000);
 
 let texto = fecha.toLocaleString('es-AR', {
   timeZone: 'America/Argentina/San_Juan',
   day: '2-digit',
   month: '2-digit',
   year: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
   hour12: false
 });

 db.users.push({
  nombre
