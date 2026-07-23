const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNz1xNKdLNLkySIBy2QYEGSkdk6YOeiYUeKoL_wXjElbtLSGDsduJtG_1v_q3PCKBW/exec";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {

  async fetch(request, env, ctx) {

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
      
      // Upload da licença para o R2

      if (body.portal === "UPLOAD_LICENCA") {

        if (!body.arquivo || !body.conteudo) {

          return Response.json(
              {
                  ok: false,
                  erro: "Arquivo ou conteúdo não informado."
              },
              {
                  status: 400,
                  headers: CORS_HEADERS
              }
          );

      }

    await env.LICENCAS.put(
      body.arquivo,
      body.conteudo
    );

    return Response.json(
      {
        ok: true,
        arquivo: body.arquivo,
        tamanho: body.conteudo.length,
        mensagem: "Licença enviada ao R2 com sucesso."
      },
      {
        headers: CORS_HEADERS
      }
    );

  }

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
      body.navegador = identificarNavegador(userAgent);
      body.sistemaOperacional = sistemaOperacional;
      body.timestamp = new Date().toISOString();

      // ==========================
      // Envia ao Apps Script
      // ==========================
     
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

function identificarNavegador(userAgent) {

  if (!userAgent) return "Desconhecido";

  let m;

  if ((m = userAgent.match(/Edg\/([\d.]+)/i))) {
    return "Microsoft Edge " + m[1].split(".")[0];
  }

  if ((m = userAgent.match(/OPR\/([\d.]+)/i))) {
    return "Opera " + m[1].split(".")[0];
  }

  if ((m = userAgent.match(/Chrome\/([\d.]+)/i)) &&
      !userAgent.includes("Edg") &&
      !userAgent.includes("OPR")) {
    return "Google Chrome " + m[1].split(".")[0];
  }

  if ((m = userAgent.match(/Firefox\/([\d.]+)/i))) {
    return "Mozilla Firefox " + m[1].split(".")[0];
  }

  if ((m = userAgent.match(/Version\/([\d.]+).*Safari/i)) &&
      !userAgent.includes("Chrome")) {
    return "Safari " + m[1].split(".")[0];
  }

  return "Outro";
}