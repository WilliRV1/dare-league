# 🦅 DARE LEAGUE | Competencia CrossFit 1v1

> **"Solo los más fuertes permanecen."**

Plataforma oficial para la gestión de inscripciones, pagos y administración del torneo de CrossFit **Dare League 2026** (Cali, Colombia).

![Dare League Banner](https://dareleague.com/logo.png)

## 🚀 Características Principales

### Para los Atletas:
*   **Registro por Etapas**: Precios dinámicos (Early, Regular, Late) automáticos según la fecha.
*   **Cupos en Tiempo Real**: Validación de disponibilidad para categorías (Principiante/Intermedio) y género.
*   **Pagos Flexibles**: Soporte para Nequi, Bancolombia y NuBank con carga de comprobantes.
*   **Portal de Estado**: Consulta de estado de inscripción (Pendiente, Aprobado, Rechazado con notas).
*   **Experiencia Elite**: Interfaz oscura, animaciones fluidas y diseño "mobile-first".

### Para la Organización (Admin):
*   **Dashboard Seguro**: Panel protegido con contraseña para gestionar atletas.
*   **Validación de Pagos**: Visualización de comprobantes y aprobación/rechazo con un clic.
*   **Comunicación Directa**: Botones de WhatsApp pre-configurados para contactar atletas (Confirmaciones o Cobros).
*   **Generador de Flyers**: Creación automática de imágenes "Welcome Athlete" para redes sociales.
*   **Exportación**: Descarga de base de datos en CSV para logística (Ventas, Tallas de Camisa, etc.).

## 🛠️ Stack Tecnológico

Este proyecto fue construido con rendimiento y escalabilidad en mente, usando las herramientas "Serverless" más modernas:

*   **Frontend**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) (Velocidad extrema).
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y personalizado).
*   **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime + Storage).
*   **Iconos**: Material Symbols (Google Fonts).

## ⚙️ Instalación y Desarrollo Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/dare-league.git
    cd dare-league
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` en la raíz con tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Correr el proyecto**:
    ```bash
    npm run dev
    ```

## 📦 Estructura de Base de Datos (Supabase)

La tabla principal `registrations` requiere las siguientes columnas clave:
*   `registration_id` (Texto, Único)
*   `full_name`, `document_id`, `email`, `phone` (Datos personales)
*   `category`, `gender`, `gym` (Datos competencia)
*   `status` (Enum: PENDING_PROOFS, PENDING_VALIDATION, APPROVED, REJECTED)
*   `payment_proof_path` (Ruta en Storage)
*   `shirt_size` (Texto)
*   `rejection_notes` (Texto)

## 🚢 Despliegue

El proyecto está optimizado para desplegarse gratuitamente en **Vercel**:
1.  Importar proyecto en Vercel.
2.  Configurar las variables de entorno (`VITE_SUPABASE_...`).
3.  Deploy!

Para más detalles, ver la [Guía de Despliegue](./deployment_guide.md).

---

Desarrollado con 🔥 para **Dare League 2026**.
