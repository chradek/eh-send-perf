const {EventHubProducerClient} = require("@azure/event-hubs");
const {runningAverage} = require("./running-average");
const {generateEvent} = require("./generate-event");
const {race} = require("./throttle");

// Configure the run via environment variables.
const connectionString = process.env["connection_string"];
const batchSize = parseInt(process.env["batch_size"], 10) || 950;
const runTimeInMinutes = parseInt(process.env["run_time"], 10) || 10;
const numberOfClients = parseInt(process.env["num_clients"], 10) || 1;
const messageSize = parseInt(process.env["msg_size"], 10) || 1024;
const numConcurrentSends = parseInt(process.env["conc_sends"], 10) || 1;

// Create runningAverages for things we want to measure over time.
const totalSentMessageCount = runningAverage("Total messages sent during run");
const clientsSentMessagesCount = [];


function createLogger(intervalInMs) {
  // Start rates just in case.
  totalSentMessageCount.start();

  function printRates() {
    totalSentMessageCount.stop();
    totalSentMessageCount.printTotalOverTime("seconds");
  }

  const tid = setInterval(printRates, intervalInMs);

  return { 
    stop() {
      printRates();
      totalSentMessageCount.stop();
      totalSentMessageCount.printTotalOverTime("minutes");
      for (const clientCount of clientsSentMessagesCount) {
        clientCount.stop();
        clientCount.printTotalOverTime("minutes");
      }
      clearInterval(tid);
    }
  }
}

const clients = [];

// create clients and rates
for (let i = 0; i < numberOfClients; i++) {
  clients.push(new EventHubProducerClient(connectionString));
  clientsSentMessagesCount.push(runningAverage(`Total messages sent by client ${i} during run`));
}

async function run() {
  const runningTime = 60000 * runTimeInMinutes;

  const logger = createLogger(20000);
  const loops = [];

  for (let i = 0; i < clients.length; i++) {
    loops.push(clientLoop(i, runningTime));
  }

  await Promise.all(loops);
  logger.stop();
}

async function clientLoop(clientIndex, runningTime) {
  console.log(`Starting loop for client ${clientIndex}`);
  const clientSentMessagesCount = clientsSentMessagesCount[clientIndex];
  clientSentMessagesCount.start();
  const startTime = Date.now();
  let currentTime = startTime;
  const throttle = race(numConcurrentSends);
  while ((currentTime - startTime) < runningTime) {
    await throttle.add(sendEvents(clientIndex));
    currentTime = Date.now();
  }
  await throttle.waitForAll();
  clientSentMessagesCount.stop();
  await clients[clientIndex].close();
}

/**
 * Creates and fills an EventDataBatch using the provided EventHubProducerClient.
 * @param {EventHubProducerClient} client 
 */
async function createAndFillBatch(client) {
  const batch = await client.createBatch();

  for (let i = 0; i < batchSize; i++) {
    const event = generateEvent(messageSize);
    if (!batch.tryAdd(event)) {
      console.error(`Failed to add event ${i}`);
      break;
    }
  }

  return batch;
}

/**
 * 
 * @param {number} clientIndex
 */
async function sendEvents(clientIndex) {
  const client = clients[clientIndex];
  const batch = await createAndFillBatch(client);
  try {
    await client.sendBatch(batch);
    totalSentMessageCount.add(batch.count);
    clientsSentMessagesCount[clientIndex].add(batch.count);
  } catch (err) {
    console.error(`Received an error while sending ${batch.count} events: ${err.message}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

