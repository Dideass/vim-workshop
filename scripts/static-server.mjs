import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export function serve(root,port=4174) {
 const base=path.resolve(root);
 return new Promise(resolve=>{const server=http.createServer(async(req,res)=>{
  try {let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/between-lines\//,'/'); if(name.endsWith('/'))name+='index.html';
   const target=path.resolve(base,'.'+name); if(!target.startsWith(base+path.sep))throw Error('Invalid path');
   const data=await readFile(target); const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'}[path.extname(target)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});res.end(data);
  }catch {res.writeHead(404);res.end('Not found');}
 }).listen(port,'127.0.0.1',()=>resolve(server));});
}
