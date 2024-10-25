import { Injectable } from '@nestjs/common';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { saveTaskInCosmosDB } from './appServices/app.service-cosmosDB';
import { Item } from './helper/Item';
import { sendMessagesInBus } from './appServices/app.service-messageBusTopic';
require('dotenv').config();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello'
  }
}
