export default async function handler(req, res) {
  // Manejar solo solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Solo aceptamos POST.' });
  }

  try {
    const { body } = req;
    
    // Convertir el JSON recibido del frontend a URLSearchParams 
    // porque es el formato que Google Apps Script procesa sin fallar (x-www-form-urlencoded)
    const params = new URLSearchParams();
    for (const key in body) {
      params.append(key, body[key]);
    }

    const scriptURL = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptURL) {
      console.error('La variable de entorno GOOGLE_SCRIPT_URL no está configurada.');
      return res.status(500).json({ error: 'Error de configuración en el servidor.' });
    }

    // Realizar la petición HTTP a la URL de Google Sheets
    const response = await fetch(scriptURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    // Validar si la respuesta de Google Sheets no fue exitosa (fuera de rango 200-299)
    if (!response.ok) {
      throw new Error(`Google Apps Script devolvió un error: ${response.status}`);
    }

    // Como usamos un servidor proxy, evitamos el problema de CORS en el navegador.
    // Devolvemos el estado de éxito real al frontend.
    return res.status(200).json({ success: true, message: '¡RSVP guardado correctamente!' });
    
  } catch (error) {
    console.error('Error al intentar guardar el RSVP en Google Sheets:', error);
    return res.status(500).json({ error: 'Hubo un error al procesar la confirmación.' });
  }
}
