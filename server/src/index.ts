import express, { Request, Response } from 'express';
import expressWebsockets from 'express-ws'
import { Server } from '@hocuspocus/server'
import { Logger } from '@hocuspocus/extension-logger';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import { SQLite } from '@hocuspocus/extension-sqlite'
import * as Y from 'yjs';
import {debounce} from 'debounce'
import initialValue from './data/initialValue.json';

let debounced:any
const PORT: number = 1234;
const server = Server.configure({
    port: PORT,
    extensions: [
        new Logger(),
        new SQLite({
            database: 'db.sqlite',
        }),
    ],
    async onLoadDocument(data) {
        // // Load the initial value in case the document is empty
        if (data.document.isEmpty('content')) {
            const insertDelta = slateNodesToInsertDelta(initialValue);
            const sharedRoot:any = data.document.get('content', Y.XmlText);
            sharedRoot.applyDelta(insertDelta); 
        }
        
        return data.document;
    },
    
    async onChange(data) {
      const save = () => {
        console.log(`Document ${data.documentName} changed by ${data.context.user.name}`)
      }
  
      debounced?.clear()
      debounced = debounce(() => save, 4000)
      debounced()
    },
})

const { app } = expressWebsockets(express())

app.get('/', (req: Request, res: Response): void => {
    res.send('Hello World!')
})
app.ws('/collaboration/:document', (websocket, request) => {
    const context = {
      user: {
        id: 1234,
        name: 'Jane',
      },
    }
    server.handleConnection(websocket, request, request.params.document, context)
})
app.listen(PORT, (): void => {
    console.log('Listening on http://127.0.0.1:', PORT);
});