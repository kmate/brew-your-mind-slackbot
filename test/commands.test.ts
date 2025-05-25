import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as commands from '../src/commands';
import * as scraping from '../src/scraping';
import * as notifications from '../src/notifications';
import * as responses from '../src/responses';

// Mock dependencies
jest.mock('../src/scraping');
jest.mock('../src/notifications');
jest.mock('../src/responses');

describe('commands.dispatch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows help for help command', async () => {
        const result = await commands.dispatch('help');
        expect(result.text).toContain('használható parancsok');
    });

    it('shows help for unknown command', async () => {
        const result = await commands.dispatch('foobar');
        expect(result.text).toContain('használható parancsok');
    });

    it('lists products for ls command', async () => {
        const fakeProducts = [{ name: 'foo' }];
        (scraping.allProductsWithDetails as any).mockResolvedValue(fakeProducts);
        (responses.formatProductList as any).mockReturnValue({ blocks: ['block'] });
        const result = await commands.dispatch('ls');
        expect(result.response_type).toBe('ephemeral');
        expect((result as any).blocks).toEqual(['block']);
    });

    it('returns human experiment notification if found', async () => {
        (scraping.allProductsWithDetails as any).mockResolvedValue(['p']);
        (notifications.checkForHumanExperiment as any).mockResolvedValue('he');
        (responses.formatHumanExperimentNotification as any).mockReturnValue({ blocks: ['heblock'] });
        const result = await commands.dispatch('he');
        expect(result.response_type).toBe('ephemeral');
        expect((result as any).blocks).toEqual(['heblock']);
    });

    it('returns no human experiment message if not found', async () => {
        (scraping.allProductsWithDetails as any).mockResolvedValue(['p']);
        (notifications.checkForHumanExperiment as any).mockResolvedValue(undefined);
        const result = await commands.dispatch('he');
        expect(result.response_type).toBe('ephemeral');
        expect(result.text).toContain('Nincs új Human Experiment');
    });
});
