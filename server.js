package com.streamflixreborn.streamflix.activities.main

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.streamflixreborn.streamflix.R
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val prefs = getSharedPreferences("remix_panel", MODE_PRIVATE)

        if (prefs.getBoolean("logueado", false)) {
            startActivity(Intent(this, MainMobileActivity::class.java))
            finish()
            return
        }

        val etUser = findViewById<EditText>(R.id.et_user)
        val etPass = findViewById<EditText>(R.id.et_pass)
        val btn = findViewById<Button>(R.id.btn_login)

        btn.setOnClickListener {
            val email = etUser.text.toString().trim()
            val pass = etPass.text.toString().trim()

            if (email.isEmpty() || pass.isEmpty()) {
                Toast.makeText(this, "Completa email y contraseña", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btn.isEnabled = false
            btn.text = "Entrando..."

            CoroutineScope(Dispatchers.IO).launch {
                var ok = false
                var tipo = ""
                var venc = ""
                var msgError = "Usuario o clave incorrecta"

                try {
                    val conn = URL("https://remix-app-panel.onrender.com/api/check-login").openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.connectTimeout = 20000
                    conn.readTimeout = 20000
                    conn.doOutput = true

                    val body = JSONObject()
                    body.put("email", email)
                    body.put("password", pass)

                    conn.outputStream.use { it.write(body.toString().toByteArray()) }

                    val response = try {
                        conn.inputStream.bufferedReader().readText()
                    } catch (e: Exception) {
                        conn.errorStream?.bufferedReader()?.readText() ?: ""
                    }

                    val json = JSONObject(response)
                    ok = json.optBoolean("ok", false)
                    if (ok) {
                        tipo = json.optString("tipo", "")
                        venc = json.optString("vencimiento", "")
                    } else {
                        msgError = json.optString("msg", "Usuario o clave incorrecta")
                        // Si venció
                        if (json.optBoolean("expired", false)) {
                            msgError = json.optString("msg", "Tu acceso venció")
                        }
                    }
                } catch (e: Exception) {
                    msgError = "No se pudo conectar al panel. Render dormido, probá de nuevo en 20 seg."
                }

                withContext(Dispatchers.Main) {
                    if (ok) {
                        prefs.edit().putBoolean("logueado", true).putString("user_email", email).putString("user_tipo", tipo).putString("user_venc", venc).apply()
                        Toast.makeText(this@LoginActivity, "Bienvenido $tipo - vence $venc", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, MainMobileActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, msgError, Toast.LENGTH_LONG).show()
                        btn.isEnabled = true
                        btn.text = "Entrar"
                    }
                }
            }
        }
    }
                      }
