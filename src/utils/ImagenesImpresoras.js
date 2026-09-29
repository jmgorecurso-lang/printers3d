const imagenesModulo = import.meta.glob('../assets/Imagenes/impresoras/*', {
  eager: true,
  import: 'default',
});

export const imagenesPorNombre = Object.fromEntries(
  Object.entries(imagenesModulo).map(([ruta, url]) => [
    ruta.split('/').pop(),
    url,
  ])
);