import { Injectable } from '@nestjs/common';
import { Prisma, medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { SelectAll } from '@src/utils/excludeField';
import typia from 'typia';

@Injectable()
export class MedicineRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(
    { page, limit }: Required<Pick<Page.Search, 'page' | 'limit'>>,
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).medicine.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ...(typia.random<
          SelectAll<Medicine, true>
        >() satisfies Prisma.medicineFindManyArgs['select']),
      },
    });
  }

  count(tx?: PrismaTxType) {
    return (tx ?? this.prisma).medicine.count();
  }

  async aggregateSearch(
    {
      search,
      page,
      limit,
      path,
    }: Required<Page.Search> & {
      path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
    },
    searchOption?: {
      fuzzy?: {
        maxEdits: number;
      };
    },
  ) {
    const searchParam = {
      index: 'medicine',
      text: {
        query: search,
        path,
        ...(searchOption?.fuzzy
          ? {
              fuzzy: searchOption.fuzzy,
            }
          : {}),
      },
      count: {
        type: 'total',
      },
    };

    const $project = {
      $project: {
        ...typia.random<SelectAll<Medicine, 1>>(),
        id: '$_id',
      },
    };

    const data = (await this.prisma.medicine.aggregateRaw({
      pipeline: [
        {
          $search: searchParam,
        },
        { ...$project },
        { $skip: (page - 1) * limit },
        {
          $limit: limit,
        },
      ],
    })) as unknown as Omit<
      medicine,
      'document' | 'usage' | 'effect' | 'change_content' | 'caution'
    >[];

    return data;
  }

  async aggregateSearchCount(
    {
      search,
      path,
    }: Required<Pick<Page.Search, 'search'>> & {
      path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
    },
    searchOption?: {
      fuzzy?: {
        maxEdits: number;
      };
    },
  ) {
    const searchParam = {
      index: 'medicine',
      text: {
        query: search,
        path,
        ...(searchOption?.fuzzy
          ? {
              fuzzy: searchOption.fuzzy,
            }
          : {}),
      },
      count: {
        type: 'total',
      },
    };

    const count = (await this.prisma.medicine.aggregateRaw({
      pipeline: [
        {
          $searchMeta: searchParam,
        },
      ],
    })) as unknown as [{ count: { total: number } }];

    return count[0].count.total;
  }
}
