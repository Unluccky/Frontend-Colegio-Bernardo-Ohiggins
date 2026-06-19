# Frontend - Colegio Bernardo O'Higgins

Sistema de gestión escolar desarrollado con **React + Vite + TailwindCSS**, que consume una arquitectura de microservicios a través de un API Gateway.

## Repositorios del proyecto

| Repositorio | Descripción |
|---|---|
| [Backend-Colegio-Bernardo-Ohiggins](https://github.com/Unluccky/Backend-Colegio-Bernardo-Ohiggins.git) | API Gateway + microservicios (Spring Boot) |
| [Documentacion-Colegio-Bernardo-Ohiggins](https://github.com/Unluccky/Documentacion-Colegio-Bernardo-Ohiggins.git) | Informe, diagramas y documentación del proyecto |

---

## Tecnologías utilizadas

| Tecnología | Versión | Descripción |
|---|---|---|
| React | 18.3.1 | Framework principal de UI |
| Vite | 5.3.1 | Bundler y servidor de desarrollo |
| TailwindCSS | 3.4.4 | Estilos utilitarios |
| React Router DOM | 6.23.1 | Enrutamiento SPA |
| Axios | 1.7.2 | Cliente HTTP para consumo de APIs |
| Recharts | 2.12.7 | Gráficos y visualizaciones |
| Lucide React | 0.378.0 | Iconografía |
| jsPDF + html2canvas | — | Generación de reportes PDF |
| Docker + Nginx | — | Contenedorización y despliegue |

---

## Requisitos previos

- **Node.js** v20 o superior
- **npm** v9 o superior
- **Docker** (opcional, para despliegue con contenedor)
- El **API Gateway** corriendo en `http://localhost:9090`

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Unluccky/Frontend-Colegio-Bernardo-Ohiggins.git
cd Frontend-Colegio-Bernardo-Ohiggins
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

### 4. Compilar para producción

```bash
npm run build
```

### 5. Previsualizar build de producción

```bash
npm run preview
```

---

## Ejecución con Docker

### Construir la imagen

```bash
docker build -t frontend-colegio .
```

### Ejecutar el contenedor

```bash
docker run -p 80:80 frontend-colegio
```

La aplicación quedará disponible en: `http://localhost:80`

---

## Configuración del Proxy (API Gateway)

El archivo `vite.config.js` redirige todas las peticiones al API Gateway en `http://localhost:9090`:

| Prefijo de ruta | Microservicio destino |
|---|---|
| `/auth` | Servicio de autenticación |
| `/admin` | Servicio de administración |
| `/academico` | Microservicio académico |
| `/asistencia` | Microservicio de asistencia |
| `/comunicaciones` | Microservicio de comunicaciones |

---

## Estructura del proyecto

```
src/
├── api/
│   ├── auth.js          # Llamadas de autenticación
│   ├── client.js        # Instancia Axios con interceptores JWT
│   └── endpoints.js     # Todos los endpoints de la API
├── components/
│   ├── Layout.jsx        # Estructura principal con sidebar y navbar
│   ├── Pagination.jsx    # Componente de paginación reutilizable
│   ├── ProtectedRoute.jsx # Control de acceso por roles
│   └── Skeleton.jsx      # Componente de carga
├── context/
│   └── AuthContext.jsx   # Contexto global de autenticación
├── pages/
│   ├── dashboard/        # Panel principal
│   ├── estudiantes/      # CRUD de estudiantes
│   ├── profesores/       # CRUD de profesores
│   ├── apoderados/       # CRUD de apoderados
│   ├── asignaturas/      # CRUD de asignaturas
│   ├── evaluaciones/     # Gestión de evaluaciones
│   ├── notas/            # Registro de notas
│   ├── asistencia/       # Control de asistencia
│   ├── anotaciones/      # Anotaciones de conducta
│   ├── cursos/           # Gestión de cursos
│   ├── horarios/         # Horarios de clases
│   ├── calendario/       # Calendario escolar
│   ├── mensajes/         # Sistema de mensajería
│   ├── notificaciones/   # Notificaciones
│   ├── reportes/         # Generación de reportes PDF
│   ├── perfil/           # Perfil de usuario
│   ├── mis-notas/        # Vista de notas para alumnos/apoderados
│   ├── mi-asistencia/    # Vista de asistencia para alumnos/apoderados
│   ├── mis-anotaciones/  # Vista de anotaciones para alumnos/apoderados
│   ├── utp/              # Gestión de usuarios UTP
│   ├── Login.jsx         # Página de inicio de sesión
│   ├── ForgotPassword.jsx # Recuperación de contraseña
│   └── Diagnostico.jsx   # Página de diagnóstico del sistema
├── utils/
│   └── dateUtils.js      # Utilidades para manejo de fechas
├── types/
│   └── index.js          # Definición de tipos
├── App.jsx               # Enrutamiento principal
├── main.jsx              # Punto de entrada
└── index.css             # Estilos globales
```

---

## Roles y permisos

El sistema maneja 4 roles con acceso diferenciado a las rutas:

| Rol | Acceso |
|---|---|
| **UTP** | Acceso completo: estudiantes, profesores, apoderados, asignaturas, cursos, evaluaciones, notas, asistencia, anotaciones, reportes |
| **PROFESOR** | Evaluaciones, notas, asistencia, anotaciones, horarios, reportes |
| **ALUMNO** | Mis notas, mi asistencia, mis anotaciones, horarios, calendario, mensajes |
| **APODERADO** | Mis notas, mi asistencia, mis anotaciones, calendario, mensajes |

---

## Autenticación

El sistema utiliza **JWT (JSON Web Token)**:

- El token se almacena en `localStorage` tras el login.
- El interceptor de Axios agrega automáticamente el header `Authorization: Bearer <token>` en cada petición.
- Si el servidor responde con `401 Unauthorized`, el sistema elimina el token y redirige al login automáticamente.

---

## Endpoints consumidos

### Microservicio Académico (`/academico`)
- `GET/POST/PUT/DELETE /academico/api/estudiantes`
- `GET/POST/PUT/DELETE /academico/api/profesores`
- `GET/POST/PUT/DELETE /academico/api/apoderados`
- `GET/POST/PUT/DELETE /academico/api/asignaturas`
- `GET/POST/PUT/DELETE /academico/api/evaluaciones`
- `GET/POST/DELETE /academico/api/notas`
- `GET/POST/PUT/DELETE /academico/api/horarios`

### Microservicio de Asistencia (`/asistencia`)
- `GET/POST/PUT/DELETE /asistencia/api/asistencias`
- `GET/POST/PUT/DELETE /asistencia/api/anotaciones`

### Microservicio de Comunicaciones (`/comunicaciones`)
- `GET/POST/PUT/DELETE /comunicaciones/api/mensajes`
- `GET/POST/DELETE /comunicaciones/api/notificaciones`

### Administración (`/admin`)
- `GET/POST/DELETE /admin/usuarios-utp`

---

## Autores

**José Muñoz**
**Sebastián Santander**

Proyecto grupal — Evaluación Parcial N°3
Asignatura: Desarrollo Fullstack III — DuocUC
