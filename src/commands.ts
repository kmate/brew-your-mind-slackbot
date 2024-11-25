import { RespondArguments } from "@slack/bolt";
import * as scraping from "./scraping";
import util from 'util';

const helpRegex = /(help)|(hogy(an?)\??)|(segítség)|(segits)|(segiccse)/i;
const lsRegex = /(ls)|(mi ?van\??)/i;

export async function dispatch(command: string): Promise<RespondArguments> {
    if (helpRegex.test(command)) {
        return showHelp();
    } else if (lsRegex.test(command)) {
        return await listProducts();
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
            ...allProducts.map((product) => ({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*<${product.link}|${product.name}>*`
                },
                accessory: {
                    type: "image",
                    image_url: product.image,
                    alt_text: product.name
                }
            }))
        ],
    };
}
