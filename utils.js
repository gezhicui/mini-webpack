const fs = require('fs');

//将\替换成/
function toUnixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

//获取工作目录，在哪里执行命令就获取哪里的目录，这里获取的也是跟操作系统有关系，要替换成/
const baseDir = toUnixPath(process.cwd());

//获取文件路径
function tryExtensions(modulePath, extensions) {
  if (fs.existsSync(modulePath)) {
    return modulePath;
  }
  for (let i = 0; i < extensions?.length; i++) {
    let filePath = modulePath + extensions[i];
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(`无法找到${modulePath}`);
}

//生成运行时代码
function getSource(chunk) {
  return `
    (() => {
     var modules = {
       ${chunk.modules.map(
         module => `
         "${module.id}": (module) => {
           ${module._source}
         }
       `
       )}  
     };
     var cache = {};
     function require(moduleId) {
       var cachedModule = cache[moduleId];
       if (cachedModule !== undefined) {
         return cachedModule.exports;
       }
       var module = (cache[moduleId] = {
         exports: {},
       });
       modules[moduleId](module, module.exports, require);
       return module.exports;
     }
     var exports ={};
     ${chunk.entryModule._source}
   })();
    `;
}

module.exports = {
  toUnixPath,
  baseDir,
  tryExtensions,
  getSource,
};
