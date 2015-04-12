'use strict';

var transpiler = require('babel-core');
var Filter     = require('broccoli-persistent-filter');
var clone      = require('clone');
var crypto     = require('crypto');

/*
 * @public
 *
 * new Babel('lib', {
 *  whitelist: [ .... ], // see: http://babeljs.io./docs/usage/transformers/ for value options
 *  blacklist: [ .... ],
 *  optional:  [ .... ],
 *  nonStandard: true | false, // toggle non-standard but on-by-default functionality of babel (like JSX),
 *  highlightCode: true | false, // toggle error codeFrame ansi coloring
 * });
 *
 *
 * @class Babel
 * @param {Tree} inputTree the tree babel transformations should take place on
 * @param {Object} options options to configure this filter
 */
function Babel(inputTree, options) {
  if (!(this instanceof Babel)) {
    return new Babel(inputTree, options);
  }

  var options = options || {};
  var extensions = options.filterExtensions || ['js'];

  this.options = clone(options);
  delete this.options.filterExtensions;

  options.extensions = extensions;

  Filter.call(this, inputTree, options);
}

Babel.prototype = Object.create(Filter.prototype);
Babel.prototype.constructor = Babel;

/*
 * @public
 *
 * While decided to transform a file or not, this list of extensions will be
 * consulted. If the files extension is part of the list, it will be
 * transformed, other-wise it will not be.
 *
 * @property extensions
 */
Babel.prototype.extensions = ['js'];

/*
 * @public
 *
 * transformed files will have there extension changed to this property.
 *
 * @property targetExtension
 */
Babel.prototype.targetExtension = 'js';

/* @public
 *
 * @method cacheKey
 * @returns {String} ...
 */
Babel.prototype.cacheKey = function() {
  return Filter.prototype.cacheKey.call(this) + 'some-checksum-of-the-deps';
};

/* @public
 *
 * @method cacheKeyProcessString
 * @param {String} string
 * @param {String} relativePath
 * @return {String} ...
 */
Babel.prototype.cacheKeyProcessString = function(string, relativePath) {
  return crypto.createHash('md5').update(this.optionsString() + string).digest('hex');
};

/* @public
 *
 * @method processString
 * @param {String} string string contents of the file to be transformed
 * @param {String} relativePath the file path at input time where the string content originated.
 * @return {String} the result of the transformation
 */
Babel.prototype.processString = function (string, relativePath) {
  var options = this.options;
  options.filename = options.sourceMapName = options.sourceFileName = relativePath;

  return this._transform(string, options);
};

/* @private
 *
 * @method _transform
 * @param {String} string string contents of the file to be transformed
 * @param {String} options configuration for the transform
 * @return {String} the result of the transformation
 */
Babel.prototype._transform = function(string, options) {
  return transpiler.transform(string, options);
};

/*
 * @private
 *
 * @method optionsString
 * @returns a stringifeid version of the input options
 */
Babel.prototype.optionsString = function() {
  return (this._optionsString = JSON.stringify(this.options));
};

module.exports = Babel;
