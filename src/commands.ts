import { RespondArguments } from "@slack/bolt";
import * as scraping from "./scraping";
import * as notifications from "./notifications";

const HELP_REGEX = /(help)|(hogy(an?)\??)|(segítség)|(segits)|(segiccse)/i;
const LS_REGEX = /(ls)|(mi ?van\??)/i;
const HE_REGEX = /(he\??)/i;

export async function dispatch(command: string): Promise<RespondArguments> {
    if (HELP_REGEX.test(command)) {
        return showHelp();
    } else if (LS_REGEX.test(command)) {
        return await listProducts();
    } else if (HE_REGEX.test(command)) {
        const products = await scraping.allProductsWithDetails();
        const newHe = await notifications.checkForHumanExperiment(products);
        if (newHe) {
            return {
                response_type: "ephemeral",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "🚨 *Új Human Experiment!* 🚨",
                        }
                    },
                    formatProduct(newHe),
                ]
            };
        } else {
            return {
                response_type: "ephemeral",
                text: "Nincs új Human Experiment. 😢"
            };
        }
    } else {
        return showHelp();
    }
}

function showHelp(): Promise<RespondArguments> {
    return Promise.resolve({
        response_type: "ephemeral",
        text:
            "Ez a bot a Brew Your Mind sörfőzde kínálatát mutatja meg. Íme a használható parancsok:\n" +
            "  - `/bym help`: megjeleníti ezt a súgót\n" +
            "  - `/bym ls`: listázza a jelenlegi kínálatot\n"
    });
}

async function listProducts(): Promise<RespondArguments> {
    const allProducts = await scraping.allProducts();

    return {
        response_type: "ephemeral",
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
            ...allProducts.map((product) => formatProduct(product))
        ],
    };
}

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

function formatProduct(product: scraping.Product): ProductBlock {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `*<${product.url}|${product.originalName}>*`,
            // TODO add more properties from detailed product?
        },
        accessory: {
            type: "image",
            image_url: product.image,
            alt_text: product.originalName,
        }
    };
}
