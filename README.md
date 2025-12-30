# Site Velthar SCP

Wiki fan de SCP para el servidor de roleplay Velthar, desarrollado en Next.js y Firebase Firestore.

## 🚀 Descripción

Esta es una plataforma wiki dedicada al universo SCP, específicamente para el servidor de roleplay Velthar. Incluye gestión de usuarios, autenticación, paneles de administración y estudiante, con integración completa a Firebase.

---

## 📦 Requisitos previos

- **Node.js** v18 o superior (recomendado)
- **Cuenta de Firebase** con un proyecto y Firestore habilitado
- Variables de entorno configuradas (ver abajo)

---

## ⚙️ Configuración inicial

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/ElementWolf/Site-Velthar.git
   cd Site-Velthar
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env.local` en la raíz con el siguiente contenido:
   ```
   ADMIN_USERNAME=tu_admin_username
   JWT_SECRET=tu_clave_secreta_segura
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}  # Contenido completo del JSON de Firebase
   ```

---

## 🛠️ Scripts útiles

- **Iniciar en desarrollo:**
  ```sh
  npm run dev
  ```

- **Construir para producción:**
  ```sh
  npm run build
  ```

- **Desplegar en Vercel:**
  Importa el repo en Vercel y configura las variables de entorno.

---

## 📁 Estructura del proyecto

- `src/app/` - Páginas y APIs de Next.js
- `src/components/` - Componentes React
- `src/lib/` - Utilidades y lógica de negocio
- `src/contexts/` - Contextos de React

---

## 🤝 Contribuciones

¡Bienvenido! Abre issues o pull requests para mejoras.

---

## 📄 Licencia

Este proyecto es de código abierto. Consulta la licencia para más detalles.

---

## 📄 Documentación adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

---

## 👤 Autor y contacto

- Desarrollado por: [ElementWolf](https://github.com/ElementWolf)
- ¿Dudas o sugerencias? Abre un issue o contacta por GitHub.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!  
Haz un fork, crea una rama y envía tu pull request.
"<!-- Trigger deployment after Vercel restoration -->
<!-- Force deployment - Fix student deletion function ready -->" 
=======
# Site-Velthar
>>>>>>> 47a23088e4aeb08b05b2b1a2ca3b86e31e2a93bc
