
import cubo from '../assets/Imagenes/cubo.svg';
import {
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaLinkedinIn,
 
} from 'react-icons/fa6';
export default function Footer({ setVistaActual }) {
    // Navega a la vista y sube al principio de la página

// Añadimos 'color:xxxxx' para dar colores a los iconos
const REDES = [
  { nombre: 'Instagram', url: 'https://www.instagram.com/', Icono: FaInstagram,color:'#f6a00a' },
  { nombre: 'YouTube', url: 'https://www.youtube.com/', Icono: FaYoutube, color:'#E4405F' },
   { nombre: 'LinkedIn', url: 'https://www.linkedin.com/', Icono: FaLinkedinIn,color:'#2487f1'},
  { nombre: 'GitHub', url: 'https://github.com/', Icono: FaGithub,color:'#67f37e'},
];
    const ir = (vista) => {
        setVistaActual(vista);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="site-footer">
            <div className="site-footer-contenido">
                <div className="site-footer-marca">
                    <div className="site-footer-logo">
                        <img src={cubo} alt="cubo" /><h2 className='logoPrint'>PRINT </h2> <h2 className='logoLab'> LAB</h2>
                    </div>
                    <p>
                        Plataforma de calibración y perfiles para impresión 3D: impresoras,
                        materiales y ajustes compartidos por la comunidad.
                    </p>
                </div>

                <div className="site-footer-columna" aria-label="Explorar">
                    <h5>Información</h5>
                    <ul>
                        <li>Contacto</li>
                        <li>Privacidad</li>
                        <li>Aviso Legal</li>
                        <li>Cookies</li>
                    </ul>
                </div>
{/* añadimos color para que se aplique el color dado mas arriba */}
                <nav className="site-footer-columna" aria-label="Redes sociales">
                    <h5>Redes sociales</h5>
                    {REDES.map(({ nombre, url, Icono, color }) => (
                        <a key={nombre} href={url} target="_blank" rel="noopener noreferrer">
                            <Icono aria-hidden="true" style={{ color }}/>
                            {nombre}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="site-footer-inferior">
                <span>© {new Date().getFullYear()} PrintLab. Todos los derechos reservados.</span>
            </div>
        </footer>
    );
}