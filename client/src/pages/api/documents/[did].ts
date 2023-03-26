import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { did } = req.query;
  const id = parseInt(did as string);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "GET") {
      const document = await prisma.document.findFirst({
        where: { id },
        include: {
          data: true,
        },
      });
      res.status(200).json(document);
    } else {
    }
  } else {
    res.status(401).send("Unauthorized");
  }
  res.end();
}
