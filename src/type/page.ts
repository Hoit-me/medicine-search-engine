export type Page<T> = {
  /**
   * List of items
   */
  data: T[];
  /**
   * Page information
   */
  pagenation: Page.Pagenation;
};

export namespace Page {
  export interface Pagenation {
    /**
     * Current page number
     */
    current: number;

    /**
     * Number of items per page
     */
    limit: number;

    /**
     * Total number of items
     */
    total_count: number;

    /**
     * Total number of pages
     */
    total_page: number;
  }

  export interface Query {
    /**
     * Page number
     * @default 1
     */
    page?: number;

    /**
     * Number of items per page
     * @default 10
     * @maximum 100
     */
    limit?: number;
  }

  export interface Search extends Query {
    /**
     * Search keyword
     * @minLength 1
     */
    search?: string;
  }
}
