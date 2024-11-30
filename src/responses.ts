import * as scraping from "./scraping";
import { RespondArguments } from "@slack/bolt";

interface ProductBlock {
    type: string;
    text: {
        type: string;
        text: string;
    };
    accessory: {
        type: string;
        image_url: string;
        alt_text: string;
    };
}

export function formatProduct(product: scraping.DetailedProduct): ProductBlock {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text:
                `*<${product.url}|${product.name}>*\n` +
                (product.extra ? `_${product.extra}_\n` : "") +
                `ABV: ${product.abv}%\n` +
                `Ár: ${product.price} Ft\n` +
                `Raktáron: ${product.stock} db\n`
            ,
        },
        accessory: {
            type: "image",
            image_url: product.image,
            alt_text: product.originalName,
        }
    };
}

export function formatHumanExperimentNotification(heCandidate: scraping.DetailedProduct): RespondArguments {
    return {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "🚨 *Új Human Experiment!* 🚨",
                }
            },
            formatProduct(heCandidate),
        ]
    };
}

export function formatProductList(products: scraping.DetailedProduct[]): RespondArguments {
    return {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*A jelenlegi kínálat:*"
                }
            },
            {
                "type": "divider"
            },
            ...products
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product) => formatProduct(product))
        ],
    };
};
