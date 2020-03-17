import { PropertyValueInputType } from '../../../types/PropertyTypes';

// general
const language:PropertyValueInputType[] = require('./language');
const contentLicense:PropertyValueInputType[] = require('./content-license');
const publicationStatus:PropertyValueInputType[] = require('./publication-status');
const curationStatus:PropertyValueInputType[] = require('./curation-status');
// video
const videoCategory:PropertyValueInputType[] = require('./video-category');
  // music
const musicGenre:PropertyValueInputType[] = require('./music-genre-allmusic');
const musicMood:PropertyValueInputType[] = require('./music-mood-allmusic');
const musicTheme:PropertyValueInputType[] = require('./music-theme-allmusic');
  //test
const test:PropertyValueInputType[] = require('./test');

export const entityValueList:PropertyValueInputType[][] = [
  language,contentLicense,publicationStatus,curationStatus,
  videoCategory,
  musicGenre,musicMood,musicTheme,
  test
]