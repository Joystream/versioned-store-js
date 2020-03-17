// general
import mediaObject = require('./general/mediaObject.json');
import language = require('./general/language.json');
import contentLicense = require('./general/contentLicense.json');
import publicationStatus = require('./general/publicationStatus.json');
import curationStatus = require('./general/curationStatus.json');
import featuredContent = require('./general/featuredContent.json');
// video
import video = require('./video/video.json');
import videoCategory = require('./video/videoCategory.json');
  // music
import musicAlbum = require('./music/musicAlbum.json');
import musicTrack = require('./music/musicTrack.json');
import musicGenre = require('./music/musicGenre.json');
import musicMood = require('./music/musicMood.json');
import musicTheme = require('./music/musicTheme.json');
  //test
// import test = require('./test/test.json');

const createClassJsons = [
  mediaObject,language,contentLicense,publicationStatus,curationStatus,featuredContent,
  video,videoCategory,
  musicAlbum,musicGenre,musicMood,musicTheme,musicTrack,
  // test
]

export default createClassJsons

