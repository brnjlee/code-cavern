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
      const spaces = await prisma.spaceMember.findMany({
        where: {
          memberId: session.sub,
          active: true,
        },
        select: {
          space: true,
        },
      });
      res.status(200).json(spaces);
    } else {
      const name = req.body.name?.trim();
      if (!name) {
        res.status(400).send({ error: "Invalid name" });
      }
      const newSpace = await prisma.space.create({
        data: {
          name,
          createdById: session.sub,
        },
      });
      await prisma.spaceMember.create({
        data: {
          spaceId: newSpace.id,
          memberId: session.sub,
          pendingEmail: session.user?.email,
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

      await prisma.documentData.create({
        data: {
          data: Y.encodeStateAsUpdate(yDoc) as any,
          documentId: firstDocument.id,
        },
      });
      res.status(200).json(newSpace);
    }
  } else {
    res.status(401).send({ error: "Unauthorized" });
  }
  res.end();
}
