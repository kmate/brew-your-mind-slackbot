import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export interface Product {
    originalName: string;
    name: string;
    extra: string;
    abv: number;
    image: string;
    url: string;
}

export interface ParsedProductName {
    name: string;
    extra: string;
    abv: number;
}

const NAME_REGEXES = [
    /^(?<name>.*?)\:\s+(?<extra>.*?)\s*\-?\s*(?<abv>\d+(?:[\.,]\d+)?)\s*%$/,
    /^(?<name>.*?)\s+\-\s+(?<extra>.*?)\s*\-?\s*(?<abv>\d+(?:[\.,]\d+)?)\s*%$/,
    /^(?<name>.*?)\s+(?<extra>APA|IPA|DIPA)\s*\-?\s*(?<abv>\d+(?:[\.,]\d+)?)\s*%$/,
    /^(?<name>.*?)\s+(?<abv>\d+(?:[\.,]\d+)?)\s*%$/,
    /^(?<name>.*)$/,
];

const EXTRA_SPLIT_REGEX = /\-|\+/g;

function parseProductName(name: string): ParsedProductName {
    const match = NAME_REGEXES.reduce((acc, regex) => acc || regex.exec(name), null as RegExpExecArray);
    const groups = match?.groups;

    return {
        name: groups?.name,
        extra: groups?.extra?.split(EXTRA_SPLIT_REGEX).map((x) => x.trim()).join(", "),
        abv: groups?.abv ? Number.parseFloat(groups?.abv.replace(",", ".")) : -1,
    };
}

// TODO: also there seem to be a mandatory pagination that we seem to fail sometimes...
export async function allProducts(): Promise<Product[]> {
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
                            const text = $(el).text();
                            return text.trim();
                        },
                    },
                    image: {
                        selector: "img.product-card__image",
                        value: "src",
                    },
                    url: {
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

    const allProducts = (await Promise.all(products)).flatMap((x) => x.products.map((p) => {
        const parsed = parseProductName(p.name);
        return {
            originalName: p.name,
            ...parsed,
            image: p.image,
            url: p.url,
        };
    }));

    return [...new Map(allProducts.map(item => [item.originalName, item])).values()];
}

export interface DetailedProduct extends Product {
    price: number;
    stock: number;
}

export async function allProductsWithDetails(): Promise<DetailedProduct[]> {
    const products = await allProducts();
    const allDetails = await Promise.all(products.map((product) => axios.get(product.url)));
    return allDetails.map(({ data }, i) => {
        const $ = cheerio.load(data);

        const price = Number.parseInt($("span.product-price").text().trim().replace(".", ""));
        const stock = Number.parseInt($("tr.product-parameter.product-parameter__stock td.product-parameter__value span").text().trim());

        return {
            ...products[i],
            price,
            stock,
        };
    });
}
