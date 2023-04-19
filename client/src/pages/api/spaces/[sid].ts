import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
      const space = await prisma.space.findFirst({
        where: { id },
        include: {
          documents: true,
        },
      });
      res.status(200).json(space);
    } else {
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
  }
  res.end();
}
