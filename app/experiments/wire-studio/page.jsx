'use client'

import { useEffect } from 'react'

export default function WireStudio() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const P = {
        radius: 2.2, widthSeg: 80, heightSeg: 80,
        dispAmp: 0.38, dispFreq: 3.5, dispFreq2: 7.0, dispAmp2: 0.12,
        edgeScallop: 14, scallopAmp: 0.22,
        colTop: '#22d3ee', colBot: '#9333ea', colMid: '#3b82f6',
        bgCol: '#111118', wireOpacity: 0.55, wireWidth: 1.0,
        rotX: 0.0015, rotY: 0.003, rotZ: 0.0, autoRotate: 1,
        dispSpeed: 0.4, dispSpeed2: 0.27, mouseInfluence: 0.6,
        rimStrength: 1.8, rimPower: 3.5, ambientLight: 0.18, glowStrength: 0.5,
      }
      const DEFAULTS = JSON.parse(JSON.stringify(P))

      const TABS = {
        geo:[
          {title:'SPHERE', items:[
            {k:'radius',     l:'Radius',      min:.5,  max:4,   step:.05},
            {k:'widthSeg',   l:'Width segs',  min:8,   max:120, step:2,  rebuild:true},
            {k:'heightSeg',  l:'Height segs', min:8,   max:120, step:2,  rebuild:true},
          ]},
          {title:'DISPLACEMENT', items:[
            {k:'dispAmp',    l:'Amp 1',       min:0,   max:1,   step:.01},
            {k:'dispFreq',   l:'Freq 1',      min:1,   max:12,  step:.1},
            {k:'dispAmp2',   l:'Amp 2',       min:0,   max:.5,  step:.01},
            {k:'dispFreq2',  l:'Freq 2',      min:1,   max:20,  step:.2},
          ]},
          {title:'EDGE SCALLOP', items:[
            {k:'edgeScallop',l:'Count',       min:4,   max:32,  step:1},
            {k:'scallopAmp', l:'Depth',       min:0,   max:.8,  step:.01},
          ]},
        ],
        color:[
          {title:'WIRE COLORS', items:[
            {k:'colTop',  l:'Top color'},
            {k:'colMid',  l:'Mid color'},
            {k:'colBot',  l:'Bottom color'},
            {k:'bgCol',   l:'Background'},
          ]},
          {title:'MATERIAL', items:[
            {k:'wireOpacity', l:'Opacity', min:.05, max:1, step:.01},
          ]},
        ],
        motion:[
          {title:'ROTATION', items:[
            {k:'rotX', l:'Rot X', min:-.01, max:.01, step:.0005},
            {k:'rotY', l:'Rot Y', min:-.01, max:.01, step:.0005},
            {k:'rotZ', l:'Rot Z', min:-.01, max:.01, step:.0005},
          ]},
          {title:'DISPLACEMENT', items:[
            {k:'dispSpeed',      l:'Speed 1', min:0, max:2, step:.01},
            {k:'dispSpeed2',     l:'Speed 2', min:0, max:2, step:.01},
            {k:'mouseInfluence', l:'Mouse',   min:0, max:2, step:.05},
          ]},
        ],
        light:[
          {title:'RIM LIGHT', items:[
            {k:'rimStrength', l:'Strength', min:0,  max:5,  step:.05},
            {k:'rimPower',    l:'Power',    min:.5, max:10, step:.1},
          ]},
          {title:'AMBIENT', items:[
            {k:'ambientLight', l:'Ambient',   min:0, max:1, step:.01},
            {k:'glowStrength', l:'Core glow', min:0, max:2, step:.05},
          ]},
        ],
      }

      function buildControls(tab) {
        const con = document.getElementById('controls'); con.innerHTML=''
        ;(TABS[tab]||[]).forEach(sec => {
          const wrap=document.createElement('div'); wrap.className='section'
          const hdr=document.createElement('div'); hdr.className='sec-hdr'
          hdr.innerHTML=`<span>${sec.title}</span><span class="chv">▾</span>`
          const body=document.createElement('div'); body.className='sec-body'
          hdr.onclick=()=>{const h=body.style.display==='none';body.style.display=h?'':'none';hdr.querySelector('.chv').style.transform=h?'':'rotate(-90deg)';}
          ;(sec.items||[]).forEach(item => {
            const isColor=typeof P[item.k]==='string'
            const row=document.createElement('div')
            if(isColor){
              row.className='color-row'
              const sw=document.createElement('div'); sw.className='swatch'; sw.style.background=P[item.k]
              const inp=document.createElement('input'); inp.type='color'; inp.value=P[item.k]
              inp.oninput=e=>{P[item.k]=e.target.value;sw.style.background=e.target.value;onParamChange(item.k);}
              sw.appendChild(inp)
              row.innerHTML=`<span class="ctrl-label">${item.l}</span>`; row.appendChild(sw)
            } else {
              row.className='ctrl-row'
              const dec=item.step<.01?4:item.step<1?2:0
              const vEl=document.createElement('span'); vEl.className='ctrl-val'; vEl.id='v_'+item.k; vEl.textContent=P[item.k].toFixed(dec)
              const sl=document.createElement('input'); sl.type='range'; sl.min=item.min; sl.max=item.max; sl.step=item.step; sl.value=P[item.k]
              sl.oninput=e=>{P[item.k]=parseFloat(e.target.value);vEl.textContent=P[item.k].toFixed(dec);onParamChange(item.k,item.rebuild);}
              row.innerHTML=`<span class="ctrl-label">${item.l}</span>`
              const right=document.createElement('div'); right.className='ctrl-right'; right.appendChild(sl); right.appendChild(vEl); row.appendChild(right)
            }
            body.appendChild(row)
          })
          wrap.appendChild(hdr); wrap.appendChild(body); con.appendChild(wrap)
        })
      }
      document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'))
        t.classList.add('active'); buildControls(t.dataset.tab)
      })
      buildControls('geo')

      const wrap = document.getElementById('canvas-wrap')
      const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true})
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(devicePixelRatio||1)
      wrap.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.z = 6.5

      function resizeRenderer() {
        const size = Math.min(wrap.clientWidth, wrap.clientHeight)
        renderer.setSize(size, size)
        camera.aspect = 1
        camera.updateProjectionMatrix()
      }
      resizeRenderer()
      window.addEventListener('resize', resizeRenderer)

      const wireMat = new THREE.ShaderMaterial({
        uniforms: {
          uColTop:{value:new THREE.Color(P.colTop)}, uColMid:{value:new THREE.Color(P.colMid)},
          uColBot:{value:new THREE.Color(P.colBot)}, uOpacity:{value:P.wireOpacity},
          uRimStr:{value:P.rimStrength}, uRimPow:{value:P.rimPower},
          uAmbient:{value:P.ambientLight}, uGlow:{value:P.glowStrength},
          uCamPos:{value:camera.position},
        },
        vertexShader:`varying vec3 vNormal,vWorldPos;varying float vY;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPos=wp.xyz;vNormal=normalize(normalMatrix*normal);vY=normalize(position).y;gl_Position=projectionMatrix*viewMatrix*wp;}`,
        fragmentShader:`uniform vec3 uColTop,uColMid,uColBot;uniform float uOpacity,uRimStr,uRimPow,uAmbient,uGlow;uniform vec3 uCamPos;varying vec3 vNormal,vWorldPos;varying float vY;void main(){vec3 viewDir=normalize(uCamPos-vWorldPos);float rim=1.0-clamp(dot(viewDir,vNormal),0.0,1.0);rim=pow(rim,uRimPow)*uRimStr;float t=clamp(vY*0.5+0.5,0.0,1.0);vec3 col=t>0.5?mix(uColMid,uColTop,(t-0.5)*2.0):mix(uColBot,uColMid,t*2.0);float core=pow(clamp(dot(viewDir,vNormal),0.0,1.0),2.0)*uGlow;vec3 final=col*(uAmbient+rim)+col*core;gl_FragColor=vec4(final,uOpacity*(0.4+rim*0.6+core*0.3));}`,
        transparent:true, side:THREE.DoubleSide, wireframe:true, depthWrite:false,
      })

      const bgGeo=new THREE.PlaneGeometry(20,20)
      const bgMat=new THREE.MeshBasicMaterial({color:new THREE.Color(P.bgCol),side:THREE.DoubleSide})
      const bgMesh=new THREE.Mesh(bgGeo,bgMat); bgMesh.position.z=-5; scene.add(bgMesh)

      let sphereMesh=null, basePositions=null

      function buildSphere(){
        if(sphereMesh){scene.remove(sphereMesh);sphereMesh.geometry.dispose()}
        const geo=new THREE.SphereGeometry(P.radius,Math.round(P.widthSeg),Math.round(P.heightSeg))
        basePositions=geo.attributes.position.array.slice()
        sphereMesh=new THREE.Mesh(geo,wireMat); scene.add(sphereMesh)
        document.getElementById('s-seg').textContent=Math.round(P.widthSeg)+'×'+Math.round(P.heightSeg)
      }
      buildSphere()

      function displaceVertices(t){
        if(!sphereMesh)return
        const pos=sphereMesh.geometry.attributes.position,arr=pos.array,base=basePositions
        const f1=P.dispFreq,a1=P.dispAmp,f2=P.dispFreq2,a2=P.dispAmp2
        const sc=P.edgeScallop,sa=P.scallopAmp,t1=t*P.dispSpeed,t2=t*P.dispSpeed2
        for(let i=0;i<arr.length;i+=3){
          const bx=base[i],by=base[i+1],bz=base[i+2]
          const len=Math.sqrt(bx*bx+by*by+bz*bz)
          if(len<0.001){arr[i]=bx;arr[i+1]=by;arr[i+2]=bz;continue}
          const nx=bx/len,ny=by/len,nz=bz/len
          const theta=Math.acos(Math.max(-1,Math.min(1,ny))),phi=Math.atan2(nz,nx)
          const d1=a1*(Math.sin(f1*phi+t1)*Math.cos(f1*theta*0.8+t1*0.7))
          const d2=a2*(Math.sin(f2*phi-t2*1.3)*Math.sin(f2*theta+t2))
          const scallop=sa*Math.pow(Math.sin(theta),2)*Math.sin(sc*phi+t1*0.5)
          const r=len+d1+d2+scallop
          arr[i]=nx*r;arr[i+1]=ny*r;arr[i+2]=nz*r
        }
        pos.needsUpdate=true; sphereMesh.geometry.computeVertexNormals()
        document.getElementById('s-disp').textContent=(P.dispAmp+P.dispAmp2).toFixed(2)
      }

      function onParamChange(key,rebuild){
        if(rebuild){buildSphere();return}
        wireMat.uniforms.uColTop.value.set(P.colTop); wireMat.uniforms.uColMid.value.set(P.colMid)
        wireMat.uniforms.uColBot.value.set(P.colBot); wireMat.uniforms.uOpacity.value=P.wireOpacity
        wireMat.uniforms.uRimStr.value=P.rimStrength; wireMat.uniforms.uRimPow.value=P.rimPower
        wireMat.uniforms.uAmbient.value=P.ambientLight; wireMat.uniforms.uGlow.value=P.glowStrength
        bgMat.color.set(P.bgCol)
      }

      let mx=0,my=0,tmx=0,tmy=0
      wrap.addEventListener('mousemove',e=>{
        const r=wrap.getBoundingClientRect()
        mx=(e.clientX-r.left)/r.width*2-1; my=-((e.clientY-r.top)/r.height*2-1)
        document.getElementById('s-mouse').textContent=mx.toFixed(2)+', '+my.toFixed(2)
      })

      let paused=false,pauseOffset=0,pausedAt=0,start=null,frames=0,lastFpsT=performance.now(),animRaf
      function frame(ts){
        if(!start)start=ts
        if(!paused){
          const t=(ts-start-pauseOffset)/1000
          tmx+=(mx-tmx)*0.04; tmy+=(my-tmy)*0.04
          displaceVertices(t)
          if(sphereMesh){
            sphereMesh.rotation.x+=P.rotX; sphereMesh.rotation.y+=P.rotY; sphereMesh.rotation.z+=P.rotZ
            sphereMesh.rotation.x+=tmy*P.mouseInfluence*0.002; sphereMesh.rotation.y+=tmx*P.mouseInfluence*0.002
          }
          document.getElementById('s-rot').textContent=sphereMesh?(sphereMesh.rotation.y*180/Math.PI).toFixed(1)+'°':'—'
          renderer.render(scene,camera)
        }
        frames++
        if(ts-lastFpsT>600){document.getElementById('fps-badge').textContent=Math.round(frames*1000/(ts-lastFpsT))+' fps';frames=0;lastFpsT=ts}
        animRaf=requestAnimationFrame(frame)
      }
      animRaf=requestAnimationFrame(frame)

      window._wireTogglePlay=()=>{
        paused=!paused
        if(paused)pausedAt=performance.now();else pauseOffset+=performance.now()-pausedAt
        document.getElementById('play-btn').textContent=paused?'▶ Play':'⏸ Pause'
      }

      const PRESETS={
        default:{...DEFAULTS},
        fire:{colTop:'#ff9900',colMid:'#ff4400',colBot:'#cc0000',bgCol:'#100500',rimStrength:2.2,rimPower:3,dispAmp:.45,dispFreq:4,edgeScallop:10,scallopAmp:.3},
        ghost:{colTop:'#e0f0ff',colMid:'#88aaff',colBot:'#6644cc',bgCol:'#08091a',wireOpacity:.35,rimStrength:2.5,rimPower:5,dispAmp:.2,scallopAmp:.15},
        gold:{colTop:'#fff0aa',colMid:'#f0a020',colBot:'#c05000',bgCol:'#0a0800',rimStrength:3,rimPower:2.5,dispAmp:.3,edgeScallop:20,scallopAmp:.18,wireOpacity:.6},
        matrix:{colTop:'#00ff88',colMid:'#00cc44',colBot:'#005522',bgCol:'#000a04',rimStrength:2,rimPower:4,dispAmp:.25,dispFreq:5,edgeScallop:8,wireOpacity:.5},
      }
      window._wireSetPreset=name=>{
        const pr=PRESETS[name];if(!pr)return
        Object.assign(P,JSON.parse(JSON.stringify(DEFAULTS)),pr)
        buildSphere();onParamChange('');buildControls(document.querySelector('.tab.active').dataset.tab)
      }

      document.getElementById('btn-reset').onclick=()=>{Object.assign(P,JSON.parse(JSON.stringify(DEFAULTS)));buildSphere();onParamChange('');buildControls(document.querySelector('.tab.active').dataset.tab)}
      document.getElementById('btn-random').onclick=()=>{
        const rh=()=>'#'+[0,0,0].map(()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')
        const rf=(a,b)=>a+Math.random()*(b-a)
        P.colTop=rh();P.colMid=rh();P.colBot=rh();P.dispAmp=rf(.1,.6);P.dispFreq=rf(2,10)
        P.dispAmp2=rf(0,.3);P.edgeScallop=Math.floor(rf(6,28));P.scallopAmp=rf(.05,.5)
        P.rimStrength=rf(.5,4);P.rimPower=rf(1.5,8)
        buildSphere();onParamChange('');buildControls(document.querySelector('.tab.active').dataset.tab)
      }
      document.getElementById('btn-export').onclick=()=>{
        renderer.render(scene,camera)
        const cv=document.createElement('canvas'); cv.width=renderer.domElement.width; cv.height=renderer.domElement.height
        const ctx=cv.getContext('2d'); ctx.fillStyle=P.bgCol; ctx.fillRect(0,0,cv.width,cv.height)
        ctx.drawImage(renderer.domElement,0,0)
        const a=document.createElement('a'); a.download='wire-studio.png'; a.href=cv.toDataURL(); a.click()
      }

      script._cleanup=()=>{cancelAnimationFrame(animRaf);window.removeEventListener('resize',resizeRenderer)}
    }
    document.body.appendChild(script)
    return ()=>{
      if(script._cleanup)script._cleanup()
      delete window._wireTogglePlay; delete window._wireSetPreset
      if(document.body.contains(script))document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-tool-bg0 text-tool-text text-[13px]"
         style={{'--tool-accent2':'#22d3ee'}}>
      {/* PANEL */}
      <div className="w-[280px] min-w-[280px] bg-tool-bg1 border-r border-tool-border flex flex-col overflow-hidden">
        <div className="px-4 py-[14px] border-b border-tool-border flex items-center gap-[10px]">
          <div className="w-7 h-7 bg-gradient-to-br from-[#7c3aed] to-[#22d3ee] rounded-md flex items-center justify-center text-[13px] font-bold text-white shrink-0">W</div>
          <h1 className="text-[14px] font-semibold">Wire Studio</h1>
          <span className="ml-auto text-[11px] text-tool-text3 bg-tool-bg3 px-[7px] py-[2px] rounded-[20px]">v1.0</span>
        </div>
        <div id="tabs" className="flex border-b border-tool-border px-[6px]">
          {[['geo','Geometry'],['color','Color'],['motion','Motion'],['light','Light']].map(([k,l])=>(
            <div key={k} className="tab" data-tab={k}>{l}</div>
          ))}
        </div>
        <div id="controls" className="flex-1 overflow-y-auto py-[6px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-tool-bg4 [&::-webkit-scrollbar-thumb]:rounded-sm" />
        <div className="p-[10px_12px] border-t border-tool-border flex flex-col gap-[6px]">
          <div className="flex gap-[6px]">
            <button id="btn-reset"  className="flex-1 py-[7px] px-3 rounded-md text-[12px] font-medium cursor-pointer bg-tool-bg3 text-tool-text2 border border-tool-border2 hover:bg-tool-bg4 hover:text-tool-text transition-colors">Reset</button>
            <button id="btn-random" className="flex-1 py-[7px] px-3 rounded-md text-[12px] font-medium cursor-pointer bg-tool-bg3 text-tool-text2 border border-tool-border2 hover:bg-tool-bg4 hover:text-tool-text transition-colors">Randomize</button>
          </div>
          <button id="btn-export" className="py-[7px] px-3 rounded-md text-[12px] font-medium cursor-pointer bg-[#7c3aed] text-white hover:opacity-85 transition-opacity">Export Frame (PNG)</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[42px] bg-tool-bg1 border-b border-tool-border flex items-center px-[14px] gap-[6px]">
          <button id="play-btn" onClick={()=>window._wireTogglePlay?.()} className="px-2 py-[5px] rounded text-[12px] text-tool-text2 bg-transparent border-none cursor-pointer hover:bg-tool-bg3 hover:text-tool-text transition-colors whitespace-nowrap">⏸ Pause</button>
          <div className="w-px h-5 bg-tool-border2 mx-[2px] shrink-0" />
          {[['default','🔵 Default'],['fire','🔥 Fire'],['ghost','👻 Ghost'],['gold','✨ Gold'],['matrix','💚 Matrix']].map(([p,l])=>(
            <button key={p} onClick={()=>window._wireSetPreset?.(p)} className="px-2 py-[5px] rounded text-[12px] text-tool-text2 bg-transparent border-none cursor-pointer hover:bg-tool-bg3 hover:text-tool-text transition-colors whitespace-nowrap">{l}</button>
          ))}
          <span id="fps-badge" className="ml-auto text-[11px] text-tool-text3 bg-tool-bg2 px-2 py-[3px] rounded shrink-0 tabular-nums">— fps</span>
        </div>
        <div id="canvas-wrap" className="flex-1 flex items-center justify-center bg-tool-bg0 overflow-hidden [&_canvas]:block" />
        <div className="h-[26px] bg-tool-bg1 border-t border-tool-border flex items-center px-4 gap-5 text-[11px] text-tool-text3">
          <span>Segments: <b className="text-tool-text2" id="s-seg">—</b></span>
          <span>Displacement: <b className="text-tool-text2" id="s-disp">—</b></span>
          <span>Rotation: <b className="text-tool-text2" id="s-rot">—</b></span>
          <span>Mouse: <b className="text-tool-text2" id="s-mouse">—</b></span>
        </div>
      </div>
    </div>
  )
}
