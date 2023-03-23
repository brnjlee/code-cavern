import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

import gettingStarted from "../../../data/gettingStarted.json";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log(req);
  const session = await getServerSession(req, res, authOptions);
  console.log(session);
  const token = await getToken({ req });
  if (session) {
    if (req.method === "GET") {
      const spaces = await prisma.space.findMany({
        where: { createdById: session.sub },
      });
      res.status(200).json(spaces);
    } else {
      // const body = JSON.parse(req.body);
      const name = req.body.name?.trim();
      if (!name) {
        res.status(400).send("Invalid name");
      }
      const newSpace = await prisma.space.create({
        data: {
          name,
          createdById: session.sub,
        },
      });
      const firstDocument = await prisma.document.create({
        data: {
          type: "TEXT",
          name: "Getting Started",
          spaceId: newSpace.id,
        },
      });
      const firstDocumentData = await prisma.documentData.create({
        data: {
          data: gettingStarted,
          documentId: firstDocument.id,
        },
      });
      res.status(200).json(newSpace);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
  res.end();
}
