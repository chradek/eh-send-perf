## Intro
This project tests the throughput of sending events to Event Hubs.
Running this sample will attempt to send events as quickly as it can based on
the configured settings.
Note that this project is not meant to represent production scenarios and is only meant to observe throughput of sending events.

## Settings
The following environment variables can be used to configure how the project runs:
- __connection_string__: Connection string to an Event Hub used to connect to the service.
- __batch_size__: The number of events to include in each `EventDataBatch`. Default: 950.
- __run_time__: The length of time to send events, in minutes. Default: 10.
- __num_clients__: The number of clients to send events with. Default: 1.
- __msg_size__: The approximate size of each event in bytes.
Note: Converting the event to an AMQP message adds some overhead to each event.
Default: 1024.
- __conc_sends__: The number of allowed `sendBatch` operations in-flight at any time per client.
Default: 1.

## How to run
1. Install project dependencies using `npm install`.
2. Specify any environment variables needed to configure the run.
3. Run the script from the project root via `node ./index.js`.

## Note about metrics
This project will print an approximate rate of messages sent per second every 20 seconds while running.
For more accurate results, view the metrics available for your Event Hub through the Azure portal.