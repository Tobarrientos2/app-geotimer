import { CapacitorUpdater } from '@capgo/capacitor-updater';

// Función para verificar actualizaciones
export async function checkForUpdate() {
  try {
    const result = await CapacitorUpdater.checkForUpdate();
    
    if (result.update) {
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
    
    // Configurar listener para el progreso de descarga
    const downloadListener = CapacitorUpdater.addListener('download', (info) => {
      console.log(`Progreso de descarga: ${info.percent}%`);
    });
    
    // Descargar e instalar la actualización
    const result = await CapacitorUpdater.download({
      url: 'https://github.com/Tobarrientos2/app-geotimer/archive/refs/heads/main.zip',
      version: 'latest'
    });
    
    // Remover el listener
    downloadListener.remove();
    
    if (result.status === 'success') {
      console.log('Descarga completada, instalando actualización...');
      
      // Instalar la actualización
      await CapacitorUpdater.set({
        id: result.bundle.id
      });
      
      console.log('Actualización instalada correctamente');
      return true;
    } else {
      console.error('La descarga no fue exitosa');
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
    await CapacitorUpdater.reload();
    return true;
  } catch (error) {
    console.error('Error al recargar la aplicación:', error);
    return false;
  }
} 