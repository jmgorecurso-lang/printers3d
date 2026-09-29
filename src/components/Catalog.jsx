//import { useState } from 'react';

import printers from '../data/printers.json';
import datos from '../data/datosPrinters.json';
// 1. Importamos el archivo de estilos modulares
import styles from '../styles/catalog.module.css';


export default function Catalog({ tipo, volver }) {
  // 1. Buscamos los datos comerciales/básicos en el catálogo
  const infoBasica = printers[tipo];

  // 2. Extraemos los datos técnicos usando el 'tipo' (filamento, resina, etc.) directamente como llave
  const infoTecnica = datos[tipo];

  // Seguridad por si no encuentra la información
  if (!infoBasica || !infoTecnica) {
    return <p className={styles.contenedor}>Cargando información o tipo no encontrado...</p>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <button onClick={volver} style={{ marginBottom: '1.5rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
        ← Volver al inicio
      </button>

      <h1>{infoBasica.titulo}</h1>
  {/* // Cargamos imagen o icono del json */}
      <img
        src={infoTecnica.icono}
        alt={`Icono de ${infoBasica.titulo}`}
        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
      />
      <p className={styles.subtitulo}>{infoTecnica.descripcionCorta}</p>
      


      {/* Ficha de Funcionamiento Técnico */}
      <div className={styles.fichaTecnica}>
        <h2>Ficha de Especificaciones Técnicas</h2>
        <p><strong className={styles.pregunta}>Funcionamiento: </strong>{infoTecnica.funcionamiento}</p>
        <p><strong className={styles.pregunta}>Usos principales:</strong> {infoTecnica.usos}</p>
        <p><strong className={styles.pregunta}>Temperatura de Cama:</strong> {infoTecnica.temperaturaCama}</p>
        <p><strong className={styles.pregunta}>Temperatura de Boquilla:</strong> {infoTecnica.temperaturaBoquilla}</p>

        <p><strong>Variantes de la tecnología:</strong> </p>
        <ul>
          {Array.isArray(infoTecnica.variantes) ? (
            infoTecnica.variantes.map((v, i) => <li key={i}>{v}</li>)
          ) : (
            <li>{infoTecnica.variantes}</li>
          )}
        </ul>
      </div>
      {/* Bloque de Impresoras y Materiales */}
      <div className={styles.bloqueColumnas}>
        <div className={styles.columna}>
          <h3>⚙️ Impresoras recomendadas</h3>
          <ul className={styles.listaItems}>
            {infoBasica.impresoras.map((imp, index) => <li key={index}>{imp}</li>)}
          </ul>
        </div>

        <div className={styles.columna}>
          <h3>🧪 Materiales comunes</h3>
          <ul className={styles.listaItems}>
            {infoBasica.materiales.map((mat, index) => <li key={index}>{mat}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
