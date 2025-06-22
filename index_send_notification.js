require("dotenv").config();
const axios = require("axios");
const { log } = require("console");
const fs = require("fs");
const imageBase64 = fs.readFileSync("./assets/header_msg.jpeg", {
  encoding: "base64",
});
// Configura las credenciales de WhatsApp Business API
const whatsappApiUrl = process.env.WHATSAPP_API_URL;
const accessToken = process.env.ACCESS_TOKEN;

const link = process.env.FIRST_LIST;
const templateName = process.env.NOTIFICATION_TEMPLATE_NAME;
const notifyTitle = "Encuesta derivada de reunión 20-06-2025";
const notifyText =
  "Favor de votar la encuesta de propuestas para la mejora en nuestra privada. El tiempo estimado para contestar es de 5 minutos.";

async function readJson() {
  const data = fs.readFileSync("./Data/Notify.json", "utf8");
  return JSON.parse(data).notifications;
}

async function sendMessage(phoneNumber, components) {
  try {
    const response = await axios.post(
      whatsappApiUrl,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "es_MX", // Cambia esto al código de idioma de tu plantilla
          },
          components: components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message
    );
    return "Failed";
  }
}

async function processNotifications() {
  const notifications = await readJson();
  for (const notification of notifications) {
    const { NotifyNumber, Casa } = notification;
    const phoneNumber = `+52${NotifyNumber}`; // Asegúrate de que el número incluye el prefijo internacional
    if (!/^\+\d{11,15}$/.test(phoneNumber)) {
      console.error(`Invalid phone number format: ${phoneNumber}`);
      continue;
    }
    log(`Processing notification for ${Casa} (${phoneNumber}), ${link}`);
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", parameter_name: "neigh_value", text: Casa },
          { type: "text", parameter_name: "notify_title", text: notifyTitle },
          { type: "text", parameter_name: "notify_text", text: notifyText },
        ],
      },
      {
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          {
            type: "text",
            text: link == "" ? "SOd-o" : link,
          },
        ],
      },
    ];

    console.log(
      "Datos enviados a WhatsApp:",
      JSON.stringify(components, null, 2)
    );
    const sendStatus = await sendMessage(phoneNumber, components);
    console.log(`Message to ${phoneNumber} (${Casa}):`, sendStatus);
  }
}

processNotifications().catch(console.error);
