const amqp = require("amqplib/callback_api");
const dotenv = require("dotenv");

dotenv.config();

let PayStack = require("paystack-node");

let APIKEY = process.env.PAYSTACK_SECRET_KEY;
const environment = process.env.NODE_ENV;

const paystack = new PayStack(APIKEY, environment);
const queue = "paymentNotificationQueue";
const paymentNotication = async (req, res) => {
  console.log("IS WEBHOOK CALLED?", req.body);
  try {
    const product = {
      id: 1,
      title: "Infinix note 5",
      price: 4000000,
      quantity: 1,
      amount: 4000000,
    };

    const createTransaction = await paystack.initializeTransaction({
      // reference: "7PVGX8MEk85tgeEpVDtD",
      amount: product.amount, // 5,000 Naira (remember you have to pass amount in kobo)
      // get the email from the user object in redux. send as q QS
      email: "algomachine007@gmail.com",
      // subaccount: "ACCT_8f4s1eq7ml6rlzj",
    });
    // send to queue successful transactions. i.e

    const isPaymentVerified = await paystack.verifyTransaction({
      // console.log(createTransaction.reference)
      reference: "p0j5t1zmbk",
    });
    console.log("isPaymentVerified", isPaymentVerified.body);
    const mergePaymentAndProduct = {};

    if (isPaymentVerified.body) {
      amqp.connect(process.env.RABBIT_MQ, function (error, connection) {
        console.log("error", error);
        if (error) {
          throw error;
        }
        connection.createChannel(function (error1, channel) {
          if (error1) {
            throw error1;
          }

          channel.assertQueue(queue, {
            durable: true,
          });
          channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(isPaymentVerified.body)),
            {
              persistent: true,
            },
          );
          console.log("Sent to queue '%s'");
        });
        setTimeout(function () {
          connection.close();
          res.end();
          // process.exit(0);
        }, 500);
      });
    }
  } catch (error) {
    console.log("ERROR MESSAGE", error);
  }
};

// sends an sms to user on payment and inventory status
const smsEmitter = async (req, res) => {
  try {
    // Listener that then sends an sms based on payment and account balance
    amqp.connect(process.env.RABBIT_MQ, function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }

        channel.assertQueue(queue, {
          durable: true,
        });
        channel.prefetch(1);

        channel.consume(queue, (msg) => {
          // This callback function does whatever with the message in the queue
          console.log("Received '%s'", msg.content.toString());
          console.log("Parsed", JSON.parse(msg.content));
          // hey, do whatever you want with the message in the queue
          // res.send(msg.toString());
          // ends here

          setTimeout(function () {
            // res.send(JSON.parse(msg.content));
            channel.ack(msg);
            res.end();
            // process.exit(0);
          }, 1000);
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { paymentNotication, smsEmitter };
