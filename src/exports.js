/**
 * @description UMD support
 */

!function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define([], factory);
  else if (typeof module === 'object' && module.exports)
    module.exports = factory();
  else
    root.qrgen = factory();
}(typeof window !== 'undefined' ? window : this, function () {
  return {
    canvas: QRCanvas,
  };
});
