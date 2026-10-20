import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const RONDAS_HASH = 10;

// Convierte una contraseña en texto plano en su versión hasheada
export async function hashearContrasena(contrasena) {
  return bcrypt.hash(contrasena, RONDAS_HASH);
}

// Compara una contraseña en texto plano con el hash guardado en la BD
export async function verificarContrasena(contrasena, hash) {
    return bcrypt.compare (contrasena, hash);
    }

// Crea un JWT que identifica a un usuario, válido 7 días
export function crearToken(usuario) {
  return jwt.sign(
    { id: usuario._id.toString(), 
      email: usuario.email, 
      nombre: usuario.nombre,
      rol: usuario.rol ||'usuario', 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
// Devuelve el usuario si hay una sesión válida, o null si no la hay
export function usuarioOpcional(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return verificarToken(token);
  } catch {
    return null;
  }
}

// Comprueba que un token es válido y no ha sido manipulado; devuelve sus datos
export function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Middleware de Express: protege una ruta exigiendo una cookie de sesión válida
export function requiereAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'No has iniciado sesión' });
  }
  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión no válida o caducada' });
  }
}
// Middleware adicional: exige que el usuario autenticado tenga uno de los roles indicados
export function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esto' });
    }
    next();
  };
  
}
// Función para obtener iniciales dinámica
function obtenerIniciales(nombre) {
  if (!nombre) return "??";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0].substring(0, 2).toUpperCase();
}