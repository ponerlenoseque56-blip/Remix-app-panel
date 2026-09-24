const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'remix2024rojo123', resave: false, saveUninitialized: true }));

let db = { credits: 50, users: [] };

// USUARIO DEFINITIVO
const USERS = { Remix22: '2212' };

function checkAuth(req,res,next){ if(req.session.user) return next(); res.redirect('/login'); }

app.get('/', (req,res)=> res.redirect('/login'));
app.get('/login', (req,res)=> res.render('login', {error: null}));

app.post('/login', (req,res)=>{
  const {username, password} = req.body;
  console.log('Intento login:', username, password);
  if(USERS[username] && USERS[username] === password){
    req.session.user = username;
    return res.redirect('/dashboard');
  }
  return res.render('login', {error: 'Usuario o contraseña incorrecta'});
});

app.get('/dashboard', checkAuth, (req,res)=>{
  const total = db.users.length;
  const premium = db.users.filter(u=>u.tipo==='Premium').length;
  const demos = db.users.filter(u=>u.tipo==='Demo').length;
  res.render('dashboard', { username: req.session.user, db, total, premium, demos, vencidos: 0 });
});

app.get('/agregar-usuario', checkAuth, (req,res)=> res.render('agregar', {credits: db.credits}));
app.post('/api/create-user', checkAuth, (req,res)=>{
  const {nombre,email,pass,tipo,dispositivos}=req.body;
  if(db.users.find(u=>u.email===email)) return res.json({ok:false,msg:'Email ya existe'});
  if(tipo==='Premium' && db.credits<=0) return res.json({ok:false,msg:'Sin créditos'});
  const fecha=new Date(); fecha.setDate(fecha.getDate() + (tipo==='Premium'?30:3));
  if(tipo==='Premium') db.credits--;
  db.users.push({nombre,email,pass,tipo,dispositivos,vencimiento:fecha.toLocaleDateString()});
  res.json({ok:true});
});
app.post('/api/delete-user', checkAuth, (req,res)=>{ db.users=db.users.filter(u=>u.email!==req.body.email); res.json({ok:true}); });
app.post('/api/delete-demos', checkAuth, (req,res)=>{ db.users=db.users.filter(u=>u.tipo!=='Demo'); res.json({ok:true}); });
app.post('/api/add-credits', checkAuth, (req,res)=>{ db.credits+=parseInt(req.body.amount)||0; res.json({ok:true,credits:db.credits}); });
app.get('/logout', (req,res)=> req.session.destroy(()=>res.redirect('/login')));
app.listen(PORT, ()=> console.log('ON '+PORT));
