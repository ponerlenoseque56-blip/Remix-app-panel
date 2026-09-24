const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Remix-app-panel', 'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({secret:'remix2026',resave:false,saveUninitialized:true}));

let db={credits:50,users:[]};
const USER='Remix22';
const PASS='2212';

app.get('/',(req,res)=>{res.render('login');});
app.post('/login',(req,res)=>{
 if(req.body.username===USER && req.body.password===PASS){
  req.session.user=USER;
  return res.redirect('/dashboard');
 }
 res.send('Clave mal <a href="/">Volver</a>');
});
app.get('/logout',(req,res)=>{req.session.destroy(()=>res.redirect('/'));});

app.get('/dashboard',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 let ahora=Date.now();
 db.users=db.users.filter(u=>!u.expiraEn || u.expiraEn>ahora);
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
 let tipo=req.body.tipo;
 let fecha;
 let tipoFinal='Premium';
 if(tipo && tipo.toLowerCase().includes('demo')){
  tipoFinal='Demo';
  fecha=new Date(Date.now()+60*60*1000);
 }else{
  fecha=new Date(Date.now()+30*24*60*60*1000);
 }
 let texto=fecha.toLocaleDateString('es-AR')+' '+fecha.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
 db.users.push({
  nombre:req.body.nombre,
  email:req.body.email,
  password:req.body.password,
  tipo:tipoFinal,
  dispositivos:req.body.dispositivos||'1',
  vencimiento:texto,
  expiraEn:fecha.getTime()
 });
 db.credits-=1;
 res.redirect('/dashboard');
});

app.post('/api/delete-user',(req,res)=>{
 db.users=db.users.filter(u=>u.email!==req.body.email);
 res.json({ok:true});
});
app.post('/api/delete-demos',(req,res)=>{
 db.users=db.users.filter(u=>u.tipo!=='Demo');
 res.json({ok:true});
});
app.post('/api/add-credits',(req,res)=>{
 db.credits+=parseInt(req.body.amount)||0;
 res.json({ok:true});
});

let PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('ON '+PORT));
