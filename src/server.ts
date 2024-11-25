import * as commands from "./commands";
import * as cron from "node-cron";
import express from "express";
import { App, ExpressReceiver } from "@slack/bolt";

const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// FIXME this doesn't look to be working
receiver.router.use(express.static("public"));

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/bym", async ({ command, ack, respond }) => {
  console.log(`Received command: ${command.text}`);
  await ack();
  const response = await commands.dispatch(command.text);
  await respond(response);
});

async function checkAndReport() {
  // TODO
  //  - scrape
  //  - check for new HE or Big Lies
  //  - report on channel
  console.log("Checking stock...");
  //const result = await axios.post(process.env.BEER_CHANNEL_WEBHOOK_URL, {
  //  text: `Szerintem az idő most kb. ${Date.now()}`
  //});
  //console.log(result);
}

cron.schedule(process.env.CHECK_CRON_SCHEDULE, async () => {
  checkAndReport();
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Brew Your Mind bot is running!");
  checkAndReport();
})();
