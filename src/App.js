/* global BarcodeDetector */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Gaegu:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#fdf6f0; --surface:#fffaf7; --surface2:#fff4ee; --border:#f0d9cc;
    --pink:#f9a8c9; --pink-l:#fde8f2; --pink-d:#c2607a;
    --mint:#86dbb6; --mint-l:#d9f5ea; --mint-d:#2d8a60;
    --peach:#ffb085; --peach-l:#ffe8d6; --peach-d:#a0520c;
    --lav:#c4b0f7; --lav-l:#ede8ff; --lav-d:#6040b8;
    --sky:#93d0f5; --sky-l:#dff1fd; --sky-d:#1a6b9a;
    --warn:#ffd97d; --warn-l:#fff5d6; --warn-d:#a06000;
    --danger:#ffb3b3; --danger-l:#ffe8e8; --danger-d:#b83030;
    --text:#4a3728; --text2:#9a7b6a; --text3:#c4a898;
    --radius:18px; --radius-sm:12px;
    --shadow:0 2px 12px rgba(180,120,80,.10); --shadow-sm:0 1px 6px rgba(180,120,80,.07);
    --font:'Nunito',sans-serif; --font-title:'Gaegu',cursive;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;font-size:14px;}
  .app{max-width:1060px;margin:0 auto;padding:2rem 1.5rem 5rem;}

  .header{text-align:center;margin-bottom:2.5rem;}
  .header-deco{font-size:3rem;line-height:1;display:block;margin-bottom:.4rem;}
  .header-title{font-family:var(--font-title);font-size:clamp(2rem,5vw,3rem);color:var(--text);line-height:1.1;}
  .header-title span{color:var(--pink-d);}
  .header-sub{font-size:.78rem;color:var(--text2);margin-top:.4rem;letter-spacing:.06em;}
  .stat-pills{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem;}
  .stat-pill{display:flex;align-items:center;gap:.4rem;padding:.38rem .9rem;border-radius:999px;font-size:.78rem;font-weight:700;border:1.5px solid transparent;}
  .pill-total{background:var(--lav-l);color:var(--lav-d);border-color:var(--lav);}
  .pill-warn{background:var(--warn-l);color:var(--warn-d);border-color:var(--warn);}
  .pill-danger{background:var(--danger-l);color:var(--danger-d);border-color:var(--danger);}
  .pill-none{background:var(--surface2);color:var(--text2);border-color:var(--border);}

  .tabs{display:flex;gap:.5rem;margin-bottom:1.5rem;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:.35rem;flex-wrap:wrap;}
  .tab{flex:1;min-width:90px;padding:.55rem .8rem;border-radius:14px;border:none;background:transparent;color:var(--text2);font-family:var(--font);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:.35rem;}
  .tab:hover{background:var(--surface2);color:var(--text);}
  .tab.active{background:var(--pink);color:#fff;box-shadow:var(--shadow-sm);}
  .tab.active.t-recipe{background:var(--mint);}
  .tab.active.t-alert{background:var(--peach);}
  .badge{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:var(--danger-d);color:#fff;font-size:.6rem;font-weight:800;}

  .card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);padding:1.25rem 1.4rem;margin-bottom:1rem;box-shadow:var(--shadow-sm);}
  .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:.5rem;flex-wrap:wrap;}
  .card-title{font-family:var(--font-title);font-size:1.15rem;color:var(--text);}

  .add-form{display:grid;grid-template-columns:1.2fr 1fr .9fr 1.1fr auto;gap:.6rem;align-items:end;}
  @media(max-width:680px){.add-form{grid-template-columns:1fr 1fr;}.add-form .btn-add{grid-column:1/-1;}}
  .field{display:flex;flex-direction:column;gap:.3rem;}
  .field label{font-size:.68rem;color:var(--text2);font-weight:700;letter-spacing:.06em;}
  .field input,.field select{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font);font-size:.84rem;font-weight:600;padding:.52rem .8rem;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;}
  .field input:focus,.field select:focus{border-color:var(--pink);box-shadow:0 0 0 3px var(--pink-l);}
  .field select option{background:var(--surface2);}
  .expiry-row{display:flex;gap:.4rem;align-items:stretch;}
  .expiry-row input{flex:1;min-width:0;}

  .btn{border:none;border-radius:var(--radius-sm);font-family:var(--font);font-size:.82rem;font-weight:700;cursor:pointer;padding:.52rem 1.1rem;transition:all .15s;display:inline-flex;align-items:center;gap:.4rem;white-space:nowrap;}
  .btn-pink{background:var(--pink);color:#fff;box-shadow:0 2px 8px rgba(249,168,201,.4);}
  .btn-pink:hover{filter:brightness(1.07);transform:translateY(-1px);}
  .btn-mint{background:var(--mint);color:#fff;box-shadow:0 2px 8px rgba(134,219,182,.4);}
  .btn-mint:hover{filter:brightness(1.07);transform:translateY(-1px);}
  .btn-peach{background:var(--peach);color:#fff;box-shadow:0 2px 8px rgba(255,176,133,.4);}
  .btn-peach:hover{filter:brightness(1.07);transform:translateY(-1px);}
  .btn-lav{background:var(--lav);color:#fff;box-shadow:0 2px 8px rgba(196,176,247,.4);}
  .btn-lav:hover{filter:brightness(1.07);transform:translateY(-1px);}
  .btn-sky-out{background:var(--sky-l);border:1.5px solid var(--sky);color:var(--sky-d);}
  .btn-sky-out:hover{background:var(--sky);color:#fff;}
  .btn-ghost{background:var(--surface2);border:1.5px solid var(--border);color:var(--text2);}
  .btn-ghost:hover{border-color:var(--pink);color:var(--text);}
  .btn:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:none;}

  .btn-ai{background:var(--lav-l);border:1.5px solid var(--lav);color:var(--lav-d);font-size:.7rem;font-weight:700;padding:.5rem .65rem;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);white-space:nowrap;transition:all .15s;display:inline-flex;align-items:center;gap:.2rem;flex-shrink:0;}
  .btn-ai:hover{background:var(--lav);color:#fff;}
  .btn-ai:disabled{opacity:.4;cursor:not-allowed;}
  .btn-ai-sm{font-size:.63rem;padding:.22rem .55rem;border-radius:8px;}

  /* 바코드 버튼 */
  .btn-barcode{background:var(--sky-l);border:1.5px solid var(--sky);color:var(--sky-d);font-size:.7rem;font-weight:700;padding:.5rem .65rem;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);white-space:nowrap;transition:all .15s;display:inline-flex;align-items:center;gap:.2rem;flex-shrink:0;}
  .btn-barcode:hover{background:var(--sky);color:#fff;}

  .item-list{display:flex;flex-direction:column;gap:.45rem;margin-top:.9rem;}
  .item-row{display:flex;align-items:center;gap:.6rem;padding:.65rem .85rem;background:var(--surface2);border-radius:var(--radius-sm);border:1.5px solid var(--border);transition:all .15s;flex-wrap:wrap;}
  .item-row:hover{border-color:var(--pink);box-shadow:var(--shadow-sm);}
  .item-row.warn{border-color:var(--warn);background:var(--warn-l);}
  .item-row.danger{border-color:var(--danger);background:var(--danger-l);}
  .item-name{font-weight:700;font-size:.9rem;flex:1;min-width:80px;}
  .item-qty{font-size:.72rem;font-weight:600;color:var(--text2);background:var(--surface);border-radius:999px;padding:.18rem .6rem;border:1px solid var(--border);}
  .item-cat{font-size:.68rem;font-weight:700;padding:.18rem .55rem;border-radius:999px;}
  .item-right{display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap;justify-content:flex-end;}
  .item-exp{font-size:.72rem;font-weight:600;}
  .exp-ok{color:var(--mint-d);} .exp-warn{color:var(--warn-d);} .exp-danger{color:var(--danger-d);} .exp-none{color:var(--text3);font-style:italic;}
  .item-del{background:transparent;border:none;color:var(--text3);cursor:pointer;font-size:1rem;padding:.2rem .3rem;border-radius:6px;transition:all .15s;flex-shrink:0;}
  .item-del:hover{color:var(--danger-d);background:var(--danger-l);}
  .item-check{appearance:none;width:17px;height:17px;border:2px solid var(--border);border-radius:5px;background:transparent;cursor:pointer;flex-shrink:0;position:relative;transition:all .15s;}
  .item-check:checked{background:var(--pink);border-color:var(--pink);}
  .item-check:checked::after{content:'✓';position:absolute;top:-3px;left:1px;font-size:.75rem;color:#fff;font-weight:800;}

  .recipe-type{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem;}
  .rtype{padding:.38rem .85rem;border:1.5px solid var(--border);border-radius:999px;background:var(--surface2);color:var(--text2);font-family:var(--font);font-size:.74rem;font-weight:700;cursor:pointer;transition:all .15s;}
  .rtype:hover{border-color:var(--mint);color:var(--mint-d);}
  .rtype.active{border-color:var(--mint);background:var(--mint-l);color:var(--mint-d);}
  .recipe-controls{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem;}
  .recipe-output{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:1.1rem;font-size:.82rem;line-height:1.8;white-space:pre-wrap;min-height:200px;max-height:520px;overflow-y:auto;color:var(--text);}
  .recipe-output.placeholder{display:flex;align-items:center;justify-content:center;color:var(--text3);font-style:italic;}
  .recipe-output::-webkit-scrollbar{width:6px;}
  .recipe-output::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

  .thinking{display:flex;align-items:center;gap:.6rem;color:var(--text2);font-size:.8rem;font-weight:600;}
  .dot-anim span{animation:blink 1.2s infinite;display:inline-block;}
  .dot-anim span:nth-child(2){animation-delay:.2s;}
  .dot-anim span:nth-child(3){animation-delay:.4s;}
  @keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}

  .alert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.9rem;margin-top:.9rem;}
  .alert-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:1rem;}
  .alert-card.warn{border-color:var(--warn);background:var(--warn-l);}
  .alert-card.danger{border-color:var(--danger);background:var(--danger-l);}
  .alert-name{font-weight:800;font-size:.92rem;margin-bottom:.25rem;}
  .alert-days{font-size:.74rem;font-weight:600;margin-bottom:.7rem;}
  .alert-actions{display:flex;gap:.45rem;flex-wrap:wrap;}
  .alert-actions .btn{font-size:.68rem;padding:.32rem .65rem;}

  .tag-list{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem;}
  .tag{background:var(--pink-l);border:1.5px solid var(--pink);color:var(--pink-d);border-radius:999px;font-size:.72rem;font-weight:700;padding:.22rem .65rem;display:flex;align-items:center;gap:.3rem;}
  .tag button{background:none;border:none;color:var(--pink-d);cursor:pointer;font-size:.85rem;padding:0;line-height:1;}

  .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--surface);border:1.5px solid var(--mint);color:var(--text);border-radius:var(--radius-sm);padding:.75rem 1.2rem;font-size:.8rem;font-weight:700;z-index:9999;animation:slideUp .2s ease;max-width:320px;box-shadow:var(--shadow);}
  @keyframes slideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}

  .divider{border:none;border-top:1.5px dashed var(--border);margin:1.1rem 0;}
  .selected-info{font-size:.74rem;font-weight:600;color:var(--text2);}
  .empty{text-align:center;padding:2.5rem 1rem;color:var(--text3);font-size:.82rem;}
  .empty-icon{font-size:2.5rem;margin-bottom:.6rem;display:block;}
  .hint-bar{font-size:.72rem;color:var(--text2);font-weight:600;margin-top:.9rem;border-top:1.5px dashed var(--border);padding-top:.75rem;}
  .hint-bar strong{color:var(--lav-d);}

  /* ── 팝업 공통 ── */
  .popup-overlay{position:fixed;inset:0;background:rgba(74,55,40,.38);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;backdrop-filter:blur(3px);}
  .popup-box{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:1.5rem;max-width:490px;width:100%;box-shadow:0 16px 48px rgba(180,120,80,.2);}
  .popup-header{margin-bottom:1rem;}
  .popup-header h3{font-family:var(--font-title);font-size:1.3rem;color:var(--text);margin-bottom:.2rem;}
  .popup-header p{font-size:.74rem;color:var(--text2);font-weight:600;}
  .popup-actions{display:flex;gap:.6rem;justify-content:flex-end;margin-top:1.2rem;}

  /* ── 보존기한 팝업 ── */
  .shelf-summary{background:var(--lav-l);border:1.5px solid var(--lav);border-radius:var(--radius-sm);padding:.85rem 1rem;font-size:.82rem;font-weight:600;line-height:1.65;margin-bottom:1rem;color:var(--lav-d);}
  .shelf-tip{font-size:.74rem;color:var(--mint-d);margin-top:.45rem;font-weight:700;}
  .shelf-options-label{font-size:.68rem;color:var(--text2);font-weight:700;letter-spacing:.06em;margin-bottom:.5rem;}
  .shelf-options{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem;}
  .shelf-option{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:.75rem .9rem;cursor:pointer;transition:all .15s;gap:.5rem;}
  .shelf-option:hover{border-color:var(--pink);background:var(--pink-l);}
  .shelf-option.selected{border-color:var(--pink);background:var(--pink-l);box-shadow:0 0 0 3px var(--pink-l);}
  .shelf-opt-left{display:flex;flex-direction:column;gap:.12rem;flex:1;}
  .shelf-opt-label{font-size:.83rem;font-weight:800;}
  .shelf-opt-desc{font-size:.7rem;color:var(--text2);font-weight:600;}
  .shelf-opt-right{display:flex;flex-direction:column;align-items:flex-end;gap:.1rem;flex-shrink:0;}
  .shelf-opt-days{font-size:.88rem;color:var(--pink-d);font-weight:800;}
  .shelf-opt-date{font-size:.67rem;color:var(--text2);font-weight:600;}
  .popup-loading{display:flex;align-items:center;gap:.6rem;color:var(--text2);font-size:.8rem;font-weight:700;padding:1.5rem 0;justify-content:center;}

  /* ── 바코드 팝업 ── */
  .bc-mode-tabs{display:flex;gap:.5rem;margin-bottom:1.1rem;}
  .bc-mode-tab{flex:1;padding:.45rem .7rem;border-radius:10px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text2);font-family:var(--font);font-size:.76rem;font-weight:700;cursor:pointer;transition:all .15s;text-align:center;}
  .bc-mode-tab.active{background:var(--sky-l);border-color:var(--sky);color:var(--sky-d);}

  /* 카메라 뷰파인더 */
  .bc-camera-wrap{position:relative;background:#1a1a2e;border-radius:var(--radius-sm);overflow:hidden;margin-bottom:1rem;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;}
  .bc-video{width:100%;height:100%;object-fit:cover;display:block;}
  .bc-scan-line{position:absolute;left:10%;right:10%;height:2px;background:var(--pink);border-radius:1px;animation:scanline 2s ease-in-out infinite;}
  @keyframes scanline{0%,100%{top:20%}50%{top:75%}}
  .bc-corners::before,.bc-corners::after{content:'';position:absolute;width:28px;height:28px;border-color:var(--pink);border-style:solid;}
  .bc-corners::before{top:10%;left:10%;border-width:3px 0 0 3px;border-radius:4px 0 0 0;}
  .bc-corners::after{bottom:10%;right:10%;border-width:0 3px 3px 0;border-radius:0 0 4px 0;}
  .bc-corners-br::before{top:10%;right:10%;border-width:3px 3px 0 0;border-radius:0 4px 0 0;}
  .bc-corners-br::after{bottom:10%;left:10%;border-width:0 0 3px 3px;border-radius:0 0 0 4px;}
  .bc-camera-msg{color:#fff;font-size:.82rem;font-weight:700;text-align:center;padding:1rem;}

  /* 바코드 직접입력 */
  .bc-manual-row{display:flex;gap:.5rem;margin-bottom:.75rem;}
  .bc-manual-row input{flex:1;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font);font-size:.9rem;font-weight:600;padding:.6rem .85rem;outline:none;transition:border-color .15s;}
  .bc-manual-row input:focus{border-color:var(--sky);box-shadow:0 0 0 3px var(--sky-l);}

  /* 스캔 결과 */
  .bc-result{background:var(--mint-l);border:1.5px solid var(--mint);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;}
  .bc-result-name{font-size:1rem;font-weight:800;color:var(--text);margin-bottom:.3rem;}
  .bc-result-meta{font-size:.75rem;color:var(--text2);font-weight:600;margin-bottom:.7rem;}
  .bc-result-fields{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;}
  .bc-field{display:flex;flex-direction:column;gap:.25rem;}
  .bc-field label{font-size:.65rem;color:var(--text2);font-weight:700;letter-spacing:.06em;}
  .bc-field input,.bc-field select{background:var(--surface);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font);font-size:.8rem;font-weight:600;padding:.42rem .65rem;outline:none;width:100%;}
  .bc-field input:focus,.bc-field select:focus{border-color:var(--mint);}
  .bc-not-found{background:var(--warn-l);border:1.5px solid var(--warn);border-radius:var(--radius-sm);padding:.85rem 1rem;font-size:.8rem;color:var(--warn-d);font-weight:700;margin-bottom:.9rem;}
