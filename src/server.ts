import * as commands from "./commands";
import * as notifications from "./notifications";
import { App, ExpressReceiver } from "@slack/bolt";

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: "/slack/events",
});

receiver.app.get("/health", (_, res) => {
  res.status(200).send("bot is running");
});

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
});

app.command("/bym", async ({ command, ack, respond }) => {
  console.log(`Received command: ${command.text}`);
  await ack();
  const response = await commands.dispatch(command.text);
  await respond(response);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Brew Your Mind bot is running!");
  notifications.start(process.env.NOTIFICATIONS_CRON_SCHEDULE);
})();
