import { LiveUpdate } from '@capacitor/live-updates';

// Función para verificar actualizaciones
export async function checkForUpdate() {
  try {
    const update = await LiveUpdate.checkForUpdate();
    
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
    console.log('Iniciando descarga de actualización...');
    
    // Iniciar la descarga
    const download = await LiveUpdate.downloadUpdate((progress) => {
      console.log(`Progreso de descarga: ${progress.percent}%`);
    });
    
    if (download.consistent) {
      console.log('Descarga completada, instalando actualización...');
      
      // Instalar la actualización
      await LiveUpdate.installUpdate();
      console.log('Actualización instalada correctamente');
      return true;
    } else {
      console.error('La descarga no es consistente');
      return false;
    }
  } catch (error) {
    console.error('Error al descargar/instalar la actualización:', error);
    return false;
  }
}

// Función para recargar la aplicación
export async function reloadApp() {
  try {
    await LiveUpdate.reloadApp();
    return true;
  } catch (error) {
    console.error('Error al recargar la aplicación:', error);
    return false;
  }
} 