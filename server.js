const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
// BUSCA EN LAS 2 RUTAS, ASI NO FALLA MAS POR MAYUSCULAS
app.set('views', [
  path.join(__dirname, 'Remix-app-panel', 'views'),
  path.join(__dirname, 'remix-app-panel', 'views'),
  path.join(__dirname, 'views'),
  path.join(__dirname, 'Remix-app-panel'),
  path.join(__dirname, 'src', 'views')
]);

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:'remix2026',resave:false,saveUninitialized:true}));

let db={credits:50,users:[]};
const USER='Remix22';
const PASS='2212';

app.get('/', (req,res)=>{
 res.send(`
 <body style="background:#000;color:#fff;font-family:Arial;padding:30px;text-align:center">
 <h1 style="color:red">REMIX APP</h1>
 <form method="POST" action="/login" style="background:#151515;padding:20px;border-radius:10px;margin-top:20px">
 <input name="username" placeholder="Usuario" style="width:90%;padding:12px;margin:10px;background:#111;color:#fff;border:1px solid #333"><br>
 <input name="password" type="password" placeholder="Clave" style="width:90%;padding:12px;margin:10px;background:#111;color:#fff;border:1px solid #333"><br>
 <button style="width:90%;padding:12px;background:red;color:#fff;border:none;border-radius:20px;font-weight:bold">ENTRAR</button>
 </form></body>`);
});

app.post('/login',(req,res)=>{
 if(req.body.username===USER && req.body.password===PASS){
  req.session.user=USER;
  return res.redirect('/dashboard');
 }
 res.send('Mal <a href="/">Volver</a>');
});

app.get('/dashboard',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 db.users=db.users.filter(u=>!u.expiraEn || u.expiraEn>Date.now());
 let lista = db.users.map(u=>`<div style="background:#111;padding:10px;margin:5px;border-radius:5px;display:flex;justify-content:space-between"><div><b>${u.nombre}</b><br><small>${u.email} - ${u.tipo} - Vence: ${u.vencimiento}</small></div><form method="POST" action="/delete"><input type="hidden" name="email" value="${u.email}"><button style="background:red;color:#fff;border:none;padding:5px 10px;border-radius:5px">X</button></form></div>`).join('');
 res.send(`
 <body style="background:#000;color:#fff;font-family:Arial">
 <div style="background:#0a0a0a;padding:12px;display:flex;justify-content:space-between;border-bottom:2px solid red"><b style="color:red">REMIX APP</b><div>Creditos: ${db.credits} | <a href="/logout" style="color:#fff">Salir</a></div></div>
 <div style="padding:15px">
 <h3>Total: ${db.users.length} | Premium: ${db.users.filter(u=>u.tipo==='Premium').length} | Demo: ${db.users.filter(u=>u.tipo==='Demo').length}</h3>
 <a href="/agregar-usuario" style="display:block;background:red;color:#fff;padding:12px;text-align:center;border-radius:20px;text-decoration:none;margin:15px 0">+ AGREGAR CLIENTE</a>
 ${lista || '<p style="color:#888;text-align:center;margin-top:20px">Sin clientes</p>'}
 </div></body>`);
});

app.get('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 res.send(`
 <body style="background:#000;color:#fff;font-family:Arial">
 <div style="background:#0a0a0a;padding:12px;border-bottom:2px solid red"><b style="color:red">REMIX APP</b></div>
 <div style="background:#151515;margin:15px;padding:18px;border-radius:12px">
 <h2 style="color:red;text-align:center">+ Agregar Cliente</h2>
 <form method="POST" action="/agregar-usuario">
 <input type="text" name="nombre" placeholder="Nombre" required style="width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;color:#fff;border-radius:8px">
 <input type="email" name="email" placeholder="Email" required style="width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;color:#fff;border-radius:8px">
 <input type="text" name="password" placeholder="Contraseña" value="1234" required style="width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;color:#fff;border-radius:8px">
 <select name="tipo" style="width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;color:#fff;border-radius:8px">
 <option value="Premium">PREMIUM - 30 días</option><option value="Demo">DEMO - 1 hora</option>
 </select>
 <select name="dispositivos" style="width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;color:#fff;border-radius:8px">
 <option value="1">1 Dispositivo</option><option value="2">2</option><option value="3">3</option>
 </select>
 <button type="submit" style="width:100%;padding:12px;background:red;color:#fff;border:none;border-radius:25px;font-weight:bold;margin-top:12px">Crear Cliente</button>
 <a href="/dashboard" style="display:block;background:#222;color:#fff;padding:12px;text-align:center;border-radius:25px;text-decoration:none;margin-top:10px">Volver</a>
 </form></div></body>`);
});

app.post('/agregar-usuario',(req,res)=>{
 let tipo=req.body.tipo;
 let fecha, tipoFinal='Premium';
 if(tipo && tipo.toLowerCase().includes('demo')){ tipoFinal='Demo'; fecha=new Date(Date.now()+60*60*1000); }
 else{ fecha=new Date(Date.now()+30*24*60*60*1000); }
 let texto=fecha.toLocaleDateString('es-AR')+' '+fecha.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
 db.users.push({nombre:req.body.nombre,email:req.body.email,password:req.body.password,tipo:tipoFinal,dispositivos:req.body.dispositivos||'1',vencimiento:texto,expiraEn:fecha.getTime()});
 db.credits-=1;
 res.redirect('/dashboard');
});

app.post('/delete',(req,res)=>{
 db.users=db.users.filter(u=>u.email!==req.body.email);
 res.redirect('/dashboard');
});

app.get('/logout',(req,res)=>{req.session.destroy(()=>res.redirect('/'));});

app.listen(process.env.PORT||3000,()=>console.log('ON'));;
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
