const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNz1xNKdLNLkySIBy2QYEGSkdk6YOeiYUeKoL_wXjElbtLSGDsduJtG_1v_q3PCKBW/exec";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {

  async fetch(request) {

    // ==========================
    // CORS
    // ==========================

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

      const cf = request.cf || {};

      // ==========================
      // IP
      // ==========================

      const ip =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For") ||
        "";

      // ==========================
      // User Agent
      // ==========================

      const userAgent =
        request.headers.get("User-Agent") || "";

      // ==========================
      // Navegador
      // ==========================

      let navegador = "Desconhecido";

      if (/Edg\/([\d.]+)/i.test(userAgent))
        navegador = "Microsoft Edge " + userAgent.match(/Edg\/([\d.]+)/i)[1];

      else if (/OPR\/([\d.]+)/i.test(userAgent))
        navegador = "Opera " + userAgent.match(/OPR\/([\d.]+)/i)[1];

      else if (/Chrome\/([\d.]+)/i.test(userAgent))
        navegador = "Google Chrome " + userAgent.match(/Chrome\/([\d.]+)/i)[1];

      else if (/Firefox\/([\d.]+)/i.test(userAgent))
        navegador = "Mozilla Firefox " + userAgent.match(/Firefox\/([\d.]+)/i)[1];

      else if (/Version\/([\d.]+).*Safari/i.test(userAgent))
        navegador = "Safari " + userAgent.match(/Version\/([\d.]+)/i)[1];

      // ==========================
      // Sistema Operacional
      // ==========================

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

      // ==========================
      // Informações para o Apps Script
      // ==========================

      body.ip = ip;
      body.cidade = cf.city || "";
      body.uf = cf.regionCode || cf.region || "";
      body.navegador = "TESTE WORKER NOVO";
      body.sistemaOperacional = sistemaOperacional;
      body.timestamp = new Date().toISOString();

      // ==========================
      // Envia ao Apps Script
      // ==========================

     console.log("NAVEGADOR FINAL:", body.navegador);
console.log(JSON.stringify(body, null, 2));
     
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