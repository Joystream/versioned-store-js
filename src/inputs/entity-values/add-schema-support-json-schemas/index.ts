//import mediaObject = require('./mediaObject.json');
import language = require('./language.json');
import publicationStatus = require('./publicationStatus.json');
import curationStatus = require('./curationStatus.json');
import contentLicense = require('./contentLicense.json');
//import featuredContent = require('./featuredContent.json');
  // video
//import video = require('./video.json');
import videoCategory = require('./videoCategory.json');

  // music
//import musicAlbum = require('./musicAlbum.json');
//import musicTrack = require('./musicTrack.json');
import musicGenre = require('./musicGenre.json');
import musicMood = require('./musicMood.json');
import musicTheme = require('./musicTheme.json');
// import test = require('./test.json');



const entityJsons = [
  language,publicationStatus,curationStatus,contentLicense,
  videoCategory,
  musicGenre,musicMood,musicTheme,
  // test
]

export default entityJsons

