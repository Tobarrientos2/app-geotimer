import { LiveUpdates } from '@capacitor/live-updates';

// Función para verificar actualizaciones
export async function checkForUpdate() {
  try {
    const update = await LiveUpdates.checkForUpdate();
    
    if (update.available) {
      console.log('¡Hay una actualización disponible!');
      return true;
    } else {
      console.log('No hay actualizaciones disponibles');
      return false;
    }
  } catch (error) {
    console.error('Error al verificar actualizaciones:', error);
    return false;
  }
}

// Función para descargar e instalar la actualización
export async function downloadAndInstall() {
  try {
    console.log('Descargando actualización...');
    const download = await LiveUpdates.downloadUpdate((progress) => {
      console.log(`Progreso de descarga: ${progress.percent}%`);
    });
    
    console.log('Instalando actualización...');
    await LiveUpdates.installUpdate();
    
    return true;
  } catch (error) {
    console.error('Error al descargar o instalar la actualización:', error);
    return false;
  }
}

// Función para recargar la aplicación con la nueva actualización
export async function reloadApp() {
  await LiveUpdates.reloadApp();
} 