// Canonical metaobject field key candidates. Keep this configurable so stores
// with different field names can be supported by editing only this file.
export const NAME_KEYS = ["name", "handle"] as const;
export const IS_CUSTOMIZABLE_KEYS = ["isCustomizable", "is_customizable"] as const;
export const DIMENSION_KEYS = ["dimensions", "dimensions_per", "size"] as const;
export const WIDTH_KEYS = ["width", "width_pct", "width_per"] as const;
export const HEIGHT_KEYS = ["height", "height_pct", "height_per"] as const;
export const OFFSET_KEYS = ["offset", "offset_pct", "offset_per"] as const;
export const TEMPLATE_SIZE_KEYS = ["template_size", "templateSize"] as const;

const fields = {
  NAME_KEYS,
  IS_CUSTOMIZABLE_KEYS,
  DIMENSION_KEYS,
  WIDTH_KEYS,
  HEIGHT_KEYS,
  OFFSET_KEYS,
  TEMPLATE_SIZE_KEYS,
};

export default fields;
