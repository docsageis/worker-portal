const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNz1xNKdLNLkySIBy2QYEGSkdk6YOeiYUeKoL_wXjElbtLSGDsduJtG_1v_q3PCKBW/exec";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {

  async fetch(request) {

    // Preflight (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // Aceita somente POST
    if (request.method !== "POST") {
      return Response.json(
        {
          ok: false,
          erro: "Método não permitido."
        },
        {
          status: 405,
          headers: CORS_HEADERS
        }
      );
    }

    try {

      const body = await request.json();

      const resposta = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const texto = await resposta.text();

      return new Response(texto, {
        status: resposta.status,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });

    } catch (erro) {

      return Response.json(
        {
          ok: false,
          erro: erro.message
        },
        {
          status: 500,
          headers: CORS_HEADERS
        }
      );

    }

  }

}