`;

const CATEGORIES = ["채소","육류","해산물","유제품","과일","음료","조미료","기타"];
const RECIPE_TYPES = ["한식","양식","일식","중식","채식","간단요리","다이어트"];
const CAT_COLORS = {"채소":"#86dbb6","육류":"#ffb085","해산물":"#93d0f5","유제품":"#f9a8c9","과일":"#c4b0f7","음료":"#ffd97d","조미료":"#ffb3b3","기타":"#c4b0f7"};
const CAT_TEXT   = {"채소":"#2d8a60","육류":"#a0520c","해산물":"#1a6b9a","유제품":"#c2607a","과일":"#6040b8","음료":"#a06000","조미료":"#b83030","기타":"#6040b8"};

function daysUntil(d){if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000);}
function expClass(days){if(days===null)return "";if(days<=3)return "danger";if(days<=7)return "warn";return "";}
function expLabel(days){if(days===null)return "";if(days<0)return `만료 ${Math.abs(days)}일 초과`;if(days===0)return "오늘 만료!";return `${days}일 남음`;}
function expTextClass(days){if(days===null)return "exp-none";if(days<=3)return "exp-danger";if(days<=7)return "exp-warn";return "exp-ok";}
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];}
function makeCalendarLink(item){const d=new Date(item.expiry);const fmt=n=>String(n).padStart(2,"0");const date=`${d.getFullYear()}${fmt(d.getMonth()+1)}${fmt(d.getDate())}`;return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🧊 소비기한 임박: ${item.name}`)}&dates=${date}/${date}&details=${encodeURIComponent(`재료: ${item.name}`)}`;}
function makeMailLink(items){const subject=encodeURIComponent(`[냉장고 알림] 소비기한 임박 재료 ${items.length}개`);const body=encodeURIComponent(`소비기한이 임박한 재료들이에요!\n\n`+items.map(i=>`• ${i.name} — ${expLabel(daysUntil(i.expiry))}`).join("\n")+`\n\n빨리 써주세요 🥺`);return `mailto:?subject=${subject}&body=${body}`;}

// Open Food Facts API로 바코드 조회
async function lookupBarcode(barcode) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_ko,categories_tags,quantity,brands`);
  const data = await res.json();
  if (data.status !== 1) return null;
  const p = data.product;
  const name = p.product_name_ko || p.product_name || "";
  if (!name) return null;
  // 카테고리 매핑
  const cats = (p.categories_tags || []).join(" ").toLowerCase();
  let category = "기타";
  if (cats.includes("vegetable") || cats.includes("채소") || cats.includes("야채")) category = "채소";
  else if (cats.includes("meat") || cats.includes("육류") || cats.includes("chicken") || cats.includes("pork") || cats.includes("beef")) category = "육류";
  else if (cats.includes("seafood") || cats.includes("fish") || cats.includes("해산물")) category = "해산물";
  else if (cats.includes("dairy") || cats.includes("milk") || cats.includes("유제품") || cats.includes("cheese")) category = "유제품";
  else if (cats.includes("fruit") || cats.includes("과일")) category = "과일";
  else if (cats.includes("beverage") || cats.includes("drink") || cats.includes("음료")) category = "음료";
  return { name: name.trim(), category, brand: p.brands || "", quantity: p.quantity || "" };
}

