import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function dirname() {
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename);
}

export function getPath(file: string) {
    return path.join(dirname(), file);
}

export function createMockRunner() {
    const __dirname = dirname();
    const taskPath: string = path.join(__dirname, '..', '..', 'SpotCheckPullRequest', 'SpotCheckPullRequest.ts');

    return new TaskMockRunner(taskPath);
}