import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { conectarDB } from './db.js';
import { hashearContrasena, verificarContrasena, crearToken, requiereAuth } from './auth.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/salud', async (req, res) => {
  try {
    const db = await conectarDB();
    await db.command({ ping: 1 });
    res.json({ ok: true, mensaje: 'Conectado a MongoDB Atlas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'No se pudo conectar' });
  }
});

app.get('/api/impresoras', async (req, res) => {
  try {
    const db = await conectarDB();
    const impresoras = await db
      .collection('impresoras')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.json(impresoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las impresoras' });
  }
});

app.get('/api/materiales', async (req, res) => {
  try {
    const db = await conectarDB();
    const materiales = await db
      .collection('materiales')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.json(materiales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los materiales' });
  }
});

app.get('/api/tipos', async (req, res) => {
  try {
    const db = await conectarDB();
    const tipos = await db.collection('tipos').find({}).toArray();
    res.json(tipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los tipos' });
  }
});

// ===== Autenticación =====

app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = await conectarDB();
    const usuarios = db.collection('usuarios');

    const existente = await usuarios.findOne({ email: email.toLowerCase() });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const contrasenaHash = await hashearContrasena(contrasena);
    const resultado = await usuarios.insertOne({
      nombre,
      email: email.toLowerCase(),
      contrasenaHash,
      creadoEn: new Date(),
    });

    const usuario = { _id: resultado.insertedId, nombre, email: email.toLowerCase() };
    const token = crearToken(usuario);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días, en milisegundos
    });

    res.status(201).json({ nombre: usuario.nombre, email: usuario.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo completar el registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const db = await conectarDB();
    const usuarios = db.collection('usuarios');
    const usuario = await usuarios.findOne({ email: email.toLowerCase() });

    // Mismo mensaje tanto si el email no existe como si la contraseña es incorrecta,
    // para no dar pistas a quien intente adivinar cuentas existentes
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const coincide = await verificarContrasena(contrasena, usuario.contrasenaHash);
    if (!coincide) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = crearToken(usuario);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ nombre: usuario.nombre, email: usuario.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Permite a React comprobar, al cargar la página, si ya hay una sesión activa
app.get('/api/auth/yo', requiereAuth, (req, res) => {
  res.json({ nombre: req.usuario.nombre, email: req.usuario.email });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));