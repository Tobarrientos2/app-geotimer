# Svelte + Vite

This template should help get you started developing with Svelte in Vite.

## Recommended IDE Setup

- Obtiene tu ubicación actual mediante GPS
- Permite buscar destinos usando OpenStreetMap
- Calcula la distancia entre tu ubicación y el destino
- Activa una alarma cuando llegas a menos de 100 metros del destino
- Interfaz de usuario intuitiva y fácil de usar

## Requisitos

- Node.js 14 o superior
- npm o yarn
- Xcode (para compilar para iOS)
- Un dispositivo iOS para pruebas (recomendado)

## Instalación

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Construye la aplicación:

```bash
npm run build
```

4. Sincroniza los archivos con Capacitor:

```bash
npx cap sync
```

5. Abre el proyecto en Xcode:

```bash
npx cap open ios
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Permisos requeridos

La aplicación requiere los siguientes permisos:

- Ubicación (siempre, incluso en segundo plano)
- Notificaciones

## Cómo funciona

1. La aplicación obtiene tu ubicación actual
2. Buscas y seleccionas un destino
3. Inicias el seguimiento
4. La aplicación verifica periódicamente tu ubicación
5. Cuando estás a menos de 100 metros del destino, suena la alarma

## Tecnologías utilizadas

- Svelte para la interfaz de usuario
- Capacitor para el acceso a APIs nativas
- OpenStreetMap (Nominatim) para la geocodificación
- Fórmula de Haversine para el cálculo de distancias

## Licencia

MIT
