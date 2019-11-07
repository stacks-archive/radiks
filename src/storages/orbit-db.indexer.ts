import { Indexer, CentralSaveData, FindQuery } from "./indexer";
import { Model } from "..";

const OrbitDB = require('orbit-db');

export class OrbitDbIndexer implements Indexer {

    constructor(ipfs, dbName = 'default-radiks') {
        ipfs.on('error', (e) => console.error(e))
        ipfs.on('ready', async () => {
            const orbitdb = await OrbitDB.createInstance(ipfs)

            // Create / Open a database
            const db = await orbitdb.log(dbName)
            await db.load()

            // Listen for updates from peers
            db.events.on('replicated', (address) => {
                console.log(db.iterator({ limit: -1 }).collect())
            })

            // Add an entry
            const hash = await db.add('world')
            console.log(hash)

            // Query
            const result = db.iterator({ limit: -1 }).collect()
            console.log(JSON.stringify(result, null, 2))
        });
    }

    sendNewGaiaUrl(gaiaURL: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    find(query: FindQuery): Promise<any> {
        throw new Error("Method not implemented.");
    }

    count(query: FindQuery): Promise<any> {
        throw new Error("Method not implemented.");
    }

    fetchCentral(key: string, username: string, signature: string) {
        throw new Error("Method not implemented.");
    }

    saveCentral(data: CentralSaveData) {
        throw new Error("Method not implemented.");
    }
    
    destroyModel(model: Model) {
        throw new Error("Method not implemented.");
    }
}