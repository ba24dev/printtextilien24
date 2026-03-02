export const IMAGE_FIELDS = `
  id
  url
  altText
`;

export const FEATURED_IMAGE_FIELDS = `
  featuredImage {
    ${IMAGE_FIELDS}
  }
`;
