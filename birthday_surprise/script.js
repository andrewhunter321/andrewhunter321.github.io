const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const body=document.body,scenes=$$('.scene'),progress=$('#topProgress'),stars=$('#stars'),aurora=$('#aurora'),tripSite=$('#tripSite'),toast=$('#toast');
let sceneIndex=0,soundOn=true,audioCtx,toastTimer,confetti=[],fxFrame,secretClicks=0,wheelSpinning=false;

function makeStars(){const n=innerWidth<600?80:150;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='star';s.style.left=`${Math.random()*100}%`;s.style.top=`${Math.random()*100}%`;s.style.setProperty('--size',`${.7+Math.random()*2.4}px`);s.style.setProperty('--opacity',`${.2+Math.random()*.8}`);s.style.setProperty('--speed',`${1.4+Math.random()*3.5}s`);s.style.setProperty('--delay',`${-Math.random()*5}s`);stars.appendChild(s)}}makeStars();
addEventListener('pointermove',e=>{const g=$('#cursorGlow');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});

function audio(){if(!audioCtx){const A=window.AudioContext||window.webkitAudioContext;if(A)audioCtx=new A()}if(audioCtx?.state==='suspended')audioCtx.resume()}
function tone(freq,start=.0,dur=.55,vol=.025,type='sine'){if(!soundOn)return;audio();if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,audioCtx.currentTime+start);g.gain.exponentialRampToValueAtTime(vol,audioCtx.currentTime+start+.02);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+start+dur);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+start);o.stop(audioCtx.currentTime+start+dur+.03)}
function chime(level=0){const sets=[[392,523.25],[523.25,659.25],[587.33,739.99],[659.25,783.99],[523.25,659.25,783.99,1046.5]];sets[Math.min(level,4)].forEach((n,i)=>tone(n,i*.08,.75,.026,i%2?'triangle':'sine'))}
function sparkle(){[880,1174.66,1396.91].forEach((n,i)=>tone(n,i*.05,.32,.018,'triangle'))}
$('#soundControl').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',String(soundOn));e.currentTarget.querySelector('.sound-text').textContent=soundOn?'Sound on':'Sound off';if(soundOn)sparkle()});

function goScene(index,delay=600){if(index===sceneIndex)return;const old=scenes[sceneIndex];old.classList.add('leaving');setTimeout(()=>{old.classList.remove('active','leaving');scenes[index].classList.add('active');sceneIndex=index;progress.style.width=scenes[index].dataset.progress+'%';chime(index)},delay)}
$('#activateMission').addEventListener('click',()=>{audio();chime(0);goScene(1,450)});

$$('.mystery-key').forEach(key=>key.addEventListener('click',()=>{if($('#vaultDoor').classList.contains('open'))return;$$('.mystery-key').forEach(k=>k===key?k.classList.add('selected'):k.classList.add('rejected'));$('#vaultStatus').textContent=`${key.dataset.key[0].toUpperCase()+key.dataset.key.slice(1)} key accepted. Vault opening…`;$('#vaultDoor').classList.add('open');sparkle();burstConfetti(55);setTimeout(()=>goScene(2,650),1700)}));

const arena=$('#heartArena');let caught=0;function spawnHearts(){for(let i=0;i<5;i++){const h=document.createElement('button');h.className='catch-heart';h.type='button';h.textContent='♥';h.style.left=`${8+Math.random()*78}%`;h.style.top=`${18+Math.random()*65}%`;h.style.setProperty('--dx',`${-80+Math.random()*160}px`);h.style.setProperty('--dy',`${-70+Math.random()*140}px`);h.style.setProperty('--rot',`${-25+Math.random()*50}deg`);h.style.setProperty('--wander',`${1.8+Math.random()*2.5}s`);h.addEventListener('click',()=>{if(h.classList.contains('caught'))return;h.classList.add('caught');caught++;$('#heartScore').textContent=caught;sparkle();heartsAt(h,5);if(caught===5){burstConfetti(80);setTimeout(()=>goScene(3,650),950)}});arena.appendChild(h)}}spawnHearts();

