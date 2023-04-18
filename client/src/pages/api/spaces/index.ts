import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import * as Y from "yjs";
import { slateNodesToInsertDelta } from "@slate-yjs/core";

import gettingStarted from "../../../data/gettingStarted.json";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "GET") {
      const spaces = await prisma.space.findMany({
        where: { createdById: session.sub },
      });
      res.status(200).json(spaces);
    } else {
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
      const newSpaceMember = await prisma.spaceMember.create({
        data: {
          spaceId: newSpace.id,
          memberId: session.sub,
          role: "ADMIN",
        },
      });
      const firstDocument = await prisma.document.create({
        data: {
          type: "TEXT",
          name: "Getting Started",
          spaceId: newSpace.id,
        },
      });
      const yDoc = new Y.Doc();
      const sharedType = yDoc.get("content", Y.XmlText);
      sharedType.applyDelta(slateNodesToInsertDelta(gettingStarted as any));

      const firstDocumentData = await prisma.documentData.create({
        data: {
          data: Y.encodeStateAsUpdate(yDoc) as any,
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
