// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class APIService {
  /**
   * Buscar el parqueadero más cercano
   * @param {Object} location - {lat: number, lng: number}
   * @param {Object} filters - Filtros opcionales de búsqueda
   * @returns {Promise<Object>} - Información del parqueadero encontrado
   */
  async findNearestParking(location, filters = {}) {
    try {
      console.log('🔍 Enviando petición al backend:', `${API_BASE_URL}/search/nearest/`);
      console.log('📍 Datos enviados:', { latitude: location.lat, longitude: location.lng, filters });
      
      const response = await fetch(`${API_BASE_URL}/search/nearest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          filters: filters
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No se encontraron parqueaderos disponibles');
        }
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(data.error || 'Demasiadas solicitudes, intenta más tarde');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al buscar parqueadero:', error);
      throw error;
    }
  }

  /**
   * Actualizar disponibilidad de un parqueadero
   * @param {number} parkingId - ID del parqueadero
   * @param {boolean} isAvailable - Nueva disponibilidad
   * @returns {Promise<Object>} - Información actualizada
   */
  async updateParkingAvailability(parkingId, isAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/${parkingId}/availability/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: isAvailable
        })
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar disponibilidad: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de búsquedas
   * @returns {Promise<Array>} - Lista de búsquedas anteriores
   */
  async getSearchHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/search/history/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener historial: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Verificar si el backend está disponible
   * @returns {Promise<boolean>} - true si el backend responde
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/search/history/`, {
        method: 'GET',
      });
      return response.ok || response.status === 404; // 404 es OK, significa que el endpoint existe
    } catch (error) {
      return false;
    }
  }
}

export default new APIService();
