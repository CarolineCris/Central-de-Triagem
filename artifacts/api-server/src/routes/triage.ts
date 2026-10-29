import { Router, type IRouter } from "express";
import { SubmitTriageBody, SubmitTriageResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const INTEGRATION_NOT_CONFIGURED =
  "A integração com o n8n não está configurada. Cadastre N8N_WEBHOOK_URL e N8N_API_KEY em Secrets.";
const UPSTREAM_FAILURE =
  "O n8n não confirmou o resultado. Nenhuma nova chamada automática foi feita. Confira o Google Sheets antes de tentar novamente.";

router.post("/triagem", async (req, res): Promise<void> => {
  const input = SubmitTriageBody.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({
      error: "Informe um nome de até 100 caracteres e uma mensagem de até 2.000 caracteres.",
    });
    return;
  }

  if (!input.data.nome.trim() || !input.data.mensagem.trim()) {
    res.status(400).json({
      error: "Nome fictício e mensagem não podem ficar em branco.",
    });
    return;
  }

  const webhookUrlValue = process.env["N8N_WEBHOOK_URL"]?.trim();
  const apiKey = process.env["N8N_API_KEY"];

  if (!webhookUrlValue || !apiKey) {
    res.status(503).json({ error: INTEGRATION_NOT_CONFIGURED });
    return;
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(webhookUrlValue);
  } catch {
    res.status(503).json({ error: INTEGRATION_NOT_CONFIGURED });
    return;
  }

  if (webhookUrl.protocol !== "https:" && webhookUrl.protocol !== "http:") {
    res.status(503).json({ error: INTEGRATION_NOT_CONFIGURED });
    return;
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(input.data),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    req.log.warn("Não foi possível obter resposta do webhook n8n");
    res.status(502).json({ error: UPSTREAM_FAILURE });
    return;
  }

  if (!upstreamResponse.ok) {
    res.status(502).json({ error: UPSTREAM_FAILURE });
    return;
  }

  let upstreamBody: unknown;
  try {
    upstreamBody = await upstreamResponse.json();
  } catch {
    res.status(502).json({ error: UPSTREAM_FAILURE });
    return;
  }

  const result = SubmitTriageResponse.safeParse(upstreamBody);
  if (
    !result.success ||
    !result.data.Categoria.trim() ||
    !result.data.Status.trim()
  ) {
    res.status(502).json({ error: UPSTREAM_FAILURE });
    return;
  }

  res.json(result.data);
});

export default router;
