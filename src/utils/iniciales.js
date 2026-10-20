// Obtiene las iniciales del nombre (ej: "Antonio Lobato" -> "AL", "Laura" -> "LA")
export const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');