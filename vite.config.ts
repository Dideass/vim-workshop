import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'));
export default defineConfig({base:'./',define:{'import.meta.env.VITE_RUNTIME_VERSION':JSON.stringify(version)},server:{port:4173,strictPort:true},preview:{port:4173,strictPort:true}});
