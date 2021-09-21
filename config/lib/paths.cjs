let path = require('path');
let fs = require('fs');

exports._path = function(...args) {
    const pth = path.join(...args);
    let objs = (this?.paths || exports.paths);
    for (const key in objs) {
        const value = objs[key];
        if (pth.substr(0, key.length) == key) {
            return path.join(value, pth.substr(key.length));
        }
    }
    return pth;
}

exports.path = function(...args) {
    const pth = this._path(...args);
    const dir = path.extname(pth).length > 0 ? path.dirname(pth) : pth;
    if (!fs.existsSync(dir)) {
        const rdir = path.relative(process.cwd(), dir)
        if (rdir.length > 0) {
            console.log({ mkdir: rdir })
            fs.mkdirSync(rdir, { recursive: true })
        }
        
    }
    return pth;
}