let clue=0;const clueCards=$$('.clue-card'),clueDots=$$('#clueDots i');function renderClue(){clueCards.forEach((c,i)=>{c.classList.toggle('active',i===clue);c.classList.toggle('past',i<clue)});clueDots.forEach((d,i)=>d.classList.toggle('active',i===clue));$('#nextClue span').textContent=clue===3?'Make a birthday wish':'Decrypt next clue'}
$('#nextClue').addEventListener('click',()=>{sparkle();heartsAt($('#nextClue'),4);if(clue<3){clue++;renderClue()}else goScene(4,550)});

const wishBtn=$('#wishButton'),cake=$('#cakeWorld');let holdStart,holdFrame,wishDone=false;function wishStart(e){if(wishDone)return;e.preventDefault();audio();holdStart=performance.now();function loop(now){const p=Math.min((now-holdStart)/2000,1);wishBtn.style.setProperty('--hold',`${p*360}deg`);if(p<1)holdFrame=requestAnimationFrame(loop);else wishFinish()}holdFrame=requestAnimationFrame(loop)}function wishCancel(){if(wishDone)return;cancelAnimationFrame(holdFrame);wishBtn.style.setProperty('--hold','0deg')}function wishFinish(){wishDone=true;cancelAnimationFrame(holdFrame);cake.classList.add('done');wishBtn.querySelector('strong').textContent='Wish made ♥';wishBtn.querySelector('small').textContent='Let it come true';[392,523.25,659.25,783.99].forEach((n,i)=>tone(n,i*.1,.9,.026));heartsAt(wishBtn,14);burstConfetti(90);setTimeout(()=>goScene(5,700),1800)}wishBtn.addEventListener('pointerdown',wishStart);['pointerup','pointerleave','pointercancel'].forEach(ev=>wishBtn.addEventListener(ev,wishCancel));wishBtn.addEventListener('contextmenu',e=>e.preventDefault());

const scratch=$('#scratchCanvas'),sctx=scratch.getContext('2d');let scratching=false,lastX,lastY,scratchReady=false;function setupScratch(){const r=scratch.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);scratch.width=r.width*d;scratch.height=r.height*d;sctx.setTransform(d,0,0,d,0,0);const g=sctx.createLinearGradient(0,0,r.width,r.height);g.addColorStop(0,'#ad8daf');g.addColorStop(.5,'#6f5879');g.addColorStop(1,'#a788aa');sctx.fillStyle=g;sctx.fillRect(0,0,r.width,r.height);sctx.fillStyle='rgba(255,255,255,.85)';sctx.font='900 28px system-ui';sctx.textAlign='center';sctx.fillText('SCRATCH HERE ✦',r.width/2,r.height/2+10);for(let i=0;i<70;i++){sctx.fillStyle=`rgba(255,255,255,${Math.random()*.18})`;sctx.beginPath();sctx.arc(Math.random()*r.width,Math.random()*r.height,1+Math.random()*3,0,Math.PI*2);sctx.fill()}scratchReady=true}function scratchPos(e){const r=scratch.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:p.clientX-r.left,y:p.clientY-r.top}}function scratchLine(x,y){if(!scratchReady)return;sctx.globalCompositeOperation='destination-out';sctx.lineCap='round';sctx.lineJoin='round';sctx.lineWidth=42;sctx.beginPath();sctx.moveTo(lastX??x,lastY??y);sctx.lineTo(x,y);sctx.stroke();lastX=x;lastY=y}function scratchPercent(){const r=scratch.getBoundingClientRect(),data=sctx.getImageData(0,0,Math.floor(r.width),Math.floor(r.height)).data;let clear=0,total=data.length/4;for(let i=3;i<data.length;i+=16)if(data[i]===0)clear+=4;const pct=Math.min(100,Math.round(clear/total*100));$('#scratchPercent').textContent=`${pct}% revealed`;if(pct>48&&!scratch.dataset.done){scratch.dataset.done='1';sparkle();burstConfetti(70);setTimeout(()=>goScene(6,650),900)}}scratch.addEventListener('pointerdown',e=>{scratching=true;const p=scratchPos(e);lastX=p.x;lastY=p.y;scratch.setPointerCapture(e.pointerId)});scratch.addEventListener('pointermove',e=>{if(!scratching)return;const p=scratchPos(e);scratchLine(p.x,p.y)});scratch.addEventListener('pointerup',()=>{scratching=false;lastX=lastY=null;scratchPercent()});scratch.addEventListener('pointercancel',()=>{scratching=false});
const observer=new MutationObserver(()=>{if($('#sceneScratch').classList.contains('active')&&!scratchReady)setTimeout(setupScratch,100)});observer.observe($('#sceneScratch'),{attributes:true});

