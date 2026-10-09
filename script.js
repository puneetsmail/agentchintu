'use strict';
const topics = {
 ideas: {number:'01 / 03',title:'“Is this a business,<br>or just a very long<br>shower thought?”',text:"Let's find the customer, the problem, and the cheapest way to be wrong. The logo can wait five minutes.",items:['Pressure-test the idea','Find the useful evidence','Make a first version'],note:'AMBITION: HIGH. HAND-WAVING: LOW.'},
 content: {number:'02 / 03',title:'“I have a point.<br>It currently needs<br>fourteen paragraphs.”',text:"Let's find the sharp bit, make it sound like you, and delete the paragraph that's just wearing a tie.",items:['Find the real point','Shape the story','Make it worth reading'],note:'PERSONALITY: YES. CORPORATE CONFETTI: NO.'},
 life: {number:'03 / 03',title:'“Can we make life<br>a little less<br>spreadsheet-shaped?”',text:"A trip, a comparison, or the thing you've been meaning to sort. Let's turn the open tabs into one sensible next step.",items:['Research the options','Check the trade-offs','Untangle the plan'],note:'LESS ADMIN. MORE ACTUAL LIFE.'}
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
 tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});
 const data=topics[tab.dataset.topic];
 document.getElementById('example').setAttribute('aria-labelledby',tab.id);
 document.getElementById('example-title').innerHTML=data.title;
 document.getElementById('example-text').textContent=data.text;
 document.getElementById('quest-number').textContent=data.number;
 document.getElementById('example-note').textContent=data.note;
 document.getElementById('example-list').replaceChildren(...data.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectTab(tab));
 tab.addEventListener('keydown',event=>{
  let target;
  if(event.key==='ArrowDown'||event.key==='ArrowRight')target=(index+1)%tabs.length;
  if(event.key==='ArrowUp'||event.key==='ArrowLeft')target=(index+tabs.length-1)%tabs.length;
  if(event.key==='Home')target=0;
  if(event.key==='End')target=tabs.length-1;
  if(target!==undefined){event.preventDefault();selectTab(tabs[target]);tabs[target].focus()}
 });
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.getElementById('motion'),character=document.getElementById('character');
let paused=reduced.matches;
function syncMotion(){document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'Play motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused)); document.dispatchEvent(new Event('chintu-motion-change'))}
syncMotion();
motion.addEventListener('click',()=>{paused=!paused;syncMotion()});
reduced.addEventListener('change',event=>{paused=event.matches;syncMotion()});
const thoughts=["What if we just made it?","That meeting could've been a meme.",'Strong opinion. Weak Wi-Fi.','Plot twist: I checked.','The footnote had a plot twist.','Hear me out.'];
let thought=0,pokeTimeout;
character.addEventListener('click',()=>{
 document.getElementById('hello').textContent=thoughts[thought++%thoughts.length];
 if(!paused&&!reduced.matches){character.classList.add('poke');clearTimeout(pokeTimeout);pokeTimeout=setTimeout(()=>character.classList.remove('poke'),350)}
});
// All face layers stay vector sharp, including on high-density displays.
const face=character.querySelector('.chintu-face');
const body=character.querySelector('.chintu-body');
const glints=[...character.querySelectorAll('.chintu-glint')];
let targetX=0,targetY=0,gazeX=0,gazeY=0,gazeFrame=0,lastPointer=null,resetTimer;
const clamp=(value)=>Math.max(-1,Math.min(1,value));
function renderGaze(){
 gazeFrame=0;
 if(paused||reduced.matches){gazeX=0;gazeY=0;targetX=0;targetY=0;}
 else {gazeX+=(targetX-gazeX)*.13;gazeY+=(targetY-gazeY)*.13;}
 face.setAttribute('transform',`translate(${(gazeX*22).toFixed(2)} ${(gazeY*17).toFixed(2)}) rotate(${(gazeX*1.4).toFixed(2)} 558 515)`);
 body.setAttribute('transform',`rotate(${(gazeX*1.7).toFixed(2)} 558 640)`);
 glints.forEach(glint=>glint.setAttribute('transform',`translate(${(gazeX*9).toFixed(2)} ${(gazeY*9).toFixed(2)})`));
 if(Math.abs(targetX-gazeX)+Math.abs(targetY-gazeY)>.003)gazeFrame=requestAnimationFrame(renderGaze);
}
function queueGaze(){if(!gazeFrame)gazeFrame=requestAnimationFrame(renderGaze)}
function updateGaze(x,y){
 if(paused||reduced.matches||document.hidden)return;
 const bounds=character.getBoundingClientRect();
 targetX=clamp((x-(bounds.left+bounds.width*.51))/Math.max(180,bounds.width*.6));
 targetY=clamp((y-(bounds.top+bounds.height*.48))/Math.max(180,bounds.height*.6));
 queueGaze();
}
function resetGaze(){lastPointer=null;targetX=0;targetY=0;queueGaze()}
window.addEventListener('pointermove',event=>{
 lastPointer={x:event.clientX,y:event.clientY};updateGaze(event.clientX,event.clientY);
 if(event.pointerType==='touch'){clearTimeout(resetTimer);resetTimer=setTimeout(resetGaze,1600)}
},{passive:true});
character.addEventListener('pointerdown',event=>{updateGaze(event.clientX,event.clientY);if(event.pointerType!=='mouse'){clearTimeout(resetTimer);resetTimer=setTimeout(resetGaze,1600)}},{passive:true});
window.addEventListener('scroll',()=>{if(lastPointer)updateGaze(lastPointer.x,lastPointer.y)},{passive:true});
window.addEventListener('resize',()=>{if(lastPointer)updateGaze(lastPointer.x,lastPointer.y)},{passive:true});
document.documentElement.addEventListener('pointerleave',resetGaze);
window.addEventListener('blur',resetGaze);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetGaze()});
document.addEventListener('chintu-motion-change',()=>{targetX=0;targetY=0;queueGaze()});
