import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NotificationEntity } from '../database/entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: jest.Mocked<Pick<Repository<NotificationEntity>, 'create' | 'save' | 'count'>>;
  let gateway: jest.Mocked<Pick<NotificationsGateway, 'emitToUser'>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => ({ id: 'n1', createdAt: new Date(), readAt: null, ...data })),
      save: jest.fn(async (entity) => entity),
      count: jest.fn(async () => 1),
    };

    gateway = {
      emitToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(NotificationEntity), useValue: repository },
        { provide: NotificationsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  it('creates notification and emits websocket event', async () => {
    await service.createAndPush({
      recipientId: 'user-1',
      type: 'championship.created',
      title: 'Test',
      body: 'Body',
      deepLink: '/championships/1',
    });

    expect(repository.save).toHaveBeenCalled();
    expect(repository.count).toHaveBeenCalledWith({
      where: { recipientId: 'user-1', readAt: IsNull() },
    });
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        unreadCount: 1,
        notification: expect.objectContaining({ title: 'Test', isRead: false }),
      }),
    );
  });
});
