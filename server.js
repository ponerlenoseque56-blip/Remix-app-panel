const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Remix-app-panel', 'views'));

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
 
