let esDemo = req.body.tipo === 'Demo' || req.body.tipo === 'demo';
let fecha;
if(esDemo){
  fecha = new Date(Date.now() + 60 * 60 * 1000); // 1 HORA
} else {
  fecha = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 DIAS
}
