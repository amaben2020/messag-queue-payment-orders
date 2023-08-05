const amqp = require("amqplib/callback_api");
const dotenv = require("dotenv");

dotenv.config();
const paymentNotication = async (req, res) => {
  console.log("Called");
  try {
    // when a user makes a successful payment using the webhook, emit an event and send to the message queue incase of network failure when the payment was made
    const payment = {
      ...req.body,
    };
    const queue = "paymentNotificationQueue";

    if (payment.success) {
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
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(payment)), {
            persistent: true,
          });
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
  const queue = "paymentNotificationQueue";
  console.log("Called");
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
