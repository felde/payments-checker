require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const imageBase64 = fs.readFileSync("./assets/header_msg.jpeg", {
  encoding: "base64",
});
// Configura las credenciales de WhatsApp Business API
const whatsappApiUrl = process.env.WHATSAPP_API_URL;
const accessToken = process.env.ACCESS_TOKEN;

const lockCode = process.env.LOCK_CODE;
const templateName = process.env.TEMPLATE_NAME;

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

    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", parameter_name: "notify", text: NotifyNumber },
          { type: "text", parameter_name: "house", text: Casa },
          { type: "text", parameter_name: "key", text: lockCode },
          {
            type: "text",
            parameter_name: "month",
            text: (new Date().getMonth() + 1).toString(),
          },
          {
            type: "text",
            parameter_name: "year",
            text: new Date().getFullYear().toString(),
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
