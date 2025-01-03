/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved
} from '@testing-library/react';
import React from 'react';
import fs from 'node:fs';

import { SpotCheckContent } from '../SpotCheck/SpotCheck';
import JSZip from 'jszip';

jest.mock('../Common');

global.fetch = async (request: string | Request | URL): Promise<Response> => {
    const url = request as string;
    const file = await fs.promises.readFile(url);
    const arrayBuffer: () => Promise<ArrayBuffer> = async () =>
        file;

    return {
        url,
        status: 200,
        ok: true,
        arrayBuffer
    } as Response;
}

describe('SpotCheckContent', () => {

    test('SpotCheckContent - rendering', () => {

        render(<SpotCheckContent />);
        expect(screen.getByText(/Loading report/i)).toBeDefined();
    });

    test('SpotCheckContent - load build', async () => {

        render(<SpotCheckContent />);
        expect(await screen.findByText(/Listsandstaticsegments/i)).toBeInTheDocument();
    });

    test('SpotCheckContent - load build', async () => {

        render(<SpotCheckContent />);

        await screen.findByText(/Listsandstaticsegments/i);

        

    });

})