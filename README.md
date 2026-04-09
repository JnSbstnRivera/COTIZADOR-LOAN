# COTIZADOR LOAN - Windmar Home

Este es un cotizador integral de alta precisión para proyectos de Roofing, Solar y Baterías con múltiples opciones de financiamiento, diseñado para Windmar Home.

## 🚀 Despliegue en Vercel

Para desplegar este proyecto en Vercel, sigue estos pasos:

1. **Subir a GitHub**:
   - Crea un nuevo repositorio en tu cuenta de GitHub.
   - Sigue las instrucciones para subir este código (ej. `git init`, `git add .`, `git commit`, `git push`).

2. **Conectar con Vercel**:
   - Ve a [Vercel](https://vercel.com) e inicia sesión.
   - Haz clic en **"Add New"** > **"Project"**.
   - Importa tu repositorio de GitHub.
   - Vercel detectará automáticamente que es un proyecto de **Vite**.
   - Haz clic en **"Deploy"**.

## 🛠️ Desarrollo Local

Si deseas ejecutar el proyecto localmente:

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

- `src/`: Contiene el código fuente de React.
- `server.ts`: Servidor Express (opcional para persistencia local).
- `public/`: Archivos estáticos.
- `vite.config.ts`: Configuración de Vite.

## 📝 Notas sobre la Base de Datos
El proyecto incluye un servidor Express con SQLite para guardar cotizaciones localmente. Ten en cuenta que Vercel es una plataforma para sitios estáticos y funciones serverless, por lo que el archivo `quotes.db` no persistirá datos entre reinicios en Vercel. Si necesitas persistencia real en la nube, considera conectar una base de datos externa como Supabase o Firebase.
