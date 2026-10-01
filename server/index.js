import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { conectarDB } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

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
// subimos los tipos de impresion
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));