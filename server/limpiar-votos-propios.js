// server/limpiar-votos-propios.js
import { conectarDB, cerrarDB } from './db.js';

const db = await conectarDB();
const configuraciones = await db
  .collection('configuraciones')
  .find({}, { projection: { autorId: 1 } })
  .toArray();

let borrados = 0;
for (const c of configuraciones) {
  // Votos cuyo autor es el mismo que el de la configuración
  const resultado = await db
    .collection('votos')
    .deleteMany({ configuracionId: c._id.toString(), usuarioId: c.autorId });
  borrados += resultado.deletedCount;
}

console.log(`Votos propios eliminados: ${borrados}`);
await cerrarDB();