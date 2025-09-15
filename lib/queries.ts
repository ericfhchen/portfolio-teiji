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
    client,
    "tags": tags[]->name,
    coverImage {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    heroAsset {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    hoverMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    description,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip,
        alt
      },
      _type == "projectImage" => {
        ...,
        uploadedImage {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        },
        indexItemRef-> {
          _id,
          title,
          description,
          image {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          }
        }
      },
      _type == "videoMux" => {
        ...,
        asset {
          ...,
          asset-> {
            ...,
            playbackId,
            data,
            status,
            assetId
          }
        },
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
          source,
          uploadedImage {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          indexItemRef-> {
            _id,
            title,
            description,
            image {
              ...,
              "lqip": asset->metadata.lqip,
              alt
            }
          }
        }
      },
      _type == "imageBleed" => {
        ...,
        media {
          mediaType,
          mediaType == "image" => {
            image {
              ...,
              "lqip": asset->metadata.lqip,
              alt
            }
          },
          mediaType == "video" => {
            video {
              // Properly dereference the MUX asset
              asset {
                ...,
                asset-> {
                  ...,
                  playbackId,
                  data,
                  status,
                  assetId
                }
              },
              controls,
              poster {
                ...,
                "lqip": asset->metadata.lqip,
                alt
              },
              captions {
                asset
              }
            }
          },
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
    }
  }
`;

export const indexFeedQuery = groq`
  *[_type == "indexItem" && discipline == $section] | order(orderRank asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    year,
    medium,
    description,
    "tags": tags[]->name,
    featuredMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    gallery[] {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    }
  }
`;

export const indexFeedByTagsQuery = groq`
  *[_type == "indexItem" && discipline == $section && count(tags[]->name[@ in $tags]) > 0] | order(orderRank asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    year,
    medium,
    description,
    "tags": tags[]->name,
    featuredMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    gallery[] {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    }
  }
`;

export const allTagsQuery = groq`
  *[_type == "tag" && _id in *[_type == "indexItem" && discipline == $section].tags[]._ref].name
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
    description,
    featuredImage {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    }
  }
`;

export const workPageQuery = groq`
  *[_type == "work" && discipline == $section && featured == true] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    year,
    medium,
    description,
    coverImage {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    },
    hoverMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    }
  }
`;

export const aboutQuery = groq`
  *[_type == "about" && discipline == $section][0] {
    _id,
    discipline,
    bio,
    cv[] {
      _key,
      year,
      text
    },
    "services": services[]->name,
    clients[] {
      _key,
      name,
      url
    },
    email,
    mediaItem {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          alt
        }
      },
      mediaType == "video" => {
        video {
          // Properly dereference the MUX asset
          asset {
            ...,
            asset-> {
              ...,
              playbackId,
              data,
              status,
              assetId
            }
          },
          controls,
          poster {
            ...,
            "lqip": asset->metadata.lqip,
            alt
          },
          captions {
            asset
          }
        }
      },
      alt
    }
  }
`;