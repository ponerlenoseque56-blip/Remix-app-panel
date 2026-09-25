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

// DB QUE NO SE BORRA
let dbPath = path.join(__dirname, 'db.json');
let db = {credits:50, users:[]};
if(fs.existsSync(dbPath)){ try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch(e){} }
function saveDB(){ fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }

const USER='Remix22';
const PASS='2212';

app.get('/',(req,res)=>res.render('login'));
app.post('/login',(req,res)=>{
 if(req.body.username===USER && req.body.password===PASS){req.session.user=USER;return res.redirect('/dashboard');}
 res.send('Clave mal <a href="/">Volver</a>');
});
app.get('/dashboard',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 db.users=db.users.filter(u=>!u.expiraEn || u.expiraEn>Date.now());
 saveDB();
 res.render('dashboard',{username:req.session.user,db:db,total:db.users.length,premium:db.users.filter(u=>u.tipo==='Premium').length,demos:db.users.filter(u=>u.tipo==='Demo').length});
});
app.get('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 res.render('agregar-usuario',{db:db});
});
app.post('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 let esDemo = req.body.tipo && req.body.tipo.toLowerCase().includes('demo');
 let fecha = esDemo ? new Date(Date.now()+60*60*1000) : new Date(Date.now()+30*24*60*60*1000);
 let texto = fecha.toLocaleString('es-AR',{timeZone:'America/Argentina/San_Juan',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
 let nuevo = {nombre:req.body.nombre,email:req.body.email,password:req.body.password,tipo:esDemo?'Demo':'Premium',dispositivos:req.body.dispositivos||'1',vencimiento:texto,expiraEn:fecha.getTime()};
 db.users.push(nuevo);
 if(!esDemo) db.credits-=1;
 saveDB();
 let txtCopy = `*${esDemo?'DEMO CREADA':'CLIENTE GENERADO'}* ✅\n\n📧 Email: ${nuevo.email}\n🔑 Clave: ${nuevo.password}\n👤 Usuario: ${nuevo.nombre}\n⏰ Vence: ${nuevo.vencimiento}\n📱 Tipo: ${nuevo.tipo}`;
 res.render('usuario-creado',{nuevo:nuevo,esDemo:esDemo,textoCopiar:txtCopy});
});

// APIS APP
app.post('/api/login',(req,res)=>{
  let login = (req.body.email || req.body.username || '').trim().toLowerCase();
  db.users = db.users.filter(u=>!u.expiraEn || u.expiraEn > Date.now()); saveDB();
  let user = db.users.find(u => (u.email.toLowerCase()===login || u.nombre.toLowerCase()===login) && u.password===req.body.password);
  if(!user) return res.json({ok:false}); return res.json({ok:true,user:user});
});
app.post('/api/renew-user',(req,res)=>{
  let user = db.users.find(u=>u.email===req.body.email);
  if(!user) return res.json({ok:false});
  let base = (user.expiraEn && user.expiraEn>Date.now()) ? user.expiraEn : Date.now();
  let nueva = new Date(base + 30*24*60*60*1000);
  user.expiraEn = nueva.getTime();
  user.vencimiento = nueva.toLocaleString('es-AR',{timeZone:'America/Argentina/San_Juan',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
  if(user.tipo==='Demo') user.tipo='Premium';
  db.credits -= 1; saveDB();
  res.json({ok:true,vencimiento:user.vencimiento});
});
app.post('/api/edit-user',(req,res)=>{
  let user = db.users.find(u=>u.email===req.body.email);
  if(!user) return res.json({ok:false});
  if(req.body.password) user.password = req.body.password;
  saveDB(); res.json({ok:true});
});
app.post('/api/add-credits',(req,res)=>{ let c=parseInt(req.body.cantidad||5); db.credits+=c; saveDB(); res.json({ok:true}); });
app.post('/api/credits',(req,res)=>{ let c=parseInt(req.body.cantidad||5); db.credits+=c; saveDB(); res.json({ok:true}); });
app.post('/api/delete-user',(req,res)=>{db.users=db.users.filter(u=>u.email!==req.body.email);saveDB();res.json({ok:true});});
app.post('/api/delete-demos',(req,res)=>{db.users=db.users.filter(u=>u.tipo!=='Demo');saveDB();res.json({ok:true});});
app.get('/logout',(req,res)=>{req.session.destroy(()=>res.redirect('/'));});
app.listen(process.env.PORT||3000,()=>console.log('ON'));
