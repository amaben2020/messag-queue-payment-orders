const express = require("express");

const { paymentNotication, smsEmitter } = require("./controllers/payment.js");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const PORT = 3009;

const route = express.Router();

app.use(route);

const errorHandler = (error, request, response, next) => {
  // Error handling middleware functionality
  console.log(`error ${error.message}`); // log the error
  const status = error.status || 400;
  // send back an easily understandable error message to the caller
  response.status(status).send(error.message);
};

route.post("/payment-notification", paymentNotication);
route.post("/acknowledge", smsEmitter);

app.listen(PORT, () => {
  console.log("running successfully ✅");
});
