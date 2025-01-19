/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {
    render,
    screen,
    fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import fs from 'node:fs';
import { RepoConfig } from '../Config/RepoConfig';

jest.mock('../Common');

describe('RepoConfig', () => {

    let confirmSpy;
    beforeAll(() => {
        confirmSpy = jest.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(jest.fn(() => true));
    });

    afterAll(() =>
        confirmSpy.mockRestore());

    test('RepoConfig - rendering', async () => {

        render(<RepoConfig />);

        expect(await screen.findByText(/SpotCheck Configuration/i)).toBeInTheDocument();

    });

    test('RepoConfig - add and save configuration', async () => {

        render(<RepoConfig />);

        const [, gitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder).toBeInTheDocument();
        fireEvent.change(gitFolder, { target: { value: 'src/tests' } });

        const [, artifact] = await screen.findAllByLabelText(/Artifact with test screenshots/i);
        expect(artifact).toBeInTheDocument();
        fireEvent.change(artifact, { target: { value: 'screenshots' } });

        const selectDefinition = await screen.findByLabelText(/Select build definition/i);
        expect(selectDefinition).toBeInTheDocument();
        fireEvent.click(selectDefinition);

        const definition = await screen.findByText(/Build Definition 1/);
        expect(definition).toBeInTheDocument();
        fireEvent.click(definition);

        const save = await screen.findByText(/Save/);
        fireEvent.click(save);

        const [gitFolder1, gitFolder2] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder1['value']).toBe('/path/to/git');
        expect(gitFolder2['value']).toBe('src/tests');
    });

    test('RepoConfig - add and cancel configuration', async () => {

        render(<RepoConfig />);

        const [, gitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder).toBeInTheDocument();
        fireEvent.change(gitFolder, { target: { value: 'src/tests' } });

        const [, artifact] = await screen.findAllByLabelText(/Artifact with test screenshots/i);
        expect(artifact).toBeInTheDocument();
        fireEvent.change(artifact, { target: { value: 'screenshots' } });

        const selectDefinition = await screen.findByLabelText(/Select build definition/i);
        expect(selectDefinition).toBeInTheDocument();
        fireEvent.click(selectDefinition);

        const definition = await screen.findByText(/Build Definition 1/);
        expect(definition).toBeInTheDocument();
        fireEvent.click(definition);

        const reset = await screen.findByText(/Reset/);
        fireEvent.click(reset);

        const [gitFolder1, gitFolder2] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder1['value']).toBe('/path/to/git');
        expect(gitFolder2['value']).toBe('');
    });

    test('RepoConfig - delete and save configuration', async () => {

        render(<RepoConfig />);

        const [gitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder['value']).toBe('/path/to/git');

        const [remove,] = await screen.findAllByLabelText(/Remove configuration/i);
        expect(remove).toBeInTheDocument();
        fireEvent.click(remove);

        const save = await screen.findByText(/Save/);
        fireEvent.click(save);

        const [deletedGitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(deletedGitFolder['value']).toBe('');
    });


    test('RepoConfig - delete and reset configuration', async () => {

        render(<RepoConfig />);

        const [gitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(gitFolder['value']).toBe('/path/to/git');

        const [remove,] = await screen.findAllByLabelText(/Remove configuration/i);
        expect(remove).toBeInTheDocument();
        fireEvent.click(remove);

        const reset = await screen.findByText(/Reset/);
        fireEvent.click(reset);

        const [resetGitFolder] = await screen.findAllByLabelText(/Git folder with baseline screenshots/i);
        expect(resetGitFolder['value']).toBe('/path/to/git');
    });
});