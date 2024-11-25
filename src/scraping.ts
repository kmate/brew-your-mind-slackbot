import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from 'url';

export async function allProducts() {
    const products = process.env.BYM_URLS_TO_SCRAPE.split(",").flatMap(async (url) => {
        const baseUrl = new URL(url).origin;
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        return $.extract({
            products: [{
                selector: "div.product-card",
                value: {
                    name: {
                        selector: "h2.product-card__title",
                        value: (el, _) => {
                            // TODO split percentage, name etc.
                            const text = $(el).text();
                            return text.trim();
                        },
                    },
                    image: {
                        selector: "img.product-card__image",
                        value: "src",
                    },
                    link: {
                        selector: "a",
                        value: (el, _) => {
                            const href = el.attribs["href"];
                            return new URL(href, baseUrl).toString();
                        }
                    },
                }
            }]
        });
    });
    return (await Promise.all(products)).flatMap((x) => x.products);
}
