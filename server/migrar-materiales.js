
import { readFile } from 'node:fs/promises';
import { conectarDB, cerrarDB } from './db.js';

const ruta = new URL('../src/data/materiales.json', import.meta.url);
const materialesJson = JSON.parse(await readFile(ruta, 'utf-8'));

// El JSON es un objeto { "PLA": {...}, "ABS": {...} }.
// Lo convertimos en un array de documentos, guardando el nombre como campo "nombre".
const materiales = Object.entries(materialesJson).map(([nombre, info]) => ({
  nombre,
  ...info,
}));

const db = await conectarDB();
const coleccion = db.collection('materiales');

await coleccion.deleteMany({});
const resultado = await coleccion.insertMany(materiales);

console.log(`Migrados ${resultado.insertedCount} materiales`);
await cerrarDB();