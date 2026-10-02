import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const cards=[...html.matchAll(/<article class="track-card">[\s\S]*?<\/article>/g)].map(x=>x[0]);
if(cards.length!==48)throw Error(`Expected 48 tracks, found ${cards.length}`);
const numbers=cards.map(x=>x.match(/class="track-no">(\d+)/)[1]);
if(new Set(numbers).size!==48)throw Error('Duplicate track numbers');
for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(m[1].includes('application/ld+json'))JSON.parse(m[2]);else new vm.Script(m[2]);
}
for(const card of cards){
 const audio=card.match(/<audio[^>]*src="([^"]+)"/)[1];
 if(!fs.existsSync(audio)||fs.statSync(audio).size===0)throw Error(`Missing audio: ${audio}`);
}
for(const row of JSON.parse(fs.readFileSync('assets/data/batch-20261001.json','utf8'))){
 for(const asset of [row.audio,row.artwork])if(!fs.existsSync(asset)||fs.statSync(asset).size===0)throw Error(`Missing asset ${asset}`);
}
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
fs.copyFileSync('index.html','dist/index.html');fs.cpSync('assets','dist/assets',{recursive:true});
console.log('Build passed: 48 unique tracks, all audio and 13 new covers present, inline JavaScript syntax valid.');
