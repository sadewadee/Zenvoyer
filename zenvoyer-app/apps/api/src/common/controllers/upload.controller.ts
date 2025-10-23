import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { imageOnlyConfig } from '../config/multer.config';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo', imageOnlyConfig))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() request: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'Logo uploaded successfully',
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File, @Req() request: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
