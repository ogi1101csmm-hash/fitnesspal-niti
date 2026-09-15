
const DB_KEY="fittrack-free-v1";
const defaultState={
  goals:{calories:2200,protein:160,carbs:220,fat:70,water:2000},
  profile:{name:"",height:180,weight:80,target:75},
  diary:{}, water:{}, weights:[], recipes:[],
  fasting:{active:false,start:null,goalHours:16}
};
let state=loadState();
let deferredPrompt=null, html5QrCode=null;

function loadState(){
  try{return {...structuredClone(defaultState),...JSON.parse(localStorage.getItem(DB_KEY)||"{}")}}
  catch{return structuredClone(defaultState)}
}
function saveState(){localStorage.setItem(DB_KEY,JSON.stringify(state))}
function dayKey(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function entries(date=dayKey()){return state.diary[date]||[]}
function sum(date=dayKey()){
  return entries(date).reduce((a,f)=>({calories:a.calories+(+f.calories||0),protein:a.protein+(+f.protein||0),carbs:a.carbs+(+f.carbs||0),fat:a.fat+(+f.fat||0)}),{calories:0,protein:0,carbs:0,fat:0})
}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function format1(n){return Math.round((+n||0)*10)/10}

function renderAll(){
  const today=dayKey(), t=sum(today), g=state.goals;
  const rem=Math.max(0,g.calories-t.calories);
  remainingCalories.textContent=Math.round(rem);
  calorieFormula.textContent=`Objetivo ${g.calories} − comida ${Math.round(t.calories)}`;
  const pct=Math.min(100,Math.round(t.calories/g.calories*100)||0);
  caloriePct.textContent=pct+"%"; calorieRing.style.setProperty("--p",(pct*3.6)+"deg");
  proteinNow.textContent=`${format1(t.protein)} g`; carbsNow.textContent=`${format1(t.carbs)} g`; fatNow.textContent=`${format1(t.fat)} g`;
  todayLabel.textContent=new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"short"}).format(new Date());
  mealSummary.innerHTML=mealHTML(today,false);

  const water=state.water[today]||0;
  waterLabel.textContent=`${water} / ${g.water} ml`;
  waterBar.style.width=Math.min(100,water/g.water*100)+"%";

  diaryDate.value=diaryDate.value||today;
  diaryMeals.innerHTML=mealHTML(diaryDate.value,true);

  goalCalories.value=g.calories; goalProtein.value=g.protein; goalCarbs.value=g.carbs; goalFat.value=g.fat; goalWater.value=g.water;
  profileName.value=state.profile.name||""; profileHeight.value=state.profile.height||""; profileWeight.value=state.profile.weight||""; profileTarget.value=state.profile.target||"";

  renderRecipes(); renderWeights(); drawCalorieChart(); renderFasting();
}
function mealHTML(date,withButtons){
  const names=["Desayuno","Comida","Cena","Snacks"];
  const list=entries(date);
  return names.map(m=>{
    const items=list.filter(x=>x.meal===m);
    const kcal=items.reduce((a,x)=>a+(+x.calories||0),0);
    return `<div class="meal"><div class="meal-title"><span>${m}</span><span>${Math.round(kcal)} kcal</span></div>
      ${items.length?items.map((f,i)=>`<div class="food"><div><b>${esc(f.name)}</b><br><small>${format1(f.qty)} ${esc(f.unit)} · P ${format1(f.protein)} · C ${format1(f.carbs)} · G ${format1(f.fat)}</small></div><span>${Math.round(f.calories)} kcal</span>${withButtons?`<button class="remove" onclick="removeFood('${date}','${f.id}')">×</button>`:""}</div>`).join(""):`<div class="muted" style="padding:8px 0">Sin alimentos</div>`}
    </div>`
  }).join("")
}
window.removeFood=(date,id)=>{state.diary[date]=(state.diary[date]||[]).filter(x=>x.id!==id);saveState();renderAll()}

document.querySelectorAll(".bottomnav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(b.dataset.view).classList.add("active");
  document.querySelectorAll(".bottomnav button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  if(b.dataset.view==="progressView"){renderWeights();drawCalorieChart()}
});
document.querySelectorAll("[data-water]").forEach(b=>b.onclick=()=>{const k=dayKey();state.water[k]=(state.water[k]||0)+(+b.dataset.water);saveState();renderAll()});
resetWater.onclick=()=>{state.water[dayKey()]=0;saveState();renderAll()};
diaryDate.onchange=renderAll;

