// Ficha Ninja editável (HTML + JS puro)
const STORAGE_DATA_KEY = "ninja_ficha:data:v1";
const STORAGE_LAYOUT_KEY = "ninja_ficha:layout:v1";

const $ = (sel) => document.querySelector(sel);

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}

function readJSONFile(file){
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      try{ resolve(JSON.parse(fr.result)); }
      catch(e){ reject(e); }
    };
    fr.onerror = reject;
    fr.readAsText(file);
  });
}

function debounce(fn, ms=200){
  let t=null;
  return (...args) => {
    clearTimeout(t);
    t=setTimeout(()=>fn(...args), ms);
  };
}

const DEFAULT_LAYOUT = {"version": 1, "pages": [{"id": "p1", "bg": "assets/page_1.png", "fields": [{"id": "nome", "type": "text", "x": 7.0, "y": 9.4, "w": 23.5, "h": 3.2}, {"id": "tipo_ninja", "type": "text", "x": 7.0, "y": 12.7, "w": 23.5, "h": 3.2}, {"id": "idade", "type": "text", "class": "numeric", "x": 7.0, "y": 16.1, "w": 7.0, "h": 3.2}, {"id": "level", "type": "text", "class": "numeric", "x": 23.5, "y": 16.1, "w": 7.0, "h": 3.2}, {"id": "rank", "type": "text", "x": 7.0, "y": 19.6, "w": 23.5, "h": 3.2}, {"id": "vila", "type": "text", "x": 7.0, "y": 22.9, "w": 23.5, "h": 3.2}, {"id": "cla", "type": "text", "x": 7.0, "y": 26.3, "w": 23.5, "h": 3.2}, {"id": "forca", "type": "text", "class": "numeric", "x": 40.0, "y": 11.0, "w": 6.0, "h": 3.0}, {"id": "forca_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 11.0, "w": 6.0, "h": 3.0}, {"id": "destreza", "type": "text", "class": "numeric", "x": 40.0, "y": 14.5, "w": 6.0, "h": 3.0}, {"id": "destreza_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 14.5, "w": 6.0, "h": 3.0}, {"id": "agilidade", "type": "text", "class": "numeric", "x": 40.0, "y": 18.0, "w": 6.0, "h": 3.0}, {"id": "agilidade_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 18.0, "w": 6.0, "h": 3.0}, {"id": "percepcao", "type": "text", "class": "numeric", "x": 40.0, "y": 21.5, "w": 6.0, "h": 3.0}, {"id": "percepcao_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 21.5, "w": 6.0, "h": 3.0}, {"id": "inteligencia", "type": "text", "class": "numeric", "x": 40.0, "y": 25.0, "w": 6.0, "h": 3.0}, {"id": "inteligencia_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 25.0, "w": 6.0, "h": 3.0}, {"id": "vigor", "type": "text", "class": "numeric", "x": 40.0, "y": 28.5, "w": 6.0, "h": 3.0}, {"id": "vigor_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 28.5, "w": 6.0, "h": 3.0}, {"id": "espirito", "type": "text", "class": "numeric", "x": 40.0, "y": 32.0, "w": 6.0, "h": 3.0}, {"id": "espirito_bonus", "type": "text", "class": "numeric", "x": 47.0, "y": 32.0, "w": 6.0, "h": 3.0}, {"id": "taijutsu", "type": "text", "class": "numeric", "x": 70.2, "y": 10.7, "w": 5.5, "h": 3.0}, {"id": "arma_ninja", "type": "text", "class": "numeric", "x": 70.2, "y": 14.2, "w": 5.5, "h": 3.0}, {"id": "furtividade", "type": "text", "class": "numeric", "x": 70.2, "y": 17.7, "w": 5.5, "h": 3.0}, {"id": "medicina", "type": "text", "class": "numeric", "x": 70.2, "y": 21.2, "w": 5.5, "h": 3.0}, {"id": "controle_chakra", "type": "text", "class": "numeric", "x": 70.2, "y": 24.7, "w": 5.5, "h": 3.0}, {"id": "labia", "type": "text", "class": "numeric", "x": 70.2, "y": 28.2, "w": 5.5, "h": 3.0}, {"id": "sobrevivencia", "type": "text", "class": "numeric", "x": 70.2, "y": 31.7, "w": 5.5, "h": 3.0}, {"id": "conhecimento_ninja", "type": "text", "class": "numeric", "x": 70.2, "y": 35.2, "w": 5.5, "h": 3.0}, {"id": "dados_importantes", "type": "textarea", "x": 6.5, "y": 44.0, "w": 24.5, "h": 26.0}, {"id": "fortitude", "type": "text", "class": "numeric", "x": 46.8, "y": 49.0, "w": 7.0, "h": 3.2}, {"id": "reflexo", "type": "text", "class": "numeric", "x": 46.8, "y": 54.6, "w": 7.0, "h": 3.2}, {"id": "vontade", "type": "text", "class": "numeric", "x": 46.8, "y": 60.2, "w": 7.0, "h": 3.2}, {"id": "elementos_ninja", "type": "text", "x": 39.0, "y": 66.5, "w": 25.0, "h": 3.8}, {"id": "hp", "type": "text", "class": "numeric", "x": 86.0, "y": 48.0, "w": 10.0, "h": 3.0}, {"id": "ca", "type": "text", "class": "numeric", "x": 86.0, "y": 53.5, "w": 10.0, "h": 3.0}, {"id": "chack", "type": "text", "class": "numeric", "x": 86.0, "y": 59.0, "w": 10.0, "h": 3.0}, {"id": "inic", "type": "text", "class": "numeric", "x": 86.0, "y": 64.5, "w": 10.0, "h": 3.0}, {"id": "desloc", "type": "text", "class": "numeric", "x": 86.0, "y": 70.0, "w": 10.0, "h": 3.0}, {"id": "jutsus_mais_usados", "type": "textarea", "x": 7.0, "y": 78.0, "w": 89.0, "h": 18.5}]}, {"id": "p2", "bg": "assets/page_2.png", "fields": [{"id": "mochila_1", "type": "text", "x": 8.0, "y": 12.2, "w": 32.0, "h": 3.4}, {"id": "mochila_2", "type": "text", "x": 8.0, "y": 15.9, "w": 32.0, "h": 3.4}, {"id": "mochila_3", "type": "text", "x": 8.0, "y": 19.6, "w": 32.0, "h": 3.4}, {"id": "mochila_4", "type": "text", "x": 8.0, "y": 23.3, "w": 32.0, "h": 3.4}, {"id": "mochila_5", "type": "text", "x": 8.0, "y": 27.0, "w": 32.0, "h": 3.4}, {"id": "mochila_6", "type": "text", "x": 8.0, "y": 30.7, "w": 32.0, "h": 3.4}, {"id": "mochila_7", "type": "text", "x": 8.0, "y": 34.4, "w": 32.0, "h": 3.4}, {"id": "mochila_8", "type": "text", "x": 8.0, "y": 38.1, "w": 32.0, "h": 3.4}, {"id": "mochila_9", "type": "text", "x": 8.0, "y": 41.8, "w": 32.0, "h": 3.4}, {"id": "mochila_10", "type": "text", "x": 8.0, "y": 45.5, "w": 32.0, "h": 3.4}, {"id": "ryos", "type": "text", "class": "numeric", "x": 47.0, "y": 12.0, "w": 10.0, "h": 4.2}, {"id": "talentos_passivas", "type": "textarea", "x": 63.0, "y": 12.0, "w": 33.0, "h": 40.0}, {"id": "jutsu_situacional_1", "type": "textarea", "x": 8.0, "y": 66.5, "w": 88.0, "h": 13.0}, {"id": "jutsu_situacional_2", "type": "textarea", "x": 8.0, "y": 81.0, "w": 88.0, "h": 13.0}]}, {"id": "p3", "bg": "assets/page_3.png", "fields": [{"id": "jutsu_situacional_3", "type": "textarea", "x": 8.0, "y": 18.0, "w": 88.0, "h": 14.0}, {"id": "jutsu_situacional_4", "type": "textarea", "x": 8.0, "y": 34.5, "w": 88.0, "h": 14.0}, {"id": "jutsu_situacional_5", "type": "textarea", "x": 8.0, "y": 51.0, "w": 88.0, "h": 14.0}, {"id": "jutsu_situacional_6", "type": "textarea", "x": 8.0, "y": 67.5, "w": 88.0, "h": 14.0}, {"id": "jutsu_situacional_7", "type": "textarea", "x": 8.0, "y": 84.0, "w": 88.0, "h": 14.0}]}]};

