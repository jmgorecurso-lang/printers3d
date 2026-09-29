import { readFile } from 'node:fs/promises';
import { conectarDB, cerrarDB } from './db.js';

const ruta = new URL('../src/data/catalogoImpresoras.json', import.meta.url);
const impresoras = JSON.parse(await readFile(ruta, 'utf-8'));

const db = await conectarDB();
const coleccion = db.collection('impresoras');

await coleccion.deleteMany({});
const resultado = await coleccion.insertMany(impresoras);

console.log(`Migradas ${resultado.insertedCount} impresoras`);
await cerrarDB();