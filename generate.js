const isBinaryFileSync = require("isbinaryfile").isBinaryFileSync;
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const ignoredDirs = ["node_modules", "build", "dist", ".git"];
const excludedFiles = [];
const filesContent = [];

if (!process.env.ROOT_PATH) {
  process.exit(1);
}

const rootPath = path.resolve(process.env.ROOT_PATH);
console.log("path", rootPath);

const files = getDirFiles(rootPath);
files?.forEach(processFile);

if (files) {
  const stream = fs.createWriteStream("code.txt");
  stream.on("error", (e) => console.error(e));
  filesContent.forEach((content) => stream.write(content));
  stream.end();
}

console.log("done");
console.log("total files", files?.length);
console.log("excluded binary files", excludedFiles.length);
console.log("files with content", filesContent.length);

/**
 * @param {string} dirPath 
 * @param {string[]} arrayOfFiles 
 * @returns 
 */
function getDirFiles(dirPath, arrayOfFiles = []) {
  const isIgnoredDirectory = ignoredDirs.some((ignoredDir) => {
    const lastPathPart = dirPath.split('/').at(-1);
    return lastPathPart === ignoredDir;
  });

  if (isIgnoredDirectory) {
    const lastPathPart = dirPath.split('/').at(-1);
    console.warn("ignoring", dirPath, '| match:', lastPathPart);
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const stat = fs.statSync(dirPath + "/" + file);

    if (stat.isDirectory()) {
      getDirFiles(dirPath + "/" + file, arrayOfFiles) || [];
    } else {
      // заполнение глобального массива при обнаружении файла
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

function processFile(filePath) {
  if (isBinaryFileSync(filePath)) {
    excludedFiles.push(filePath);
  } else {
    const content = fs.readFileSync(filePath).toString();
    filesContent.push(content);
  }
}
