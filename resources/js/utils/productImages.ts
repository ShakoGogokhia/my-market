export type ProductImageSource =
  | string
  | {
      url?: string | null;
      image_url?: string | null;
      src?: string | null;
      path?: string | null;
      file?: string | null;
      is_primary?: boolean | number | string | null;
      primary?: boolean | number | string | null;
    }
  | null
  | undefined;

type ProductImageCollection = {
  images?: ProductImageSource[] | null;
  image?: ProductImageSource;
};

function hasTruthyPrimaryFlag(source: ProductImageSource): boolean {
  if (!source || typeof source === "string") return false;

  return Boolean(source.is_primary || source.primary);
}

function extractRawUrl(source: ProductImageSource): string | null {
  if (!source) return null;

  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) return null;

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return extractRawUrl(JSON.parse(trimmed) as ProductImageSource);
      } catch {
        // Fall through to normal string handling.
      }
    }

    return trimmed;
  }

  return source.url || source.image_url || source.src || source.path || source.file || null;
}

export function resolveProductImageUrl(
  source: ProductImageSource,
  fallback = "/images/placeholder.png"
): string {
  const rawUrl = extractRawUrl(source);

  if (!rawUrl) return fallback;

  const normalized = rawUrl.trim().replace(/\\/g, "/");

  if (!normalized) return fallback;

  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized.startsWith("data:") ? normalized : encodeURI(normalized);
  }

  if (normalized.startsWith("/")) {
    return encodeURI(normalized);
  }

  return encodeURI(`/${normalized.replace(/^\/+/, "")}`);
}

export function getProductImageUrls(product: ProductImageCollection): string[] {
  const candidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ]
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .filter((item): item is Exclude<ProductImageSource, null | undefined> => item != null)
    .map((item, index) => ({
      url: resolveProductImageUrl(item),
      priority: hasTruthyPrimaryFlag(item) ? 0 : 1,
      index,
    }))
    .filter(({ url }) => url !== "/images/placeholder.png")
    .sort((a, b) => a.priority - b.priority || a.index - b.index);

  return Array.from(new Set(candidates.map((item) => item.url)));
}

export function getPrimaryProductImageUrl(product: ProductImageCollection): string {
  return getProductImageUrls(product)[0] || "/images/placeholder.png";
}
