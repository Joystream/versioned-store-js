// general
import mediaObject = require('./general/mediaObject0.json');
import language = require('./general/language0.json');
import contentLicense = require('./general/contentLicense0.json');
import publicationStatus = require('./general/publicationStatus0.json');
import curationStatus = require('./general/curationStatus0.json');
import featuredContent = require('./general/featuredContent0.json');
// video
import video = require('./video/video0.json');
import videoCategory = require('./video/videoCategory0.json');
// music
import musicAlbum = require('./music/musicAlbum0.json');
import musicTrack = require('./music/musicTrack0.json');
import musicGenre = require('./music/musicGenre0.json');
import musicMood = require('./music/musicMood0.json');
import musicTheme = require('./music/musicTheme0.json');
//test
// import test = require('./test/test0.json');

const addClassSchemaJsons = [
  mediaObject,language,contentLicense,publicationStatus,curationStatus,featuredContent,
  video,videoCategory,
  musicAlbum,musicGenre,musicMood,musicTheme,musicTrack,
  // test
]

export default addClassSchemaJsons
