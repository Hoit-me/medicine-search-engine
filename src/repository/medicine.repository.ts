import { Injectable } from '@nestjs/common';
import { medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { SelectAll } from '@src/utils/excludeField';
import typia from 'typia';

@Injectable()
export class MedicineRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {}

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
    tx?: PrismaTxType, // 만약 트랜잭션내에서 실행되는 쿼리라면, 해당 트랜잭션을 사용하도록 합니다.
  ) {
    const searchParam = {
      index: 'medicine',
      ...(search
        ? {
            text: {
              query: search,
              path,
              ...(searchOption?.fuzzy
                ? {
                    fuzzy: searchOption.fuzzy,
                  }
                : {}),
            },
          }
        : {
            wildcard: {
              query: '*',
              path,
              allowAnalyzedField: true,
            },
          }),
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
    const data = (await (tx ?? this.prisma).medicine.aggregateRaw({
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

    const total = (await (tx ?? this.prisma).medicine.aggregateRaw({
      pipeline: [
        {
          $searchMeta: searchParam,
        },
      ],
    })) as unknown as [{ count: { total: number } }];

    return {
      data,
      pagenation: {
        current: page,
        limit,
        total_count: total[0].count.total,
        total_page: Math.ceil(total[0].count.total / limit),
      },
    };
  }
}
