const dotenv = require("dotenv").config({ path: "./../.env" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio");

class TwilioMailer {
  constructor() {
    this.client = client(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  async sendMessage(message = "okay its working") {
    try {
      const data = await this.client.messages.create({
        from: "+12185597183",
        to: "+2347037413090",
        body: message,
      });
      console.log(`Successfully delivered:  ${data.body.split("-")[1]} ✅`);
      return data;
    } catch (error) {
      console.log(error?.message);
    }
  }
}

const sender = new TwilioMailer();
sender.sendMessage();
