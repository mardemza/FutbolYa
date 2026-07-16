import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Healthcheck basico de la API' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
