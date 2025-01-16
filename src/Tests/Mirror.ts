import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import crypto from 'node:crypto';

export class Mirror {
    static async createMirror(source: string): Promise<string> {

        const sourceFolder = path.join(__dirname, source);

        const targetFolder = path.join(
            os.tmpdir(),
            crypto.randomBytes(16).toString('hex'));

        await fs.promises.mkdir(targetFolder, { recursive: true });

        await fs.promises.cp(sourceFolder, targetFolder, { recursive: true }, );

        return targetFolder;
    }
}