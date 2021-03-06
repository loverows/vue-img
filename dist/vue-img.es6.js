const VueImg$1 = Object.create(null);

// Check webP support
VueImg$1.canWebp = false;
const img = new Image();
img.onload = () => { VueImg$1.canWebp = true; };
img.src = 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAsAAAABBxAREYiI/gcAAABWUDggGAAAADABAJ0BKgEAAQABABwlpAADcAD+/gbQAA==';

// Default cdn prefix
const protocol = location.protocol === 'https:' ? 'https://' : 'http://';
const env = document.domain.match(/.(alpha|beta).ele(net)?.me$/);
VueImg$1.cdn = protocol + (env ? `fuss${env[0]}` : 'fuss10.elemecdn.com');

// Translate hash to path
const hashToPath = hash => hash.replace(/^(\w)(\w\w)(\w{29}(\w*))$/, '/$1/$2/$3.$4');

// Get image size
const getSize = (width, height) => {
  const thumb = 'thumbnail/';
  const cover = `${width}x${height}`;

  if (width && height) return `${thumb}!${cover}r/gravity/Center/crop/${cover}/`
  if (width) return `${thumb}${width}x/`
  if (height) return `${thumb}x${height}/`
  return ''
};

// Get image size
const getSrc = ({ hash, width, height, prefix, suffix, quality } = {}) => {
  if (!hash || typeof hash !== 'string') return ''

  const _prefix = typeof prefix === 'string' ? prefix : VueImg$1.cdn;
  const _suffix = typeof suffix === 'string' ? suffix : '';
  const _quality = typeof quality === 'number' ? `quality/${quality}/` : '';
  const _format = VueImg$1.canWebp ? 'format/webp/' : '';
  const params = `${_quality}${_format}${getSize(width, height)}${_suffix}`;

  return _prefix + hashToPath(hash) + (params ? `?imageMogr/${params}` : '')
};

// Set img.src or element.style.backgroundImage
const setAttr = (el, src, tag) => {
  tag === 'img' ? el.src = src : el.style.backgroundImage = `url('${src}')`;
};

// If value is an object, `binding.oldValue === binding.value`
const checkAttr = (el, src, tag) => {
  const re = /^url\(['"]?(.*?)['"]?\)$/;
  const oldSrc = tag === 'img' ? el.src : el.style.backgroundImage.match(re)[1];
  return src === oldSrc
};

// Vue plugin installer
const install = (Vue, opt = {}) => {

  const updateCallback = (el, binding, vnode) => {
    const params = binding.value;
    const hash = Object.prototype.toString.call(params).slice(8, -1) === 'Object' ? params.hash : params;
    if (!hash || typeof hash !== 'string') return

    const src = getSrc({
      hash,
      width: params.width,
      height: params.height,
      prefix: opt.prefix,
      suffix: params.suffix,
      quality: params.hasOwnProperty('quality') ? params.quality : opt.quality
    });
    if (checkAttr(el, src, vnode.tag)) return

    const img = new Image();

    img.onload = () => {
      setAttr(el, src, vnode.tag);
    };

    const error = params.hasOwnProperty('error') ? params.error : opt.error;
    if (error && typeof error === 'string') {
      const errSrc = getSrc({
        hash: error,
        width: params.width,
        height: params.height,
        prefix: opt.prefix
      });

      img.onerror = () => {
        setAttr(el, errSrc, vnode.tag);
      };
    }

    img.src = src;
  };

  // Register Vue directive
  Vue.directive('img', {
    bind(el, binding, vnode) {
      const params = binding.value;
      const loading = params.hasOwnProperty('loading') ? params.loading : opt.loading;
      const src = getSrc({
        hash: loading,
        width: params.width,
        height: params.height,
        prefix: opt.prefix
      });

      if (src) setAttr(el, src, vnode.tag);

      updateCallback(el, binding, vnode);
    },

    update: updateCallback
  });

};

VueImg$1.getSrc = getSrc;
VueImg$1.install = install;

export default VueImg$1;