let LAYOUT = null;
let data = {};
let layoutMode = false;

function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    data = raw ? JSON.parse(raw) : {};
  }catch{ data = {}; }
}
function saveData(){ localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data)); }

function loadLayout(){
  try{
    const raw = localStorage.getItem(STORAGE_LAYOUT_KEY);
    if(raw) return JSON.parse(raw);
  }catch{}
  return DEFAULT_LAYOUT;
}
function saveLayout(layout){
  localStorage.setItem(STORAGE_LAYOUT_KEY, JSON.stringify(layout));
}

function createFieldEl(field, sheetEl){
  const wrap = document.createElement("div");
  wrap.className = "field" + (field.class ? " " + field.class : "");
  wrap.dataset.id = field.id;
  wrap.style.left = field.x + "%";
  wrap.style.top  = field.y + "%";
  wrap.style.width  = field.w + "%";
  wrap.style.height = field.h + "%";

  const input = field.type === "textarea"
    ? document.createElement("textarea")
    : document.createElement("input");

  input.className = "input";
  if(input.tagName === "INPUT") input.type = "text";

  input.value = data[field.id] ?? "";
  input.addEventListener("input", debounce(() => {
    data[field.id] = input.value;
    saveData();
  }, 120));

  input.addEventListener("mousedown", (e)=>{ e.stopPropagation(); });

  wrap.appendChild(input);

  const resizer = document.createElement("div");
  resizer.className = "resizer";
  wrap.appendChild(resizer);

  let drag = null;
  wrap.addEventListener("mousedown", (e) => {
    if(!layoutMode) return;

    const rect = sheetEl.getBoundingClientRect();
    const isResize = e.target === resizer;

    drag = {
      field, wrap, rect,
      startX: e.clientX, startY: e.clientY,
      startLeft: field.x, startTop: field.y,
      startW: field.w, startH: field.h,
      isResize,
    };

    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if(!drag) return;

    const dx = (e.clientX - drag.startX) / drag.rect.width * 100;
    const dy = (e.clientY - drag.startY) / drag.rect.height * 100;

    if(drag.isResize){
      drag.field.w = clamp(drag.startW + dx, 1, 95);
      drag.field.h = clamp(drag.startH + dy, 1, 95);
    }else{
      drag.field.x = clamp(drag.startLeft + dx, 0, 99);
      drag.field.y = clamp(drag.startTop + dy, 0, 99);
    }

    drag.wrap.style.left = drag.field.x + "%";
    drag.wrap.style.top  = drag.field.y + "%";
    drag.wrap.style.width  = drag.field.w + "%";
    drag.wrap.style.height = drag.field.h + "%";
  });

  window.addEventListener("mouseup", () => {
    if(!drag) return;
    saveLayout(LAYOUT);
    drag = null;
  });

  return wrap;
}

