import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { ErrorUtil } from '../../utils';

@Injectable()
export class SlugUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
  ) {}

  async createUserSlug(initialSlug: string, id?: string) {
    try {
      const baseSlug = slugify(initialSlug, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;

      const existingSlug = await this.prisma.user.findFirst({
        where: { slug, NOT: { id } },
        select: { slug: true },
      });

      if (!existingSlug) return slug;

      // Generate unique suffix
      let suffix = 1;
      do {
        slug = `${baseSlug}-${suffix++}`;
      } while (
        await this.prisma.user.findFirst({ where: { slug, NOT: { id } } })
      );

      return slug;
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}
