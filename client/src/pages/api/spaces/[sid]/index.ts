import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sid } = req.query;
  const id = parseInt(sid as string);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "GET") {
      const spaceMember = await prisma.spaceMember.findFirst({
        where: {
          OR: [
            {
              spaceId: id,
              pendingEmail: session.user?.email,
            },
            {
              spaceId: id,
              memberId: session.sub,
            },
          ],
        },
      });
      if (!spaceMember) {
        res.status(400).send({ error: "No permission" });
      }
      const space = await prisma.space.findFirst({
        where: { id },
        include: {
          documents: true,
        },
      });

      if (spaceMember && !spaceMember.memberId) {
        await prisma.spaceMember.update({
          where: {
            id: spaceMember.id,
          },
          data: {
            memberId: session.sub,
          },
        });
      }
      if (spaceMember && !spaceMember.active) {
        await prisma.spaceMember.update({
          where: {
            id: spaceMember.id,
          },
          data: {
            active: true,
          },
        });
      }
      res.status(200).json(space);
    } else {
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
  }
  res.end();
}
