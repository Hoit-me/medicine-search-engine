import { medicine } from '@prisma/client';

export namespace MedicineRes {
  export type Page = {
    medicineList: Partial<medicine>[];
    totalCount: number;
  };
}
