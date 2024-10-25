import { ServiceBusClient } from "@azure/service-bus";
require('dotenv').config();

const busConnectionString = process.env.SERVICE_BUS_CONECTION_STRING;
const busTopicName = process.env.SERVICE_BUS_TOPIC_NAME;


export async function sendMessagesInBus(fileName?: string, taskId?: string) {
  const serviceBusClient = new ServiceBusClient(busConnectionString);
  const sender = serviceBusClient.createSender(busTopicName);


  const message = {
    fileName: fileName,
    id: taskId,
  };
  await sender.sendMessages({
    body: message
  });
  console.log("message sent");

  await sender.close();
}