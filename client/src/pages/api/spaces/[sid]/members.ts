import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    let { sid } = req.query;
    const spaceId = parseInt(sid as string);
    if (req.method === "GET") {
      const spaceMembers = await prisma.spaceMember.findMany({
        where: { spaceId },
        include: {
          member: true,
        },
      });
      res.status(200).json(spaceMembers);
    } else if (req.method === "POST") {
      const existingSpaceMember = await prisma.spaceMember.findFirst({
        where: { spaceId, pendingEmail: req.body.email },
      });
      if (existingSpaceMember) {
        res.status(400).send({ error: "Member already exists" });
      }
      const invitedUser = await prisma.user.findFirst({
        where: { email: req.body.email },
      });

      const newSpaceMember = await prisma.spaceMember.create({
        data: {
          spaceId,
          memberId: invitedUser ? invitedUser.id : null,
          pendingEmail: invitedUser ? invitedUser.email : req.body.email,
          role: "EDIT",
        },
      });
      res.status(200).json(newSpaceMember);
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
  }
  res.end();
}
