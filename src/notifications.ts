import * as cron from "node-cron";
import * as scraping from "./scraping";
import * as english2numbers from "./english2numbers";

export async function checkForHumanExperiment(products: scraping.DetailedProduct[]): Promise<scraping.DetailedProduct | undefined> {
    const heCandidate = products.find((p) => p.name.toLowerCase().includes("human experiment"));
    const heNumber = heCandidate ? english2numbers.convert(heCandidate.name) : null;
    return heNumber > 0 ? heCandidate : undefined;
}

async function checkAndReport() {
    // TODO
    //  - scrape all products
    //  - check for new HE or Big Lies
    //  - report on channel
    console.log("Checking stock...");
    const products = await scraping.allProducts();

    const heCandidate = products.find((p) => p.name.toLowerCase().includes("human experiment"));
    const heNumber = heCandidate ? english2numbers.convert(heCandidate.name) : null;

    console.log(await scraping.allProductsWithDetails());

    console.log(heCandidate);
    console.log(heNumber);
    if (heNumber > 0) {
        // TODO send notification if we didn't yet!
        console.log(`Human Experiment available: ${heNumber}`);
    }

    //const result = await axios.post(process.env.BEER_CHANNEL_WEBHOOK_URL, {
    //  text: `Szerintem az idő most kb. ${Date.now()}`
    //});
    //console.log(result);
}

export async function start(schedule: string) {
    cron.schedule(schedule, async () => {
        checkAndReport();
    });
    checkAndReport();
}
