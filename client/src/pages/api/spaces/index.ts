import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

import gettingStarted from "../../../data/gettingStarted.json";

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log(req);
  const token = await getToken({ req });
  if (token) {
    if (req.method === "GET") {
      const spaces = await prisma.space.findMany({
        where: { createdById: token.sub },
      });
      res.status(200).json(spaces);
    } else {
      // const body = JSON.parse(req.body);
      const name = req.body.name?.trim();
      if (!name) {
        res.status(400).send("Invalid name");
      }
      console.log(name);
      const newSpace = await prisma.space.create({
        data: {
          name,
          createdById: token.sub,
        },
      });
      const firstDocument = await prisma.document.create({
        data: {
          type: "TEXT",
          name: "Getting Started",
          data: gettingStarted,
          spaceId: newSpace.id,
        },
      });
      res.status(200).json(newSpace);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
  res.end();
}
