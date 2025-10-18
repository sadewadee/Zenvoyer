import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import {
  InviteSubUserDto,
  UpdateSubUserPermissionsDto,
  AcceptInvitationDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Req() request: any) {
    return this.usersService.getProfile(request.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sub-users')
  async getSubUsers(@Req() request: any) {
    return this.usersService.getSubUsers(request.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sub-users/invite')
  async inviteSubUser(@Req() request: any, @Body() inviteSubUserDto: InviteSubUserDto) {
    return this.usersService.inviteSubUser(request.user.id, inviteSubUserDto);
  }

  @Post('sub-users/accept-invitation')
  @HttpCode(200)
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.usersService.acceptInvitation(acceptInvitationDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('sub-users/:subUserId/permissions')
  async updateSubUserPermissions(
    @Req() request: any,
    @Param('subUserId') subUserId: string,
    @Body() updatePermissionsDto: UpdateSubUserPermissionsDto,
  ) {
    return this.usersService.updateSubUserPermissions(
      request.user.id,
      subUserId,
      updatePermissionsDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('sub-users/:subUserId')
  async removeSubUser(@Req() request: any, @Param('subUserId') subUserId: string) {
    return this.usersService.removeSubUser(request.user.id, subUserId);
  }
}
