import {
  parseCSTimerFile,
  validateCSTimerFile,
  convertToSpeedcubeFormat,
} from "./cstimer-import";

// Test avec un petit échantillon du fichier cstimer
const testCSTimerData = `{
  "session1": [
    [[0,40338],"U2 F2 U' F2 L2 U' R2 D' F2 D2 F' L F D' F U B2 F2 L' B2","",1738353671],
    [[0,30313],"R B L2 B2 U2 L2 U F2 U2 L2 B2 D' F2 L F' R' D' R U L2 B","",1738353996],
    [[2000,39570],"F2 D L2 U R2 U' F2 U2 R2 B2 L' B' U2 R2 D2 U F2 L B' F","",1738357947]
  ],
  "session2": [
    [[0,225206],"D' B2 R2 B2 L2 U2 L2 U F2 U R2 L' U' R F R' L2 B D2 R' Fw2 Rw2 U2 D' L' Fw2 U Uw2 L B2 U2 D Rw2 Fw U2 L2 Fw Rw U L' Fw U' Rw2 Uw B","",1739120643]
  ],
  "properties": {
    "sessionData": "{\\"1\\":{\\"name\\":\\"333\\",\\"opt\\":{},\\"rank\\":1,\\"stat\\":[8037,0,22052.965036705238],\\"date\\":[1738353671,1754605478]},\\"2\\":{\\"name\\":\\"444\\",\\"opt\\":{\\"scrType\\":\\"444wca\\"},\\"rank\\":3,\\"stat\\":[1,0,225206],\\"date\\":[1739120643,1739120643]}}"
  }
}`;

console.log("=== Test validation ===");
console.log("Fichier valide:", validateCSTimerFile(testCSTimerData));

console.log("\n=== Test parsing ===");
const result = parseCSTimerFile(testCSTimerData);
console.log("Résultat:", JSON.stringify(result, null, 2));

if (result.success && result.data) {
  console.log("\n=== Test conversion ===");
  const converted = convertToSpeedcubeFormat(result.data.sessions);
  console.log("Solves convertis:", JSON.stringify(converted, null, 2));
}
