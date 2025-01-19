/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {
    render,
    screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RepoConfig } from '../Config/RepoConfig';

jest.mock('../Common');

describe('RepoConfig', () => {

    test('RepoConfig - rendering', async () => {

        render(<RepoConfig />);

        expect(screen.findByText(/SpotCheck Configuration/i)).toBeDefined();

    });
});