let envOpen=false;function openEnv(){if(envOpen)return;envOpen=true;$('#grandEnvelope').classList.add('open');$('#breakSeal').textContent='Something is inside…';sparkle();heartsAt($('#grandEnvelope'),12);setTimeout(()=>{burstConfetti(120);goScene(7,550)},1750)}$('#grandEnvelope').addEventListener('click',openEnv);$('#breakSeal').addEventListener('click',openEnv);

$('#enterAdventure').addEventListener('click',()=>{megaCelebration();scenes[sceneIndex].classList.add('leaving');setTimeout(()=>{scenes.forEach(s=>s.style.display='none');tripSite.classList.add('visible');body.classList.remove('locked');stars.style.opacity='0';aurora.style.opacity='0';progress.style.width='100%';scrollTo(0,0);initScroll();setTimeout(()=>$('#tripNav').classList.add('visible'),500)},800)});

function updateCountdown(){const t=new Date('2026-09-05T14:00:00+01:00').getTime()-Date.now();if(t<=0){$('#countdown .countdown-grid').innerHTML='<div style="grid-column:1/-1"><strong>IT\'S TIME</strong><span>Bruges begins today ♥</span></div>';return}const d=Math.floor(t/86400000),h=Math.floor(t%86400000/3600000),m=Math.floor(t%3600000/60000),s=Math.floor(t%60000/1000);$('#days').textContent=String(d).padStart(2,'0');$('#hours').textContent=String(h).padStart(2,'0');$('#minutes').textContent=String(m).padStart(2,'0');$('#seconds').textContent=String(s).padStart(2,'0')}updateCountdown();setInterval(updateCountdown,1000);

const hotelKey=$('#hotelKeycard');function flipHotelKey(){const flipped=hotelKey.classList.toggle('flipped');hotelKey.setAttribute('aria-pressed',String(flipped));hotelKey.setAttribute('aria-label',flipped?'Tap to show the front of the room key':'Tap to reveal the hotel and room');sparkle();heartsAt(hotelKey,7)}hotelKey.addEventListener('click',flipHotelKey);hotelKey.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flipHotelKey()}});
$('#calendarButton').addEventListener('click',e=>{burstConfetti(120);heartsAt(e.currentTarget,12);showToast('Excitement successfully increased by 1000% ♥')});

