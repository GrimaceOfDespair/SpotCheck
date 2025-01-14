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

    static async createMirror(source: string): Promise<string> {

        const sourceFolder = path.join(__dirname, source);
        const targetFolder = await Temp.createFolder();

        await fs.promises.cp(sourceFolder, targetFolder, { recursive: true });

        return targetFolder;
    }
}