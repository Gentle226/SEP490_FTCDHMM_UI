export interface Pagination {
  total: number;
  currentPage: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
