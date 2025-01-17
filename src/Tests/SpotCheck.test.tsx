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
import userEvent from '@testing-library/user-event';
import React from 'react';
import fs from 'node:fs';

import { SpotCheckContent } from '../SpotCheck/SpotCheck';
import JSZip from 'jszip';

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

jest.mock('../Common');

describe('SpotCheckContent', () => {

    test('SpotCheckContent - rendering', async () => {

        render(<SpotCheckContent />);

        expect(screen.getByText(/Loading report/i)).toBeDefined();

        expect(await screen.findByText(/\bListsandstaticsegments\b/i, { selector: '.primary-text' })).toBeInTheDocument();
    });

    test('SpotCheckContent - load build', async () => {

        render(<SpotCheckContent />);
        
        expect(await screen.findByText(/\bListsandstaticsegments\b/i, { selector: '.primary-text' })).toBeInTheDocument();
        expect(await screen.findByText(/\bListsandstaticsegments_dup\b/i, { selector: '.primary-text' })).toBeInTheDocument();

        expect(await screen.queryByText(/\bCreate_List\b/i)).toBeInTheDocument();
        expect(await screen.queryByText(/\bCreate_List_dup\b/i)).not.toBeInTheDocument();
    });

    test('SpotCheckContent - select build', async () => {

        render(<SpotCheckContent />);

        const suite = await screen.findByText(/\bListsandstaticsegments_dup\b/i, { selector: '.primary-text' });
        await userEvent.click(suite);

        expect(await screen.findByText(/\bCreate_List_dup\b/i)).toBeInTheDocument();
    });

    test('SpotCheckContent - select test', async () => {

        render(<SpotCheckContent />);

        const suite = await screen.findByText(/\bListsandstaticsegments_dup\b/i, { selector: '.primary-text' });
        await userEvent.click(suite);

        const test = await screen.findByText(/\bCreate_List_dup\b/i);
        await userEvent.click(test);

        const screenshots = await screen.findByRole('heading', { name: 'Create_List_dup' });
        expect(screenshots).toBeInTheDocument();

        const container = await screen.findByTestId('splitter-container');
        expect(container).toBeInTheDocument();
    });

    test('SpotCheckContent - drag splitter with mouse', async () => {

        render(<SpotCheckContent />);

        const suite = await screen.findByText(/\bListsandstaticsegments_dup\b/i, { selector: '.primary-text' });
        await userEvent.click(suite);

        const test = await screen.findByText(/\bCreate_List_dup\b/i);
        await userEvent.click(test);

        const screenshots = await screen.findByRole('heading', { name: 'Create_List_dup' });
        expect(screenshots).toBeInTheDocument();

        const leftImage = await screen.findByTestId('splitter-left');
        expect(leftImage).toBeInTheDocument();

        jest.spyOn(leftImage,'getBoundingClientRect').mockReturnValue({
            width: 50,
        } as DOMRect);
        
        const container = await screen.findByTestId('splitter-container');
        expect(container).toBeInTheDocument();

        jest.spyOn(container,'getBoundingClientRect').mockReturnValue({
            width: 100,
        } as DOMRect);
        
        const splitter = await screen.findByTestId('splitter-handle');
        expect(splitter).toBeInTheDocument();

        fireEvent.mouseDown(splitter, { clientX: 0, clientY: 0 });
        fireEvent.mouseMove(splitter, { clientX: 10, clientY: 0 });
        fireEvent.mouseUp(splitter);

        const leftImageWidth = getComputedStyle(leftImage).width;
        expect(leftImageWidth).toBe("60%");
    });
})
