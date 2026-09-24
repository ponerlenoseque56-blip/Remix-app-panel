const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'remix2026',
  resave: false,
  saveUninitialized: true
}));

let db = {
  credits: 50,
  users: []
};

const USER = 'Remix22';
const PASS = '2212';

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  if (req.body.username === USER && req.body.password === PASS) {
    req.session.user = USER;
    return res.redirect('/dashboard');
  }
  res.send('Usuario o clave incorrecta <a href="/">Volver</a>');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  let ahora = Date.now();
  db.users = db.users.filter(u => {
    if (!u.expiraEn) return true;
    return u.expiraEn > ahora;
  });

  let total = db.users.length;
  let premium = db.users.filter(u => u.tipo === 'Premium').length;
  let demos = db.users.filter(u => u.tipo === 'Demo').length;

  res.render('dashboard', {
    username: req.session.user,
    db: db,
    total: total,
    premium: premium,
    demos: demos
  });
});

app.get('/agregar-usuario', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('agregar-usuario', { db: db });
});

app.post('/agregar-usuario', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  let nombre = req.body.nombre;
  let email = req.body.email;
  let password = req.body.password;
  let tipo = req.body.tipo;
  let dispositivos = req.body.dispositivos;

  if (db.users.find(u => u.email === email)) {
    return res.send('Email ya existe <a href="/agregar-usuario">Volver</a>');
  }

  if (db.credits <= 0) {
    return res.send('Sin creditos <a href="/dashboard">Volver</a>');
  }

  let fechaVencimiento;
  let tipoFinal = 'Premium';

  if (tipo && tipo.toLowerCase().includes('demo')) {
    tipoFinal = 'Demo';
    fechaVencimiento = new Date(Date.now() + 60 * 60 * 1000);
  } else {
    tipoFinal = 'Premium';
    fechaVencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  let vencimientoTexto = fechaVencimiento.toLocaleDateString('es-AR') + ' ' + fechaVencimiento.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});

  db.users.push({
    nombre: nombre,
    email: email,
    password: password,
    tipo: tipoFinal,
    dispositivos: dispositivos || '1',
    vencimiento: vencimientoTexto,
    expiraEn: fechaVencimiento.getTime()
  });

  db.credits -= 1;
  res.redirect('/dashboard');
});

app.post('/api/delete-user', (req, res) => {
  db.users = db.users.filter(u => u.email !== req.body.email);
  res.json({ ok: true });
});

app.post('/api/delete-demos', (req, res) => {
  db.users = db.users.filter(u => u.tipo !== 'Demo');
  res.json({ ok: true });
});

app.post('/api/add-credits', (req, res) => {
  let cant = parseInt(req.body.amount) || 0;
  db.credits += cant;
  res.json({ ok: true });
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server en ' + PORT));
