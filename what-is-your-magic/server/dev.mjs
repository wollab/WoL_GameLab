import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHandler} from './statistics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const handler=createHandler();
http.createServer(async(req,res)=>{
 if(req.url.split('?')[0]==='/api/result-stats'){let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){res.writeHead(413);res.end();return;}}req.body=body||undefined;return handler(req,res);}
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return;}
 const file=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
}).listen(4193,'127.0.0.1',()=>console.log('YourMagic development http://127.0.0.1:4193'));
