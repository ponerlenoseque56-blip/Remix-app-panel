<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Agregar Cliente - REMIX APP</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:Arial}
.header{background:#0a0a0a;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ff0000}
.box{background:#151515;border:1px solid #222;border-radius:12px;margin:15px;padding:18px}
input,select{width:100%;padding:12px;margin:8px 0;background:#111;border:1px solid #333;border-radius:8px;color:white;font-size:14px}
label{font-size:12px;color:#888;margin-top:8px;display:block}
.btn{width:100%;padding:12px;border-radius:25px;border:none;font-weight:bold;cursor:pointer;margin-top:12px;font-size:15px}
.btn-red{background:#ff0000;color:white}
.btn-dark{background:#222;color:white;text-decoration:none;display:block;text-align:center}
.info{background:#1a1a1a;border-left:3px solid #ff0000;padding:10px;margin-bottom:12px;border-radius:5px;font-size:12px;color:#ccc}
</style>
</head>
<body>

<div class="header">
<b style="color:#ff0000">▶ REMIX APP</b>
<div style="font-size:13px">Créditos: <%= db.credits %></div>
</div>

<div class="box">
<h2 style="color:#ff0000;text-align:center;margin-bottom:10px">+ Agregar Cliente</h2>

<div class="info">
<b style="color:#ff0000">DEMO:</b> Dura 1 HORA y se borra sola.<br>
<b style="color:#fff">PREMIUM:</b> Dura 30 días.
</div>

<form method="POST" action="/agregar-usuario">
<label>Nombre del cliente</label>
<input type="text" name="nombre" placeholder="Ej: Gonzalo" required>

<label>Email / Usuario</label>
<input type="email" name="email" placeholder="Ej: cliente@gmail.com" required>

<label>Contraseña</label>
<input type="text" name="password" placeholder="Ej: 1234" value="1234" required>

<label>Tipo de cuenta</label>
<select name="tipo" required>
<option value="Premium">PREMIUM - 30 días</option>
<option value="Demo">DEMO - 1 hora</option>
</select>

<label>Dispositivos</label>
<select name="dispositivos">
<option value="1">1 Dispositivo</option>
<option value="2">2 Dispositivos</option>
<option value="3">3 Dispositivos</option>
</select>

<button class="btn btn-red" type="submit">🔥 Crear Cliente</button>
<a href="/dashboard" class="btn btn-dark">Volver al Dashboard</a>
</form>
</div>

</body>
</html>
