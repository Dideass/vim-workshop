export const SPACE_MARKER_COLOR='#747474';

export function installSpaceMarkers(canvas){
 const context=canvas.getContext('2d');
 const fillText=context.fillText.bind(context);
 // vim-wasm 0.0.13 clears two cells for the UTF-8 listchar '·'. Keep the
 // native listchar ASCII and substitute its glyph only while painting it.
 context.fillText=function(text,...args){
  return fillText(text==='.'&&this.fillStyle===SPACE_MARKER_COLOR?'·':text,...args);
 };
}
