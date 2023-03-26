import { faker } from "@faker-js/faker";
import randomColor from "randomcolor";
import { v4 as uuidv4 } from "uuid";

import { CursorData } from "../types";

const {
  name: { firstName, lastName },
} = faker;

export function cursorData(name: string): CursorData {
  return {
    color: randomColor({
      luminosity: "dark",
      alpha: 1,
      format: "hex",
    }),
    name,
  };
}

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return hexColor + normalized.toString(16).toUpperCase();
}

export function genUniqueId() {
  return uuidv4().slice(0, 8);
}

export function curateDocuments(documents: any[]) {
  return documents.map((document) => ({
    ...document,
    itemId: document.id.toString(),
    id: genUniqueId(),
  }));
}

export function JsonToArray(json) {
  var ret = new Uint8Array(Object.keys(json).length);
  for (var i = 0; i < Object.keys(json).length; i++) {
    ret[i] = json[i];
  }
  return ret;
}
