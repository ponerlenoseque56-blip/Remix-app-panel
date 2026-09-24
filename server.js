const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(session({secret:'remix-app-red-2026', resave:false, saveUninitialized:true}));

// BASE DE DATOS
let db = { credits:8, users:[] };
const DB_PATH = path.join(__dirname,'db.json');
if(fs.existsSync(DB_PATH)){ try{ db = JSON.parse(fs.readFileSync(DB_PATH)); }catch(e){} }
function save(){ fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2)); }

// ADMIN - SOLO VOS
const ADMIN_USER = 'Remix22';
const ADMIN_PASS = '2212';

app.get('/',(req,res)=> res.redirect('/login'));

app.get('/login',(req,res)=> res.render('login',{error:null}));

app.post('/login',(req,res)=>{
  const {user,pass}=req.body;
  if(user===ADMIN_USER && pass===ADMIN_PASS){
    req.session.admin=true; req.session.username=user;
    return res.redirect('/dashboard');
  }
  res.render('login',{error:'Usuario o contraseña incorrecto'});
});

app.get('/dashboard',(req,res)=>{
  if(!req.session.admin) return res.redirect('/login');
  const total=db.users.length;
  const premium=db.users.filter(u=>u.tipo==='Premium').length;
  const demos=db.users.filter(u=>u.tipo==='Demo').length;
  const vencidos=db.users.filter(u=> new Date(u.vencimiento)<new Date()).length;
  res.render('dashboard',{db,total,premium,demos,vencidos,username:req.session.username});
});

app.get('/agregar-usuario',(req,res)=>{
  if(!req.session.admin) return res.redirect('/login');
  res.render('agregar',{username:req.session.username, credits:db.credits});
});

// CREAR USUARIO - VALIDA EMAIL UNICO
app.post('/api/create-user',(req,res)=>{
  if(!req.session.admin) return res.status(401).json({ok:false});
  if(db.credits<=0) return res.json({ok:false,msg:'Sin créditos disponibles - recarga créditos'});
  const {nombre,email,pass,tipo,dispositivos}=req.body;
  if(!nombre||!email||!pass) return res.json({ok:false,msg:'Completa todos los campos'});
  if(db.users.find(u=>u.email.toLowerCase()===email.toLowerCase())){
    return res.json({ok:false,msg:'Ese email ya existe - debe ser único'});
  }
  const venc=new Date();
  if(tipo==='Demo'){ venc.setDate(venc.getDate()+3); }
  else { venc.setMonth(venc.getMonth()+1); db.credits--; }
  const vencStr = venc.toISOString().slice(0,19).replace('T',' ');
  db.users.push({
    nombre,email:email.toLowerCase(),usuario:email.split('@')[0],
    pass,tipo,dispositivos:parseInt(dispositivos),
    vencimiento:vencStr,creado:new Date().toISOString().slice(0,10)
  });
  save();
  res.json({ok:true});
});

// CREDITOS - SOLO VOS
app.post('/api/add-credits',(req,res)=>{
  if(!req.session.admin) return res.status(401).json({ok:false,msg:'Solo admin'});
  const amount=parseInt(req.body.amount)||0;
  db.credits+=amount; save();
  res.json({ok:true,credits:db.credits});
});

app.post('/api/delete-user',(req,res)=>{
  if(!req.session.admin) return res.status(401).json({ok:false});
  db.users=db.users.filter(u=>u.email!==req.body.email); save();
  res.json({ok:true});
});

app.post('/api/delete-demos',(req,res)=>{
  if(!req.session.admin) return res.status(401).json({ok:false});
  db.users=db.users.filter(u=>u.tipo!=='Demo'); save();
  res.json({ok:true});
});

// NUBE - PARA TU APP DE CONTENIDO
app.post('/api/auth',(req,res)=>{
  const {usuario,pass,email}=req.body; const key=(usuario||email||'').toLowerCase();
  const u=db.users.find(x=>(x.usuario.toLowerCase()===key||x.email.toLowerCase()===key)&&x.pass===pass);
  if(!u) return res.json({ok:false,msg:'Usuario no encontrado'});
  if(new Date(u.vencimiento)<new Date()) return res.json({ok:false,msg:'Vencido'});
  res.json({ok:true,user:u});
});

app.get('/logout',(req,res)=>{ req.session.destroy(()=>res.redirect('/login')); });
app.listen(PORT,()=>console.log('REMIX APP PANEL ROJO en '+PORT));
