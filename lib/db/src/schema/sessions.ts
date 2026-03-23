import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  professorName: text("professor_name").notNull(),
  university: text("university").notNull(),
  matchScore: integer("match_score").notNull(),
  studentProfile: jsonb("student_profile").notNull(),
  targetLab: jsonb("target_lab").notNull(),
  analysisResult: jsonb("analysis_result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
