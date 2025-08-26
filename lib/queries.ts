import { groq } from 'next-sanity';

export const workSlugParamsQuery = groq`
  *[_type == "work"] {
    "section": discipline,
    "slug": slug.current
  }
`;

export const workBySlugQuery = groq`
  *[_type == "work" && discipline == $section && slug.current == $slug][0] {
    _id,
    title,
    slug,
    discipline,
    year,
    "tags": tags[]->name,
    coverImage {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    },
    summary,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip,
        alt
      },
      _type == "videoMux" => {
        ...,
        poster {
          ...,
          "lqip": asset->metadata.lqip
        }
      },
      _type == "imageRow" => {
        ...,
        images[] {
          _key,
          asset,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      _type == "imageDual" => {
        ...,
        images[] {
          _key,
          asset,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      _type == "imageBleed" => {
        ...,
        image {
          _key,
          asset,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      _type == "textAside" => {
        ...,
        body[] {
          _key,
          _type,
          children[] {
            _key,
            _type,
            text
          }
        }
      }
    },
    gallery[] {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`;

export const indexFeedQuery = groq`
  *[_type == "work" && discipline == $section] | order(featured desc, order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    "tags": tags[]->name,
    gallery[] {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`;

export const indexFeedByTagsQuery = groq`
  *[_type == "work" && discipline == $section && count(array::intersect(tags, $tags)) > 0] | order(featured desc, order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    "tags": tags[]->name,
    gallery[] {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`;

export const allTagsQuery = groq`
  array::unique(*[_type == "work" && discipline == $section].tags[]->name)
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    title,
    description,
    keywords,
    favicon {
      ...,
      "url": asset->url,
      alt
    },
    ogImage {
      ...,
      "url": asset->url,
      alt
    },
    themeColors,
    seo
  }
`;

export const featuredWorksQuery = groq`
  *[_type == "work" && discipline == $section && featured == true] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    featuredImage {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`;