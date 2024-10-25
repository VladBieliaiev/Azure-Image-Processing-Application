import { BlobServiceClient } from "@azure/storage-blob";
import { getTaskFromCosmosDB, updateTaskInCosmosDB } from "./app.service-cosmosDB";
require('dotenv').config();

const blobStorageConectionString = process.env.BLOB_STORAGE_CONECTION_STRING
const blobStorageContainerName = process.env.BLOB_STORAGE_CONTAINER_NAME

export async function flipImage(id) {
  try {
    // Step 1: Retrieve image from Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(blobStorageConectionString);
    const containerClient = blobServiceClient.getContainerClient(blobStorageContainerName);

    const task = await getTaskFromCosmosDB(id);
    const blobName = task.fileName;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = await blockBlobClient.downloadToBuffer();

    // Step 2: Flip the image
    const Jimp = require('jimp');
    const image = await Jimp.read(buffer);
    image.flip(true, true);

    // Step 3: Upload the flipped image to Blob Storage
    const flippedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const flippedBlobName = "flipped-" + blobName;

    const flippedBlockBlobClient = containerClient.getBlockBlobClient(flippedBlobName);
    await flippedBlockBlobClient.upload(flippedBuffer, flippedBuffer.length);

    task.state = "done";
    task.fileName = flippedBlobName;
    task.processedFilePath = flippedBlockBlobClient.url;
    await updateTaskInCosmosDB(task);

    // Step 5: Return success message
    console.log("image has been flipped and uploaded")
    return `Image ${task.originalFilePath} has been flipped and uploaded to ${task.processedFilePath}.`;
  } catch (error) {
    return error.message;
  }
}