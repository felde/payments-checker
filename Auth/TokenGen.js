const axios = require("axios");

async function getLongLivedToken(appId, appSecret, shortLivedToken) {
  try {
    const response = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error obteniendo token:",
      error.response?.data || error.message
    );
    throw error;
  }
}
