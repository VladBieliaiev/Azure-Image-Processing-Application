import { ApiProperty } from "@nestjs/swagger";

export class Item {
  fileName: string;
  state: string;
  id: string;
  originalFilePath: string;
  processedFilePath: string;
  task_id: string;
  constructor(fileName: string, state: string, id: string, originalFilePath: string, processedFilePath: string, task_id: string) {
    this.fileName = fileName;
    this.state = state;
    this.id = id;
    this.originalFilePath = originalFilePath;
    this.processedFilePath = processedFilePath;
    this.task_id = task_id;
  }
}


export class ItemDto {
  @ApiProperty({ type: 'string' })
  fileName: string;

  @ApiProperty({ type: 'string' })
  state: string;

  @ApiProperty({ type: 'string' })
  id: string;

  @ApiProperty({ type: 'string' })
  originalPath: string;

  @ApiProperty({ type: 'string' })
  processedPath: string;

  @ApiProperty({ type: 'string' })
  task_id: string;
}