const flightRoute=$('#flightPath'),railRoute=$('#routePath'),plane=$('#planeMarker'),train=$('#trainMarker'),mapButton=$('#mapPlay');
let mapPlaying=false;
function animateMarker(marker,path,duration){
  return new Promise(resolve=>{
    if(!marker||!path){resolve();return}
    const length=path.getTotalLength(),started=performance.now();
    function frame(now){
      const p=Math.min((now-started)/duration,1),point=path.getPointAtLength(length*p);
      marker.setAttribute('transform',`translate(${point.x} ${point.y})`);
      if(p<1)requestAnimationFrame(frame);else resolve();
    }
    requestAnimationFrame(frame);
  });
}
mapButton.addEventListener('click',async()=>{
  if(mapPlaying)return;
  mapPlaying=true;
  mapButton.disabled=true;
  plane.setAttribute('transform','translate(160 245)');
  train.setAttribute('transform','translate(520 190)');
  mapButton.querySelector('span').textContent='FR1452: Dublin → Brussels…';
  sparkle();
  await animateMarker(plane,flightRoute,3000);
  burstConfetti(40);
  mapButton.querySelector('span').textContent='All aboard for Bruges…';
  await new Promise(resolve=>setTimeout(resolve,400));
  await animateMarker(train,railRoute,3200);
  mapPlaying=false;
  mapButton.disabled=false;
  mapButton.querySelector('span').textContent='Play it again';
  burstConfetti(90);
  showToast('Dublin → Brussels → Bruges. Journey complete ♥');
});

$('#passport').addEventListener('click',e=>{const p=e.currentTarget;if(!p.classList.contains('open')){p.classList.add('open');sparkle()}else if(!p.classList.contains('stamped')){p.classList.add('stamped');tone(120,.0,.18,.07,'square');burstConfetti(50);showToast('Passport approved for romance ♥')}else p.classList.remove('open')});

$$('.day-tab').forEach(tab=>tab.addEventListener('click',()=>{const id=tab.dataset.day;$$('.day-tab').forEach(t=>{const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on))});$$('.day-panel').forEach(p=>{const on=p.id===id;p.hidden=!on;p.classList.toggle('active',on)});sparkle();heartsAt(tab,5)}));
$$('.hint-button').forEach(b=>b.addEventListener('click',()=>{showToast(b.dataset.message);sparkle();heartsAt(b,7)}));

const wheel=$('#funWheel'),wheelLabels=$$('#funWheel span b'),results=['A giant Belgian waffle','A local beer together','A local beer together','A chocolate shop raid','A local beer togetherr','An extra boat moment','A ridiculous souvenir','A fancy cocktail'];let wheelRotation=0;$('#spinWheel').addEventListener('click',()=>{if(wheelSpinning)return;wheelSpinning=true;const index=Math.floor(Math.random()*results.length),extra=5+Math.floor(Math.random()*3),target=extra*360+(360-index*45-22.5);wheelRotation+=target;wheel.style.transform=`rotate(${wheelRotation}deg)`;$('#wheelResult').textContent='';sparkle();setTimeout(()=>{wheelLabels.forEach((label,i)=>label.style.transform=`rotate(${-i*45-22.5-wheelRotation}deg)`);wheelSpinning=false;$('#wheelResult').textContent=`The wheel has spoken: ${results[index]}!`;burstConfetti(70);showToast(results[index]+' added to the mission ♥')},5600)});

$('#megaCelebrate').addEventListener('click',megaCelebration);
$('#replay').addEventListener('click',()=>location.reload());
const secretSeal=$('#secretSeal'),secretHint=$('#secretHint'),secretModal=$('#secretModal');
secretSeal.addEventListener('click',()=>{
  if(secretClicks>=5)return;
  secretClicks++;
  secretHint.textContent=secretClicks<5
    ? `Bonus secret: tap the round “A” seal above five times · ${secretClicks}/5`
    : 'Secret unlocked ♥';
  secretSeal.animate([
    {transform:'scale(1) rotate(0deg)'},
    {transform:'scale(.82) rotate(-10deg)'},
    {transform:'scale(1.08) rotate(8deg)'},
    {transform:'scale(1) rotate(0deg)'}
  ],{duration:330,easing:'ease-out'});
  sparkle();
  heartsAt(secretSeal,4);
  if(secretClicks===5){
    secretModal.classList.add('show');
    secretModal.setAttribute('aria-hidden','false');
    megaCelebration();
  }
});
$('#closeSecret').addEventListener('click',()=>{
  secretModal.classList.remove('show');
  secretModal.setAttribute('aria-hidden','true');
});

