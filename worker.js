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

      // =============================
      // Dados da requisição
      // =============================

      const ip =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("X-Forwarded-For") ||
          "";

      const userAgent =
          request.headers.get("User-Agent") || "";

      const cidade =
          request.headers.get("CF-IPCity") || "";

      const uf =
          request.headers.get("CF-Region-Code") ||
          request.headers.get("CF-Region") ||
          "";

      let sistemaOperacional = "";

      if (/Windows/i.test(userAgent))
          sistemaOperacional = "Windows";
      else if (/Android/i.test(userAgent))
          sistemaOperacional = "Android";
      else if (/iPhone|iPad|iOS/i.test(userAgent))
          sistemaOperacional = "iOS";
      else if (/Mac/i.test(userAgent))
          sistemaOperacional = "macOS";
      else if (/Linux/i.test(userAgent))
          sistemaOperacional = "Linux";
      else
          sistemaOperacional = "Desconhecido";

      // Acrescenta as informações ao objeto recebido
      body.ip = ip;
      body.navegador = userAgent;
      body.sistemaOperacional = sistemaOperacional;
      body.cidade = cidade;
      body.uf = uf;
      body.timestamp = new Date().toISOString();

      // Encaminha ao Apps Script
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