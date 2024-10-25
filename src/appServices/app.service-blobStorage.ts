import { Item } from '../helper/Item';
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { saveTaskInCosmosDB } from "./app.service-cosmosDB";
import { sendMessagesInBus } from "./app.service-messageBusTopic";
import { v4 as uuidv4 } from 'uuid';


require('dotenv').config();


const azureConection = process.env.BLOB_STORAGE_CONECTION_STRING;
const containerName = process.env.BLOB_STORAGE_CONTAINER_NAME;

async function processImage(file: Express.Multer.File): Promise<Express.Multer.File> {
  return file;
}

function getBlobClient(imageName: string): BlockBlobClient {
  const blobClientService = BlobServiceClient.fromConnectionString(azureConection);
  const containerClient = blobClientService.getContainerClient(containerName);
  const blobClient = containerClient.getBlockBlobClient(imageName);
  return blobClient;
}

export async function upload(file: Express.Multer.File) {
  try {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      const errorMessage = `Invalide file type '${file.mimetype}'.Allowed types are: ${allowedTypes.join(', ')}`;
      return { status: "error", message: errorMessage }
    }

    const uniqId = uuidv4();
    const metadata = { myKey: 'myValue', id: uniqId };
    const blobClient = getBlobClient(file.originalname);
    await blobClient.uploadData(file.buffer);
    await blobClient.setMetadata(metadata);
    const originalPath = blobClient.url;

    const processedImage = await processImage(file);
    const processedBlobClient = getBlobClient(processedImage.originalname);
    await processedBlobClient.uploadData(processedImage.buffer);


    const item = new Item(file.originalname, 'created', uniqId, originalPath, null, uniqId)
    await saveTaskInCosmosDB(item);
    await sendMessagesInBus(item.fileName, item.id);
    return { status: "Created", message: "file uploaded successfully.", fileName: file.originalname, id: uniqId, originalFilePath: originalPath, processedFilePath: null }
  } catch (error) {
    console.log(error);
  }
}