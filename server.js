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

// BASE DE DATOS EN MEMORIA
let db = {
  credits: 49,
  users: []
};

const USER = 'Remix22';
const PASS = '2212';

// LOGIN
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

// DASHBOARD
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  // Limpiar vencidos automaticamente
  const ahora