let currentFoodBasis = null;

function openFood(prefill={}){
  foodMeal.value=prefill.meal||"Comida";
  foodName.value=prefill.name||"";
  foodQty.value=prefill.qty||100;
  foodUnit.value=prefill.unit||"g";

  currentFoodBasis = prefill.per100 ? {
    qty: 100,
    unit: prefill.unit || "g",
    calories: +prefill.calories || 0,
    protein: +prefill.protein || 0,
    carbs: +prefill.carbs || 0,
    fat: +prefill.fat || 0
  } : null;

  foodCalories.value=prefill.calories??"";
  foodProtein.value=prefill.protein??0;
  foodCarbs.value=prefill.carbs??0;
  foodFat.value=prefill.fat??0;

  recalcFoodFromQty();
  foodDialog.showModal();
}

function recalcFoodFromQty(){
  if(!currentFoodBasis) return;
  const qty = +foodQty.value || 0;
  const factor = qty / currentFoodBasis.qty;

  foodCalories.value = format1(currentFoodBasis.calories * factor);
  foodProtein.value = format1(currentFoodBasis.protein * factor);
  foodCarbs.value = format1(currentFoodBasis.carbs * factor);
  foodFat.value = format1(currentFoodBasis.fat * factor);
}

foodQty.addEventListener("input", recalcFoodFromQty);

foodUnit.addEventListener("change", ()=>{
  if(currentFoodBasis && foodUnit.value !== currentFoodBasis.unit){
    currentFoodBasis = null;
  } else {
    recalcFoodFromQty();
  }
});
addFoodFab.onclick=()=>openFood();
foodForm.addEventListener("submit",e=>{
  if(e.submitter?.value==="cancel")return;
  e.preventDefault();
  const date=diaryDate.value||dayKey();
  const item={id:crypto.randomUUID(),meal:foodMeal.value,name:foodName.value.trim(),qty:+foodQty.value,unit:foodUnit.value,calories:+foodCalories.value,protein:+foodProtein.value,carbs:+foodCarbs.value,fat:+foodFat.value};
  (state.diary[date]??=[]).push(item); saveState(); foodDialog.close(); renderAll();
});

saveGoals.onclick=()=>{state.goals={calories:+goalCalories.value,protein:+goalProtein.value,carbs:+goalCarbs.value,fat:+goalFat.value,water:+goalWater.value};saveState();renderAll()};
saveProfile.onclick=()=>{state.profile={name:profileName.value.trim(),height:+profileHeight.value,weight:+profileWeight.value,target:+profileTarget.value};saveState();renderAll()};

addWeight.onclick=()=>{
  const v=prompt("Peso (kg):",state.profile.weight||"");
  if(v===null||isNaN(+v))return;
  state.weights.push({date:dayKey(),weight:+v}); state.profile.weight=+v; saveState(); renderAll();
};
function renderWeights(){
  weightList.innerHTML=[...state.weights].reverse().slice(0,10).map(w=>`<div class="meal-title meal"><span>${w.date}</span><span>${w.weight} kg</span></div>`).join("")||'<p class="muted">Aún no hay registros.</p>';
  drawLineChart(weightChart,state.weights.slice(-30).map(x=>({label:x.date.slice(5),value:x.weight})),"kg");
}
function drawCalorieChart(){
  const data=[]; for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);const k=dayKey(d);data.push({label:k.slice(5),value:sum(k).calories})}
  drawBars(calorieChart,data,state.goals.calories);
}
function prepCanvas(c){
  const ratio=window.devicePixelRatio||1, w=c.clientWidth||800, h=Math.round(w*.45);
  c.width=w*ratio;c.height=h*ratio;const x=c.getContext("2d");x.scale(ratio,ratio);return {x,w,h}
}
function drawLineChart(c,data,suffix){
  const {x,w,h}=prepCanvas(c);x.clearRect(0,0,w,h); if(!data.length){x.fillStyle="#94a3b8";x.fillText("Sin datos",20,30);return}
  const vals=data.map(d=>d.value), min=Math.min(...vals)-1,max=Math.max(...vals)+1, pad=34;
  x.strokeStyle="#34d399";x.lineWidth=3;x.beginPath();
  data.forEach((d,i)=>{const px=pad+i*(w-pad*2)/Math.max(1,data.length-1),py=h-pad-(d.value-min)/(max-min)*(h-pad*2);i?x.lineTo(px,py):x.moveTo(px,py)});
  x.stroke();x.fillStyle="#94a3b8";x.font="12px system-ui";x.fillText(`${format1(vals.at(-1))} ${suffix}`,pad,20);
}
function drawBars(c,data,goal){
  const {x,w,h}=prepCanvas(c);x.clearRect(0,0,w,h);const pad=30,max=Math.max(goal,...data.map(d=>d.value),1),bw=(w-pad*2)/data.length*.58;
  data.forEach((d,i)=>{const cx=pad+(i+.5)*(w-pad*2)/data.length,bh=d.value/max*(h-60);x.fillStyle="#60a5fa";x.fillRect(cx-bw/2,h-30-bh,bw,bh);x.fillStyle="#94a3b8";x.font="10px system-ui";x.textAlign="center";x.fillText(d.label,cx,h-12)});
  x.strokeStyle="#34d399";x.setLineDash([5,5]);const gy=h-30-goal/max*(h-60);x.beginPath();x.moveTo(pad,gy);x.lineTo(w-pad,gy);x.stroke();x.setLineDash([]);
}

