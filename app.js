const express = require('express')
const { App, ExpressReceiver } = require('@slack/bolt');

const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

receiver.router.use(express.static('public'))

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command('/bym', async ({ command, ack, respond }) => {
  console.log(`Received command: ${command.text}`);
  await ack();
  await say(`Echo: ${command.text}`);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('Brew Your Mind bot is running!');
})();
