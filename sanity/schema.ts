import { type SchemaTypeDefinition } from 'sanity'

import work from './schemas/work'
import indexItem from './schemas/indexItem'
import tag from './schemas/tag'
import siteSettings from './schemas/siteSettings'
import about from './schemas/about'
import imageWithAlt from './schemas/objects/imageWithAlt'
import imageLayout from './schemas/objects/imageLayout'
import imageDual from './schemas/objects/imageDual'
import imageRow from './schemas/objects/imageRow'
import imageBleed from './schemas/objects/imageBleed'
import textAside from './schemas/objects/textAside'
import projectImage from './schemas/objects/projectImage'
import spacer from './schemas/objects/spacer'

export interface FeedItem {
  _id: string;
  src: string;
  alt: string;
  lqip: string;
  parentSlug: string;
  parentTitle: string;
  parentTags: string[];
  index: number;
  year?: number;
  medium?: string;
  description?: string;
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    work,
    indexItem,
    tag,
    siteSettings,
    about,
    // Objects
    imageWithAlt,
    imageLayout,
    imageDual,
    imageRow,
    imageBleed,
    textAside,
    projectImage,
    spacer,
  ],
}