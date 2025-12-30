# MerlynBills

Sistema de gestión de MerlynBills para estudiantes y administración, desarrollado en Next.js y totalmente migrado a Firebase Firestore.

## 🚀 Descripción

MerlynBills es una plataforma para la gestión de puntos, canjes, historial de transacciones y administración de estudiantes, diseñada para instituciones educativas.  
Permite a los administradores asignar puntos, gestionar canjes, ver estadísticas y auditar movimientos, mientras que los estudiantes pueden consultar su saldo, historial y realizar solicitudes de canje.

---

## 📦 Requisitos previos

- **Node.js** v18 o superior (recomendado)
- **Cuenta de Firebase** con un proyecto y Firestore habilitado
- Archivo de credenciales: `src/app/api/firebase-service-account.json`
- Variables de entorno en `.env.local` (ver abajo)

---

## ⚙️ Configuración inicial

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/ElementWolf/merlynbills.git
   cd merlynbills
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env.local` en la raíz con el siguiente contenido:
   ```
   ADMIN_USERNAME=admin
   JWT_SECRET=tu_clave_secreta_segura
   ```

4. **Agrega el archivo de credenciales de Firebase:**
   - Descarga el archivo JSON de tu proyecto Firebase (cuenta de servicio).
   - Colócalo en `src/app/api/firebase-service-account.json`.

---

## 🛠️ Scripts útiles

- **Iniciar en desarrollo:**
  ```sh
  npm run dev
  ```

- **Limpiar historial de transacciones:**
  ```sh
  node limpiarHistorial.js
  ```

- **Limpiar y normalizar usuarios:**
  ```sh
  node limpiarUsuarios.js
  ```

- **Restablecer toda la base de datos (solo admin, todo lo demás vacío):**
  ```sh
  node resetDatabase.js
  ```

---

## 📝 Notas importantes

- **Migración completa a Firebase:**  
  El sistema ya no usa Json Silo ni archivos locales, solo Firestore.
- **El admin nunca aparece como estudiante ni en el historial.**
- **Scripts de limpieza:**  
  Úsalos si necesitas reiniciar el sistema o eliminar datos corruptos.

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
