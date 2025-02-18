import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import crypto from 'node:crypto';

export class Temp {
    static async createFolder(): Promise<string> {

        const folder = path.join(
            os.tmpdir(),
            crypto.randomBytes(16).toString('hex'));

        await fs.promises.mkdir(folder, { recursive: true });

        return folder;
    }
}