// api/proxy.js
export default async function handler(req, res) {
  
  // --- 1. SEGURIDAD: CONTRASEÑA DE ACCESO ---
  // Esta es la clave que el personal debe escribir para entrar.
  const APP_PASSWORD = "vidaplay.vid@net"; 
  
  const incomingPassword = req.headers['x-app-password'];

  // Si la clave enviada desde la web no coincide, denegamos acceso.
  if (incomingPassword !== APP_PASSWORD) {
    return res.status(401).json({ error: "Acceso no autorizado. Verifique la clave." });
  }

  // --- 2. CONFIGURACIÓN DE DESTINO ---
  const { endpoint } = req.query; // user/new, user/list, etc.
  
  if (!endpoint) {
    return res.status(400).json({ error: "Falta especificar el endpoint" });
  }

  // Reconstruimos los parámetros de la URL (page, limit, docid, etc.)
  const queryParams = new URLSearchParams(req.query);
  queryParams.delete('endpoint'); // Quitamos 'endpoint' para no duplicarlo en la URL final
  
  const targetUrl = `https://apiusertv.bessersolutions.com/${endpoint}?${queryParams.toString()}`;

  // --- 3. HEADERS SEGUROS ---
  // Aquí inyectamos el Token de la API desde las variables de entorno de Vercel (OCULTO)
  const headers = {
    'Content-Type': 'application/json',
    'x-access-token': process.env.API_TOKEN, 
    'Origin': 'https://apiusertv.bessersolutions.com',
    'Accept-Language': 'en'
  };

  // --- 4. EJECUCIÓN DE LA PETICIÓN ---
  try {
    const options = {
      method: req.method,
      headers: headers
    };

    // Si es POST o DELETE, enviamos el cuerpo del mensaje
    if (req.method === 'POST' || req.method === 'DELETE') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const data = await response.json();

    // Devolvemos la respuesta exacta de la API al frontend
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Error interno en el servidor proxy", details: error.message });
  }
}
