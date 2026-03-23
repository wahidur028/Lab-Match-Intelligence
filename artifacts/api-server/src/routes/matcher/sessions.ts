import { Router } from "express";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSessionBody } from "@workspace/api-zod";

const router = Router();

router.post("/sessions", async (req, res) => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { studentProfile, targetLab, analysisResult } = parsed.data;

  const [session] = await db
    .insert(sessionsTable)
    .values({
      studentName: studentProfile.name,
      professorName: targetLab.professorName,
      university: targetLab.university,
      matchScore: analysisResult.matchScore,
      studentProfile: studentProfile as any,
      targetLab: targetLab as any,
      analysisResult: analysisResult as any,
    })
    .returning();

  res.status(201).json({
    id: session.id,
    studentName: session.studentName,
    professorName: session.professorName,
    university: session.university,
    matchScore: session.matchScore,
    studentProfile: session.studentProfile,
    targetLab: session.targetLab,
    analysisResult: session.analysisResult,
    createdAt: session.createdAt,
  });
});

router.get("/sessions", async (req, res) => {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .orderBy(sessionsTable.createdAt);

  res.json(
    sessions.map((s) => ({
      id: s.id,
      studentName: s.studentName,
      professorName: s.professorName,
      university: s.university,
      matchScore: s.matchScore,
      studentProfile: s.studentProfile,
      targetLab: s.targetLab,
      analysisResult: s.analysisResult,
      createdAt: s.createdAt,
    }))
  );
});

router.get("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json({
    id: session.id,
    studentName: session.studentName,
    professorName: session.professorName,
    university: session.university,
    matchScore: session.matchScore,
    studentProfile: session.studentProfile,
    targetLab: session.targetLab,
    analysisResult: session.analysisResult,
    createdAt: session.createdAt,
  });
});

router.delete("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  const result = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.status(204).send();
});

export default router;
