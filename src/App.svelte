<script>
  import { onMount } from 'svelte';
  import { Geolocation } from '@capacitor/geolocation';
  import { LocalNotifications } from '@capacitor/local-notifications';
  import { checkForUpdate, downloadAndInstall, reloadApp } from './liveUpdates.js';

  let currentLocation = null;
  let destination = null;
  let searchQuery = '';
  let searchResults = [];
  let isTracking = false;
  let distance = null;
  let trackingInterval = null;
  let notificationSent = false;
  let errorMessage = '';
  let isLoading = false;
  let updateAvailable = false;
  let updateDownloading = false;

  // Función para obtener la ubicación actual
  async function getCurrentLocation() {
    try {
      errorMessage = '';
      isLoading = true;
      const permResult = await Geolocation.checkPermissions();
      
      if (permResult.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          errorMessage = 'Se requieren permisos de ubicación para usar esta aplicación';
          isLoading = false;
          return;
        }
      }
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      
      currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      isLoading = false;
    } catch (error) {
      errorMessage = `Error al obtener la ubicación: ${error.message}`;
      isLoading = false;
    }
  }

  // Función para buscar un lugar usando OpenStreetMap Nominatim
  async function searchLocation() {
    if (!searchQuery.trim()) {
      errorMessage = 'Por favor ingresa un lugar para buscar';
      return;
    }
    
    try {
      errorMessage = '';
      isLoading = true;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'GeoTimerApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const data = await response.json();
      searchResults = data.map(item => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
      
      isLoading = false;
    } catch (error) {
      errorMessage = `Error en la búsqueda: ${error.message}`;
      isLoading = false;
    }
  }

  // Función para seleccionar un destino
  function selectDestination(location) {
    destination = location;
    searchResults = [];
  }

  // Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en metros
    
    return d;
  }

  // Función para iniciar el seguimiento
  async function startTracking() {
    if (!currentLocation || !destination) {
      errorMessage = 'Se requiere ubicación actual y destino';
      return;
    }
    
    try {
      await LocalNotifications.requestPermissions();
      
      isTracking = true;
      notificationSent = false;
      
      // Configurar intervalo para verificar la distancia
      trackingInterval = setInterval(async () => {
        await getCurrentLocation();
        
        if (currentLocation && destination) {
          distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            destination.latitude,
            destination.longitude
          );
          
          // Si estamos a menos de 100 metros y no hemos enviado la notificación
          if (distance < 100 && !notificationSent) {
            triggerAlarm();
            notificationSent = true;
          }
        }
      }, 10000); // Verificar cada 10 segundos
    } catch (error) {
      errorMessage = `Error al iniciar seguimiento: ${error.message}`;
      isTracking = false;
    }
  }

  // Función para detener el seguimiento
  function stopTracking() {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
    isTracking = false;
  }

  // Función para activar la alarma
  async function triggerAlarm() {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '¡Has llegado a tu destino!',
            body: `Estás a ${Math.round(distance)} metros de tu destino`,
            id: 1,
            sound: 'beep.wav',
            actionTypeId: '',
            extra: null
          }
        ]
      });
      
      // También podemos detener el seguimiento automáticamente
      stopTracking();
    } catch (error) {
      errorMessage = `Error al activar la alarma: ${error.message}`;
    }
  }

  // Función para verificar actualizaciones
  async function checkForAppUpdate() {
    try {
      updateAvailable = await checkForUpdate();
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
    }
  }

  // Función para instalar actualizaciones
  async function installUpdate() {
    updateDownloading = true;
    try {
      const success = await downloadAndInstall();
      if (success) {
        await reloadApp();
      }
    } catch (error) {
      console.error('Error al instalar la actualización:', error);
    } finally {
      updateDownloading = false;
    }
  }

  // Limpiar al desmontar el componente
  onMount(() => {
    getCurrentLocation();
    checkForAppUpdate();
    
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  });
</script>

