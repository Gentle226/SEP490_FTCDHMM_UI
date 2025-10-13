import type { Pagination } from './pagination.type';
import type { Sorting } from './sorting.type';

export type SuccessResponse<T> = T extends unknown[]
  ? {
      data: T;
      metadata: {
        pagination: Pagination;
        filters: Record<string, unknown>;
        sorting: Sorting[];
      };
    }
  : { data: T };
