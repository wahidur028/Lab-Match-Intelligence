import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 14000);
  } finally {
    clearTimeout(timeout);
  }
}

router.post("/scrape-lab", async (req, res) => {
  const { googleScholarUrl, labWebsiteUrl } = req.body as {
    googleScholarUrl?: string;
    labWebsiteUrl?: string;
  };

  if (!googleScholarUrl && !labWebsiteUrl) {
    res.status(400).json({ error: "At least one URL is required" });
    return;
  }

  let scholarText = "";
  let labWebsiteText = "";
  const fetchErrors: string[] = [];

  if (googleScholarUrl) {
    try {
      scholarText = await fetchPageText(googleScholarUrl);
      req.log.info({ url: googleScholarUrl, chars: scholarText.length }, "Fetched Google Scholar page");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      fetchErrors.push(`Google Scholar: ${msg}`);
      req.log.warn({ url: googleScholarUrl, error: msg }, "Failed to fetch Google Scholar page");
    }
  }

  if (labWebsiteUrl) {
    try {
      labWebsiteText = await fetchPageText(labWebsiteUrl);
      req.log.info({ url: labWebsiteUrl, chars: labWebsiteText.length }, "Fetched lab website");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      fetchErrors.push(`Lab website: ${msg}`);
      req.log.warn({ url: labWebsiteUrl, error: msg }, "Failed to fetch lab website");
    }
  }

  if (!scholarText && !labWebsiteText) {
    res.status(422).json({
      error:
        fetchErrors.join(". ") ||
        "Could not retrieve content from the provided URLs. Please check that the URLs are correct and publicly accessible.",
    });
    return;
  }

  const contentSections: string[] = [];
  if (scholarText) {
    contentSections.push(`=== GOOGLE SCHOLAR PAGE CONTENT ===\n${scholarText}`);
  }
  if (labWebsiteText) {
    contentSections.push(`=== LAB WEBSITE CONTENT ===\n${labWebsiteText}`);
  }

  const prompt = `You are an expert at extracting structured academic profile information from web page text.

${contentSections.join("\n\n")}

Based ONLY on the content above, extract and return a JSON object with these fields:

{
  "professorName": "<full name of the professor/PI>",
  "university": "<university or institution name>",
  "department": "<department or school name>",
  "researchFocus": "<3-5 sentence summary of the professor's main research themes, methodologies, and application areas. Be specific and technical.>",
  "recentPapers": "<Formatted readable list of up to 8 recent paper titles with years. Example: '• Neural Architecture Search via Evolutionary Algorithms (2024)\\n• Efficient Transformers for Scientific Computing (2023)'>",
  "activeKeywords": ["<research keyword 1>", "<research keyword 2>", ...up to 12 keywords],
  "hIndex": <h-index as integer if visible, or null>,
  "citationCount": <total citation count as integer if visible, or null>
}

Rules:
- Only use information explicitly present in the page content
- If a field cannot be found, use null or an empty string
- For recentPapers, prefer papers from the last 3-5 years; include years
- activeKeywords should be specific technical terms (e.g. "Federated Learning", "Graph Neural Networks"), not generic words
- If this is a Google Scholar page, focus on extracting publications from the citations table
- Return ONLY valid JSON, no other text`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = aiResponse.choices[0]?.message?.content;
  if (!content) {
    res.status(500).json({ error: "AI extraction failed to return content" });
    return;
  }

  const extracted = JSON.parse(content);
  res.json({
    ...extracted,
    fetchErrors: fetchErrors.length > 0 ? fetchErrors : undefined,
  });
});

export default router;
