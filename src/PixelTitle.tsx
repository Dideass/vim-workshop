import type {CSSProperties} from 'react';
import {chinesePixels} from './pixel-chinese';

// Fixed pixel cells, like the logo, instead of a scaled or blurred outline font.
const alphabet:Record<string,string[]>={
 A:['01110','10001','10001','11111','10001','10001','10001'],
 C:['01111','10000','10000','10000','10000','10000','01111'],
 D:['11110','10001','10001','10001','10001','10001','11110'],
 E:['11111','10000','10000','11110','10000','10000','11111'],
 G:['01111','10000','10000','10111','10001','10001','01111'],
 I:['11111','00100','00100','00100','00100','00100','11111'],
 L:['10000','10000','10000','10000','10000','10000','11111'],
 N:['10001','11001','11001','10101','10011','10011','10001'],
 O:['01110','10001','10001','10001','10001','10001','01110'],
 R:['11110','10001','10001','11110','10100','10010','10001'],
 S:['01111','10000','10000','01110','00001','00001','11110'],
 T:['11111','00100','00100','00100','00100','00100','00100'],
 U:['10001','10001','10001','10001','10001','10001','01110'],
 V:['10001','10001','10001','10001','10001','01010','00100'],
 '!':['1','1','1','1','1','0','1'],
};

export function PixelTitle({text,colors,small=false}:{text:string;colors?:readonly string[];small?:boolean}){
 const isChinese=/[\u4e00-\u9fff]/.test(text);const height=isChinese?16:7;
 let width=0;
 const pixels:{x:number;y:number}[]=[];
 for(const char of text.toUpperCase()){
  if(char===' '){width+=4;continue;}
  const rows=chinesePixels[char]||alphabet[char];
  if(!rows)continue;
  rows.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')pixels.push({x:width+x,y});}));
  width+=rows[0].length+(isChinese?2:1);
 }
 width-=isChinese?2:1;
 const columns=[...new Set(pixels.map(p=>p.x))].sort((a,b)=>a-b);
 const columnColors=new Map(columns.map((x,i)=>[x,colors?.[Math.floor(i/columns.length*colors.length)]]));
 return <svg className="pixel-title" viewBox={`0 0 ${width} ${height}`} style={{'--pixel-width':width,'--pixel-unit':`${small?(isChinese?1:2):(isChinese?2:3)}px`} as CSSProperties} aria-hidden="true" shapeRendering="crispEdges">
  {pixels.map(({x,y})=><rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={columnColors.get(x)||'currentColor'}/>)}
 </svg>;
}
