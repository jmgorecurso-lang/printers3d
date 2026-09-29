import impresoras from '../data/catalogoImpresoras.json';
import tipos from '../data/Tipos.json';

export function buscarEnCatalogo(query) {
    const texto = query.trim().toLowerCase();
    if (!texto) return [];

    const resultadosImpresoras = impresoras
        .filter(
            (imp) =>
                imp.modelo.toLowerCase().includes(texto) ||
                imp.marca.toLowerCase().includes(texto) ||
                imp.subtipo.toLowerCase().includes(texto)
        )
        .map ((imp) =>({
            tipo: 'impresora',
            titulo: imp.modelo,
            detalle: `${imp.marca} · ${imp.proceso} · ${imp.subtipo}`
        }));
    
    const resultadosMateriales = [];
    Object.entries (tipos).forEach (([clave, info])=> {
        const materiales = Array.isArray(info.materiales)
        ? info.materiales
        : [info.materiales];
    materiales.forEach ((mat) => {
        if (mat.toLowerCase ().includes(texto)){
            resultadosMateriales.push ({
                tipo: 'material',
                titulo: mat,
                detalle: info.nombre,
                clave,
            });
        }
    });
    });
    return [...resultadosImpresoras, ...resultadosMateriales];
}