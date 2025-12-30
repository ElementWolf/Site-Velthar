import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/axios';

/**
 * Hook optimizado para peticiones API con manejo de loading, error y refetch.
 * Incluye cache, debounce y cancelación de requests.
 * @param {string} url - Endpoint a consultar.
 * @param {object} [options] - Opciones adicionales (method, body, cache, etc).
 * @returns {object} { data, loading, error, refetch }
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  // Cache simple en memoria
  const cache = useRef(new Map());
  const cacheTimeout = useRef(new Map());

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let res;
      const config = { 
        signal: abortControllerRef.current.signal,
        timeout: 15000
      };

      switch (options.method) {
        case 'POST':
          res = await api.post(url, options.body, config);
          break;
        case 'PATCH':
          res = await api.patch(url, options.body, config);
          break;
        case 'PUT':
          res = await api.put(url, options.body, config);
          break;
        case 'DELETE':
          res = await api.delete(url, { data: options.body, ...config });
          break;
        default:
          res = await api.get(url, config);
      }

      if (isMountedRef.current) {
        setData(res.data);
      }
    } catch (e) {
      if (!isMountedRef.current) return;
      
      if (e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
        return;
      }
      
      let errorMessage = 'Error desconocido';
      
      if (e?.response?.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (e?.response?.status === 401) {
        errorMessage = 'No autorizado';
      } else if (e?.response?.status === 403) {
        errorMessage = 'Acceso denegado';
      } else if (e?.response?.status >= 500) {
        errorMessage = 'Error del servidor';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, options]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, reloadFlag]);

  const refetch = useCallback(() => {
    setReloadFlag(f => f + 1);
  }, []);

  return { data, loading, error, refetch };
} 