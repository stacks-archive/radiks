import { Indexer, CentralSaveData, FindQuery } from "./indexer";
import { Model, getConfig } from "..";

import OrbitDB from 'orbit-db';

export class OrbitDbIndexer implements Indexer {

    private db: any;

    constructor(ipfs) {
        const { apiServer } = getConfig();
        ipfs.on('error', (e) => console.error(e))
        ipfs.on('ready', async () => {
            const orbitdb = await OrbitDB.createInstance(ipfs)

            // Create / Open a database
            const db = await orbitdb.open(apiServer, {
                // If database doesn't exist, create it
                create: true,
                overwrite: true,
                // Load only the local version of the database,
                // don't load the latest from the network yet
                localOnly: false,
                type: 'docs',
                write: ['*'],
              });

            db.events.on('ready', () => {
                console.log(`Database is ready!`)
            });
            // Load the latest local copy of the DB.
            await db.load();

            // Listen for updates from peers
            db.events.on('replicated', (address) => {
                console.log(db.iterator({ limit: -1 }).collect())
            })
        });
    }

    sendNewGaiaUrl(gaiaURL: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async find(query: FindQuery): Promise<any> {
        const keys = Object.keys(query);
        const all = await this.db.query((doc) => {
            let valid: boolean;
            for (let key in keys) {
                valid = valid && doc[key] === query[key];
            }
            return valid;
        });
        return all;
    }

    async count(query: FindQuery): Promise<any> {
        const x = await this.find(query);
        return x.length;
    }

    async fetchCentral(key: string, username: string, signature: string) {
        // const queryString = stringify({ username, signature });
        return await this.db.get(key);
    }

    async saveCentral(data: CentralSaveData) {
        await this.db.put(data);
        return true; // successfully saved!
    }
    
    async destroyModel(model: Model) {
        const hash = await this.db.del(model._id)
        return true;
    }
}