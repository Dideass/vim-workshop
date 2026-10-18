import type {CSSProperties} from 'react';
import {PixelTitle} from './PixelTitle';

export const completionColors=['#c9b2a0','#a9c7b7','#b8b2d1','#d1b2b8','#a6c6c9','#cfbf93','#b3c19b','#b6bfd6','#d0b099','#c3adca','#a9c2cf',...Array.from({length:22},(_,i)=>`hsl(${Math.round((i*137.508+31)%360)} 28% 75%)`)];
const rainbow=['#d1a6ad','#d3b59a','#d4c797','#aec79f','#a4c8c3','#aabfda','#bbaed3'];

// Whole grid cells keep the stamp in the same visual language as the wordmark.
const stamp=[[1,5],[2,6],[3,7],[4,8],[5,7],[6,6],[7,5],[8,4],[9,3],[10,2]];
export function PixelCheck({className='',colors}:{className?:string;colors?:readonly string[]}){
 return <svg className={`pixel-check ${className}`} viewBox="0 0 12 12" aria-hidden="true" shapeRendering="crispEdges">
  {stamp.map(([x,y],i)=><rect key={i} x={x} y={y} width="1" height="1" fill={colors?.[Math.floor(i/stamp.length*colors.length)]} style={{'--pixel-order':i} as CSSProperties}/>)}
 </svg>;
}

const fragments=[[-180,-60],[-150,90],[-112,-122],[-74,135],[-24,-145],[34,138],[92,-130],[145,108],[180,-70],[198,40],[-194,24],[150,-125]];
export function Completion({title,subtitle,detail,count,total,level,final=false}:{title:string;subtitle?:string;detail:string;count:number;total:number;level:number;final?:boolean}){
 const color=completionColors[level-1]||completionColors[0];
 const style={'--completion-color':color,'--completion-rainbow':`linear-gradient(90deg,${rainbow.map((c,i)=>`${c} ${i/rainbow.length*100}% ${(i+1)/rainbow.length*100}%`).join(',')})`} as CSSProperties;
 return <div className="completion-scene" aria-hidden="true">
  <div className="completion-fragments">{fragments.map(([x,y],i)=><i key={i} style={{'--x':`${x}px`,'--y':`${y}px`,'--delay':`${120+i*24}ms`} as CSSProperties}/>)}</div>
  <div className={`completion-stamp${final?' is-final':''}`} style={style}>
   <PixelCheck colors={final?rainbow:undefined}/>
   <strong><PixelTitle text={title} colors={final?rainbow:undefined}/><span className="sr-only">{title}</span></strong>
   {subtitle&&<span className="completion-congratulations"><PixelTitle text={subtitle} colors={final?rainbow:undefined} small/><span className="sr-only">{subtitle}</span></span>}
   <span className="completion-detail">{detail}</span>
   <div className="completion-progress">{Array.from({length:total},(_,i)=><i key={i} className={i<count?'filled':''} style={final?{backgroundColor:rainbow[Math.floor(i/total*rainbow.length)]}:undefined}/>)}</div>
  </div>
 </div>;
}