newRecipe.onclick=()=>recipeDialog.showModal();
recipeForm.addEventListener("submit",e=>{
  if(e.submitter?.value==="cancel")return;e.preventDefault();
  state.recipes.push({id:crypto.randomUUID(),name:recipeName.value.trim(),servings:+recipeServings.value,ingredients:recipeIngredients.value,calories:+recipeCalories.value||0,protein:+recipeProtein.value||0,carbs:+recipeCarbs.value||0,fat:+recipeFat.value||0});
  saveState();recipeDialog.close();recipeForm.reset();renderAll();
});
function renderRecipes(){
  recipeList.innerHTML=state.recipes.map(r=>`<div class="card recipe-card"><div class="section-head"><div><h3>${esc(r.name)}</h3><div class="recipe-meta">${r.servings} raciones · ${Math.round(r.calories/r.servings||0)} kcal/ración</div></div><button class="secondary" onclick="addRecipe('${r.id}')">Añadir</button></div><pre style="white-space:pre-wrap;color:#cbd5e1">${esc(r.ingredients)}</pre></div>`).join("")||'<div class="card muted">Crea recetas para reutilizarlas en tu diario.</div>';
}
window.addRecipe=id=>{
  const r=state.recipes.find(x=>x.id===id); if(!r)return;
  openFood({name:r.name+" (1 ración)",qty:1,unit:"ud",calories:r.calories/r.servings,protein:r.protein/r.servings,carbs:r.carbs/r.servings,fat:r.fat/r.servings});
};

fastingBtn.onclick=()=>{
  if(state.fasting.active){state.fasting.active=false;state.fasting.start=null}
  else{state.fasting.active=true;state.fasting.start=Date.now();state.fasting.goalHours=+fastingGoal.value}
  saveState();renderFasting();
};
fastingGoal.onchange=()=>{state.fasting.goalHours=+fastingGoal.value;saveState();renderFasting()};
function renderFasting(){
  fastingGoal.value=String(state.fasting.goalHours||16);
  fastingBtn.textContent=state.fasting.active?"Finalizar ayuno":"Iniciar ayuno";
  if(!state.fasting.active){fastingStatus.textContent="Sin iniciar";fastingClock.textContent="00:00:00";return}
  const ms=Date.now()-state.fasting.start,s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;
  fastingClock.textContent=[h,m,sec].map(n=>String(n).padStart(2,"0")).join(":");
  fastingStatus.textContent=`Objetivo ${state.fasting.goalHours} h · ${Math.min(100,Math.round(ms/(state.fasting.goalHours*3600000)*100))}%`;
}
setInterval(()=>state.fasting.active&&renderFasting(),1000);

