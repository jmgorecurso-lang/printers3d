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
    { id: usuario._id.toString(), email: usuario.email, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
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