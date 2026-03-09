// api/proxy.js
// Este archivo corre en el servidor de Vercel, no en el navegador del usuario.

export default async function handler(req, res) {
  // 1. Seguridad (Opcional): Verificar una contraseña simple de la app
  // Puedes definir un PASSWORD en las variables de entorno de Vercel.
  // Si no quieres contraseña para el personal, borra este bloque.
  const appPassword = req.headers['x-app-password'];
  if (process.env.APP_PASSWORD && appPassword !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  // 2. Obtener datos de la petición
  const { endpoint } = req.query; // user/new, user/list, etc.
  const method = req.method;
  const body = req.body;

  // Validar endpoint
  if (!endpoint) {
    return res.status(400).json({ error: "Falta el endpoint" });
  }

  // 3. Construir URL real
  const targetUrl = `https://apiusertv.bessersolutions.com/${endpoint}`;

  // 4. Preparar Headers (Aquí inyectamos el Token Seguro)
  const headers = {
    'Content-Type': 'application/json',
    'x-access-token': process.env.API_TOKEN, // <-- TOKEN OCULTO
    'Origin': 'https://apiusertv.bessersolutions.com',
    'Accept-Language': 'en'
  };

  try {
    // 5. Hacer la petición a la API real
    const options = {
      method: method,
      headers: headers
    };

    // Si es POST o DELETE, enviar el body
    if (method === 'POST' || method === 'DELETE') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(targetUrl, options);
    const data = await response.json();

    // 6. Devolver respuesta al frontend
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor proxy", details: error.message });
  }
}
