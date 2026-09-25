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
app.use(express.static('views'));

app.use(session({
  secret: 'remix123',
  resave: false,
  saveUninitialized: true
}));

let dbPath = path.join(__dirname, 'db.json');
let db = { users: [], credits: 999 };
if (fs.existsSync(dbPath)) {
  try { db = JSON.parse(fs.readFileSync(dbPath)); if(!db.users) db.users=[]; if(db.credits==null) db.credits=999; } catch(e){}
}
function save(){ fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }

function checkAuth(req,res,next){ if(req.session.logged){ next(); } else { res.redirect('/login'); } }

app.get('/', (req,res)=> res.redirect('/dashboard'));

app.get('/login', (req,res)=> res.render('login'));
app.post('/login', (req,res)=>{
  const { username, password } = req.body;
  if(username==='admin' && password==='admin'){ req.session.logged=true; req.session.username=username; res.redirect('/dashboard'); }
  else { res.send('Usuario o clave incorrecta <a href="/login">Volver</a>'); }
});

app.get('/logout', (req,res)=>{ req.session.destroy(()=>res.redirect('/login')); });

app.get('/dashboard', checkAuth, (req,res)=>{
  let premium = db.users.filter(u=>u.tipo==='Premium').length;
  let demos = db.users.filter(u=>u.tipo==='Demo').length;
  res.render('dashboard', {
    db: db,
    username: req.session.username || 'admin',
    total: db.users.length,
    premium: premium,
    demos: demos
  });
});

app.get('/agregar-usuario', checkAuth, (req,res)=> res.render('agregar-usuario', { db: db }));

app.post('/crear-usuario', checkAuth, (req,res)=>{
  let { nombre, email, password, tipo, dispositivos } = req.body;
  let dias = tipo==='Demo' ? 1 : 30;
  let horas = tipo==='Demo' ? 1 : 0;
  let fecha = new Date();
  if(tipo==='Demo') fecha.setHours(fecha.getHours()+1);
  else fecha.setDate(fecha.getDate()+30);
  let vencimiento = fecha.toLocaleString('es-AR');
  
  let nuevo = { nombre, email, password, tipo, dispositivos: dispositivos||1, vencimiento, vencimiento_ms: fecha.getTime() };
  db.users.push(nuevo);
  if(tipo!=='Demo') db.credits = Math.max(0, db.credits-1);
  save();

  let textoCopiar = `*${tipo==='Demo'?'DEMO CREADA':'CLIENTE GENERADO'}* ✅\n\n📧 Email: ${email}\n🔑 Clave: ${password}\n👤 Usuario: ${nombre}\n⏰ Vence: ${vencimiento}\n📱 Tipo: ${tipo}`;
  res.render('usuario-creado', { nuevo, textoCopiar, esDemo: tipo==='Demo' });
});

app.post('/api/delete-user', checkAuth, (req,res)=>{
  db.users = db.users.filter(u=>u.email!==req.body.email);
  save(); res.json({ok:true});
});

app.post('/api/delete-demos', checkAuth, (req,res)=>{
  db.users = db.users.filter(u=>u.tipo!=='Demo');
  save(); res.json({ok:true});
});

app.post('/api/add-credits', checkAuth, (req,res)=>{
  db.credits += parseInt(req.body.amount)||0;
  save(); res.json({ok:true});
});

app.post('/api/renew-user', checkAuth, (req,res)=>{
  let u = db.users.find(x=>x.email===req.body.email);
  if(u){
    let fecha = new Date();
    fecha.setDate(fecha.getDate()+30);
    u.vencimiento = fecha.toLocaleString('es-AR');
    u.vencimiento_ms = fecha.getTime();
    u.tipo = 'Premium';
    db.credits = Math.max(0, db.credits-1);
    save();
    res.json({ok:true, vencimiento: u.vencimiento});
  } else res.json({ok:false});
});

app.post('/api/edit-user', checkAuth, (req,res)=>{
  let u = db.users.find(x=>x.email===req.body.email);
  if(u){ u.password=req.body.password; save(); res.json({ok:true}); }
  else res.json({ok:false});
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('Remix corriendo en '+PORT));
