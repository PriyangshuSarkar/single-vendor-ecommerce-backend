import { Injectable, BadRequestException } from '@nestjs/common';
import { ErrorUtil } from './error.utils';

@Injectable()
export class CursorUtil {
  constructor(private readonly errorUtil: ErrorUtil) {}

  encodeCursor(cursor: Record<string, any> | null) {
    try {
      if (!cursor) return null;
      return Buffer.from(JSON.stringify(cursor)).toString('base64');
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  decodeCursor(cursor: string | null) {
    try {
      if (!cursor) return null;
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch {
      throw new BadRequestException('Invalid cursor format');
    }
  }

  buildCursorObject(cursor: string | null, orderBy: string) {
    try {
      const decodedCursor = this.decodeCursor(cursor);
      if (!decodedCursor || !decodedCursor[orderBy] || !decodedCursor.id)
        return undefined;

      return { [orderBy]: decodedCursor[orderBy], id: decodedCursor.id };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  getNextCursor(followers: any[], limit: number, orderBy: string) {
    try {
      if (followers.length !== limit) return null;

      const lastFollower = followers[followers.length - 1];
      const rawCursor = {
        [orderBy]: lastFollower[orderBy],
        id: lastFollower.id,
      };

      return this.encodeCursor(rawCursor);
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}
