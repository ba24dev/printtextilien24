import { convertTime } from "@/utils/helpers";

// HIDDEN CATEGORIES - Configurable handles for hidden shopify collections
export const HOMEPAGE_FEATURED_HANDLE = "hidden-homepage-featured-items";
export const HOMEPAGE_CAROUSEL_HANDLE = "hidden-homepage-carousel";

// MARQUEE SETTINGS - Configurable settings for the marquee component
export const MARQUEE_DUPLICATION_FACTOR = 3;
export const MARQUEE_SCROLL_SPEED = 12;

// APP CONFIG - General application configuration
export const COMPANY_NAME = "Printex";
export const SITE_NAME = "Printtextilien24.de";
export const SITE_LOCALE = "de-DE";

// SEARCH CONFIG - Configuration for search functionality
export const DEBOUNCE_MS = 300;
export const INDEX_TTL_MS = convertTime(5, "min", "ms");
export const SEARCH_LIMIT = 8;
export const SEARCH_PAGE_SIZE = 100;

// PRINT CONFIG - Print validation settings
export const PRINT_CONFIG = {
  desiredDpi: 300, // e.g. 300 DPI for print
  minPhysicalSizeMm: 30, // e.g. minimum 30x30 mm
};