<main>
  <h1>GeoTimer</h1>
  <p class="subtitle">Alarma que suena al llegar a tu destino</p>
  
  {#if updateAvailable}
    <div class="update-banner">
      <p>¡Hay una actualización disponible!</p>
      <button on:click={installUpdate} disabled={updateDownloading} class="update-button">
        {updateDownloading ? 'Instalando...' : 'Instalar ahora'}
      </button>
    </div>
  {/if}
  
  {#if errorMessage}
    <div class="error-message">
      {errorMessage}
    </div>
  {/if}
  
  <div class="card">
    <h2>Mi Ubicación</h2>
    <button on:click={getCurrentLocation} disabled={isLoading}>
      {isLoading ? 'Obteniendo ubicación...' : 'Actualizar ubicación'}
    </button>
    
    {#if currentLocation}
      <p>
        Latitud: {currentLocation.latitude.toFixed(6)}<br>
        Longitud: {currentLocation.longitude.toFixed(6)}
      </p>
    {:else}
      <p>Ubicación no disponible</p>
    {/if}
  </div>
  
  <div class="card">
    <h2>Buscar Destino</h2>
    <div class="search-container">
      <input 
        type="text" 
        bind:value={searchQuery} 
        placeholder="Ingresa un lugar o dirección"
        on:keydown={(e) => e.key === 'Enter' && searchLocation()}
      />
      <button on:click={searchLocation} disabled={isLoading}>
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </div>
    
    {#if searchResults.length > 0}
      <div class="search-results">
        <h3>Resultados:</h3>
        <ul>
          {#each searchResults as result}
            <li>
              <button on:click={() => selectDestination(result)}>
                {result.name}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    
    {#if destination}
      <div class="destination-info">
        <h3>Destino seleccionado:</h3>
        <p>{destination.name}</p>
        <p>
          Latitud: {destination.latitude.toFixed(6)}<br>
          Longitud: {destination.longitude.toFixed(6)}
        </p>
        <button on:click={() => destination = null} class="secondary">
          Cambiar destino
        </button>
      </div>
    {/if}
  </div>
  
  <div class="card">
    <h2>Control de Alarma</h2>
    {#if currentLocation && destination}
      {#if !isTracking}
        <button on:click={startTracking} class="primary">
          Iniciar seguimiento
        </button>
      {:else}
        <button on:click={stopTracking} class="secondary">
          Detener seguimiento
        </button>
        
        {#if distance !== null}
          <p>Distancia al destino: {Math.round(distance)} metros</p>
        {/if}
      {/if}
    {:else}
      <p>Configura tu ubicación y destino para iniciar</p>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
    color: #333;
  }
  
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 0;
  }
  
  .subtitle {
    text-align: center;
    color: #666;
    margin-top: 0;
    margin-bottom: 30px;
  }
  
  .card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #1e40af;
    margin-top: 0;
  }
  
  button {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #2563eb;
  }
  
  button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
  
  button.secondary {
    background-color: #6b7280;
  }
  
  button.secondary:hover {
    background-color: #4b5563;
  }
  
  button.primary {
    background-color: #10b981;
  }
  
  button.primary:hover {
    background-color: #059669;
  }
  
  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
    margin-bottom: 10px;
  }
  
  .search-container {
    display: flex;
    flex-direction: column;
  }
  
  .search-results {
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
  }
  
  .search-results ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .search-results li {
    margin-bottom: 8px;
  }
  
  .search-results button {
    background: none;
    border: none;
    color: #2563eb;
    text-align: left;
    padding: 5px 0;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
  }
  
  .search-results button:hover {
    text-decoration: underline;
    background: none;
  }
  
  .destination-info {
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
  }
  
  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 20px;
  }
  
  .update-banner {
    background-color: #dbeafe;
    color: #1e40af;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .update-banner p {
    margin: 0;
  }
  
  .update-button {
    background-color: #2563eb;
    margin-left: 10px;
  }
  
  @media (min-width: 640px) {
    .search-container {
      flex-direction: row;
    }
    
    input {
      margin-right: 10px;
      margin-bottom: 0;
      flex: 1;
    }
  }
</style>
