import { nanoid } from "nanoid";
import { z } from "zod";
import { createProfessor } from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { ok } from "~/server/utils/response";

const professorSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  universityName: z.string().min(2).max(300),
  department: z.string().max(200).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  researchArea: z.string().max(500).nullable().optional(),
  deadlineAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { db, user } = await requireUser(event);
  const body = await readBody(event);
  const input = professorSchema.parse(body);

  const created = await createProfessor(db, {
    id: nanoid(),
    userId: user.id,
    professorName: input.name,
    email: input.email.toLowerCase(),
    universityName: input.universityName,
    department: input.department ?? null,
    country: input.country ?? null,
    researchArea: input.researchArea ?? null,
    deadlineAt: input.deadlineAt ?? null,
    notes: input.notes ?? null,
    status: "draft",
  });

  return ok(created);
});
