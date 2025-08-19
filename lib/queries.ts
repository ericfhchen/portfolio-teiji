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
    tags,
    hero {
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
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      _type == "imageBleed" => {
        ...,
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
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
    tags,
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
    tags,
    gallery[] {
      ...,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`;

export const allTagsQuery = groq`
  array::unique(*[_type == "work" && discipline == $section].tags[])
`;