function showToast(msg){clearTimeout(toastTimer);toast.textContent=msg;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),3600)}
function heartsAt(el,n=6){const r=el.getBoundingClientRect();for(let i=0;i<n;i++){const h=document.createElement('span');h.className='float-heart';h.textContent=Math.random()>.2?'♥':'✦';h.style.left=`${r.left+r.width/2+(Math.random()-.5)*40}px`;h.style.top=`${r.top+r.height/2}px`;h.style.setProperty('--x',`${(Math.random()-.5)*120}px`);h.style.setProperty('--r',`${(Math.random()-.5)*100}deg`);h.style.fontSize=`${12+Math.random()*17}px`;document.body.appendChild(h);setTimeout(()=>h.remove(),1400)}}
function fireworks(count=5){const colors=['#f08bb2','#e0b85d','#6e7edb','#ffffff','#a22c55'];for(let k=0;k<count;k++)setTimeout(()=>{const f=document.createElement('span');f.className='firework';f.style.left=`${15+Math.random()*70}vw`;f.style.top=`${12+Math.random()*45}vh`;f.style.setProperty('--c',colors[Math.floor(Math.random()*colors.length)]);for(let i=0;i<12;i++){const ray=document.createElement('i');ray.style.setProperty('--t',`rotate(${i*30}deg)`);f.appendChild(ray)}document.body.appendChild(f);tone(90+Math.random()*80,0,.2,.05,'square');setTimeout(()=>f.remove(),1200)},k*260)}
function megaCelebration(){burstConfetti(260);fireworks(8);heartsAt($('#megaCelebrate')||document.body,20);[523.25,659.25,783.99,1046.5].forEach((n,i)=>tone(n,i*.1,1,.03,'triangle'));showToast('BRUGES, HERE WE COME ♥')}

const canvas=$('#fxCanvas'),ctx=canvas.getContext('2d');function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0)}resize();addEventListener('resize',resize);function burstConfetti(n=120){const cols=['#7f163b','#f08bb2','#e0b85d','#6e7edb','#ffffff','#ffd2e3'];for(let i=0;i<n;i++)confetti.push({x:innerWidth/2+(Math.random()-.5)*260,y:innerHeight*.2,vx:(Math.random()-.5)*12,vy:-4-Math.random()*10,g:.15+Math.random()*.1,r:Math.random()*Math.PI,rs:(Math.random()-.5)*.24,w:5+Math.random()*8,h:8+Math.random()*12,c:cols[Math.floor(Math.random()*cols.length)],a:1});if(!fxFrame)animateFx()}function animateFx(){ctx.clearRect(0,0,innerWidth,innerHeight);confetti.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.rs;p.a-=.0045;ctx.save();ctx.globalAlpha=Math.max(0,p.a);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()});confetti=confetti.filter(p=>p.a>0&&p.y<innerHeight+60&&p.x>-60&&p.x<innerWidth+60);if(confetti.length)fxFrame=requestAnimationFrame(animateFx);else{fxFrame=null;ctx.clearRect(0,0,innerWidth,innerHeight)}}

function initScroll(){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.14});$$('.scroll-reveal').forEach(el=>io.observe(el));addEventListener('scroll',()=>{$$('.parallax-heart').forEach((h,i)=>h.style.transform=`translateY(${scrollY*(.04+i*.018)}px) rotate(${scrollY*.02}deg)`)},{passive:true})}
$$('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{if(matchMedia('(hover:none)').matches||card.id==='hotelKeycard')return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*7}deg) rotateY(${x*9}deg) translateY(-3px)`});card.addEventListener('pointerleave',()=>{if(card.id!=='hotelKeycard')card.style.transform=''})});
$$('.magnetic').forEach(btn=>{btn.addEventListener('pointermove',e=>{if(matchMedia('(hover:none)').matches)return;const r=btn.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;btn.style.transform=`translate(${x*.08}px,${y*.11}px)`});btn.addEventListener('pointerleave',()=>btn.style.transform='')});
