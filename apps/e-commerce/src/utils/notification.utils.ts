import { Injectable } from '@nestjs/common';
import { ErrorUtil } from './error.utils';
import { PrismaService } from '@app/prisma';
// import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
  ) {}

  // async createNotification(
  //   pageId: string,
  //   type: NotificationType,
  //   message: object,
  // ) {
  //   try {
  //     const notification = await this.prisma.notification.create({
  //       data: {
  //         id: uuid.v7(),
  //         page: { connect: { id: pageId } },
  //         type,
  //         message,
  //         readAt: null,
  //       },
  //     });
  //     return notification;
  //   } catch (error) {
  //     this.errorUtil.handleError(error);
  //   }
  // }

  // async createOrUpdateNotification(
  //   notificationId: string,
  //   pageId: string | undefined,
  //   type: NotificationType,
  //   message: object,
  //   readAt: Date | null | undefined,
  // ) {
  //   try {
  //     const notification = await this.prisma.notification.upsert({
  //       where: { id: notificationId, pageId: pageId },
  //       update: {
  //         page: pageId ? { connect: { id: pageId } } : undefined,
  //         type,
  //         message,
  //         readAt,
  //         deletedAt: null,
  //       },
  //       create: {
  //         id: notificationId,
  //         page: pageId ? { connect: { id: pageId } } : undefined,
  //         type,
  //         message,
  //         readAt: null,
  //         deletedAt: null,
  //       },
  //     });
  //     return notification;
  //   } catch (error) {
  //     this.errorUtil.handleError(error);
  //   }
  // }
  // async deleteNotification(notificationId: string, pageId: string | undefined) {
  //   try {
  //     const notification = await this.prisma.notification.update({
  //       where: { id: notificationId, pageId: pageId },
  //       data: {
  //         deletedAt: null,
  //       },
  //     });
  //     return notification;
  //   } catch (error) {
  //     this.errorUtil.handleError(error);
  //   }
  // }
}
