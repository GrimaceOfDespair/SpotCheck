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

import { SpotCheckContent } from '../SpotCheck/SpotCheck';

jest.mock('../Common');

describe('SpotCheckContent', () => {

    test('SpotCheckContent - rendering', () => {

        render(<SpotCheckContent />);
        const textElement = screen.getByText(/No test suites found/i);
        expect(textElement).toBeDefined();
    });

})