import { CosmosClient } from '@azure/cosmos';
require('dotenv').config();

const cosmosConnectionString = process.env.COSMOS_DB_CONECTION_STRING;
const cosmosDataBaseName = process.env.COSMOS_DB_NAME;
const cosmosContainerName = process.env.COSMOS_DB_CONTAINER_NAME;

export async function saveTaskInCosmosDB(item) {
  const cosmosClient = new CosmosClient(cosmosConnectionString);
  const container = cosmosClient
    .database(cosmosDataBaseName)
    .container(cosmosContainerName);

  const { resource: savedItem } = await container.items.create(item);
  return savedItem;
}

export async function getTaskFromCosmosDB(taskId: string) {
  const cosmosClient = new CosmosClient(cosmosConnectionString);
  const container = cosmosClient
    .database(cosmosDataBaseName)
    .container(cosmosContainerName);

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: taskId }],
  };

  const { resources: tasks } = await container.items
    .query(querySpec)
    .fetchAll();

  if (tasks.length === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  return tasks[0];
}

export async function updateTaskInCosmosDB(item) {
  const cosmosClient = new CosmosClient(cosmosConnectionString);
  const container = cosmosClient
    .database(cosmosDataBaseName)
    .container(cosmosContainerName);

  await container.items.upsert(item);
}
