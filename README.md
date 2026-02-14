# Veileder

![Cover](https://imgur.com/a/9FRHhmr)
## ¿Qué es Veileder?

Veileder es un proyecto escolar que nació de una frustración real: **encontrar quién te ayude con una materia en la universidad es innecesariamente difíci**. 

Normalmente dependemos de grupos de WhatsApp o de un aviso pegado en un tablero en los edificios que nadie se detiene realmente a mirar. Quise diseñar una solución digital que hiciera este proceso simple, conectando a estudiantes que necesitan ayuda con compañeros o tutores que dominan el tema.

## El Enfoque de Diseño (UI/UX)

Como mi objetivo es el perfil de UI/UX, no solo construí la app, sino que me enfoqué en resolver fricciones específicas del usuario:

### 1. Onboarding Segmentado
Me di cuenta de que pedir todos los datos de golpe abruma al usuario.
* **Decisión:** Dividí el flujo de registro desde el inicio (`AccountType`).
* **Resultado:** Si eres estudiante, no te pregunto cosas de profesores. La interfaz se adapta a tu contexto desde el segundo uno.

### 2. Búsqueda sin Fricción
La función principal es encontrar ayuda.
* **Decisión:** Diseñé el Dashboard para que los filtros (por materia o nombre) actúen en tiempo real.
* **Visual:** Usé tarjetas con jerarquía clara: primero la materia, luego el tutor, y un "Call to Action" evidente para contactar.

### 3. Sistema de Diseño (Tailwind)
Quería una estética que transmitiera calma y profesionalismo. Usé una paleta de colores fríos (Slate/Blue) y mucha consistencia en los espaciados y radios de los botones para que la app se sienta sólida.

---

## Cómo funciona (Features)

Más allá del diseño, la app es funcional y cuenta con:

* **Roles de Usuario:** Estudiantes (buscan) y Profesores (ofertan, con opción de suscripción).
* **Grupos de Estudio:** Puedes crear o unirte a grupos con cupos limitados.
* **Stack:** Está construida con **React + TypeScript** para el frontend y **Supabase** para manejar toda la base de datos y la autenticación en tiempo real.

---

## Pruébalo en local

Si quieres ver el código o navegar la interfaz:

1. Clona el repo:
   ```bash
   git clone [https://github.com/tu-usuario/veileder.git](https://github.com/tu-usuario/veileder.git)
   ```
2.Instala las dependencias
  ```bash
    npm install
   ```
3. Crear un .env en la raiz con tus propias keys de Supabase
4. Correr el proyecto
  ```bash
    npm run dev
   ```
##Estado del Proyecto
Actualmente el login/register, buscar y crear grupos funcionan. Aun hace falta trabajar en mejorar el feedback visual de los estados de carga y en los mensajes entre usuarios.
