import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { upload } from './appServices/app.service-blobStorage'
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { getTaskFromCosmosDB } from './appServices/app.service-cosmosDB';
import { flipImage } from './appServices/app.service-flippImage';


@Controller()
export class AppController {

  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File): Promise<{ fileName?: string, status: string, message: string; id?: string }> {
    const uploadedItem = await upload(file);
    return uploadedItem
  }

  @Get('state/:id')
  async getTaskState(@Param('id') id: string): Promise<string> {
    try {
      const task = await getTaskFromCosmosDB(id);

      if (task.state === 'done') {
        return `File ${task.fileName} is ready! \nLink to processed file: ${task.processedFilePath} `;
      } else {
        return `File ${task.fileName} is not yet ready. \nCurrent state: ${task.state}. \nlink to original file: ${task.originalFilePath}`;
      }
    } catch (error) {
      return error.message;
    }
  }

  @Get('flip/:id')
  async flipImage(@Param('id') id: string): Promise<string> {
    return flipImage(id)
  }
}
