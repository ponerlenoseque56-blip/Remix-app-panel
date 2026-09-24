const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:'remix2026',resave:false,saveUninitialized:true}));

let db={credits:50,users:[]};

app.get('/',(req,res)=>res.render('login'));
app.post('/login',(req,res)=>{
 if(req.body.username==='Remix22' && req.body.password==='2212'){
  req.session.user='Remix22';
  return res.redirect('/dashboard');
 }
 res.send('Mal');
});

app.get('/dashboard',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 res.render('dashboard',{username:'Remix22',db:db,total:db.users.length,premium:db.users.filter(u=>u.tipo==='Premium').length,demos:db.users.filter(u=>u.tipo==='Demo').length});
});

app.get('/agregar-usuario',(req,res)=>{
 if(!req.session.user) return res.redirect('/');
 res.render('agregar-usuario',{db:db});
});

app.post('/agregar-usuario',(req,res)=>{
 let venc = new Date(Date.now()+30*24*60*60*1000);
 db.users.push({nombre:req.body.nombre,email:req.body.email,password:req.body.password,tipo:'Premium',dispositivos:req.body.dispositivos,vencimiento:venc.toLocaleDateString(),expiraEn:venc.getTime()});
 db.credits--;
 res.redirect('/dashboard');
});

app.listen(process.env.PORT||3000);