// ── 바코드 팝업 ────────────────────────────────────────────────────────────
function BarcodePopup({ onClose, onAdd }) {
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [hasBarcodeAPI] = useState(() => "BarcodeDetector" in window);
  const [cameraState, setCameraState] = useState("idle"); // idle | requesting | active | error
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [result, setResult] = useState(null);   // { name, category, brand, quantity }
  const [notFound, setNotFound] = useState(false);
  const [scanned, setScanned] = useState("");   // last scanned barcode string
  const [editForm, setEditForm] = useState({ qty: "", unit: "개", category: "기타", expiry: "" });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new BarcodeDetector({ formats: ["ean_13","ean_8","upc_a","upc_e","qr_code","code_128","code_39"] });
      setCameraState("active");
    } catch (e) {
      setCameraState("error");
      setCameraError(e.name === "NotAllowedError" ? "카메라 접근 권한이 거부됐어요. 브라우저 설정에서 허용해주세요." : `카메라를 열 수 없어요: ${e.message}`);
    }
  }, []);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // 바코드 감지 루프
  useEffect(() => {
    if (cameraState !== "active") return;
    let active = true;
    const detect = async () => {
      if (!active || !videoRef.current || !detectorRef.current) return;
      try {
        const codes = await detectorRef.current.detect(videoRef.current);
        if (codes.length > 0) {
          const code = codes[0].rawValue;
          if (code !== scanned) {
            setScanned(code);
            stopCamera();
            setCameraState("idle");
            await doLookup(code);
          }
        }
      } catch {}
      if (active) rafRef.current = requestAnimationFrame(detect);
    };
    rafRef.current = requestAnimationFrame(detect);
    return () => { active = false; cancelAnimationFrame(rafRef.current); };
  }, [cameraState, scanned]);

  // 언마운트 시 카메라 정리
  useEffect(() => () => stopCamera(), []);

  // 탭 전환 시 카메라 처리
  useEffect(() => {
    if (mode === "manual") stopCamera();
  }, [mode]);

  const doLookup = async (code) => {
    setLooking(true); setResult(null); setNotFound(false);
    try {
      const found = await lookupBarcode(code);
      if (found) {
        setResult(found);
        setEditForm(p => ({ ...p, category: found.category }));
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLooking(false);
    }
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;
    setScanned(manualCode.trim());
    doLookup(manualCode.trim());
  };

  const handleAdd = () => {
    if (!result) return;
    onAdd({ name: result.name, ...editForm });
    onClose();
  };

  const resetResult = () => { setResult(null); setNotFound(false); setScanned(""); setManualCode(""); };

  return (
    <div className="popup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="popup-box">
        <div className="popup-header">
          <h3>📦 바코드로 재료 추가</h3>
          <p>바코드를 스캔하거나 번호를 입력해 제품명을 자동으로 가져와요</p>
        </div>

        {/* 모드 탭 */}
        {!result && !looking && (
          <div className="bc-mode-tabs">
            <button className={`bc-mode-tab ${mode==="camera"?"active":""}`} onClick={()=>setMode("camera")}>
              📷 카메라 스캔{!hasBarcodeAPI && " (미지원)"}
            </button>
            <button className={`bc-mode-tab ${mode==="manual"?"active":""}`} onClick={()=>setMode("manual")}>
              ⌨️ 번호 직접 입력
            </button>
          </div>
        )}

        {/* 로딩 */}
        {looking && (
          <div className="popup-loading">
            <span>제품 정보 조회 중</span>
            <span className="dot-anim"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}

        {/* 카메라 모드 */}
        {!looking && !result && mode === "camera" && (
          <>
            {!hasBarcodeAPI ? (
              <div style={{background:"var(--warn-l)",border:"1.5px solid var(--warn)",borderRadius:"var(--radius-sm)",padding:".9rem 1rem",fontSize:".8rem",color:"var(--warn-d)",fontWeight:700,marginBottom:".9rem"}}>
                ⚠️ 이 브라우저는 카메라 바코드 스캔을 지원하지 않아요.<br/>
                <span style={{fontWeight:600}}>Chrome 또는 Edge 최신 버전에서 사용해주세요.</span><br/>
                아래 "번호 직접 입력" 탭을 이용해주세요!
              </div>
            ) : (
              <>
                <div className="bc-camera-wrap">
                  {cameraState === "active" ? (
                    <>
                      <video ref={videoRef} className="bc-video" playsInline muted />
                      <div className="bc-scan-line" />
                      <div className="bc-corners" style={{position:"absolute",inset:0,pointerEvents:"none"}} />
                      <div className="bc-corners-br" style={{position:"absolute",inset:0,pointerEvents:"none"}} />
                    </>
                  ) : cameraState === "error" ? (
                    <div className="bc-camera-msg" style={{color:"#ffb3b3"}}>⚠️ {cameraError}</div>
                  ) : (
                    <div className="bc-camera-msg">📷 카메라를 시작하면<br/>바코드를 자동으로 인식해요</div>
                  )}
                </div>
                {cameraState !== "active" ? (
                  <button className="btn btn-sky-out" style={{width:"100%",justifyContent:"center"}} onClick={startCamera}>
                    📷 카메라 시작하기
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} onClick={()=>{stopCamera();setCameraState("idle");}}>
                    ⏹ 카메라 중지
                  </button>
                )}
                {scanned && <p style={{fontSize:".7rem",color:"var(--text2)",fontWeight:600,marginTop:".5rem",textAlign:"center"}}>스캔됨: {scanned}</p>}
              </>
            )}
          </>
        )}

        {/* 번호 직접 입력 모드 */}
        {!looking && !result && mode === "manual" && (
          <>
            <div className="bc-manual-row">
              <input
                value={manualCode}
                onChange={e => setManualCode(e.target.value.replace(/\D/g,""))}
                onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                placeholder="바코드 번호 입력 (예: 8801234567890)"
                maxLength={14}
              />
              <button className="btn btn-sky-out" onClick={handleManualSearch} disabled={!manualCode.trim()}>조회</button>
            </div>
            <p style={{fontSize:".72rem",color:"var(--text2)",fontWeight:600}}>
              💡 제품 포장지의 바코드 번호를 직접 입력해보세요. Open Food Facts 글로벌 DB에서 조회돼요.
            </p>
          </>
        )}

        {/* 못 찾음 */}
        {!looking && notFound && (
          <>
            <div className="bc-not-found">
              🔍 바코드 <strong>{scanned}</strong> 에 해당하는 제품을 찾지 못했어요.<br/>
              <span style={{fontWeight:600}}>국내 전용 제품이거나 DB에 등록되지 않았을 수 있어요.</span>
            </div>
            <button className="btn btn-ghost" style={{fontSize:".75rem"}} onClick={resetResult}>↩ 다시 시도</button>
          </>
        )}

        {/* 결과 */}
        {!looking && result && (
          <>
            <div className="bc-result">
              <div className="bc-result-name">🎉 {result.name}</div>
              <div className="bc-result-meta">
                {result.brand && `브랜드: ${result.brand}`}{result.brand && result.quantity && " · "}{result.quantity && `${result.quantity}`}
                {scanned && ` · 바코드: ${scanned}`}
              </div>
              <div className="bc-result-fields">
                <div className="bc-field">
                  <label>수량</label>
                  <div style={{display:"flex",gap:".3rem"}}>
                    <input value={editForm.qty} onChange={e=>setEditForm(p=>({...p,qty:e.target.value}))} placeholder="1" style={{flex:1}} />
                    <select value={editForm.unit} onChange={e=>setEditForm(p=>({...p,unit:e.target.value}))} style={{width:"58px"}}>
                      {["g","kg","ml","L","개","봉","팩","줌"].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bc-field">
                  <label>카테고리</label>
                  <select value={editForm.category} onChange={e=>setEditForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="bc-field" style={{gridColumn:"1/-1"}}>
                  <label>소비기한 (선택)</label>
                  <input type="date" value={editForm.expiry} onChange={e=>setEditForm(p=>({...p,expiry:e.target.value}))} style={{colorScheme:"light"}} />
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:".5rem"}}>
              <button className="btn btn-ghost" style={{fontSize:".75rem"}} onClick={resetResult}>↩ 다시 스캔</button>
              <button className="btn btn-mint" style={{flex:1,justifyContent:"center"}} onClick={handleAdd}>+ 냉장고에 추가하기</button>
            </div>
          </>
        )}

        <div className="popup-actions">
          <button className="btn btn-ghost" onClick={()=>{stopCamera();onClose();}}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ── 보존기한 팝업 ─────────────────────────────────────────────────────────
function ShelfPopup({ popup, onClose, onApply, onSelect }) {
  if (!popup) return null;
  return (
    <div className="popup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="popup-box">
        <div className="popup-header">
          <h3>✨ AI 보존기한 추천</h3>
          <p>"{popup.itemName}"의 권장 보존 기간을 분석했어요</p>
        </div>
        {popup.loading ? (
          <div className="popup-loading"><span>분석 중</span><span className="dot-anim"><span>.</span><span>.</span><span>.</span></span></div>
        ) : (
          <>
            {popup.result && (
              <div className="shelf-summary">
                <div>{popup.result}</div>
                {popup.tip && <div className="shelf-tip">💡 {popup.tip}</div>}
              </div>
            )}
            {popup.options.length > 0 && (
              <>
                <div className="shelf-options-label">적용할 보존기한을 골라주세요</div>
                <div className="shelf-options">
                  {popup.options.map((opt, i) => (
                    <div key={i} className={`shelf-option ${popup.selectedOption===i?"selected":""}`} onClick={()=>onSelect(i)}>
                      <div className="shelf-opt-left">
                        <span className="shelf-opt-label">{opt.label}</span>
                        <span className="shelf-opt-desc">{opt.desc}</span>
                      </div>
                      <div className="shelf-opt-right">
                        <span className="shelf-opt-days">+{opt.days}일</span>
                        <span className="shelf-opt-date">{addDays(opt.days)} 까지</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <div className="popup-actions">
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-pink" onClick={onApply} disabled={popup.loading||popup.selectedOption===null}>✓ 기한 적용하기</button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 앱 ────────────────────────────────────────────────────────────────
export default function FridgeApp() {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("fridge_items")||"[]"); } catch { return []; } });
  const [tab, setTab] = useState("fridge");
  const [form, setForm] = useState({ name:"", qty:"", unit:"g", category:"채소", expiry:"" });
  const [selected, setSelected] = useState([]);
  const [recipeType, setRecipeType] = useState("한식");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [shelfPopup, setShelfPopup] = useState(null);
  const [aiLoadingIds, setAiLoadingIds] = useState(new Set());
  const [showBarcode, setShowBarcode] = useState(false);

  useEffect(() => { localStorage.setItem("fridge_items", JSON.stringify(items)); }, [items]);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const callShelfAI = useCallback(async (itemName, _category) => {
    // 내장 식재료 DB — API 없이 즉시 반환
    const DB = {
      // 채소
      "양파":    { s:"서늘하고 통풍 잘 되는 곳에서 1~2개월 보관 가능해요", t:"그물망이나 종이봉투에 넣어 보관하세요", fast:14, normal:45, long:180 },
      "대파":    { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"키친타월로 감싸 비닐백에 넣어 냉장 보관하세요", fast:5, normal:14, long:30 },
      "쪽파":    { s:"냉장 보관 시 약 1주 신선하게 유지돼요", t:"키친타월로 감싸 냉장 보관하세요", fast:4, normal:7, long:14 },
      "마늘":    { s:"통마늘은 서늘한 곳에서 1~2개월, 깐 마늘은 냉장 1~2주 보관돼요", t:"깐 마늘은 밀폐용기에 넣어 냉장 보관하세요", fast:7, normal:30, long:180 },
      "생강":    { s:"냉장 보관 시 3~4주, 냉동 시 수개월 가능해요", t:"껍질째 보관하고 쓸 만큼만 잘라 사용하세요", fast:10, normal:28, long:120 },
      "감자":    { s:"서늘하고 어두운 곳에서 2~3개월 보관 가능해요", t:"냉장 보관하면 당 함량이 높아져 맛이 변할 수 있어요", fast:7, normal:21, long:90 },
      "고구마":  { s:"서늘하고 통풍 잘 되는 곳에서 1~2개월 보관 가능해요", t:"냉장 보관하면 오히려 빨리 상하니 실온 보관하세요", fast:7, normal:30, long:60 },
      "당근":    { s:"냉장 보관 시 약 2~4주 신선하게 유지돼요", t:"잎을 잘라내고 키친타월로 감싸 냉장 보관하세요", fast:7, normal:21, long:60 },
      "애호박":  { s:"냉장 보관 시 약 1주 신선하게 유지돼요", t:"랩으로 감싸 냉장 보관하고 자른 것은 3일 내 사용하세요", fast:3, normal:7, long:30 },
      "호박":    { s:"통호박은 서늘한 실온에서 1~3개월, 자른 것은 냉장 3~5일이에요", t:"자른 단면은 랩으로 꼭 감싸주세요", fast:3, normal:7, long:90 },
      "오이":    { s:"냉장 보관 시 약 1주 신선하게 유지돼요", t:"세워서 보관하거나 키친타월로 감싸면 더 오래 가요", fast:3, normal:7, long:14 },
      "가지":    { s:"냉장 보관 시 약 1주 신선하게 유지돼요", t:"찬 기운에 약하니 채소칸(8~12도)에 보관하세요", fast:3, normal:7, long:14 },
      "토마토":  { s:"완숙은 냉장 1주, 덜 익은 것은 실온에서 숙성하세요", t:"꼭지 부분을 위로 향하게 보관하면 더 오래 가요", fast:3, normal:7, long:14 },
      "방울토마토":{ s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"꼭지를 떼지 말고 밀폐용기에 보관하세요", fast:5, normal:10, long:21 },
      "파프리카": { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"통째로 보관하고 자른 것은 3일 내에 사용하세요", fast:5, normal:10, long:30 },
      "브로콜리": { s:"냉장 보관 시 약 1주, 데쳐서 냉동하면 1~2개월이에요", t:"물에 씻지 않고 비닐백에 넣어 냉장 보관하세요", fast:3, normal:7, long:60 },
      "콜리플라워":{ s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"잎으로 감싸거나 비닐백에 넣어 냉장 보관하세요", fast:5, normal:14, long:60 },
      "양배추":  { s:"냉장 보관 시 약 2~4주 신선하게 유지돼요", t:"겉잎을 제거하지 말고 랩으로 감싸 냉장 보관하세요", fast:7, normal:21, long:60 },
      "시금치":  { s:"냉장 보관 시 약 3~5일 신선하게 유지돼요", t:"데쳐서 냉동하면 한 달 이상 보관 가능해요", fast:2, normal:5, long:30 },
      "상추":    { s:"냉장 보관 시 약 3~5일 신선하게 유지돼요", t:"물기를 제거하고 키친타월과 함께 밀폐용기에 보관하세요", fast:2, normal:5, long:10 },
      "깻잎":    { s:"냉장 보관 시 약 3~5일 신선하게 유지돼요", t:"물에 담가두거나 젖은 키친타월로 감싸 보관하세요", fast:2, normal:5, long:10 },
      "배추":    { s:"냉장 보관 시 약 2~4주 신선하게 유지돼요", t:"신문지로 감싸 서늘한 곳에 세워서 보관하세요", fast:7, normal:21, long:60 },
      "무":      { s:"냉장 보관 시 약 2~3주 신선하게 유지돼요", t:"잎을 잘라내고 신문지에 싸서 냉장 보관하세요", fast:7, normal:21, long:60 },
      "연근":    { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"자른 단면이 갈변되지 않게 물에 담가 냉장 보관하세요", fast:3, normal:10, long:30 },
      "우엉":    { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"신문지에 싸서 냉장 보관하거나 흙이 묻은 채로 서늘한 곳에 두세요", fast:5, normal:14, long:30 },
      "버섯":    { s:"냉장 보관 시 약 3~5일 신선하게 유지돼요", t:"종이봉투나 키친타월에 싸서 냉장 보관하세요. 물기는 금물!", fast:2, normal:5, long:30 },
      "팽이버섯": { s:"냉장 보관 시 약 5~7일 신선하게 유지돼요", t:"개봉 후에는 랩으로 감싸 밀폐 보관하세요", fast:3, normal:7, long:30 },
      "새송이버섯":{ s:"냉장 보관 시 약 5~7일 신선하게 유지돼요", t:"키친타월로 감싸 밀폐용기에 보관하세요", fast:3, normal:7, long:30 },
      "표고버섯": { s:"냉장 보관 시 약 5~7일, 건표고는 서늘한 곳에서 6개월 이상이에요", t:"신선한 것은 키친타월에 싸서 냉장 보관하세요", fast:3, normal:7, long:30 },
      "고추":    { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"물기를 잘 닦고 밀폐용기에 넣어 냉장 보관하세요", fast:5, normal:14, long:90 },
      "풋고추":  { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"비닐백에 넣어 냉장 보관하세요", fast:5, normal:14, long:60 },
      "청양고추": { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"물기를 잘 닦고 비닐백에 넣어 냉장 보관하세요", fast:5, normal:14, long:60 },
      "두부":    { s:"개봉 후 냉장 3일 이내, 물에 담가 냉장 보관하면 1주 가능해요", t:"매일 물을 갈아주면 신선도를 더 오래 유지할 수 있어요", fast:2, normal:5, long:14 },
      "콩나물":  { s:"냉장 보관 시 약 2~3일 신선하게 유지돼요", t:"물에 담가 냉장 보관하고 매일 물을 갈아주세요", fast:1, normal:3, long:7 },
      "숙주나물": { s:"냉장 보관 시 약 2~3일 신선하게 유지돼요", t:"물에 담가 냉장 보관하고 빨리 사용하는 게 좋아요", fast:1, normal:3, long:7 },
      // 과일
      "사과":    { s:"냉장 보관 시 약 1~2개월 신선하게 유지돼요", t:"에틸렌 가스가 많이 나오니 다른 과일과 분리 보관하세요", fast:7, normal:30, long:60 },
      "배":      { s:"냉장 보관 시 약 1~2개월 신선하게 유지돼요", t:"개별 랩 포장 후 냉장 보관하면 더 오래 가요", fast:7, normal:30, long:60 },
      "바나나":  { s:"실온에서 약 5~7일, 냉장하면 껍질이 검어지지만 과육은 유지돼요", t:"냉동 바나나로 만들면 2개월 이상 보관 가능해요", fast:3, normal:7, long:60 },
      "딸기":    { s:"냉장 보관 시 약 3~5일 신선하게 유지돼요", t:"씻지 말고 꼭지 달린 채로 키친타월 위에 올려 냉장 보관하세요", fast:2, normal:5, long:30 },
      "포도":    { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"씻지 말고 비닐백에 넣어 냉장 보관하세요", fast:5, normal:10, long:30 },
      "복숭아":  { s:"완숙은 냉장 3~5일, 덜 익은 것은 실온 숙성 후 냉장 보관해요", t:"냉장 보관 시 저온장해가 생길 수 있어 빨리 드세요", fast:2, normal:5, long:14 },
      "수박":    { s:"통째로는 실온 2주, 자른 것은 냉장 3~5일이에요", t:"자른 단면은 랩으로 꼭 감싸 냉장 보관하세요", fast:2, normal:5, long:14 },
      "참외":    { s:"냉장 보관 시 약 1주 신선하게 유지돼요", t:"완전히 익기 전엔 실온에서 숙성한 뒤 냉장 보관하세요", fast:3, normal:7, long:14 },
      "귤":      { s:"서늘한 실온에서 약 2~3주, 냉장 보관 시 1~2개월이에요", t:"서로 겹치지 않게 보관하고 상한 것은 빨리 제거하세요", fast:7, normal:21, long:60 },
      "오렌지":  { s:"냉장 보관 시 약 2~4주 신선하게 유지돼요", t:"비닐백에 넣어 냉장 보관하면 더 오래 가요", fast:7, normal:21, long:60 },
      "레몬":    { s:"냉장 보관 시 약 3~4주 신선하게 유지돼요", t:"자른 레몬은 자른 면을 랩으로 감싸 냉장 보관하세요", fast:7, normal:21, long:60 },
      "키위":    { s:"냉장 보관 시 약 2~4주 신선하게 유지돼요", t:"사과와 함께 두면 빨리 숙성되니 분리 보관하세요", fast:5, normal:14, long:30 },
      "망고":    { s:"완숙은 냉장 3~5일, 덜 익은 것은 실온에서 숙성하세요", t:"껍질에 주름이 생기면 완숙 신호예요", fast:3, normal:7, long:30 },
      "블루베리": { s:"냉장 보관 시 약 1~2주 신선하게 유지돼요", t:"씻지 말고 종이타월을 깐 용기에 넣어 냉장 보관하세요", fast:5, normal:10, long:30 },
      // 육류
      "닭고기":  { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"밀폐 후 냉동 보관하면 3개월까지 가능해요", fast:1, normal:2, long:90 },
      "돼지고기": { s:"냉장 보관 시 2~3일 이내에 사용하세요", t:"소분하여 밀폐 후 냉동하면 3~4개월 보관 가능해요", fast:1, normal:3, long:120 },
      "소고기":  { s:"냉장 보관 시 2~3일 이내에 사용하세요", t:"소분하여 밀폐 후 냉동하면 4~6개월 보관 가능해요", fast:1, normal:3, long:180 },
      "삼겹살":  { s:"냉장 보관 시 2~3일 이내에 사용하세요", t:"소분하여 랩으로 싸서 냉동하면 3~4개월 보관 가능해요", fast:1, normal:3, long:120 },
      "다진고기": { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"냉동 보관하면 2~3개월 가능해요. 소분해서 보관하세요", fast:1, normal:2, long:90 },
      // 해산물
      "생선":    { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"손질 후 소금을 살짝 뿌려 밀폐 냉장 보관하세요", fast:1, normal:2, long:60 },
      "새우":    { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"냉동 보관하면 2~3개월 가능해요", fast:1, normal:2, long:90 },
      "오징어":  { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"손질 후 밀폐 냉동하면 2~3개월 보관 가능해요", fast:1, normal:2, long:90 },
      "조개":    { s:"냉장 보관 시 2~3일 이내에 사용하세요", t:"해수 또는 소금물에 담가 냉장 보관하세요", fast:1, normal:3, long:30 },
      "게":      { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"익힌 것은 3일, 냉동은 3개월 보관 가능해요", fast:1, normal:2, long:90 },
      // 유제품
      "우유":    { s:"개봉 후 냉장 보관 시 5~7일 이내에 드세요", t:"용기 입구를 깨끗이 닦고 밀폐 후 냉장 보관하세요", fast:3, normal:7, long:14 },
      "계란":    { s:"냉장 보관 시 약 3~4주 신선하게 유지돼요", t:"뾰족한 쪽을 아래로 향하게 냉장 보관하세요", fast:7, normal:21, long:30 },
      "달걀":    { s:"냉장 보관 시 약 3~4주 신선하게 유지돼요", t:"뾰족한 쪽을 아래로 향하게 냉장 보관하세요", fast:7, normal:21, long:30 },
      "버터":    { s:"냉장 보관 시 약 1~3개월 신선하게 유지돼요", t:"냉동 보관하면 6~9개월까지 가능해요", fast:14, normal:60, long:270 },
      "치즈":    { s:"종류에 따라 다르지만 냉장 보관 시 1~4주예요", t:"공기 차단이 중요해요. 왁스 페이퍼나 랩으로 감싸 보관하세요", fast:7, normal:21, long:90 },
      "요거트":  { s:"개봉 후 냉장 보관 시 5~7일 이내에 드세요", t:"개봉 후에는 밀폐 보관하고 숟가락을 통한 오염에 주의하세요", fast:3, normal:7, long:14 },
      "생크림":  { s:"개봉 후 냉장 보관 시 3~5일 이내에 사용하세요", t:"냉동하면 분리될 수 있으니 냉장 보관을 권장해요", fast:2, normal:5, long:10 },
    };

    const key = Object.keys(DB).find(k => itemName.includes(k) || k.includes(itemName));
    const CAT_DEFAULT = {
      "채소":   { s:"냉장 보관 시 약 5~7일 신선하게 유지돼요", t:"비닐백에 넣어 냉장 채소칸에 보관하세요", fast:3, normal:7, long:30 },
      "육류":   { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"소분하여 밀폐 냉동하면 2~3개월 가능해요", fast:1, normal:2, long:90 },
      "해산물": { s:"냉장 보관 시 1~2일 이내에 사용하세요", t:"밀폐 후 냉동 보관을 권장해요", fast:1, normal:2, long:60 },
      "유제품": { s:"개봉 후 냉장 보관 시 5~7일 이내에 사용하세요", t:"밀폐 용기에 넣어 냉장 보관하세요", fast:3, normal:7, long:14 },
      "과일":   { s:"냉장 보관 시 약 5~10일 신선하게 유지돼요", t:"씻지 말고 냉장 보관하다 먹기 전에 씻으세요", fast:3, normal:7, long:30 },
      "음료":   { s:"개봉 후 냉장 보관 시 3~5일 이내에 드세요", t:"개봉 후에는 밀폐하여 냉장 보관하세요", fast:2, normal:5, long:14 },
      "조미료": { s:"서늘하고 건조한 곳에서 장기 보관 가능해요", t:"직사광선과 습기를 피해 밀봉 보관하세요", fast:30, normal:180, long:365 },
      "기타":   { s:"냉장 보관 시 약 5~7일 이내에 사용하세요", t:"밀폐 용기에 넣어 냉장 보관하세요", fast:3, normal:7, long:30 },
    };

    const d = DB[key] || CAT_DEFAULT[_category] || CAT_DEFAULT["기타"];
    return {
      summary: d.s,
      tip: d.t,
      options: [
        { label:"빠른 소비 권장", days: d.fast,   desc:"최상의 신선도 유지 기준" },
        { label:"일반 냉장 보관", days: d.normal, desc:"일반적인 냉장 보존 기준" },
        { label:"장기 보관",     days: d.long,   desc:"냉동 또는 특수 보관 기준" },
      ],
    };
  }, []);

  const openShelfPopup = useCallback(async (itemId, itemName, category, isForm=false) => {
    if (!isForm) setAiLoadingIds(prev => new Set([...prev, itemId]));
    setShelfPopup({ itemId, itemName, category, loading:true, result:"", tip:"", options:[], selectedOption:null });
    try {
      const parsed = await callShelfAI(itemName, category);
      if (!isForm) setAiLoadingIds(prev => { const s=new Set(prev); s.delete(itemId); return s; });
      setShelfPopup(prev => prev ? { ...prev, loading:false, result:parsed.summary||"", tip:parsed.tip||"", options:parsed.options||[] } : null);
    } catch {
      if (!isForm) setAiLoadingIds(prev => { const s=new Set(prev); s.delete(itemId); return s; });
      setShelfPopup(prev => prev ? { ...prev, loading:false, result:"추천을 불러오지 못했습니다.", options:[] } : null);
    }
  }, [callShelfAI]);

  const requestShelfLifeForm = useCallback(async () => {
    if (!form.name.trim()) { showToast("❗ 재료명을 먼저 입력해주세요"); return; }
    const newItem = { id:Date.now(), ...form, name:form.name.trim() };
    setItems(prev => [newItem, ...prev]);
    setForm(p => ({ name:"", qty:"", unit:"g", category:p.category, expiry:"" }));
    await openShelfPopup(newItem.id, newItem.name, newItem.category, true);
  }, [form, openShelfPopup]);

  const applyShelfLife = () => {
    if (!shelfPopup || shelfPopup.selectedOption===null) return;
    const opt = shelfPopup.options[shelfPopup.selectedOption];
    const expiry = addDays(opt.days);
    setItems(prev => prev.map(i => i.id===shelfPopup.itemId ? { ...i, expiry } : i));
    showToast(`🎉 "${shelfPopup.itemName}" 기한 설정 완료!`);
    setShelfPopup(null);
  };

  const addItem = () => {
    if (!form.name.trim()) return;
    const newItem = { id:Date.now(), ...form, name:form.name.trim() };
    setItems(prev => [newItem, ...prev]);
    setForm(p => ({ name:"", qty:"", unit:"g", category:p.category, expiry:"" }));
    showToast(`🥬 "${newItem.name}" 추가됐어요!`);
  };

  // 바코드로 추가
  const addFromBarcode = (data) => {
    const newItem = { id:Date.now(), name:data.name, qty:data.qty, unit:data.unit, category:data.category, expiry:data.expiry };
    setItems(prev => [newItem, ...prev]);
    showToast(`📦 "${newItem.name}" 바코드로 추가됐어요!`);
  };

  const deleteItem = id => { setItems(prev=>prev.filter(i=>i.id!==id)); setSelected(prev=>prev.filter(s=>s!==id)); };
  const toggleSelect = id => setSelected(prev=>prev.includes(id)?prev.filter(s=>s!==id):[...prev,id]);

  const searchRecipe = useCallback(async () => {
    const ingredients = selected.length>0 ? items.filter(i=>selected.includes(i.id)).map(i=>i.name) : items.map(i=>i.name);
    if (!ingredients.length) { showToast("❗ 재료를 먼저 추가해주세요"); return; }
    setLoading(true); setRecipe("");
    const soonNames = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d<=5; }).map(i=>i.name);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:`당신은 한국의 전문 요리사입니다. 아래 재료들을 활용한 ${recipeType} 레시피를 2가지 추천해주세요.\n\n사용 가능한 재료: ${ingredients.join(", ")}${soonNames.length?`\n\n⚠️ 소비기한 임박 재료 (우선 활용): ${soonNames.join(", ")}`:""}
\n\n각 레시피 형식:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 레시피 이름\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏱ 조리시간:\n👥 인분:\n🥘 필요 재료:\n  -\n\n👨‍🍳 조리 순서:\n  1.\n\n💡 요리 팁:`}],
        }),
      });
      const data = await res.json();
      setRecipe(data.content?.map(b=>b.text||"").join("")||"레시피를 가져오지 못했습니다.");
    } catch { setRecipe("⚠️ 네트워크 오류가 발생했습니다."); }
    finally { setLoading(false); }
  }, [items, selected, recipeType]);

  const totalItems = items.length;
  const expiringSoon = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d>=0&&d<=7; }).length;
  const expired = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d<0; }).length;
  const noExpiry = items.filter(i=>!i.expiry).length;
  const alertItems = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d<=7; });
  const selectedItems = items.filter(i=>selected.includes(i.id));

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <header className="header">
          <span className="header-deco">🧊</span>
          <h1 className="header-title">My <span>Fridge</span></h1>
          <p className="header-sub">재료 관리 · 레시피 추천 · 소비기한 알림</p>
          <div className="stat-pills">
            <span className="stat-pill pill-total">🥕 전체 {totalItems}개</span>
            {expiringSoon>0&&<span className="stat-pill pill-warn">⏰ 임박 {expiringSoon}개</span>}
            {expired>0&&<span className="stat-pill pill-danger">❌ 만료 {expired}개</span>}
            {noExpiry>0&&<span className="stat-pill pill-none">🔖 미설정 {noExpiry}개</span>}
          </div>
        </header>

        <div className="tabs">
          <button className={`tab ${tab==="fridge"?"active":""}`} onClick={()=>setTab("fridge")}>🥬 냉장고</button>
          <button className={`tab t-recipe ${tab==="recipe"?"active":""}`} onClick={()=>setTab("recipe")}>🍳 레시피 찾기</button>
          <button className={`tab t-alert ${tab==="alert"?"active":""}`} onClick={()=>setTab("alert")}>
            🔔 소비기한 알림{alertItems.length>0&&<span className="badge">{alertItems.length}</span>}
          </button>
        </div>

        {/* ── 냉장고 탭 ── */}
        {tab==="fridge" && (
          <>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🛒 재료 추가하기</h2>
                <button className="btn-barcode" onClick={()=>setShowBarcode(true)}>📦 바코드 스캔</button>
              </div>
              <div className="add-form">
                <div className="field">
                  <label>재료명</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="예: 양파 🧅" />
                </div>
                <div className="field">
                  <label>수량</label>
                  <div style={{display:"flex",gap:".3rem"}}>
                    <input value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} placeholder="200" style={{flex:1}} />
                    <select value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} style={{width:"60px"}}>
                      {["g","kg","ml","L","개","봉","팩","줌"].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>카테고리</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>소비기한</label>
                  <div className="expiry-row">
                    <input type="date" value={form.expiry} onChange={e=>setForm(p=>({...p,expiry:e.target.value}))} style={{colorScheme:"light"}} />
                    <button className="btn-ai" onClick={requestShelfLifeForm} title="AI 보존기한 추천 받기">✨ AI</button>
                  </div>
                </div>
                <button className="btn btn-pink btn-add" onClick={addItem} style={{alignSelf:"flex-end"}}>+ 추가</button>
              </div>
              <p style={{fontSize:".7rem",color:"var(--text2)",fontWeight:600,marginTop:".7rem"}}>
                📦 <strong style={{color:"var(--sky-d)"}}>바코드 스캔</strong>으로 제품명을 자동 입력하거나, 💜 소비기한을 모를 땐 <strong style={{color:"var(--lav-d)"}}>✨ AI</strong>를 눌러보세요!
              </p>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🧺 냉장고 속 재료 ({totalItems})</h2>
                {selected.length>0&&<span className="selected-info">💗 {selected.length}개 선택됨</span>}
              </div>
              {items.length===0 ? (
                <div className="empty"><span className="empty-icon">🥬</span>재료를 추가해봐요!</div>
              ) : (
                <div className="item-list">
                  {items.map(item=>{
                    const days=daysUntil(item.expiry);
                    const isSelected=selected.includes(item.id);
                    const isAiLoading=aiLoadingIds.has(item.id);
                    return (
                      <div key={item.id} className={`item-row ${expClass(days)}`} style={isSelected?{outline:"2px solid var(--pink)",outlineOffset:"1px"}:{}}>
                        <input type="checkbox" className="item-check" checked={isSelected} onChange={()=>toggleSelect(item.id)} />
                        <span className="item-name">{item.name}</span>
                        {item.qty&&<span className="item-qty">{item.qty}{item.unit}</span>}
                        <span className="item-cat" style={{background:CAT_COLORS[item.category]+"33",color:CAT_TEXT[item.category],border:`1px solid ${CAT_COLORS[item.category]}`}}>{item.category}</span>
                        <span className="item-right">
                          {item.expiry ? (
                            <span className={`item-exp ${expTextClass(days)}`}>{item.expiry} · {expLabel(days)}</span>
                          ) : (
                            <>
                              <span className="item-exp exp-none">기한 미설정</span>
                              <button className="btn-ai btn-ai-sm" onClick={()=>openShelfPopup(item.id,item.name,item.category)} disabled={isAiLoading}>
                                {isAiLoading?"분석중...":"✨ AI 추천"}
                              </button>
                            </>
                          )}
                        </span>
                        <button className="item-del" onClick={()=>deleteItem(item.id)}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
              {noExpiry>0&&(
                <p className="hint-bar">✨ <strong>{noExpiry}개</strong> 재료의 소비기한이 아직 설정되지 않았어요. 각 재료의 <strong>AI 추천</strong> 버튼으로 설정해보세요!</p>
              )}
            </div>
          </>
        )}

        {/* ── 레시피 탭 ── */}
        {tab==="recipe" && (
          <div className="card">
            <div className="card-header"><h2 className="card-title">🍳 AI 레시피 추천</h2></div>
            {selectedItems.length>0 ? (
              <>
                <p style={{fontSize:".72rem",color:"var(--text2)",fontWeight:700,marginBottom:".5rem"}}>선택된 재료</p>
                <div className="tag-list">
                  {selectedItems.map(i=><span key={i.id} className="tag">{i.name}<button onClick={()=>toggleSelect(i.id)}>✕</button></span>)}
                </div>
              </>
            ) : (
              <p style={{fontSize:".78rem",color:"var(--text2)",fontWeight:600,marginBottom:".75rem"}}>
                💡 냉장고 탭에서 재료를 체크하면 해당 재료로만 레시피를 검색해요!
              </p>
            )}
            <hr className="divider" />
            <p style={{fontSize:".7rem",color:"var(--text2)",fontWeight:700,marginBottom:".5rem"}}>요리 스타일 선택</p>
            <div className="recipe-type">
              {RECIPE_TYPES.map(t=><button key={t} className={`rtype ${recipeType===t?"active":""}`} onClick={()=>setRecipeType(t)}>{t}</button>)}
            </div>
            <div className="recipe-controls">
              <button className="btn btn-mint" onClick={searchRecipe} disabled={loading||items.length===0}>
                {loading?"찾는 중...":"🔍 레시피 찾기"}
              </button>
              {recipe&&<button className="btn btn-ghost" onClick={()=>setRecipe("")}>초기화</button>}
              <span style={{fontSize:".72rem",color:"var(--text2)",fontWeight:600,marginLeft:"auto"}}>
                {selectedItems.length>0?`${selectedItems.length}개 선택됨`:`전체 ${items.length}개 사용`}
              </span>
            </div>
            {loading ? (
              <div className="recipe-output" style={{display:"flex",alignItems:"center"}}>
                <div className="thinking"><span>맛있는 레시피 만드는 중</span><span className="dot-anim"><span>.</span><span>.</span><span>.</span></span></div>
              </div>
            ) : recipe ? <div className="recipe-output">{recipe}</div>
              : <div className="recipe-output placeholder">재료를 선택하고 "레시피 찾기"를 눌러주세요 🍽️</div>}
          </div>
        )}

        {/* ── 알림 탭 ── */}
        {tab==="alert" && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔔 소비기한 알림</h2>
              {alertItems.length>0&&<a href={makeMailLink(alertItems)} className="btn btn-peach" style={{textDecoration:"none",fontSize:".72rem"}}>📧 전체 메일 발송</a>}
            </div>
            {alertItems.length===0 ? (
              <div className="empty"><span className="empty-icon">✨</span>소비기한이 임박한 재료가 없어요!</div>
            ) : (
              <>
                <p style={{fontSize:".78rem",color:"var(--text2)",fontWeight:600,marginBottom:".9rem"}}>
                  7일 이내 소비기한이 도래하는 재료 <strong style={{color:"var(--danger-d)"}}>{alertItems.length}개</strong>
                </p>
                <div className="alert-grid">
                  {alertItems.sort((a,b)=>daysUntil(a.expiry)-daysUntil(b.expiry)).map(item=>{
                    const days=daysUntil(item.expiry);
                    return (
                      <div key={item.id} className={`alert-card ${expClass(days)}`}>
                        <div className="alert-name">{item.name}</div>
                        <div className={`alert-days ${expTextClass(days)}`}>{item.expiry} · {expLabel(days)}</div>
                        {item.qty&&<div style={{fontSize:".7rem",color:"var(--text2)",fontWeight:600,marginBottom:".55rem"}}>{item.qty}{item.unit} · {item.category}</div>}
                        <div className="alert-actions">
                          <a href={makeCalendarLink(item)} target="_blank" rel="noopener noreferrer" className="btn btn-lav" style={{textDecoration:"none"}}>📅 캘린더</a>
                          <a href={makeMailLink([item])} className="btn btn-sky-out" style={{textDecoration:"none"}}>📧 메일</a>
                          <button className="btn btn-mint" onClick={()=>{setSelected([item.id]);setTab("recipe");}}>🍳 레시피</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showBarcode && <BarcodePopup onClose={()=>setShowBarcode(false)} onAdd={addFromBarcode} />}
      <ShelfPopup popup={shelfPopup} onClose={()=>setShelfPopup(null)} onApply={applyShelfLife} onSelect={i=>setShelfPopup(prev=>prev?{...prev,selectedOption:i}:null)} />
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
