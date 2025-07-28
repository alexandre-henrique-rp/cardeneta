import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { FindWalletDto } from './dto/find-wallet.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBody } from '@nestjs/swagger';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBody({ type: CreateWalletDto })
  create(@Body() createWalletDto: CreateWalletDto, @Req() req: any) {
    return this.walletService.create(createWalletDto, req.user);
  }

  @Post(':id')
  @UseGuards(AuthGuard)
  @ApiBody({ type: FindWalletDto })
  findOne(
    @Param('id') id: string,
    @Body() data: FindWalletDto,
    @Req() req: any,
  ) {
    return this.walletService.findOne(id, req.user, data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBody({ type: UpdateWalletDto })
  update(
    @Param('id') id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @Req() req: any,
  ) {
    return this.walletService.update(id, updateWalletDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.walletService.remove(id, req.user);
  }
}
