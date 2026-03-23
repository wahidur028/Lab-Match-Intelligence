import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeMatchBody } from "@workspace/api-zod";

const router = Router();

router.post("/analyze", async (req, res) => {
  const parsed = AnalyzeMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { studentProfile, targetLab } = parsed.data;

  const systemPrompt = `You are an expert academic advisor and research strategist specializing in MS/PhD admissions. 
You analyze student profiles against lab requirements to produce detailed, actionable match reports.
Always respond with valid JSON matching the exact structure requested.`;

  const userPrompt = `Analyze this student profile against the target lab and produce a comprehensive match report.

STUDENT PROFILE:
- Name: ${studentProfile.name}
- Research Interests: ${studentProfile.researchInterests}
- Resume/CV: ${studentProfile.resumeText}
- GPA: ${studentProfile.gpa ?? "Not provided"}
- Publications: ${studentProfile.publicationCount ?? "Not provided"}
- Skills: ${studentProfile.skills?.join(", ") ?? "Not listed"}
- LinkedIn: ${studentProfile.linkedinUrl ?? "Not provided"}
- GitHub: ${studentProfile.githubUrl ?? "Not provided"}
- Google Scholar: ${studentProfile.scholarUrl ?? "Not provided"}

TARGET LAB:
- Professor: ${targetLab.professorName}
- University: ${targetLab.university}
- Department: ${targetLab.department}
- Research Focus: ${targetLab.researchFocus}
- Recent Papers: ${targetLab.recentPapers ?? "Not provided"}
- Lab Website: ${targetLab.labWebsite ?? "Not provided"}

Return a JSON object with this exact structure:
{
  "matchScore": <integer 0-100>,
  "synergy": {
    "score": <integer 0-100>,
    "alignedAreas": [<list of strings where student's background aligns with lab>],
    "gaps": [<list of strings where student is missing lab requirements>],
    "techStackMatch": [<list of technologies/tools student has that lab uses>],
    "missingTechStack": [<list of lab's technologies student is missing>]
  },
  "trustAudit": {
    "overallTrust": "<high|medium|low>",
    "flags": [
      {
        "claim": "<specific claim from the resume>",
        "status": "<verified|unverified|suspicious>",
        "reason": "<explanation>"
      }
    ],
    "verifiedClaims": [<list of claims that appear credible>]
  },
  "labIntelligence": {
    "activeKeywords": [<list of 5-10 key research terms from the lab's focus>],
    "techStack": [<list of technologies/methods likely used in the lab>],
    "researchTrajectory": "<2-3 sentence summary of the lab's current research direction>",
    "openProblems": [<list of 3-5 likely open research problems the lab is working on>]
  },
  "tailoredResumeBullets": [<list of 5-7 bullet points rewritten to highlight relevance to this specific lab>],
  "emailDraft": "<a complete, professional cold email draft to the professor. Must mention 1-2 specific recent papers if provided. Should be warm but concise, around 200-250 words>",
  "strategicAdvice": "<3-4 paragraphs of strategic advice on how to strengthen this application, what courses or projects to highlight, and realistic assessment of admission chances>"
}

Be honest and critical in the trust audit. Flag any discrepancies between stated expertise and verifiable evidence.
For the match score: 0-30 = poor fit, 31-60 = moderate fit, 61-80 = strong fit, 81-100 = excellent fit.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    res.status(500).json({ error: "No response from AI" });
    return;
  }

  const analysisResult = JSON.parse(content);
  res.json(analysisResult);
});

export default router;
