import { canWebp } from './check-webp.js';

// default cdn prefix
const protocol = location.protocol === 'https:' ? 'https://' : 'http://';
const pathname = document.domain.match('alpha.elenet.me')
  ? 'fuss.alpha.elenet.me'
  : 'fuss10.elemecdn.com';
const cdn = protocol + pathname;

// image hash to patch
const hashToPath = hash => hash.replace(/^(\w)(\w\w)(\w{29}(\w*))$/, '/$1/$2/$3.$4');

// image size
const getSize = (width, height) => {
  const sizeParam = 'thumbnail/';
  const cover = `${width}x${height}`;

  if (width && height) return sizeParam + `!${cover}r/gravity/Center/crop/${cover}/`;
  if (width) return sizeParam + `${width}x/`;
  if (height) return sizeParam + `x${height}/`;
  return '';
};

// image src
const getSrc = opt => {
  if (!opt || typeof opt.hash !== 'string' || !opt.hash.length) return '';

  const prefix = typeof opt.prefix === 'string' ? opt.prefix : cdn;
  const quality = typeof opt.quality === 'number' ? `quality/${opt.quality}/` : '';
  const format = canWebp ? 'format/webp/' : '';
  const params = `${quality}${format}${getSize(opt.width, opt.height)}`;
  const suffix = params ? `?imageMogr/${params}` : '';

  return prefix + hashToPath(opt.hash) + suffix;
};

export default getSrc;
