import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import * as Y from "yjs";
import { slateNodesToInsertDelta } from "@slate-yjs/core";

import emptyDoc from "../../../data/emptyDoc.json";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log(req);
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    if (req.method === "POST") {
      const newDocument = await prisma.document.create({
        data: {
          type: req.body.type,
          name: "Untitled",
          spaceId: parseInt(req.body.spaceId),
        },
      });
      const yDoc = new Y.Doc();
      if (req.body.type === "TEXT") {
        const sharedType = yDoc.get("content", Y.XmlText);
        sharedType.applyDelta(slateNodesToInsertDelta(emptyDoc as any));
      }

      const newDocumentData = await prisma.documentData.create({
        data: {
          data: Y.encodeStateAsUpdate(yDoc) as any,
          documentId: newDocument.id,
        },
      });
      res.status(200).json(newDocument);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
  res.end();
}
