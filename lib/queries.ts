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
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    heroAsset[] {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    hoverMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    hoverTextTop,
    hoverTextBottom,
    description,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "lqip": asset->metadata.lqip,
      },
      _type == "projectImage" => {
        ...,
        uploadedImage {
          ...,
          "lqip": asset->metadata.lqip
        },
        indexItemRef-> {
          _id,
          title,
          description,
          featuredMedia {
            mediaType,
            mediaType == "image" => {
              image {
                ...,
                "lqip": asset->metadata.lqip
              }
            }
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
      _type == "imageDual" => {
        ...,
        images[] {
          _key,
          source,
          uploadedImage {
            ...,
            "lqip": asset->metadata.lqip
          },
          indexItemRef-> {
            _id,
            title,
            description,
            featuredMedia {
              mediaType,
              mediaType == "image" => {
                image {
                  ...,
                  "lqip": asset->metadata.lqip,
                }
              }
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
              },
              captions {
                asset
              }
            }
          },
        }
      },
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
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    gallery[] {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
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
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    gallery[] {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
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
    },
    ogImage {
      ...,
      "url": asset->url,
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
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    hoverTextTop,
    hoverTextBottom
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
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    },
    hoverMedia {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    }
    ,
    hoverTextTop,
    hoverTextBottom
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
    instagramHandle,
    mediaItem {
      mediaType,
      mediaType == "image" => {
        image {
          ...,
          "lqip": asset->metadata.lqip
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
          captions {
            asset
          }
        }
      },
    }
  }
`;