const express=require('express');
const session=require('express-session');
const bodyParser=require('body-parser');
const fs=require('fs');
const path=require('path');
const app=express();
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({secret:'remix123',resave:false,saveUninitialized:true}));
let dbPath=path.join(__dirname,'db.json');
let db={users:[],credits:999};
if(fs.existsSync(dbPath)){try{db=JSON.parse(fs.readFileSync(dbPath));}catch(e){}}
function save(){fs.writeFileSync(dbPath,JSON.stringify(db,null,2));}
function fechaArgentina(d){return d.toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires',hour12:false,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}
function checkAuth(req,res,next){if(req.session.logged)next();else res.redirect('/login');}
app.get('/',(req,res)=>res.redirect('/dashboard'));
app.get('/login',(req,res)=>res.render('login',{error:null}));
app.post('/login',(req,res)=>{
if((req.body.username==='admin'&&req.body.password==='admin')||(req.body.username==='Remix22'&&req.body.password==='2212')){req.session.logged=true;req.session.username=req.body.username;return res.redirect('/dashboard');}
res.render('login',{error:'Usuario o clave incorrecta'});
});
app.get('/logout',(req,res)=>req.session.destroy(()=>res.redirect('/login')));
app.get('/dashboard',checkAuth,(req,res)=>{
let prem=db.users.filter(x=>x.tipo==='Premium').length;
let dem=db.users.filter(x=>x.tipo==='Demo').length;
res.render('dashboard',{db,username:req.session.username,total:db.users.length,premium:prem,demos:dem});
});
app.get('/agregar-usuario',checkAuth,(req,res)=>res.render('agregar-usuario',{db}));
function crear(req,res){
let {nombre,email,password,tipo}=req.body;
let f=new Date();
if(tipo==='Demo')f.setHours(f.getHours()+1);else f.setDate(f.getDate()+30);
let v=
