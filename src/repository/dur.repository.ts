import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

export class DurRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyAgeTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).dur_ingredient_age_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }
  async findManyCombinedTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).dur_ingredient_combined_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }

  async findManyDuplicateTaboo(
    integredient_codes: string[],
    tx?: PrismaTxType,
  ) {
    return await (
      tx ?? this.prisma
    ).dur_ingredient_duplicate_effect_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }
  async findManyOldTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).dur_ingredient_old_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }
  async findManyPeriodTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).dur_ingredient_period_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }
  async findManyPregnancyTaboo(
    integredient_codes: string[],
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).dur_ingredient_pregnant_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }

  async findManyVolumeTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).dur_ingredient_volume_taboo.findMany({
      where: {
        related_ingredients: {
          some: {
            code: { in: integredient_codes },
          },
        },
      },
    });
  }

  async findManyDurTaboo(integredient_codes: string[], tx?: PrismaTxType) {
    const age_dur = await this.findManyAgeTaboo(integredient_codes, tx);
    const combined_dur = await this.findManyCombinedTaboo(
      integredient_codes,
      tx,
    );
    const duplicate_effect_dur = await this.findManyDuplicateTaboo(
      integredient_codes,
      tx,
    );
    const old_dur = await this.findManyOldTaboo(integredient_codes, tx);
    const period_dur = await this.findManyPeriodTaboo(integredient_codes, tx);
    const pregnant_dur = await this.findManyPregnancyTaboo(
      integredient_codes,
      tx,
    );
    const volume_dur = await this.findManyVolumeTaboo(integredient_codes, tx);
    return {
      age_dur,
      combined_dur,
      duplicate_effect_dur,
      old_dur,
      period_dur,
      pregnant_dur,
      volume_dur,
    };
  }
}