function renderSheet(sheetEl, page){
  sheetEl.innerHTML = "";

  const img = document.createElement("img");
  img.className = "bg";
  img.src = page.bg;
  img.alt = "Fundo da ficha";
  img.draggable = false;
  sheetEl.appendChild(img);

  for(const field of page.fields){
    sheetEl.appendChild(createFieldEl(field, sheetEl));
  }
}

function renderAll(){
  $("#sheet1").classList.toggle("layout", layoutMode);
  $("#sheet2").classList.toggle("layout", layoutMode);
  $("#sheet3").classList.toggle("layout", layoutMode);

  renderSheet($("#sheet1"), LAYOUT.pages[0]);
  renderSheet($("#sheet2"), LAYOUT.pages[1]);
  renderSheet($("#sheet3"), LAYOUT.pages[2]);
}

function setPage(n){
  const sheets = [$("#sheet1"), $("#sheet2"), $("#sheet3")];
  const btns = [$("#btnPage1"), $("#btnPage2"), $("#btnPage3")];

  sheets.forEach((s, idx) => s.classList.toggle("hidden", idx !== (n-1)));
  btns.forEach((b, idx) => b.classList.toggle("primary", idx === (n-1)));
}

function wireUI(){
  $("#btnPage1").addEventListener("click", ()=>setPage(1));
  $("#btnPage2").addEventListener("click", ()=>setPage(2));
  $("#btnPage3").addEventListener("click", ()=>setPage(3));

  $("#btnToggleLayout").addEventListener("click", () => {
    layoutMode = !layoutMode;
    $("#btnToggleLayout").classList.toggle("primary", layoutMode);
    renderAll();
  });

  $("#btnExportData").addEventListener("click", () => downloadJSON("ninja_ficha_dados.json", data));

  $("#fileImportData").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      data = (await readJSONFile(file)) || {};
      saveData();
      renderAll();
    }catch(err){
      alert("JSON inválido para dados.");
      console.error(err);
    }finally{
      e.target.value = "";
    }
  });

  $("#btnExportLayout").addEventListener("click", () => downloadJSON("ninja_ficha_layout.json", LAYOUT));

  $("#fileImportLayout").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const obj = await readJSONFile(file);
      if(!obj?.pages?.length) throw new Error("layout sem pages");
      LAYOUT = obj;
      saveLayout(LAYOUT);
      renderAll();
    }catch(err){
      alert("JSON inválido para layout.");
      console.error(err);
    }finally{
      e.target.value = "";
    }
  });

  $("#btnPrint").addEventListener("click", () => window.print());

  $("#btnReset").addEventListener("click", () => {
    const ok = confirm("Resetar dados e layout salvos no navegador?");
    if(!ok) return;
    localStorage.removeItem(STORAGE_DATA_KEY);
    localStorage.removeItem(STORAGE_LAYOUT_KEY);
    loadData();
    LAYOUT = loadLayout();
    renderAll();
  });

  window.addEventListener("keydown", (e) => {
    const isCmd = e.ctrlKey || e.metaKey;
    if(isCmd && e.key.toLowerCase() === "s"){
      e.preventDefault();
      saveData();
      saveLayout(LAYOUT);
      alert("Salvo!");
    }
  });
}

(function init(){
  loadData();
  LAYOUT = loadLayout();
  renderAll();
  wireUI();
  setPage(1);
})();
