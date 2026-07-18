const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNz1xNKdLNLkySIBy2QYEGSkdk6YOeiYUeKoL_wXjElbtLSGDsduJtG_1v_q3PCKBW/exec";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {

  async fetch(request) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

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
      // Informações da Cloudflare
      // =============================

      const cf = request.cf || {};

      const ip =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For") ||
        "";

      const userAgent =
        request.headers.get("User-Agent") || "";

      let sistemaOperacional = "Desconhecido";

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

      // Acrescenta ao body

      body.ip = ip;
      body.navegador = userAgent;
      body.sistemaOperacional = sistemaOperacional;

      body.cidade = cf.city || "";
      body.uf = cf.regionCode || cf.region || "";
      body.pais = cf.country || "";

      body.timestamp = new Date().toISOString();

      // Logs para diagnóstico

      console.log("================================");
      console.log("REQUEST.CF");
      console.log(JSON.stringify(cf, null, 2));

      console.log("================================");
      console.log("BODY ENVIADO");
      console.log(JSON.stringify(body, null, 2));
      console.log("================================");

      // Envia ao Apps Script

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

      console.error(erro);

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