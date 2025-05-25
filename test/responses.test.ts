import { describe, it, expect } from '@jest/globals';
import * as responses from '../src/responses';

const sampleProduct = {
    originalName: 'Human Experiment Forty Two',
    name: 'Human Experiment',
    extra: 'IPA',
    abv: 6.5,
    image: 'https://example.com/image.png',
    url: 'https://example.com/product',
    price: 1290,
    stock: 12,
};

describe('responses.formatProduct', () => {
    it('formats a product block correctly', () => {
        const block = responses.formatProduct(sampleProduct);
        const expected = {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text:
                    '*<https://example.com/product|Human Experiment>*\n' +
                    '_IPA_\n' +
                    'ABV: 6.5%\n' +
                    'Ár: 1290 Ft\n' +
                    'Raktáron: 12 db\n',
            },
            accessory: {
                type: 'image',
                image_url: 'https://example.com/image.png',
                alt_text: 'Human Experiment Forty Two',
            },
        };
        expect(JSON.stringify(block)).toBe(JSON.stringify(expected));
    });
    it('omits extra if not present', () => {
        const productNoExtra = { ...sampleProduct, extra: '' };
        const block = responses.formatProduct(productNoExtra);
        expect(block.text.text).not.toContain('_');
    });
});

describe('responses.formatHumanExperimentNotification', () => {
    it('formats a notification with the product block', () => {
        const result = responses.formatHumanExperimentNotification(sampleProduct) as { blocks: any[] };
        const expected = {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '🚨 *Új Human Experiment!* 🚨',
                    }
                },
                responses.formatProduct(sampleProduct)
            ]
        };
        expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    });
});

describe('responses.formatProductList', () => {
    it('formats a product list with divider and sorted products', () => {
        const products = [
            { ...sampleProduct, name: 'Brew One', originalName: 'Brew One' },
            { ...sampleProduct, name: 'Alpha', originalName: 'Alpha' },
        ];
        const result = responses.formatProductList(products) as { blocks: any[] };
        const expected = {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*A jelenlegi kínálat:*'
                    }
                },
                { type: 'divider' },
                responses.formatProduct({ ...sampleProduct, name: 'Alpha', originalName: 'Alpha' }),
                responses.formatProduct({ ...sampleProduct, name: 'Brew One', originalName: 'Brew One' })
            ]
        };
        expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    });
    it('formats an empty product list', () => {
        const result = responses.formatProductList([]) as { blocks: any[] };
        const expected = {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*A jelenlegi kínálat:*'
                    }
                },
                { type: 'divider' }
            ]
        };
        expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
    });
});