lookupBarcode.onclick=()=>lookupCode(barcodeInput.value.trim());
async function lookupCode(code){
  if(!code)return;
  barcodeResult.innerHTML='<div class="result">Buscando…</div>';
  try{
    const res=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
    const data=await res.json(); if(!data.product)throw new Error("No encontrado");
    const p=data.product,n=p.nutriments||{};
    const kcal=n["energy-kcal_100g"]??n["energy-kcal"]??0;
    const info={name:p.product_name_es||p.product_name||"Producto",qty:100,unit:"g",calories:kcal,protein:n.proteins_100g||0,carbs:n.carbohydrates_100g||0,fat:n.fat_100g||0,per100:true};
    barcodeResult.innerHTML=`<div class="result"><b>${esc(info.name)}</b><p class="muted">Por 100 g: ${Math.round(info.calories)} kcal · P ${format1(info.protein)} · C ${format1(info.carbs)} · G ${format1(info.fat)}</p><button id="addScanned">Añadir al diario</button></div>`;
    addScanned.onclick=()=>openFood(info);
  }catch(e){barcodeResult.innerHTML='<div class="result">Producto no encontrado. Puedes añadirlo manualmente desde el Diario.</div>'}
}
function normalizeBarcode(raw){
  let code=String(raw||"").replace(/\D/g,"");
  if(code.length===14 && code.startsWith("0")) code=code.slice(1);
  return code;
}

function validEanOrUpc(raw){
  const code=normalizeBarcode(raw);

  if(code.length===13){
    let sum=0;
    for(let i=0;i<12;i++){
      sum += Number(code[i]) * (i%2===0 ? 1 : 3);
    }
    return ((10-(sum%10))%10)===Number(code[12]);
  }

  if(code.length===8){
    let sum=0;
    for(let i=0;i<7;i++){
      sum += Number(code[i]) * (i%2===0 ? 3 : 1);
    }
    return ((10-(sum%10))%10)===Number(code[7]);
  }

  if(code.length===12){
    return validEanOrUpc("0"+code);
  }

  return false;
}

takeBarcodePhoto.onclick=()=>{
  barcodePhoto.value="";
  barcodePhoto.click();
};

barcodePhoto.onchange=async e=>{
  const file=e.target.files?.[0];
  if(!file) return;

  const previewUrl=URL.createObjectURL(file);
  barcodePhotoPreview.src=previewUrl;
  photoPreviewWrap.classList.remove("hidden");

  barcodeResult.innerHTML='<div class="result">Analizando la foto…</div>';

  if(typeof Html5Qrcode==="undefined"){
    barcodeResult.innerHTML='<div class="result">No se pudo cargar el lector de códigos. Recarga la página con conexión a Internet.</div>';
    return;
  }

  let fileScanner=null;

  try{
    fileScanner=new Html5Qrcode("reader");

    // scanFile analiza una foto estática. Es mucho más estable en iPhone
    // que mantener un decodificador trabajando sobre vídeo en directo.
    const decodedText=await fileScanner.scanFile(file,true);
    const code=normalizeBarcode(decodedText);

    if(!validEanOrUpc(code)){
      barcodeInput.value=code;
      barcodeResult.innerHTML=`<div class="result">
        Se detectó <b>${esc(code||decodedText)}</b>, pero no supera la validación EAN/UPC.
        <br><span class="muted">Haz otra foto más cerca, con el código recto y bien enfocado.</span>
      </div>`;
      return;
    }

    barcodeInput.value=code;
    barcodeResult.innerHTML=`<div class="result"><b>Código detectado:</b> ${code}<br><span class="muted">Buscando producto…</span></div>`;

    if(navigator.vibrate){
      try{navigator.vibrate(80)}catch{}
    }

    await lookupCode(code);

  }catch(err){
    console.error("No se pudo leer el código desde la foto:",err);
    barcodeResult.innerHTML=`<div class="result">
      <b>No se ha podido leer el código de barras de esta foto.</b>
      <br><span class="muted">Haz otra foto más cerca, evitando reflejos y procurando que todas las barras estén enfocadas.</span>
    </div>`;
  }finally{
    try{await fileScanner?.clear()}catch{}
    setTimeout(()=>URL.revokeObjectURL(previewUrl),30000);
  }
};

lookupBarcode.onclick=()=>lookupCode(barcodeInput.value.trim());

exportData.onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`fittrack-backup-${dayKey()}.json`;a.click();URL.revokeObjectURL(a.href)
};
importData.onchange=async e=>{const f=e.target.files[0];if(!f)return;try{state={...structuredClone(defaultState),...JSON.parse(await f.text())};saveState();renderAll();alert("Datos importados.")}catch{alert("Archivo no válido.")}};
wipeData.onclick=()=>{if(confirm("¿Borrar todos los datos locales?")){state=structuredClone(defaultState);saveState();renderAll()}};

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.classList.remove("hidden")});
installBtn.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.classList.add("hidden")}};

if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js");
renderAll();
