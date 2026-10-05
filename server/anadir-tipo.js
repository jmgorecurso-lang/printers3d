import { conectarDB, cerrarDB } from './db.js';

const db = await conectarDB();

// --- Impresoras: proceso -> tipo (slug) ---
const mapaProcesoImpresoras = {
  Filamento: 'filamento',
  Resina: 'resina',
  Otros: 'otros',
};

const coleccionImpresoras = db.collection('impresoras');
let totalImpresoras = 0;

for (const [proceso, slug] of Object.entries(mapaProcesoImpresoras)) {
    //busca los documentos donde el campo proceso sea igual a este valor.
  const resultado = await coleccionImpresoras.updateMany(
    { proceso },
    { $set: { tipo: slug } }
  );
  console.log(`Impresoras con proceso "${proceso}" -> tipo "${slug}": ${resultado.modifiedCount}`);
  totalImpresoras += resultado.modifiedCount;
}

// --- Materiales: categoria -> tipo (slug) ---
// Incluye "SLS" como alias de "otros", por si quedó algún material
// con esa categoría de cuando detectamos la inconsistencia.
const mapaCategoriaMateriales = {
  Filamento: 'filamento',
  Resina: 'resina',
  Otros: 'otros',
  SLS: 'otros',
};

const coleccionMateriales = db.collection('materiales');
let totalMateriales = 0;

for (const [categoria, slug] of Object.entries(mapaCategoriaMateriales)) {
  const resultado = await coleccionMateriales.updateMany(
    { categoria },
    { $set: { tipo: slug } }
  );
  console.log(`Materiales con categoria "${categoria}" -> tipo "${slug}": ${resultado.modifiedCount}`);
  totalMateriales += resultado.modifiedCount;
}

console.log(`\nTotal: ${totalImpresoras} impresoras y ${totalMateriales} materiales actualizados.`);
await cerrarDB();