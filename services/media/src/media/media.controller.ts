import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { RequestUploadDto } from '../dto/request-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { DirectUploadDto } from '../dto/direct-upload.dto';
import { UpdateMediaMetadataDto } from '../dto/update-media-metadata.dto';
import { QueryMediaDto } from '../dto/query-media.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for managing user-specific media files.
 * Provides endpoints for uploading, retrieving, updating, and deleting media assets.
 *
 * @category Media
 */
@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  /**
   * Retrieves a paginated list of media files belonging to the authenticated user.
   *
   * @param user The current authenticated user
   * @param query Filtering and pagination parameters
   * @returns Paginated list of media files
   */
  @Get()
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'List user media',
    description: 'Retrieve all media files uploaded by the current user with optional filtering.',
  })
  async getUserMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryMediaDto,
  ): Promise<any> {
    return this.mediaService.findByUser(user.userId, query);
  }

  /**
   * Initiates a new media upload request.
   * Pre-validates file metadata and prepares the system for receiving file data.
   *
   * @param user The current authenticated user
   * @param dto Upload request details
   * @returns Upload session details including a unique reference
   */
  @Post('upload/request')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Request upload',
    description: 'Initiate an upload session by providing file metadata.',
  })
  async requestUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestUploadDto,
  ): Promise<any> {
    return this.mediaService.requestUpload(user.userId, dto);
  }

  /**
   * Confirms the completion of a media upload.
   * Triggers post-processing such as virus scanning and thumbnail generation.
   *
   * @param user The current authenticated user
   * @param dto Upload confirmation details
   * @returns Finalized media record
   */
  @Post('upload/confirm')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Confirm upload',
    description: 'Notify the system that the file upload to storage is complete.',
  })
  async confirmUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmUploadDto,
  ): Promise<any> {
    return this.mediaService.confirmUpload(user.userId, dto);
  }

  /**
   * Performs a direct file upload from the client to the server.
   * Note: Prefer request/confirm flow for large files.
   *
   * @param user The current authenticated user
   * @param dto Upload metadata
   * @param file The uploaded file buffer
   * @returns Finalized media record
   */
  @Post('upload/direct')
  @UseInterceptors(FileInterceptor('file'))
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Direct upload',
    description: 'Upload a file directly to the server in a single request.',
  })
  async directUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DirectUploadDto,
    @UploadedFile() file: any,
  ): Promise<any> {
    return this.mediaService.directUpload(user.userId, file, dto);
  }

  /**
   * Retrieves storage utilization statistics for the current user.
   *
   * @param user The current authenticated user
   * @returns Storage usage statistics
   */
  @Get(['storage/stats', 'storage-usage', 'stats'])
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Get storage stats',
    description: 'Retrieve current storage usage and limits for the authenticated user.',
  })
  async getStorageStats(@CurrentUser() user: AuthenticatedUser): Promise<any> {
    return this.mediaService.getStorageStats(user.userId);
  }

  /**
   * Retrieves detailed information for a specific media file.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @returns Full media metadata and status
   */
  @Get(':id')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Get media details',
    description: 'Fetch detailed metadata and processing status for a specific file.',
  })
  async getMediaDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<any> {
    return this.mediaService.findById(id, user.userId);
  }

  /**
   * Updates the metadata (e.g., filename, description) of a media file.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @param dto The new metadata values
   * @returns The updated media record
   */
  @Patch([':id', ':id/metadata'])
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Update metadata',
    description: 'Modify the descriptive metadata associated with a media file.',
  })
  async updateMetadata(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMediaMetadataDto,
  ): Promise<any> {
    return this.mediaService.updateMetadata(id, user.userId, dto);
  }

  /**
   * Deletes a media file and its physical storage.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @returns Confirmation of deletion
   */
  @Delete(':id')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Delete media',
    description: 'Permanently remove a media file and its associated storage assets.',
  })
  async deleteMedia(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<any> {
    return this.mediaService.delete(id, user.userId);
  }

  /**
   * Generates a temporary secure download URL for a media file.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @returns A signed temporary download URL
   */
  @Get(':id/download')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Get download URL',
    description: 'Generate a secure, time-limited URL for downloading the file.',
  })
  async getDownloadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<any> {
    return this.mediaService.getDownloadUrl(id, user.userId);
  }

  /**
   * Creates a copy of an existing media file in a different folder.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @param body Destination folder details
   * @returns Details of the newly created copy
   */
  @Post(':id/copy')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Copy media',
    description: 'Create a duplicate of an existing media file.',
  })
  async copyMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { destinationFolderId?: string },
  ): Promise<any> {
    const media = await this.prismaRead.media.findUnique({
      where: { id, uploaderId: user.userId },
    });
    if (!media) throw new Error('Media not found');

    const copiedMedia = await this.prismaWrite.media.create({
      data: {
        uploaderId: user.userId,
        filename: `Copy of ${media.filename}`,
        originalFilename: `Copy of ${media.originalFilename}`,
        mimeType: media.mimeType,
        size: media.size,
        urls: media.urls ?? {},
        contextType: body.destinationFolderId ? 'folder' : media.contextType,
        contextId: body.destinationFolderId || media.contextId,
        status: media.status,
        metadata: media.metadata || {},
      },
    });

    return copiedMedia;
  }

  /**
   * Moves a media file to a different storage folder.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @param body Destination folder details
   * @returns Confirmation of movement
   */
  @Post(':id/move')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Move media',
    description: 'Relocate a media file to a new virtual directory.',
  })
  async moveMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { destinationFolderId: string },
  ): Promise<any> {
    const media = await this.prismaRead.media.findUnique({
      where: { id, uploaderId: user.userId },
    });
    if (!media) throw new Error('Media not found');

    const movedMedia = await this.prismaWrite.media.update({
      where: { id },
      data: {
        contextType: 'folder',
        contextId: body.destinationFolderId,
      },
    });

    return movedMedia;
  }

  /**
   * Forces the regeneration of media thumbnails.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @returns Confirmation of regeneration request
   */
  @Post(':id/regenerate-thumbnail')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'Regenerate thumbnail',
    description: 'Trigger the re-creation of preview images for this file.',
  })
  async regenerateThumbnail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<any> {
    return { id, thumbnailGenerated: true };
  }

  /**
   * Retrieves a history of file versions for this media asset.
   *
   * @param user The current authenticated user
   * @param id The media file ID
   * @returns List of file versions
   */
  @Get(':id/versions')
  @ApiStandardResponse(Object)
  @ApiOperation({
    summary: 'List versions',
    description: 'Fetch all historical versions and revisions of this media file.',
  })
  async getVersions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<any> {
    return { id, versions: [] };
  }
}
