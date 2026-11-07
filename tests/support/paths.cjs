'use strict';
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
module.exports={ROOT,APP_DIR:path.join(ROOT,'app'),APP_HTML:path.join(ROOT,'app/simulateur.html'),MATRIX_CSV:path.join(ROOT,'data/MATRICE_TECHNIQUES.csv')};
