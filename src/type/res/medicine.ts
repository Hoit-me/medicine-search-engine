import { ingredients } from '@prisma/client';

export namespace MedicineRes {
  export interface Medicine {
    name: string;
    company: string;
    image_url?: string | null;
    english_name: string | null;
    ingredients: ingredients[];
    pharmacological_class: { code: string; name: string }[];
  }
  export type Page = {
    medicineList: Medicine[];
    totalCount: number;
  };
}
