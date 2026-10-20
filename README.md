# PrintLab

Web para consultar configuraciones de impresión 3D: catálogo de impresoras, guía de materiales, calculadora de costes y (en construcción) un apartado de configuraciones propuestas por los usuarios, con comentarios y votos.

Este documento está pensado para los 3 colaboradores del repositorio, partiendo de que **nadie del equipo ha usado React antes**. Léelo antes de tocar código, sobre todo las secciones de "Cómo arrancar el proyecto" y "Cosas que no hay que tocar sin avisar".

---

## Qué tecnologías usa esto

- **Frontend**: React + Vite. Todo el sitio vive en `src/`.
- **Backend**: Node + Express, en la carpeta `server/`. Es una API aparte, independiente de React.
- **Base de datos**: MongoDB Atlas (en la nube, no hay nada que instalar en local).
- **Estilos**: un único archivo, `src/styles/global.css`. No hay CSS por componente.

El frontend y el backend son **dos programas distintos que corren a la vez**, cada uno en su propio puerto. React nunca habla directamente con MongoDB — siempre pasa por la API.

```
React (navegador, puerto 5173)  →  API Express (server/, puerto 3001)  →  MongoDB Atlas
```

---

## Cómo arrancar el proyecto (primera vez)

### 1. Instalar dependencias

Hay que instalarlas **dos veces**, porque son dos proyectos de Node independientes:

```bash
# En la raíz del proyecto (el frontend)
npm install

# Dentro de server/ (el backend)
cd server
npm install
cd ..
```

### 2. Pedir el archivo `.env`

Dentro de `server/` hace falta un archivo `.env` con las credenciales de la base de datos. **Este archivo no está en git** (está en `.gitignore` a propósito, porque lleva contraseñas), así que pídeselo a quien ya lo tenga configurado. Tiene esta forma:

```
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=una_cadena_larga_y_secreta
```

Sin este archivo, el backend arranca pero no consigue conectar con la base de datos.

### 3. Arrancar los dos servidores

Hacen falta **dos terminales abiertas a la vez**:

```bash
# Terminal 1 — backend
cd server
npm run dev
```

```bash
# Terminal 2 — frontend
npm run dev
```

Confirma que ambos arrancaron bien:
- Backend: abre `http://localhost:3001/api/salud` en el navegador. Debe decir `{"ok":true,"mensaje":"Conectado a MongoDB Atlas"}`.
- Frontend: abre `http://localhost:5173`. Debe verse la web.

Si abres solo el frontend sin el backend corriendo, la web carga pero las secciones que piden datos (Impresoras, Materiales, Tipo de Impresión) se quedan con un mensaje de "no se pudieron cargar".

---

## Cómo está organizado el código

```
src/
  App.jsx                → el "cerebro" de la navegación (ver más abajo)
  main.jsx                → punto de entrada, importa el CSS global
  components/              → cada pantalla o pieza de la web
  context/                 → estado compartido entre componentes (ver más abajo)
  data/                    → JSON locales (algunos ya migrados a Mongo, ver nota)
  assets/Imagenes/          → fotos e iconos
  styles/global.css        → TODOS los estilos del sitio

server/
  index.js                 → la API: aquí viven todas las rutas (/api/...)
  db.js                    → conexión a MongoDB
  auth.js                  → funciones de contraseñas, tokens y permisos
  migrar-*.js               → scripts para subir datos de un JSON a Mongo (se ejecutan a mano, una vez)
  .env                      → credenciales (no está en git)
```

### Cómo funciona la navegación (sin react-router)

Esta web **no usa ninguna librería de rutas**. En vez de eso, `App.jsx` guarda en una variable (`vista`) el nombre de la pantalla activa (`'inicio'`, `'impresoras'`, `'materiales'`...) y un `switch` decide qué componente mostrar:

```jsx
switch (vista) {
  case 'inicio': return <Home ... />
  case 'impresoras': return <Printers ... />
  // ...
}
```

Si añades una pantalla nueva, hay que: crear el componente, añadir su `case` en ese switch, e importar el componente arriba del archivo.

### Dónde vive cada dato

| Dato | Colección en Mongo | Ruta de la API | Quién puede escribir |
|---|---|---|---|
| Impresoras | `impresoras` | `/api/impresoras` | editado a mano en Atlas |
| Materiales | `materiales` | `/api/materiales` | editado a mano en Atlas |
| Tipos de impresión | `tipos` | `/api/tipos` | editado a mano en Atlas |
| Usuarios | `usuarios` | `/api/auth/...` | se crean solos al registrarse |
| Configuraciones (en construcción) | `configuraciones` | `/api/configuraciones` | usuarios logueados (CRUD) |

**Nota:** algunos JSON dentro de `src/data/` (como `Tipos.json`) son restos de antes de migrar a Mongo. Ya no los usa ningún componente, pero no se han borrado por si acaso. Si tienes dudas de si un dato viene de Mongo o de un JSON local, busca si el componente hace `fetch('/api/...')` (viene de Mongo) o `import algo from '../data/...json'` (es local, y probablemente desactualizado).

