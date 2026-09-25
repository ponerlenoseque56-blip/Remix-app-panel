const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  secret: 'remix123',
  resave: false,
  saveUninitialized: true
}));

let dbPath = path.join(__dirname, 'db.json');
let db = { users: [], credits: 999 };
if (fs.existsSync(dbPath)) {
  try { 
    db = JSON.parse(fs.readFileSync(dbPath)); 
    if(!db.users) db.users=[]; 
    if(db.credits==null) db.credits=999; 
  } catch(e){}
}
function save(){ fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }

function checkAuth(req,res,next){ 
  if(req.session.logged){ next(); } 
  else { res.redirect('/login'); } 
}

app.get('/', (req,res)=> res.redirect('/dashboard'));
app.get('/login', (req,res)=> res.render('login', {error: null}));

app.post('/login', (req,res)=>{
  const u = req.body.username;
  const p = req.body.password;
  if((u==='admin' && p==='admin') || (u==='Remix22' && p==='2212')){ 
    req.session.logged=true; 
    req.session.username=u; 
    res.redirect('/dashboard'); 
  } else { 
    res.render('login', {error: 'Usuario o clave incorrecta'}); 
  }
});

app.get('/logout', (req,res)=>{ 
  req.session.destroy(()=>res.redirect('/login')); 
});

app.get('/dashboard', checkAuth, (req,res)=>{
  let premium = db.users.filter(x=>x.tipo==='Premium').length;
  let demos = db.users.filter(x=>x.tipo==='Demo').length;
  res.render('dashboard', { db, username: req.session.username, total: db.users.length, premium, demos });
});

app.get('/agregar-usuario', checkAuth, (req,res)=> res.render('agregar-usuario', { db }));

function crearUsuario(req,res){
  let nombre = req.body.nombre;
  let email = req.body.email;
  let password = req.body.password;
  let tipo = req.body.tipo;
  let fecha = new Date();
  if(tipo==='Demo') fecha.setHours(fecha.getHours()+1);
  else fecha.setDate(fecha.getDate()+
