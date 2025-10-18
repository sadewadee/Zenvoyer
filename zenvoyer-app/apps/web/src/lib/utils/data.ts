/**
 * Data Manipulation Utilities
 * Helper functions untuk manipulate data
 */

/**
 * Sort array by field
 */
export function sortBy<T>(
  array: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA === valueB) return 0;
    if (valueA === null || valueA === undefined) return direction === 'asc' ? 1 : -1;
    if (valueB === null || valueB === undefined) return direction === 'asc' ? -1 : 1;

    const comparison =
      typeof valueA === 'string'
        ? valueA.localeCompare(String(valueB))
        : valueA < valueB
        ? -1
        : 1;

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Group array by field
 */
export function groupBy<T>(array: T[], field: keyof T): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = String(item[field]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Filter array dengan multiple conditions
 */
export function filterBy<T>(
  array: T[],
  conditions: Partial<Record<keyof T, any>>
): T[] {
  return array.filter((item) =>
    Object.entries(conditions).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      return item[key as keyof T] === value;
    })
  );
}

/**
 * Search dalam array (case-insensitive)
 */
export function search<T>(
  array: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  const lowerQuery = query.toLowerCase();
  return array.filter((item) =>
    searchFields.some((field) => {
      const value = String(item[field]).toLowerCase();
      return value.includes(lowerQuery);
    })
  );
}

/**
 * Paginate array
 */
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; pages: number } {
  const total = array.length;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: array.slice(start, end),
    total,
    pages,
  };
}

/**
 * Unique array values by field
 */
export function uniqueBy<T>(array: T[], field: keyof T): T[] {
  const seen = new Set<any>();
  return array.filter((item) => {
    const value = item[field];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Map array ke object
 */
export function keyBy<T extends { id: string | number }>(array: T[]): Record<string | number, T> {
  return array.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string | number, T>
  );
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue as any, sourceValue as any);
      } else {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * Pick specific fields dari object
 */
export function pick<T, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
  return fields.reduce(
    (acc, field) => {
      acc[field] = obj[field];
      return acc;
    },
    {} as Pick<T, K>
  );
}

/**
 * Omit specific fields dari object
 */
export function omit<T, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const fieldSet = new Set(fields);
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (!fieldSet.has(key as K)) {
        acc[key as Exclude<keyof T, K>] = value;
      }
      return acc;
    },
    {} as Omit<T, K>
  );
}

/**
 * Flatten nested array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...item);
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as T[]);
}

/**
 * Chunk array ke size tertentu
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sum array values
 */
export function sum<T>(array: T[], field: keyof T): number {
  return array.reduce((acc, item) => {
    const value = item[field];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Average array values
 */
export function average<T>(array: T[], field: keyof T): number {
  if (array.length === 0) return 0;
  return sum(array, field) / array.length;
}

export const dataUtils = {
  sortBy,
  groupBy,
  filterBy,
  search,
  paginate,
  uniqueBy,
  keyBy,
  deepMerge,
  pick,
  omit,
  flatten,
  chunk,
  sum,
  average,
};

export default dataUtils;
