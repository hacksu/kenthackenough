'use strict';

let path = require('path');
let log = rootRequire('app/helpers/logger');

module.exports = {

  /**
  * Retrieve an icon specified by the request query
  * GET /resources/icon?color=black|white|red
  *                    &format=png|svg
  *                    &size=16|24|32|48|64|128|256|512
  *                    &name=font-awesome-name
  */
  icon: (req, res) => {
    let errors = validateIcon(req.query);
    if (errors.length) return res.json({errors});

    let color = req.query.color || 'black';
    let format = req.query.format || 'png';
    let size = req.query.size || '48';
    let name = req.query.name || 'file';

    let file;
    if (format == 'png') {
      file = `icons/${color}/${format}/${size}/${name}.${format}`;
    } else {
      file = `icons/${color}/${format}/${name}.${format}`;
    }

    log.info('Accessing icon at ${file}');

    let r = path.join(__dirname, '../../public');

    return res.sendFile(file, {root: r});
  }

};

function validateIcon(query) {
  var errors = [];

  // Must have a query of some kind
  if (!query) {
    errors.push('You must specify an icon color, format, size, and name');
    return errors;
  }

  // Must have one of the available colors
  let colors = ['black', 'white', 'red'];
  if (query.color && colors.indexOf(query.color) < 0) {
    errors.push('The color must "black", "white", or "red"');
  }

  // Must be svg or png
  let formats = ['png', 'svg'];
  if (query.format && formats.indexOf(query.format) < 0) {
    errors.push('The format must be "png" or "svg"');
  }

  // Must be one of the available sizes
  let sizes = ['16', '24', '32', '48', '64', '128', '256', '512'];
  if (query.size && sizes.indexOf(query.size) < 0) {
    errors.push('The size must 16, 24, 32, 48, 64, 128, 256, or 512');
  }

  return errors;

}