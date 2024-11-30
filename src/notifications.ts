import axios from "axios";
import * as cron from "node-cron";
import * as english2numbers from "./english2numbers";
import * as memory from "./memory";
import * as responses from "./responses";
import * as scraping from "./scraping";
import { last } from "cheerio/dist/commonjs/api/traversing";

export async function checkForHumanExperiment(products: scraping.DetailedProduct[]): Promise<scraping.DetailedProduct | undefined> {
    const heCandidate = products.find((p) => p.name.toLowerCase().includes("human experiment"));
    const heNumber = heCandidate ? english2numbers.convert(heCandidate.name) : null;
    return heNumber > 0 ? heCandidate : undefined;
}

async function checkAndReport() {
    console.log("Checking stock...");
    const products = await scraping.allProductsWithDetails();

    const heCandidate = products.find((p) => p.name.toLowerCase().includes("human experiment"));
    const heNumber = heCandidate ? english2numbers.convert(heCandidate.name) : null;

    if (heNumber > 0) {
        const things = await memory.recall();
        if (things.lastHeSeen < heNumber) {
            console.log(`New Human Experiment available: ${heNumber}`);
            const result = await axios.post(process.env.BEER_CHANNEL_WEBHOOK_URL, {
                response_type: "in_channel",
                ...responses.formatHumanExperimentNotification(heCandidate),
            });
            memory.remember({ lastHeSeen: heNumber });
        }
    }
}

export async function start(schedule: string) {
    cron.schedule(schedule, async () => {
        checkAndReport();
    });
    checkAndReport();
}
