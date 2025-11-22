const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Importation de la liste des 20 employés
const employees = require('./employees.js');

// Charger la définition Protobuf depuis employee.proto
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Objet racine compatible avec message Employees
let jsonObject = { employee: employees };

// Options XML
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

// -------------- JSON : encodage -----------------------

console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

// -------------- JSON : décodage -----------------------
console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');


// -------------- XML : encodage ------------------------

console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

// -------------- XML : décodage ------------------------
console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');


// -------------- Protobuf : encodage -------------------

console.time('Protobuf encode');

let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) {
  throw Error(errMsg);
}

let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();

console.timeEnd('Protobuf encode');

// -------------- Protobuf : décodage -------------------
console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');


// -------------- Écriture des fichiers -----------------

fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);



// -------------- Mesure des tailles ---------------------

const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;


console.log(`La taille des fichiers générés :`);
console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

