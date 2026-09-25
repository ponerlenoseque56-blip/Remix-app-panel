<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>REMIX APP</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:Arial}
.header{background:#0a0a0a;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ff0000}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;padding:12px}
.stat{background:#1a1a1a;border-radius:12px;padding:14px;text-align:center;border:1px solid #222}
.stat.red{background:#e10600;border:none}
.stat h2{font-size:26px;margin-bottom:2px}
.stat small{font-size:11px;line-height:12px;display:block}
.box{background:#151515;border:1px solid #ff0000;border-radius:8px;margin:12px;padding:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
.btns{padding:0 12px;display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.b{padding:9px 16px;border-radius:20px;border:none;font-weight:bold;font-size:13px;cursor:pointer;text-decoration:none;display:inline-block}
.b-red{background:#ff0000;color:white}
.b-dark{background:#2a2a2a;color:white}
.search{width:calc(100% - 24px);margin:0 12px 12px 12px;padding:11px;background:#111;border:1px solid #333;border-radius:8px;color:white}
table{width:100%;border-collapse:collapse}
th{background:#e10600;padding:10px;font-size:11px}
td{padding:10px;border-bottom:1px solid #1a1a1a;font-size:12px;text-align:center}
.btn-mini{border:none;padding:6px 9px;border-radius:5px;color:white;font-weight:bold;font-size:11px;margin:1px;cursor:pointer}
</style>
</head>
<body>

<div class="header">
<div style="display:flex;align-items:center;gap:10px">
<img src="logo.png" onerror="this.style.display='none'" style="width:38px;height:38px;border-radius:8px;object-fit:cover">
<b style="color:#ff0000">▶ REMIX APP</b>
</div>
<div style="font-size:13px"><%= username %> · Créditos: <%= db.credits %> <a href="/logout" style="background:#222;color:white;padding:6px 12px;border-radius:15px;text-decoration:none;margin-left:8px">Salir</a></div>
</div>

<div class="stats">
<div class="stat red"><h2><%= total %></h2><small>TOTAL<br>CLIENTES</small></div>
<div class="stat red"><h2><%= premium %></h2><small>PREMIUM<br>ACTIVOS</small></div>
<div class="stat"><h2><%= demos %></h2><small>DEMOS<br>ACTIVOS</small></div>
<div class="stat"><h2>0</h2><small>VENCIDOS</small></div>
</div>

<div class="box">
<span>🔑 Créditos: <b style="color:#ff0000"><%= db.credits %></b></span>
<span><input id="c" type="number" value="5" style="width:60px;background:#000;color:#fff;border:1px solid #ff0000;padding:5px;border-radius:5px;text-align:center"> <button class="b b-red" onclick="addC()">Agregar</button></span>
</div>

<div class="btns">
<a href="/agregar-usuario" class="b b-red">+ Agregar Cliente</a>
<button class="b b-dark" onclick="delDemos()">🗑 Borrar Demos</button>
<button class="b b-dark" onclick="location.reload()">🔄 Actualizar</button>
</div>

<input id="buscador" class="search" placeholder="🔍 Buscar por nombre o email..." onkeyup="f()">

<table id="t">
<tr><th>CLIENTE</th><th>TIPO</th><th>DISP</th><th>VENCE</th><th>ACCIÓN</th></tr>
<% (db.users || []).forEach(u=>{ %>
<tr>
<td style="text-align:left;padding-left:12px"><%= u.nombre %><br><small style="color:#777"><%= u.email %></small><br><small style="color:#555"><%= u.password %></small></td>
<td style="color:<%= u.tipo=='Premium' ? '#ff0000' : '#888' %>;font-weight:bold"><%= u.tipo %></td>
<td><%= u.dispositivos || 1 %></td>
<td style="font-size:11px"><%= u.vencimiento %></td>
<td>
<button onclick="renovar('<%= u.email %>')" class="btn-mini
