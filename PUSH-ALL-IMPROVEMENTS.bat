@echo off
echo === Pusheando Todas las Mejoras de UX ===
git add .
git commit -m "feat: Mejoras completas de UX - Spinners, Anuncios, Insignias CRUD y Landing Page Mobile First

LOADING SPINNERS:
- Spinner en boton asignar MB (AdminManageBills)
- Spinner en boton actualizar puntos por defecto
- Spinner en boton limpiar historial
- Spinner en boton solicitar canje (StudentExchangeBills)
- Spinner en boton enviar mensaje/anuncio

SISTEMA DE MENSAJES/ANUNCIOS:
- Nuevo componente StudentAnnouncements
- Anuncios visibles en sidebar del dashboard de estudiantes
- UI mejorada del panel de mensajes de admin
- Capacidad de eliminar anuncios (hover)
- Textarea para mensajes largos
- Ctrl+Enter para enviar rapido
- Formato de fecha amigable
- Contador de anuncios
- IDs unicos para cada anuncio

SISTEMA DE INSIGNIAS COMPLETO:
- Cambio de keys en ingles a español
- Eliminadas: Conciencia Ecologica y Experto en Tecnologia
- CRUD completo para insignias manuales personalizadas
- Crear nuevas insignias (key + label)
- Editar insignias personalizadas existentes
- Eliminar insignias personalizadas con confirmacion
- Separacion clara entre insignias manuales y automaticas
- Cada insignia manual tiene su propia lista de estudiantes
- Seleccionar estudiante y asignar instantaneamente
- Mostrar estudiantes que tienen cada insignia
- Contador de insignias totales
- Insignias predeterminadas vs personalizadas
- Botones de editar y eliminar con emojis
- Formulario con validacion
- Seccion de asignacion con boton desplegar/contraer
- Animacion suave de expansion/contraccion
- Icono de flecha que rota
- Por defecto contraida para ahorrar espacio
- Arreglar desbordamiento de texto
- Grid responsive de 2 columnas

LANDING PAGE MOBILE FIRST:
- Enlaces rapidos del footer con scroll suave animado
- Emojis en cada enlace (🏠 ⭐ ⚙️ 🎯)
- Hover/Active states mejorados para mobile
- Active state cambia a fondo rojo cuando se toca
- Scale animation en tap (active:scale-95)
- Botones principales mas grandes en mobile (py-4 vs py-3)
- Hero section con mejor spacing mobile
- Titulo responsive (text-3xl a text-6xl)
- Cards de caracteristicas con mejor touch feedback
- Cards de pasos con gradientes en numeros
- Enlaces con width full en mobile
- Emojis en botones CTA (🚀 🎓)
- Shadow mejorada en hover
- Gap reducido en mobile (gap-6 vs gap-8)
- Padding responsive en todas las secciones
- Text sizes responsive (text-sm md:text-base)
- Leading relaxed para mejor legibilidad mobile"
git push
echo === Todos los cambios aplicados exitosamente ===
pause

