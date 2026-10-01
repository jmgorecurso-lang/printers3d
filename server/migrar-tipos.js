import { readFile } from 'node:fs/promises';
import {conectarDB, cerrarDB} from './db.js';

const ruta = new URL('../src/data/Tipos.json', import.meta.url);
const tiposJson = JSON.parse(await readFile (ruta, 'utf-8'));

// Tipos.json es un objeto { "filamento": {...}, "resina": {...}, "otros": {...} }.
// Usamos cada clave como el _id del documento: así el identificador
// ("filamento") y el dato (sus propiedades) quedan en un único sitio,
// sin riesgo de que alguien escriba "Filamento" o "FDM" por error en otra colección.

const tipos = Object.entries (tiposJson).map (([slug, info])=> ({_id: slug, ...info,}));
const db = await conectarDB();
const coleccion = db.collection('tipos');
await coleccion.deleteMany({});
const resultado = await coleccion.insertMany(tipos);

console.log (`Migrados ${resultado.insertedCount} tipos`);
await cerrarDB();
