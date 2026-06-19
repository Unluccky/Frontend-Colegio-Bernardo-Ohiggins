import { useState } from 'react';
import apiClient from '../api/client';
import { School, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function Diagnostico() {
  const [results, setResults] = useState([
    { name: 'API Gateway (puerto 9090)', status: 'pending', message: 'Pendiente' },
    { name: 'Login endpoint (/auth/login)', status: 'pending', message: 'Pendiente' },
    { name: 'Servicio Académico (/academico/api/estudiantes)', status: 'pending', message: 'Pendiente' },
  ]);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const newResults = [...results];

    // 1. Check gateway
    newResults[0] = { ...newResults[0], status: 'pending', message: 'Verificando...' };
    setResults([...newResults]);

    try {
      const start = Date.now();
      await apiClient.get('/auth/login', { timeout: 5000 });
      newResults[0] = { name: 'API Gateway (puerto 9090)', status: 'ok', message: `Conectado (${Date.now() - start}ms)` };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        newResults[0] = {
          name: 'API Gateway (puerto 9090)',
          status: 'error',
          message: 'NO CONECTA - El API Gateway no está corriendo en localhost:9090.\n' +
            'Asegúrate de tener Docker funcionando y ejecuta:\n' +
            '  docker-compose up -d\n' +
            'Luego espera unos 30 segundos a que los servicios inicien.'
        };
      } else if (err.response?.status === 405 || err.response?.status === 403) {
        newResults[0] = { name: 'API Gateway (puerto 9090)', status: 'ok', message: 'Gateway responde en puerto 9090 ✓' };
      } else {
        newResults[0] = { name: 'API Gateway (puerto 9090)', status: 'ok', message: `Gateway responde (status ${err.response?.status})` };
      }
    }
    setResults([...newResults]);

    // 2. Check login endpoint
    newResults[1] = { ...newResults[1], status: 'pending', message: 'Verificando...' };
    setResults([...newResults]);

    try {
      const resp = await apiClient.post('/auth/login', { rut: '77777777-7', password: 'utp123' }, { timeout: 5000 });
      if (resp.data?.token) {
        newResults[1] = { name: 'Login endpoint (/auth/login)', status: 'ok', message: 'Login funciona! Token recibido ✓' };
      } else {
        newResults[1] = { name: 'Login endpoint (/auth/login)', status: 'error', message: `Respuesta inesperada: ${JSON.stringify(resp.data)}` };
      }
    } catch (err) {
      if (err.response?.status === 401) {
        newResults[1] = {
          name: 'Login endpoint (/auth/login)',
          status: 'ok',
          message: 'Login endpoint responde pero devolvió 401 (credenciales inválidas) - ¡Esto es normal si el endpoint funciona!'
        };
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        newResults[1] = {
          name: 'Login endpoint (/auth/login)',
          status: 'error',
          message: 'No se puede contactar el endpoint de login. El API Gateway no está disponible.'
        };
      } else {
        newResults[1] = { name: 'Login endpoint (/auth/login)', status: 'error', message: err.message };
      }
    }
    setResults([...newResults]);

    // 3. Check academic service
    newResults[2] = { ...newResults[2], status: 'pending', message: 'Verificando...' };
    setResults([...newResults]);

    try {
      await apiClient.get('/academico/api/estudiantes', { timeout: 5000 });
      newResults[2] = { name: 'Servicio Académico', status: 'ok', message: 'Servicio académico responde correctamente' };
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        newResults[2] = { name: 'Servicio Académico', status: 'ok', message: 'Servicio responde (requiere auth) - ¡Correcto!' };
      } else if (err.code === 'ERR_NETWORK') {
        newResults[2] = { name: 'Servicio Académico', status: 'error', message: 'No conecta - Gateway caído' };
      } else {
        newResults[2] = { name: 'Servicio Académico', status: 'error', message: err.message };
      }
    }
    setResults([...newResults]);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <School size={48} className="text-blue-700 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">Diagnóstico del Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Verifica la conectividad con los servicios backend</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {testing ? (
              <><Loader2 size={18} className="animate-spin" /> Ejecutando diagnóstico...</>
            ) : (
              '▶ Ejecutar Diagnóstico'
            )}
          </button>

          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                r.status === 'pending' ? 'border-gray-200 bg-gray-50' :
                r.status === 'ok' ? 'border-emerald-200 bg-emerald-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {r.status === 'pending' && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                  {r.status === 'ok' && <CheckCircle2 size={18} className="text-emerald-600" />}
                  {r.status === 'error' && <XCircle size={18} className="text-red-600" />}
                  <span className={`font-medium text-sm ${
                    r.status === 'pending' ? 'text-gray-600' :
                    r.status === 'ok' ? 'text-emerald-800' : 'text-red-800'
                  }`}>{r.name}</span>
                </div>
                <p className={`text-xs whitespace-pre-line ml-7 ${
                  r.status === 'pending' ? 'text-gray-400' :
                  r.status === 'ok' ? 'text-emerald-600' : 'text-red-600'
                }`}>{r.message}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 space-y-1">
            <p className="font-medium">🔧 ¿Sigues con problemas?</p>
            <p>1. Abre una terminal y ejecuta: <code className="bg-blue-100 px-1 rounded">docker-compose up -d</code></p>
            <p>2. Espera 20-30 segundos a que los servicios inicien</p>
            <p>3. Verifica: <code className="bg-blue-100 px-1 rounded">curl http://localhost:9090/auth/login</code> (debe dar 405 o 200)</p>
            <p>4. Si el problema persiste, abre la consola del navegador (F12) y ve a la pestaña Red/Network para ver el error exacto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