Si añades una impresora o un material nuevo **directamente en Atlas** (en vez de por código), usa siempre estos campos, sin saltarte ninguno:

```json
// Impresora
{ "modelo": "", "marca": "", "proceso": "Filamento", "tipo": "filamento", "subtipo": "", "imagen": "" }

// Material
{ "nombre": "", "categoria": "Filamento", "tipo": "filamento", "temperaturaImpresion": "", "resistenciaImpacto": "", "flexibilidad": "", "descripcion": "" }
```

`proceso`/`categoria` (con mayúscula) y `tipo` (en minúscula, el slug: `filamento`/`resina`/`otros`) van siempre emparejados. Si se te olvida uno de los dos, algo deja de filtrar bien en la web.

### Context: cómo se comparte información entre componentes

Para un par de cosas (el modal de impresora, y la sesión del usuario) usamos **React Context**, que es la forma de React de compartir un dato entre componentes que no son padre-hijo directos, sin tener que pasarlo por props a través de todos los de en medio.

- `context/ModalImpresoraContext.jsx` — guarda qué impresora está seleccionada para el modal.
- `context/AuthContext.jsx` — guarda quién está logueado, y las funciones `login`/`registro`/`logout`.

Cualquier componente puede leerlos con `useAuth()` o `useModalImpresora()`, sin que haga falta pasarle nada desde fuera.

### Autenticación, en resumen

- Las contraseñas se guardan cifradas (`bcrypt`), nunca en texto plano.
- Al iniciar sesión, el servidor manda una cookie (`httpOnly`, no se puede leer desde JavaScript) con un token. Esa cookie es la que demuestra quién eres en peticiones futuras.
- Cada usuario tiene un `rol` (`'usuario'` o `'admin'`). Por ahora, convertir a alguien en admin se hace a mano en Atlas, editando su documento en `usuarios`.
- Las rutas que crean/editan/borran algo (en `server/index.js`) usan `requiereAuth` para exigir sesión, y comprueban que quien pide la acción es el autor (o admin) antes de tocar nada.

---

## Cosas que no hay que tocar sin avisar al grupo

Ya nos ha pasado más de una vez que un archivo de configuración se queda "como por defecto" después de algún `git pull`/`push` entre nosotros. Si tocas alguno de estos archivos por otro motivo, **no borres estos bloques**:

**`vite.config.js`** — necesita este bloque para que React pueda hablar con la API sin problemas de CORS:
```js
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
},
```

**`eslint.config.js`** — necesita este bloque al final, para que el código del backend (que usa `process`, propio de Node) no marque error:
```js
{
  files: ['server/**/*.js'],
  languageOptions: {
    globals: globals.node,
  },
},
```

Si en algún momento ves el error `Cannot GET /api/...` sirviendo HTML en vez de datos, o `'process' is not defined`, revisa primero si uno de estos dos bloques ha desaparecido.

---

## Flujo de Git entre los 3

- Haz `git pull` **antes** de empezar a trabajar cada sesión, no solo al terminar.
- Si `git pull` dice que las ramas han divergido, usa merge (no rebase, para evitar líos entre nosotros):
  ```bash
  git config pull.rebase false
  git pull
  ```
- Si aparecen marcas `<<<<<<<` / `=======` / `>>>>>>>` dentro de un archivo, es un conflicto real: parad y decidid juntos qué versión se queda antes de hacer commit.
- El `.env` de `server/` nunca se sube a git. Si alguien necesita las credenciales, se comparten por otro medio (no por GitHub).

---

## Para quien no haya usado React nunca

Algunas ideas que se repiten mucho en este proyecto y conviene entender antes de tocar código:

- **Un componente es una función de JavaScript** que devuelve algo parecido a HTML (en realidad se llama JSX). Ej.: `function Navbar() { return <nav>...</nav> }`.
- **`useState`** es la "memoria" de un componente: `const [valor, setValor] = useState(inicial)`. Cuando llamas a `setValor(...)`, React vuelve a dibujar ese componente con el valor nuevo.
- **`useEffect`** sirve para hacer algo quecurre "por fuera" de React, lo más típico aquí: pedir datos a la API cuando el componente aparece en pantalla.
- **Props** son los datos que un componente padre le pasa a uno hijo, como argumentos de una función: `<Printers filtroInicial="resina" />`.
- Antes de tocar un componente que no conoces, mira si hace `fetch` a alguna `/api/...` (trae datos de Mongo) y qué props recibe (quién se lo pasa, y para qué los usa).

Si os atascáis con algo de React en concreto, mejor preguntar en el grupo antes que copiar código de otro sitio sin entenderlo — este proyecto se ha ido construyendo explicando cada pieza, y mantenerlo así ayuda a que los 3 podáis seguir tocándolo sin depender de uno solo.

---

## Pendiente / en construcción

- CRUD de "Configuraciones" (backend ya montado, falta la vista de React).
- Comentarios y votos sobre configuraciones.
- Conectar "Configuraciones" y "Post" del Navbar a sus vistas reales.
- Migrar `BuscadorImpresoras.jsx` para que use la API en vez del JSON local.
- Que la propia API filtre por `?tipo=` en vez de traer todo y filtrar en el navegador.
