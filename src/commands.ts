import { RespondArguments } from "@slack/bolt";
import * as scraping from "./scraping";
import util from 'util';

export async function dispatch(command: string): Promise<RespondArguments> {
    const allProducts = await scraping.allProducts();
    // console.log(util.inspect(allProducts, { showHidden: false, depth: null, colors: true }));

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
