// A code-native 5×7 pixel alphabet; no remote font or raster asset is needed.
const glyphs:Record<string,string[]>={
 V:['10001','10001','10001','10001','10001','01010','00100'],
 I:['11111','00100','00100','00100','00100','00100','11111'],
 M:['10001','11011','10101','10101','10001','10001','10001'],
 W:['10001','10001','10001','10101','10101','11011','10001'],
 o:['00000','00000','01110','10001','10001','10001','01110'],
 r:['00000','00000','10110','11001','10000','10000','10000'],
 k:['10000','10000','10010','10100','11000','10100','10010'],
 S:['01111','10000','10000','01110','00001','00001','11110'],
 h:['10000','10000','10110','11001','10001','10001','10001'],
 p:['00000','01110','10001','10001','11110','10000','10000'],
};
export function PixelWordmark(){
 let x=0;
 const pixels:{x:number;y:number}[]=[];
 for(const letter of 'VIM WorkShop'){
  if(letter===' '){x+=3;continue;}
  glyphs[letter].forEach((row,y)=>[...row].forEach((bit,column)=>{if(bit==='1')pixels.push({x:x+column,y});}));x+=6;
 }
 return <svg className="pixel-wordmark" viewBox={`0 0 ${x+5} 10`} aria-hidden="true" shapeRendering="crispEdges">
  <g fill="currentColor">{pixels.map(p=><rect key={`${p.x}-${p.y}`} x={p.x} y={p.y+1} width="1" height="1"/>)}</g>
  <rect className="pixel-cursor" x={x+1} y="6" width="3" height="2"/>
 </svg>;
}
