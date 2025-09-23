import { FilterQuery, Model, QueryOptions as MongooseQueryOptions } from "mongoose";

export type SortOrder = "asc" | "desc";

export interface QueryOptions<T> {
  page?: number;
  limit?: number;
  sortBy?: keyof T | string;
  sortOrder?: SortOrder;
  searchTerm?: string;
  searchFields?: Array<keyof T | string>;
  filters?: Record<string, unknown>;
  projection?: Record<string, 0 | 1> | string | null;
  lean?: boolean;
}

export interface QueryResult<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    sortBy?: string;
    sortOrder?: SortOrder;
  };
  data: T[];
}

/**
 * Generic helper to paginate, search, filter and sort mongoose collections.
 * - searchTerm applies $regex OR across provided searchFields
 * - filters are applied directly (after removing undefined/null)
 * - supports projection and lean queries
 */
export async function findWithQuery<T>(
  model: Model<T>,
  baseConditions: FilterQuery<T> = {},
  options: QueryOptions<T> = {}
): Promise<QueryResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    searchTerm,
    searchFields = [],
    filters = {},
    projection = null,
    lean = true,
  } = options;

  // Build conditions
  const andConditions: any[] = [];

  // Base conditions first
  if (baseConditions && Object.keys(baseConditions).length) {
    andConditions.push(baseConditions);
  }

  // Text search across specified fields
  if (searchTerm && searchFields.length) {
    const or: any[] = searchFields.map((field) => ({
      [field as string]: { $regex: searchTerm, $options: "i" },
    }));
    andConditions.push({ $or: or });
  }

  // Clean filters (drop undefined/null)
  const cleanedFilters = Object.entries(filters).reduce<Record<string, unknown>>(
    (acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = v;
      return acc;
    },
    {}
  );
  if (Object.keys(cleanedFilters).length) {
    andConditions.push(cleanedFilters);
  }

  const finalConditions: FilterQuery<T> =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // Sorting
  const sort: Record<string, 1 | -1> = {};
  if (sortBy) {
    sort[String(sortBy)] = sortOrder === "asc" ? 1 : -1;
  }

  // Pagination calculation
  const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

  // Query options
  const queryOptions: MongooseQueryOptions = {
    sort,
    skip,
    limit: Math.max(limit, 1),
  };

  // Execute queries in parallel
  const [items, total] = await Promise.all([
    (projection
      ? model.find(finalConditions, projection, queryOptions)
      : model.find(finalConditions, undefined, queryOptions)
    ).lean(lean) as unknown as Promise<T[]>,
    model.countDocuments(finalConditions),
  ]);

  const totalPages = Math.ceil(total / Math.max(limit, 1)) || 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder,
    },
    data: items,
  };
}