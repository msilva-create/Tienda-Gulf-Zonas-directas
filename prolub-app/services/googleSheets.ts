import { OrderLog } from '../types';

// --- CONFIGURACIÓN ---
// Pega aquí la URL de la Aplicación Web que generaste en Google Apps Script
// Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkMqsgRgqXPPzmpwuwSKRvRKxZnozJe-XSuyIlOUI2rdyLJw_JQQDo_7FJwiGAqyLu5Q/exec'; 

export const sendOrderToGoogleSheet = async (order: OrderLog) => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("⚠️ URL de Google Sheets no configurada. Los datos no se guardarán en la nube.");
    return;
  }

  // Preparamos los datos para el script de Google
  const formData = new FormData();
  formData.append('Fecha', order.date);
  formData.append('Hora', order.time);
  formData.append('Cliente', order.client);
  formData.append('Receptor', order.receiver);
  formData.append('Ciudad', order.city);
  formData.append('Direccion', order.address);
  formData.append('Telefono', order.phone);
  formData.append('Items', order.items);
  formData.append('Puntos', order.points.toString());

  try {
    // Usamos mode: 'no-cors' porque Google scripts redirigen y causan errores de CORS en el navegador,
    // aunque la petición sí llega y se guarda correctamente.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    console.log("✅ Pedido enviado a Google Sheets exitosamente.");
  } catch (error) {
    console.error("❌ Error enviando a Google Sheets:", error);
  }
};