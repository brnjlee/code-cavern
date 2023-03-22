import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sid } = req.query;
  const id = parseInt(sid);
  const token = await getToken({ req });
  if (token) {
    if (req.method === "GET") {
      const documents = await prisma.document.findMany({
        where: { spaceId: id },
      });
      res.status(200).json(documents);
    } else {
    }
  } else {
    res.status(401).send("Unauthorized");
  }
  res.end();
}
