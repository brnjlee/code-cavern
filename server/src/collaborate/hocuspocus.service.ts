import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Database } from '@hocuspocus/extension-database';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';
import { debounce } from 'debounce';

function JsonToArray(json) {
  let ret = new Uint8Array(Object.keys(json).length);
  for (let i = 0; i < Object.keys(json).length; i++) {
    ret[i] = json[i];
  }
  return ret;
}

function binArrayToJson(binArray) {
  let ret = {};
  for (let i = 0; i < binArray.length; i++) {
    ret[i] = parseInt(binArray[i]);
  }
  return ret;
}

const prisma = new PrismaService();
let debounced: any;
@Injectable()
export class HocusPocusService {
  private readonly server = Server.configure({
    port: parseInt(process.env.PORT || '8080'),
    extensions: [
      new Logger(),
      new Database({
        fetch: async ({ documentName }) => {
          return new Promise((resolve, reject) => {
            prisma.documentData
              .findFirst({
                where: {
                  documentId: parseInt(documentName),
                },
              })
              .then((res) => {
                if (!res) {
                  reject('Document data not found');
                }
                resolve(JsonToArray(res.data));
              });
          });
        },
        store: async ({ documentName, state }) => {
          prisma.documentData
            .update({
              where: { documentId: parseInt(documentName) },
              data: {
                data: binArrayToJson(state) as any,
              },
            })
            .then((res) => {
              if (!res) {
                console.log('Document failed to save');
              }
            });
        },
      }),
    ],
    async onLoadDocument(data) {
      if (data.document.isEmpty('content')) {
        const insertDelta = slateNodesToInsertDelta([
          { type: 'paragraph', children: [{ text: '' }] },
        ] as any);
        const sharedRoot: any = data.document.get('content', Y.XmlText);
        sharedRoot.applyDelta(insertDelta);
      }
      return data.document;
    },

    async onChange(data) {
      const save = () => {
        console.log(
          `Document ${data.documentName} changed by ${data.context.user.name}`,
        );
      };

      debounced?.clear();
      debounced = debounce(() => save, 4000);
      debounced();
    },

    // async onChange(data) {
    //   const save = () => {
    //     console.log(
    //       `Document ${data.documentName} changed by ${data.context.user.name}`
    //     );
    //   };
    // },
  });

  handleConnection(socket, req, id, context) {
    console.log(socket);
    this.server.handleConnection(socket, req, id, context);
  }
}
