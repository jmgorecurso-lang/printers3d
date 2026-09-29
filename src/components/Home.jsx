import Hero from './Hero';
import imgFilamento from '../assets/Imagenes/filamento.png';
import imgResina from '../assets/Imagenes/resina.png';
import imgSls from '../assets/Imagenes/sls.png';
import tipos from '../data/Tipos.json';

const imagenes = {
  filamento: imgFilamento,
  resina: imgResina,
  otros: imgSls,
};

export default function Home({ alSeleccionarTipo }) {
  return (
    <div>
      <Hero alSeleccionarTipo={alSeleccionarTipo}  />

      <section className="tecnologias">
        <p className="tecnologias-eyebrow">Segmentación de maquinaria</p>

        <div className="tecnologias-encabezado">
          <div>
            <h2 className="tecnologias-titulo">
              Explora por Tecnología de Impresión
            </h2>
            <p className="tecnologias-subtitulo">
              Configuraciones afinadas para cinemáticas FDM, fotopolimerización
              UV en resina (SLA/DLP) y sinterizado láser selectivo (SLS).
            </p>
          </div>
          <button className="btn-texto tecnologias-ver-todo">Ver más →</button>
        </div>

        <div className="tecnologias-grid">
          {Object.keys(tipos).map((clave) => {
            const info = tipos[clave];
            return (
              <article
                key={clave}
                className="tecnologia-tarjeta"
                onClick={() => alSeleccionarTipo(clave)}
              >
                <div className="tecnologia-imagen">
                  <img src={imagenes[clave]} alt={info.nombre} />
                </div>
                <h3 className="tecnologia-nombre">{info.nombre}</h3>
                <p className="tecnologia-descripcion">{info.descripcionCorta}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}