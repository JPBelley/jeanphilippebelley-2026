'use client'

import { useEffect } from 'react'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Cursor from '../../components/Cursor'
import Section from '../../components/Section'

export default function BlobEditor() {
  useEffect(() => {
    // ─── SHAPES ───────────────────────────────────────────────────────────────
    const SHAPES = [
      { id:'blob',    name:'Blob',    icon:'M14 4C8 4 4 8 4 14s4 10 10 10 10-4 10-10S20 4 14 4z', sdf:`length(p)-r` },
      { id:'star4',   name:'4-Star',  icon:'M14 3l3 8 8 3-8 3-3 8-3-8-8-3 8-3z', sdf:`sdStar4(p,r)` },
      { id:'star6',   name:'6-Star',  icon:'M14 2l3 9h9l-7 5 3 9-8-5-8 5 3-9-7-5h9z', sdf:`sdStar6(p,r)` },
      { id:'diamond', name:'Diamond', icon:'M14 3l11 11-11 11L3 14z', sdf:`sdDiamond(p,r)` },
      { id:'ring',    name:'Ring',    icon:'M14 6a8 8 0 100 16A8 8 0 0014 6zm0 3a5 5 0 110 10A5 5 0 0114 9z', sdf:`sdRing(p,r)` },
      { id:'cross',   name:'Cross',   icon:'M11 3h6v8h8v6h-8v8h-6v-8H3v-6h8z', sdf:`sdCross(p,r)` },
      { id:'tri',     name:'Triangle',icon:'M14 3l13 22H1z', sdf:`sdTriangle(p,r)` },
      { id:'hex',     name:'Hexagon', icon:'M14 2l10 6v12l-10 6L4 20V8z', sdf:`sdHex(p,r)` },
    ]

    const SDF_FUNCS = `
float sdStar4(vec2 p, float r){
  float a=atan(p.y,p.x);
  float f=abs(mod(a,1.5708)-0.7854);
  float d=length(p)*(0.7+0.3*cos(4.0*a));
  return d-r;
}
float sdStar6(vec2 p, float r){
  float a=atan(p.y,p.x);
  float d=length(p)*(0.75+0.25*cos(6.0*a));
  return d-r;
}
float sdDiamond(vec2 p, float r){
  p=abs(p);
  return (p.x+p.y)-r*1.4;
}
float sdRing(vec2 p, float r){
  return abs(length(p)-r*0.75)-r*0.22;
}
float sdCross(vec2 p, float r){
  p=abs(p);
  float b=r*0.35;
  vec2 q=min(p,p.yx);
  return length(max(abs(p-vec2(r*0.5))-vec2(b),0.0))-0.02;
}
float sdTriangle(vec2 p, float r){
  float k=sqrt(3.0);
  p.x=abs(p.x)-r*0.9;
  p.y=p.y+r*0.5;
  if(p.x+k*p.y>0.0)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
  p.x-=clamp(p.x,-2.0*r*0.9,0.0);
  return -length(p)*sign(p.y);
}
float sdHex(vec2 p, float r){
  const vec3 k=vec3(-0.866025,0.5,0.577350);
  p=abs(p);
  p-=2.0*min(dot(k.xy,p),0.0)*k.xy;
  p-=vec2(clamp(p.x,-k.z*r,k.z*r),r);
  return length(p)*sign(p.y);
}
`

    const P = {
      shapeA: 0, shapeB: 0, morphBlend: 0.0,
      blobCount:3, blobSize:.22, blobVariance:.04, smoothing:.09, squish:.3,
      warpFreq:5, warpAmp:.05, warpFreq2:9, warpAmp2:.03,
      col1:'#ff9414', col2:'#e02e07', col3:'#ffd070', col4:'#8c1203', bgCol:'#edead7',
      swirlScale:2.8, swirlMix:.7,
      speed:.35, rotSpeed:.3, driftAmp:.06, mouseLag:.025,
      haloLayers:3, haloSpread:.55, innerGlow:.18,
      grain:.018, vignette:1.1, edgeSoft:.025,
    }
    const DEFAULTS = JSON.parse(JSON.stringify(P))

    const TABS = {
      shape:[
        { title:'BASE SHAPE', type:'shapepicker' },
        { title:'GEOMETRY', items:[
          {k:'blobCount',   l:'Count',     min:1,  max:5,   step:1},
          {k:'blobSize',    l:'Size',      min:.05,max:.5,  step:.01},
          {k:'blobVariance',l:'Variance',  min:0,  max:.15, step:.005},
          {k:'smoothing',   l:'Smoothing', min:.01,max:.25, step:.005},
          {k:'squish',      l:'Squish',    min:0,  max:.8,  step:.01},
        ]},
        { title:'WARP', items:[
          {k:'warpFreq',  l:'Warp freq 1', min:1, max:16,  step:.5},
          {k:'warpAmp',   l:'Warp amp 1',  min:0, max:.2,  step:.005},
          {k:'warpFreq2', l:'Warp freq 2', min:1, max:20,  step:.5},
          {k:'warpAmp2',  l:'Warp amp 2',  min:0, max:.12, step:.005},
        ]},
      ],
      color:[
        { title:'COLORS', items:[
          {k:'col1',  l:'Color 1 (warm)'},
          {k:'col2',  l:'Color 2 (deep)'},
          {k:'col3',  l:'Color 3 (light)'},
          {k:'col4',  l:'Color 4 (dark)'},
          {k:'bgCol', l:'Background'},
        ]},
        { title:'MIX', items:[
          {k:'swirlScale', l:'Swirl scale', min:.5, max:6,  step:.1},
          {k:'swirlMix',   l:'Swirl mix',   min:0,  max:1,  step:.01},
        ]},
      ],
      motion:[
        { title:'TIMING', items:[
          {k:'speed',    l:'Speed',    min:.02,max:2,   step:.02},
          {k:'rotSpeed', l:'Rotation', min:0,  max:1.5, step:.02},
          {k:'driftAmp', l:'Drift',    min:0,  max:.2,  step:.005},
        ]},
        { title:'MOUSE', items:[
          {k:'mouseLag', l:'Lag', min:.005, max:.2, step:.005},
        ]},
      ],
      light:[
        { title:'GLOW', items:[
          {k:'haloLayers', l:'Halo layers',  min:1,  max:5,   step:1},
          {k:'haloSpread', l:'Halo spread',  min:.05,max:1.2, step:.05},
          {k:'innerGlow',  l:'Inner glow',   min:0,  max:.6,  step:.01},
        ]},
        { title:'SURFACE', items:[
          {k:'edgeSoft', l:'Edge softness', min:.001, max:.08,  step:.001},
          {k:'grain',    l:'Grain',         min:0,    max:.05,  step:.001},
          {k:'vignette', l:'Vignette',      min:0,    max:2,    step:.05},
        ]},
      ],
    }

    function buildControls(tab) {
      const con = document.getElementById('controls')
      con.innerHTML = ''
      ;(TABS[tab]||[]).forEach(sec => {
        const wrap = document.createElement('div'); wrap.className='section'
        const hdr = document.createElement('div'); hdr.className='sec-hdr'
        hdr.innerHTML = `<span>${sec.title}</span><span class="chv">▾</span>`
        const body = document.createElement('div'); body.className='sec-body'
        hdr.onclick = () => { const h=body.style.display==='none'; body.style.display=h?'':'none'; hdr.querySelector('.chv').style.transform=h?'':'rotate(-90deg)'; }

        if (sec.type === 'shapepicker') {
          const labelA = document.createElement('div')
          labelA.style.cssText='font-size:11px;color:var(--color-tool-text3);margin:4px 0 5px;text-transform:uppercase;letter-spacing:.7px'
          labelA.textContent='Shape A'
          const gridA = document.createElement('div'); gridA.className='shape-grid'; gridA.id='grid-a'
          SHAPES.forEach((sh,i) => {
            const btn = document.createElement('div'); btn.className='shape-btn'+(P.shapeA===i?' active':'')
            btn.innerHTML=`<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="${sh.icon}"/></svg><span>${sh.name}</span>`
            btn.onclick=()=>{ P.shapeA=i; document.querySelectorAll('#grid-a .shape-btn').forEach((b,j)=>b.classList.toggle('active',j===i)); pushUniforms(); document.getElementById('s-shape').textContent=SHAPES[P.shapeA].name+(P.morphBlend>.01?'+'+SHAPES[P.shapeB].name:''); }
            gridA.appendChild(btn)
          })

          const morphRow = document.createElement('div'); morphRow.className='morph-row'
          const mLabel = document.createElement('span'); mLabel.className='ctrl-label'; mLabel.textContent='Morph →'
          const mVal = document.createElement('span'); mVal.className='ctrl-val'; mVal.id='v_morphBlend'; mVal.textContent='0.00'
          const mSl = document.createElement('input'); mSl.type='range'; mSl.min=0; mSl.max=1; mSl.step=.01; mSl.value=0; mSl.style.flex='1'; mSl.style.width='auto'
          mSl.oninput=e=>{ P.morphBlend=parseFloat(e.target.value); mVal.textContent=P.morphBlend.toFixed(2); pushUniforms(); document.getElementById('s-shape').textContent=SHAPES[P.shapeA].name+(P.morphBlend>.01?'+'+SHAPES[P.shapeB].name:''); }
          morphRow.appendChild(mLabel); morphRow.appendChild(mSl); morphRow.appendChild(mVal)

          const labelB = document.createElement('div')
          labelB.style.cssText='font-size:11px;color:var(--color-tool-text3);margin:6px 0 5px;text-transform:uppercase;letter-spacing:.7px'
          labelB.textContent='Shape B (morph target)'
          const gridB = document.createElement('div'); gridB.className='shape-grid'; gridB.id='grid-b'
          SHAPES.forEach((sh,i) => {
            const btn = document.createElement('div'); btn.className='shape-btn'+(P.shapeB===i?' active':'')
            btn.innerHTML=`<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="${sh.icon}"/></svg><span>${sh.name}</span>`
            btn.onclick=()=>{ P.shapeB=i; document.querySelectorAll('#grid-b .shape-btn').forEach((b,j)=>b.classList.toggle('active',j===i)); pushUniforms(); }
            gridB.appendChild(btn)
          })

          body.appendChild(labelA); body.appendChild(gridA)
          body.appendChild(morphRow)
          body.appendChild(labelB); body.appendChild(gridB)
        } else {
          ;(sec.items||[]).forEach(item => {
            const isColor = typeof P[item.k]==='string'
            const row = document.createElement('div')
            if (isColor) {
              row.className='color-row'
              const sw=document.createElement('div'); sw.className='swatch'; sw.style.background=P[item.k]
              const inp=document.createElement('input'); inp.type='color'; inp.value=P[item.k]
              inp.oninput=e=>{P[item.k]=e.target.value;sw.style.background=e.target.value;pushUniforms();}
              sw.appendChild(inp)
              row.innerHTML=`<span class="ctrl-label">${item.l}</span>`; row.appendChild(sw)
            } else {
              row.className='ctrl-row'
              const dec=item.step<.01?3:item.step<1?2:0
              const vEl=document.createElement('span'); vEl.className='ctrl-val'; vEl.id='v_'+item.k; vEl.textContent=P[item.k].toFixed(dec)
              const sl=document.createElement('input'); sl.type='range'; sl.min=item.min; sl.max=item.max; sl.step=item.step; sl.value=P[item.k]
              sl.oninput=e=>{P[item.k]=parseFloat(e.target.value);vEl.textContent=P[item.k].toFixed(dec);pushUniforms();}
              row.innerHTML=`<span class="ctrl-label">${item.l}</span>`
              const right=document.createElement('div'); right.className='ctrl-right'; right.appendChild(sl); right.appendChild(vEl); row.appendChild(right)
            }
            body.appendChild(row)
          })
        }
        wrap.appendChild(hdr); wrap.appendChild(body); con.appendChild(wrap)
      })
    }

    document.querySelectorAll('.blob-tab').forEach(t=>t.onclick=()=>{
      document.querySelectorAll('.blob-tab').forEach(x=>x.classList.remove('active'))
      t.classList.add('active'); buildControls(t.dataset.tab)
    })
    buildControls('shape')

    // ─── WEBGL ────────────────────────────────────────────────────────────────
    const canvas=document.getElementById('c')
    const gl=canvas.getContext('webgl',{preserveDrawingBuffer:true})

    function resize(){
      const wrap=document.getElementById('canvas-wrap')
      const sz=wrap.clientWidth
      canvas.style.width=canvas.style.height=sz+'px'
      canvas.width=canvas.height=Math.round(sz*(devicePixelRatio||1))
      gl.viewport(0,0,canvas.width,canvas.height)
      document.getElementById('s-res').textContent=canvas.width+'×'+canvas.height
    }
    resize(); window.addEventListener('resize',resize)

    const VS=`attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`

    function buildFS() {
      const sdfA = SHAPES[P.shapeA].sdf
      const sdfB = SHAPES[P.shapeB].sdf
      return `
precision highp float;
uniform float t;
uniform vec2 res;
uniform vec2 mouse;
uniform float uN,uSize,uVar,uSmooth,uSquish;
uniform float uWF1,uWA1,uWF2,uWA2;
uniform vec3 uC1,uC2,uC3,uC4,uBg;
uniform float uSwScale,uSwMix;
uniform float uSpeed,uRot,uDrift,uHL,uHS,uIG,uGrain,uVig,uEdge;
uniform float uMorph;
${SDF_FUNCS}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
mat2 rot2(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float shapeSDF(vec2 p, float r){
  float dA=${sdfA};
  float dB=${sdfB};
  return mix(dA,dB,uMorph);
}
float blobSDF(vec2 p,float r,float twist,float tt){
  p=rot2(tt)*p;
  p.x*=1.+uSquish*sin(tt*.9+p.y*1.8);
  p.y*=1.+uSquish*cos(tt*.7+p.x*1.8);
  float d=shapeSDF(p,r);
  d+=uWA1*sin(uWF1*atan(p.y,p.x)+twist*tt);
  d+=uWA2*sin(uWF2*atan(p.y,p.x)-twist*tt*1.4);
  return d;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-res*.5)/min(res.x,res.y);
  vec2 m=(mouse-.5)*vec2(1.,-1.)*uDrift*3.;
  vec2 c=m*.5;
  float tt=t*uSpeed;
  float d=1e9;
  for(int i=0;i<5;i++){
    if(float(i)>=uN)break;
    float fi=float(i),o=fi*1.0472;
    vec2 drift=vec2(uDrift*sin(tt*(.6+fi*.15)+o),uDrift*cos(tt*(.75+fi*.1)+o+1.));
    float r=uSize-fi*uVar;
    float twist=3.2-fi*.4; if(mod(fi,2.)>.5)twist=-twist;
    float bd=blobSDF(uv-c+drift,r,twist,tt*(1.+fi*.15)+o);
    if(i==0)d=bd; else d=smin(d,bd,uSmooth);
  }
  vec2 p=uv-c; p=rot2(-tt*uRot)*p;
  float sw=clamp(p.x*uSwScale+sin(p.y*3.5+tt*1.2)*.6,0.,1.);
  float edge=1.-smoothstep(-uEdge,uEdge*2.,d);
  float inner=1.-smoothstep(-uIG*2.,0.,d);
  vec3 color=uBg;
  for(int k=1;k<=5;k++){
    if(float(k)>uHL)break;
    float fk=float(k),spread=uHS/fk;
    float h=1.-smoothstep(0.,spread,d);
    color=mix(color,mix(uBg,mix(uC2,uC1,sw*.5),(.15+.1/fk)),h*(1.-edge));
  }
  vec3 bc=mix(uC2,uC1,sw);
  bc=mix(bc,uC3,sw*inner*uSwMix);
  bc=mix(bc,uC4,inner*(1.-sw)*.45);
  color=mix(color,bc,edge);
  color+=noise(uv*8.+t*.15)*uGrain;
  float vig=1.-smoothstep(.4,uVig,length(uv)*1.1);
  color=mix(color*.9,color,vig);
  gl_FragColor=vec4(clamp(color,0.,1.),1.);
}`
    }

    let prog=null
    function buildProgram(){
      if(prog) gl.deleteProgram(prog)
      prog=gl.createProgram()
      const mkS=(src,type)=>{ const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){document.getElementById('s-err').textContent='Shader err: '+gl.getShaderInfoLog(s);return null;}return s;}
      const vs=mkS(VS,gl.VERTEX_SHADER), fs=mkS(buildFS(),gl.FRAGMENT_SHADER)
      if(!vs||!fs) return
      gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog)
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){document.getElementById('s-err').textContent='Link err: '+gl.getProgramInfoLog(prog);return}
      gl.useProgram(prog)
      const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
      const aLoc=gl.getAttribLocation(prog,'a')
      gl.enableVertexAttribArray(aLoc);gl.vertexAttribPointer(aLoc,2,gl.FLOAT,false,0,0)
      pushUniforms()
    }

    function getU(n){return gl.getUniformLocation(prog,n)}

    function pushUniforms(){
      if(!prog) return
      gl.useProgram(prog)
      const h2r=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255]
      gl.uniform3fv(getU('uC1'),h2r(P.col1)); gl.uniform3fv(getU('uC2'),h2r(P.col2))
      gl.uniform3fv(getU('uC3'),h2r(P.col3)); gl.uniform3fv(getU('uC4'),h2r(P.col4))
      gl.uniform3fv(getU('uBg'),h2r(P.bgCol))
      gl.uniform1f(getU('uN'),P.blobCount);   gl.uniform1f(getU('uSize'),P.blobSize)
      gl.uniform1f(getU('uVar'),P.blobVariance); gl.uniform1f(getU('uSmooth'),P.smoothing)
      gl.uniform1f(getU('uSquish'),P.squish)
      gl.uniform1f(getU('uWF1'),P.warpFreq);  gl.uniform1f(getU('uWA1'),P.warpAmp)
      gl.uniform1f(getU('uWF2'),P.warpFreq2); gl.uniform1f(getU('uWA2'),P.warpAmp2)
      gl.uniform1f(getU('uSwScale'),P.swirlScale); gl.uniform1f(getU('uSwMix'),P.swirlMix)
      gl.uniform1f(getU('uSpeed'),P.speed);   gl.uniform1f(getU('uRot'),P.rotSpeed)
      gl.uniform1f(getU('uDrift'),P.driftAmp)
      gl.uniform1f(getU('uHL'),P.haloLayers); gl.uniform1f(getU('uHS'),P.haloSpread)
      gl.uniform1f(getU('uIG'),P.innerGlow)
      gl.uniform1f(getU('uGrain'),P.grain);   gl.uniform1f(getU('uVig'),P.vignette)
      gl.uniform1f(getU('uEdge'),P.edgeSoft)
      gl.uniform1f(getU('uMorph'),P.morphBlend)
      document.getElementById('s-blobs').textContent=P.blobCount
    }

    let _lastShapeA=0,_lastShapeB=0
    const origPushUniforms = pushUniforms
    window.pushUniforms = function(){
      if(_lastShapeA!==P.shapeA||_lastShapeB!==P.shapeB){
        _lastShapeA=P.shapeA; _lastShapeB=P.shapeB
        buildProgram()
      } else {
        origPushUniforms()
      }
    }
    buildProgram()

    let mx=.5,my=.5,tmx=.5,tmy=.5
    let paused=false,pauseOffset=0,pausedAt=0,start=null,frames=0,lastFpsT=performance.now()
    let animRaf

    canvas.addEventListener('mousemove',e=>{
      const r=canvas.getBoundingClientRect()
      mx=(e.clientX-r.left)/r.width; my=(e.clientY-r.top)/r.height
      document.getElementById('s-mouse').textContent=mx.toFixed(2)+', '+my.toFixed(2)
    })
    canvas.addEventListener('touchmove',e=>{
      e.preventDefault()
      const r=canvas.getBoundingClientRect()
      mx=(e.touches[0].clientX-r.left)/r.width; my=(e.touches[0].clientY-r.top)/r.height
    },{passive:false})

    function frame(ts){
      if(!start)start=ts
      if(!paused&&prog){
        const t=(ts-start-pauseOffset)/1000
        tmx+=(mx-tmx)*P.mouseLag; tmy+=(my-tmy)*P.mouseLag
        gl.useProgram(prog)
        gl.uniform1f(getU('t'),t)
        gl.uniform2f(getU('res'),canvas.width,canvas.height)
        gl.uniform2f(getU('mouse'),tmx,tmy)
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
      }
      frames++
      if(ts-lastFpsT>600){document.getElementById('fps-badge').textContent=Math.round(frames*1000/(ts-lastFpsT))+' fps';frames=0;lastFpsT=ts}
      animRaf = requestAnimationFrame(frame)
    }
    animRaf = requestAnimationFrame(frame)

    window._blobTogglePlay = function(){
      paused=!paused
      if(paused)pausedAt=performance.now(); else pauseOffset+=performance.now()-pausedAt
      document.getElementById('play-btn').textContent=paused?'▶ Play':'⏸ Pause'
    }

    const PRESETS={
      default:{...DEFAULTS},
      fire:  {col1:'#ff6a00',col2:'#cc2200',col3:'#ffdd44',col4:'#550000',bgCol:'#180800',speed:.45,swirlScale:3,haloSpread:.6,squish:.4,warpAmp:.07,shapeA:0,shapeB:0,morphBlend:0},
      ghost: {col1:'#c0e8ff',col2:'#5090cc',col3:'#ffffff',col4:'#203050',bgCol:'#0a0e1a',speed:.25,grain:.01,haloSpread:.7,innerGlow:.25,shapeA:0,shapeB:0,morphBlend:0},
      ocean: {col1:'#00d4ff',col2:'#0044aa',col3:'#80ffee',col4:'#001844',bgCol:'#010d1f',speed:.3,squish:.25,haloSpread:.5,shapeA:0,shapeB:0,morphBlend:0},
      neon:  {col1:'#cc00ff',col2:'#3300aa',col3:'#ff44ff',col4:'#110022',bgCol:'#080010',speed:.5,swirlScale:4,warpAmp:.07,haloSpread:.8,grain:.025,shapeA:3,shapeB:1,morphBlend:.3},
    }

    window._blobSetPreset = function(name){
      const pr=PRESETS[name]; if(!pr) return
      Object.assign(P,JSON.parse(JSON.stringify(DEFAULTS)),pr)
      buildProgram()
      buildControls(document.querySelector('.blob-tab.active').dataset.tab)
    }

    document.getElementById('btn-reset').onclick=()=>{Object.assign(P,JSON.parse(JSON.stringify(DEFAULTS)));buildProgram();buildControls(document.querySelector('.blob-tab.active').dataset.tab);}
    document.getElementById('btn-random').onclick=()=>{
      const rh=()=>'#'+[0,0,0].map(()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')
      const rf=(a,b)=>a+Math.random()*(b-a)
      P.col1=rh();P.col2=rh();P.col3=rh();P.col4=rh()
      P.blobSize=rf(.1,.38);P.smoothing=rf(.03,.18);P.squish=rf(0,.6)
      P.warpAmp=rf(0,.12);P.warpAmp2=rf(0,.08);P.speed=rf(.1,.8)
      P.swirlScale=rf(1,5);P.haloSpread=rf(.1,1)
      P.shapeA=Math.floor(Math.random()*SHAPES.length)
      P.shapeB=Math.floor(Math.random()*SHAPES.length)
      P.morphBlend=rf(0,1)
      buildProgram();buildControls(document.querySelector('.blob-tab.active').dataset.tab)
    }
    document.getElementById('btn-export').onclick=()=>{const a=document.createElement('a');a.download='blob-studio.png';a.href=canvas.toDataURL('image/png');a.click();}

    return () => {
      cancelAnimationFrame(animRaf)
      window.removeEventListener('resize', resize)
      delete window._blobTogglePlay
      delete window._blobSetPreset
      delete window.pushUniforms
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg text-foreground font-head" style={{'--tool-accent2':'#f5a040'}}>
      <Cursor />
      <Nav />

      <Section size="wide">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">// blob-editor</p>
          <h1 className="text-[clamp(28px,4vw,52px)] font-bold leading-none mb-3">Blob Studio</h1>
          <p className="text-muted text-[14px]">
            2D WebGL blob renderer with real-time SDF morphing, swirl color mixing, halo glow, and PNG export.
          </p>
        </div>

        <div className="flex gap-6 items-start max-[900px]:flex-col">

          {/* ── CONTROLS PANEL ───────────────────────────────────────────────── */}
          <aside className="w-[260px] max-[900px]:w-full shrink-0 bg-tool-bg1 border border-tool-border rounded-xl overflow-hidden font-mono">

            {/* Panel header */}
            <div className="px-4 py-[14px] border-b border-tool-border flex items-center gap-[10px]">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                   style={{ background: 'linear-gradient(135deg,#e8601a,#f5a040)' }}>B</div>
              <span className="text-[13px] font-semibold text-tool-text">Blob Studio</span>
              <span className="ml-auto text-[10px] text-tool-text3 bg-tool-bg3 px-[7px] py-[2px] rounded-full">v2.0</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-tool-border px-[6px]">
              {[['shape','Shape'],['color','Color'],['motion','Motion'],['light','Light']].map(([k,l]) => (
                <div key={k} className={`blob-tab tab${k==='shape'?' active':''}`} data-tab={k}>{l}</div>
              ))}
            </div>

            {/* Generated controls */}
            <div id="controls" className="py-[6px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-tool-bg4 [&::-webkit-scrollbar-thumb]:rounded-sm" />

            {/* Action buttons */}
            <div className="p-3 border-t border-tool-border flex flex-col gap-2">
              <div className="flex gap-2">
                <button id="btn-reset"
                  className="flex-1 py-[7px] px-3 rounded-lg text-[12px] font-medium cursor-pointer bg-tool-bg3 text-tool-text2 border border-tool-border2 hover:bg-tool-bg4 hover:text-tool-text transition-colors">
                  Reset
                </button>
                <button id="btn-random"
                  className="flex-1 py-[7px] px-3 rounded-lg text-[12px] font-medium cursor-pointer bg-tool-bg3 text-tool-text2 border border-tool-border2 hover:bg-tool-bg4 hover:text-tool-text transition-colors">
                  Random
                </button>
              </div>
              <button id="btn-export"
                className="w-full py-[7px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, var(--color-violet), var(--color-mint))' }}>
                Export PNG
              </button>
            </div>
          </aside>

          {/* ── PREVIEW ──────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 sticky top-[100px] self-start">

            {/* Toolbar */}
            <div className="bg-tool-bg1 border border-tool-border rounded-xl px-3 py-2 flex items-center gap-2 font-mono flex-wrap">
              <button id="play-btn"
                onClick={() => window._blobTogglePlay?.()}
                className="px-3 py-[5px] rounded-lg text-[12px] text-tool-text2 bg-tool-bg3 border border-tool-border2 cursor-pointer hover:bg-tool-bg4 hover:text-tool-text transition-colors whitespace-nowrap">
                ⏸ Pause
              </button>
              <div className="w-px h-4 bg-tool-border2 mx-1 shrink-0" />
              {[['default','🟠 Default'],['fire','🔥 Fire'],['ghost','👻 Ghost'],['ocean','🌊 Ocean'],['neon','💜 Neon']].map(([p,l]) => (
                <button key={p}
                  onClick={() => window._blobSetPreset?.(p)}
                  className="px-2 py-[5px] rounded text-[11px] text-tool-text2 cursor-pointer hover:bg-tool-bg3 hover:text-tool-text transition-colors whitespace-nowrap">
                  {l}
                </button>
              ))}
              <span id="fps-badge" className="ml-auto text-[11px] text-tool-text3 bg-tool-bg2 border border-tool-border px-2 py-[3px] rounded shrink-0 tabular-nums">— fps</span>
            </div>

            {/* Canvas */}
            <div
              id="canvas-wrap"
              className="w-full rounded-xl border border-ui overflow-hidden relative"
              style={{ aspectRatio: '1 / 1' }}
            >
              <canvas id="c" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-5 font-mono text-[11px] text-muted px-1 flex-wrap">
              <span>Res: <b className="text-foreground" id="s-res">—</b></span>
              <span>Shape: <b className="text-foreground" id="s-shape">Blob</b></span>
              <span>Blobs: <b className="text-foreground" id="s-blobs">3</b></span>
              <span>Mouse: <b className="text-foreground" id="s-mouse">0.50, 0.50</b></span>
              <span id="s-err" className="text-red-400" />
            </div>
          </div>

        </div>
      </Section>

      <Footer />
    </div>
  )
}
