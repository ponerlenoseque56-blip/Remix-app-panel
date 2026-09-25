const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// Config
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

// DB
let dbPath = path.join(__dirname, 'db.json');
let db = { users: [], credits: 999 };

if (fs.existsSync(dbPath)) {
  try { 
    db = JSON.parse(fs.readFileSync(dbPath)); 
  } catch(e){}
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Fecha Argentina 24hs
function fechaArgentina(date) {
  return date.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function checkAuth(req, res, next) {
  if (req.session.logged) next();
  else res.redirect('/login');
}

// Rutas
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', (req, res) => {
  let u = req.body.username;
  let p = req.body.password;
  if ((u === 'admin' && p === 'admin') || (u === 'Remix22' && p === '2212')) {
    req.session.logged = true;
    req.session.username = u;
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Usuario o clave incorrecta' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/dashboard', checkAuth, (req, res) => {
  let prem = db.users.filter(x => x.tipo === 'Premium').length;
  let dem = db.users.filter(x => x.tipo === 'Demo').length;
  res.render('dashboard', {
    db,
    username: req.session.username,
    total: db.users.length,
    premium: prem,
    demos: dem
  });
});

app.get('/agregar-usuario', checkAuth, (req, res) => {
  res.render('agregar-usuario', { db });
});

// Crear usuario
function crear(req, res) {
  let { nombre, email, password, tipo } = req.body;
  let f = new Date();
  
  if (tipo === 'Demo') {
    f.setHours(f.getHours() + 1);
  } else {
    f.setDate(f.getDate() + 30);
  }
  
  let v = fechaArgentina(f);
  
  db.users.push({
    nombre,
    email,
    password,
    tipo,
    vencimiento: v,
    vencimiento_ms: f.getTime()
  });
  
  if (tipo !== 'Demo') {
    db.credits = Math.max(0, db.credits - 1);
  }
  
  save();
  
  res.render('usuario-creado', {
    nuevo: { nombre, email, password, tipo, vencimiento: v },
    textoCopiar: tipo + ' Email:' + email + ' Clave:' + password,
    esDemo: tipo === 'Demo'
  });
}

app.post('/crear-usuario', checkAuth, crear);
app.post('/agregar-usuario', checkAuth, crear);

// API - Borrar usuario
app.post('/api/delete-user', checkAuth, (req, res) => {
  db.users = db.users.filter(x => x.email !== req.body.email);
  save();
  res.json({ ok: true });
});

// API - Borrar demos
app.post('/api/delete-demos', checkAuth, (req, res) => {
  db.users = db.users.filter(x => x.tipo !== 'Demo');
  save();
  res.json({ ok: true });
});

// API - Agregar creditos
app.post('/api/add-credits', checkAuth, (req, res) => {
  db.credits += parseInt(req.body.amount) || 0;
  save();
  res.json({ ok: true });
});

// API - RENOVAR 30 DIAS
app.post('/api/renew-user', checkAuth, (req, res) => {
  let u = db.users.find(x => x.email === req.body.email);
  if (u) {
    let base;
    if (u.vencimiento_ms && u.vencimiento_ms > Date.now()) {
      base = new Date(u.vencimiento_ms);
    } else {
      base = new Date();
    }
    base.setDate(base.getDate() + 30);
    u.vencimiento = fechaArgentina(base);
    u.vencimiento_ms = base.getTime();
    u.tipo = 'Premium';
    db.credits = Math.max(0, db.credits - 1);
    save();
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});
