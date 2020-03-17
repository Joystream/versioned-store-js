// general
import languageOne = require('./general/language1.json');
import curationStatusOne = require('./general/curationStatus1.json');
// import curationStatusTwo = require('./general/curationStatus2.json');
 // music
import musicAlbumOne = require('./music/musicAlbum1.json');
// import musicAlbumTwo = require('./music/musicAlbum2.json');

  //test
import testOne = require('./test/test1.json');

const addClassSchemaJsons = [
  languageOne,curationStatusOne,
  //curationStatusTwo,
  musicAlbumOne,
  //musicAlbumTwo,
  testOne
]

export default addClassSchemaJsons