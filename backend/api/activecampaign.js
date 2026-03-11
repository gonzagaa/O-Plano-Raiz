export default async function handler(req, res) {
  // CORS básico
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { nome, email, telefone } = req.body || {};

    if (!nome || !email || !telefone) {
      return res.status(400).json({
        error: "Nome, e-mail e telefone são obrigatórios.",
      });
    }

    const apiUrl = process.env.ACTIVECAMPAIGN_API_URL; // ex: https://sua-conta.api-us1.com
    const apiKey = process.env.ACTIVECAMPAIGN_API_KEY;
    const tagName = process.env.ACTIVECAMPAIGN_TAG_NAME || "RAIZ - Formulario - O Plano";

    if (!apiUrl || !apiKey) {
      return res.status(500).json({
        error: "Variáveis do ActiveCampaign não configuradas no servidor.",
      });
    }

    // 1) Cria ou atualiza o contato
    const syncResponse = await fetch(`${apiUrl}/api/3/contact/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": apiKey,
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: nome,
          phone: telefone,
        },
      }),
    });

    const syncData = await syncResponse.json();

    if (!syncResponse.ok) {
      console.error("Erro ao sincronizar contato:", syncData);
      return res.status(500).json({
        error: "Erro ao criar/atualizar contato no ActiveCampaign.",
        details: syncData,
      });
    }

    const contactId = syncData?.contact?.id;

    if (!contactId) {
      return res.status(500).json({
        error: "Não foi possível obter o ID do contato.",
        details: syncData,
      });
    }

    // 2) Busca a tag pelo nome
    const tagsResponse = await fetch(
      `${apiUrl}/api/3/tags?search=${encodeURIComponent(tagName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": apiKey,
        },
      }
    );

    const tagsData = await tagsResponse.json();

    if (!tagsResponse.ok) {
      console.error("Erro ao buscar tag:", tagsData);
      return res.status(500).json({
        error: "Erro ao buscar tag no ActiveCampaign.",
        details: tagsData,
      });
    }

    const matchedTag = tagsData?.tags?.find((tag) => tag.tag === tagName || tag.tagTitle === tagName);
    const tagId = matchedTag?.id;

    if (!tagId) {
      return res.status(500).json({
        error: `Tag não encontrada: ${tagName}`,
      });
    }

    // 3) Vincula a tag ao contato
    const contactTagResponse = await fetch(`${apiUrl}/api/3/contactTags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": apiKey,
      },
      body: JSON.stringify({
        contactTag: {
          contact: String(contactId),
          tag: String(tagId),
        },
      }),
    });

    const contactTagData = await contactTagResponse.json();

    // Se já estiver tagueado, dependendo da conta/plano, pode retornar erro.
    // Então vamos tratar com tolerância.
    if (!contactTagResponse.ok) {
      console.warn("Aviso ao aplicar tag:", contactTagData);
    }

    return res.status(200).json({
      success: true,
      message: "Lead enviado com sucesso ao ActiveCampaign.",
      contactId,
      tagId,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({
      error: "Erro interno no servidor.",
    });
  }
}