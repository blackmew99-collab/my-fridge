/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC82-Ui87SNyqEdV0SbLdMEOgyUUZ_77wE",
  authDomain: "my-fridge-6183a.firebaseapp.com",
  databaseURL: "https://my-fridge-6183a-default-rtdb.firebaseio.com",
  projectId: "my-fridge-6183a",
  storageBucket: "my-fridge-6183a.firebasestorage.app",
  messagingSenderId: "896513222530",
  appId: "1:896513222530:web:c6c364a53c8027bda3519b"
};

const isFirebaseReady = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL);
let db = null;
if (isFirebaseReady) {
  try { db = getDatabase(initializeApp(FIREBASE_CONFIG)); } catch (e) { console.error("Firebase init error:", e); }
}

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
  .header-clickable{display:inline-block;cursor:pointer;text-decoration:none;color:inherit;transition:opacity .15s;}
  .header-clickable:hover{opacity:.75;}
  .header-deco{font-size:3rem;line-height:1;display:block;margin-bottom:.4rem;}
  .header-title{font-family:var(--font-title);font-size:clamp(2rem,5vw,3rem);color:var(--text);line-height:1.1;}
  .header-title span{color:var(--pink-d);}
  .header-sub{font-size:.78rem;color:var(--text2);margin-top:.4rem;letter-spacing:.06em;}

  .install-btn{position:fixed;top:.9rem;right:1rem;z-index:200;display:flex;align-items:center;gap:.35rem;background:var(--sky-l);border:1.5px solid var(--sky);color:var(--sky-d);font-family:var(--font);font-size:.72rem;font-weight:700;padding:.42rem .85rem;border-radius:999px;cursor:pointer;box-shadow:var(--shadow-sm);transition:all .15s;white-space:nowrap;}
  .room-chip{position:fixed;top:.9rem;left:1rem;z-index:200;display:flex;align-items:center;gap:.35rem;background:var(--sky-l);border:1.5px solid var(--sky);color:var(--sky-d);font-family:var(--font);font-size:.72rem;font-weight:700;padding:.42rem .85rem;border-radius:999px;cursor:pointer;box-shadow:var(--shadow-sm);transition:all .15s;white-space:nowrap;}
  .room-chip:hover{background:var(--sky);color:#fff;}
  .room-chip-menu{position:fixed;top:3.1rem;left:1rem;z-index:201;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:.7rem .8rem;box-shadow:var(--shadow);min-width:180px;}
  .room-chip-menu-code{font-size:.7rem;color:var(--text2);font-weight:700;margin-bottom:.55rem;padding-bottom:.45rem;border-bottom:1px dashed var(--border);}
  .room-chip-menu-code strong{color:var(--sky-d);font-size:.8rem;}
  .install-btn:hover{background:var(--sky);color:#fff;}
  .ios-guide-overlay{position:fixed;inset:0;background:rgba(74,55,40,.45);z-index:1100;display:flex;align-items:flex-end;justify-content:center;padding:1rem;padding-bottom:5rem;}
  .ios-guide-box{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:1.4rem;max-width:360px;width:100%;box-shadow:0 16px 48px rgba(180,120,80,.25);text-align:center;}
  .ios-guide-box h3{font-family:var(--font-title);font-size:1.2rem;margin-bottom:.6rem;}
  .ios-guide-box p{font-size:.8rem;color:var(--text2);font-weight:600;line-height:1.7;margin-bottom:.5rem;}
  .ios-guide-step{display:flex;align-items:center;gap:.6rem;background:var(--surface2);border-radius:var(--radius-sm);padding:.6rem .85rem;margin:.4rem 0;font-size:.8rem;font-weight:700;text-align:left;}
  .ios-guide-step span{font-size:1.3rem;}
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
  .tab-badge{display:inline-flex;align-items:center;justify-content:center;min-width:15px;height:15px;border-radius:999px;background:var(--danger-d);color:#fff;font-size:.55rem;font-weight:800;padding:0 3px;margin-left:.2rem;flex-shrink:0;}
  @media(max-width:480px){
    .tabs{gap:.25rem;padding:.25rem;}
    .tab{padding:.5rem .35rem;font-size:.75rem;gap:.2rem;min-width:0;}
  }

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

  /* ── 쇼핑 목록 ── */
  .shop-form{display:grid;grid-template-columns:1fr auto auto auto;gap:.5rem;align-items:end;margin-bottom:.9rem;}
  @media(max-width:520px){.shop-form{grid-template-columns:1fr 1fr;}.shop-form .btn-add-shop{grid-column:1/-1;}}
  .shop-item{display:flex;align-items:center;gap:.6rem;padding:.55rem .8rem;background:var(--surface2);border-radius:var(--radius-sm);border:1.5px solid var(--border);transition:all .15s;}
  .shop-item:hover{border-color:var(--pink);box-shadow:var(--shadow-sm);}
  .shop-item.done{opacity:.55;background:var(--surface);}
  .shop-item-name{flex:1;font-weight:700;font-size:.88rem;}
  .shop-item-name.done{text-decoration:line-through;color:var(--text2);}

  .cat-filter{display:flex;gap:.4rem;flex-wrap:wrap;}
  .cat-filter-btn{padding:.32rem .85rem;border-radius:999px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text2);font-family:var(--font);font-size:.74rem;font-weight:700;cursor:pointer;transition:all .15s;}
  .cat-filter-btn:hover{border-color:var(--sky);color:var(--sky-d);}
  .cat-filter-btn.active-all{background:var(--pink-l);border-color:var(--pink);color:var(--pink-d);}
  .cat-filter-btn.active-냉장{background:var(--sky-l);border-color:var(--sky);color:var(--sky-d);}
  .cat-filter-btn.active-냉동{background:var(--lav-l);border-color:var(--lav);color:var(--lav-d);}

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

  /* ── 공유 방 패널 ── */
  .room-bar{display:flex;align-items:center;gap:.6rem;background:var(--sky-l);border:1.5px solid var(--sky);border-radius:var(--radius-sm);padding:.55rem .9rem;font-size:.78rem;font-weight:700;color:var(--sky-d);flex-wrap:wrap;margin-top:.9rem;}
  .room-badge{background:var(--sky);color:#fff;border-radius:999px;padding:.15rem .65rem;font-size:.7rem;font-weight:800;}
  .room-input-row{display:flex;gap:.4rem;width:100%;margin-top:.35rem;}
  .room-input-row input{flex:1;background:var(--surface);border:1.5px solid var(--sky);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font);font-size:.84rem;font-weight:600;padding:.45rem .75rem;outline:none;}
  .room-input-row input:focus{box-shadow:0 0 0 3px var(--sky-l);}

  .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--surface);border:1.5px solid var(--mint);color:var(--text);border-radius:var(--radius-sm);padding:.75rem 1.2rem;font-size:.8rem;font-weight:700;z-index:9999;animation:slideUp .2s ease;max-width:320px;box-shadow:var(--shadow);}
  @keyframes slideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}

  .divider{border:none;border-top:1.5px dashed var(--border);margin:1.1rem 0;}
  .selected-info{font-size:.74rem;font-weight:600;color:var(--text2);}
  .empty{text-align:center;padding:2.5rem 1rem;color:var(--text3);font-size:.82rem;}
  .empty-icon{font-size:2.5rem;margin-bottom:.6rem;display:block;}
  .hint-bar{font-size:.72rem;color:var(--text2);font-weight:600;margin-top:.9rem;border-top:1.5px dashed var(--border);padding-top:.75rem;}
  .hint-bar strong{color:var(--lav-d);}

  /* ── 자동 이메일 알림 ── */
  .notify-email-box{background:var(--peach-l);border:1.5px solid var(--peach);border-radius:var(--radius-sm);padding:1rem 1.1rem;margin-bottom:1rem;}
  .notify-email-title{font-size:.82rem;font-weight:800;color:var(--peach-d);margin-bottom:.45rem;display:flex;align-items:center;gap:.4rem;}
  .notify-email-desc{font-size:.74rem;color:var(--text2);font-weight:600;margin-bottom:.7rem;line-height:1.55;}
  .notify-email-row{display:flex;gap:.45rem;}
  .notify-email-row input{flex:1;background:var(--surface);border:1.5px solid var(--peach);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font);font-size:.84rem;font-weight:600;padding:.5rem .8rem;outline:none;transition:border-color .15s,box-shadow .15s;}
  .notify-email-row input:focus{box-shadow:0 0 0 3px var(--peach-l);border-color:var(--peach-d);}
  .notify-email-row input:disabled{opacity:.5;cursor:not-allowed;}
  .notify-tag-list{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem;}
  .notify-tag{background:#fff;border:1.5px solid var(--peach);color:var(--peach-d);border-radius:999px;font-size:.72rem;font-weight:700;padding:.22rem .55rem .22rem .7rem;display:flex;align-items:center;gap:.3rem;}
  .notify-tag button{background:none;border:none;color:var(--peach-d);cursor:pointer;font-size:.85rem;padding:0;line-height:1;opacity:.7;}
  .notify-tag button:hover{opacity:1;}

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

`;

const CATEGORIES = ["냉장","냉동"];
const CAT_COLORS = {"냉장":"#93d0f5","냉동":"#c4b0f7"};
const CAT_TEXT   = {"냉장":"#1a6b9a","냉동":"#6040b8"};

function daysUntil(d){if(!d)return null;return Math.ceil((new Date(d)-new Date())/86400000);}
function expClass(days){if(days===null)return "";if(days<=3)return "danger";if(days<=7)return "warn";return "";}
function expLabel(days){if(days===null)return "";if(days<0)return `만료 ${Math.abs(days)}일 초과`;if(days===0)return "오늘 만료!";return `${days}일 남음`;}
function expTextClass(days){if(days===null)return "exp-none";if(days<=3)return "exp-danger";if(days<=7)return "exp-warn";return "exp-ok";}
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];}
function makeCalendarLink(item){const d=new Date(item.expiry);const fmt=n=>String(n).padStart(2,"0");const date=`${d.getFullYear()}${fmt(d.getMonth()+1)}${fmt(d.getDate())}`;return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🧊 소비기한 임박: ${item.name}`)}&dates=${date}/${date}&details=${encodeURIComponent(`재료: ${item.name}`)}`;}
function makeMailLink(items){const subject=encodeURIComponent(`[냉장고 알림] 소비기한 임박 재료 ${items.length}개`);const body=encodeURIComponent(`소비기한이 임박한 재료들이에요!\n\n`+items.map(i=>`• ${i.name} — ${expLabel(daysUntil(i.expiry))}`).join("\n")+`\n\n빨리 써주세요 🥺`);return `mailto:?subject=${subject}&body=${body}`;}

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
  const [form, setForm] = useState({ name:"", qty:"", unit:"g", category:"냉장", expiry:"" });
  const [selected, setSelected] = useState([]);

  const [toast, setToast] = useState(null);
  const [shelfPopup, setShelfPopup] = useState(null);
  const [aiLoadingIds, setAiLoadingIds] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState(null); // null=전체, "냉장", "냉동"
  const [shoppingList, setShoppingList] = useState(() => { try { return JSON.parse(localStorage.getItem("shop_items")||"[]"); } catch { return []; } });
  const [shopForm, setShopForm] = useState({ name:"", qty:"", unit:"개" });
  const currentShopRef = useRef(shoppingList);
  const [notifyEmails, setNotifyEmails] = useState(() => {
    const saved = localStorage.getItem("notify_email") || "";
    return saved ? saved.split(",").filter(Boolean) : [];
  });
  const [notifyEmailInput, setNotifyEmailInput] = useState("");

  // ── PWA 홈 화면 추가 ────────────────────────────────────────────────────────
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const showInstallBtn = !isStandalone && (installPrompt || isIOS);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIosGuide(true); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  // ── 공유 방 ────────────────────────────────────────────────────────────────
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem("fridge_room") || "");
  const [roomInput, setRoomInput] = useState("");
  const [showRoomSetup, setShowRoomSetup] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const currentItemsRef = useRef(items);
  const isSharedRef = useRef(!!(localStorage.getItem("fridge_room") && db));
  const roomCodeRef = useRef(localStorage.getItem("fridge_room") || "");
  const isShared = !!(roomCode && db);

  // refs 최신값 유지
  useEffect(() => { currentItemsRef.current = items; }, [items]);
  useEffect(() => { isSharedRef.current = isShared; roomCodeRef.current = roomCode; }, [isShared, roomCode]);

  // shoppingList ref 최신화 + localStorage 동기화
  useEffect(() => { currentShopRef.current = shoppingList; }, [shoppingList]);
  useEffect(() => { localStorage.setItem("shop_items", JSON.stringify(shoppingList)); }, [shoppingList]);

  // shoppingList Firebase 리스너
  useEffect(() => {
    if (!isShared || !db) return;
    let isFirst = true;
    const shopPath = ref(db, `fridges/${roomCode}/shoppingList`);
    const unsubscribe = onValue(shopPath, (snapshot) => {
      const data = snapshot.val();
      if (isFirst && data === null) {
        const cur = currentShopRef.current;
        if (cur.length > 0) set(shopPath, cur);
      } else {
        setShoppingList(data ? (Array.isArray(data) ? data : Object.values(data)) : []);
      }
      isFirst = false;
    });
    return unsubscribe;
  }, [roomCode, isShared]);

  // items 변경 시 localStorage 항상 동기화 (공유 모드에서도 로컬 백업)
  useEffect(() => {
    localStorage.setItem("fridge_items", JSON.stringify(items));
  }, [items]);

  // 재료 저장 함수 — 공유 모드일 때만 Firebase에 직접 씀, 아닐 땐 setItems만
  const persistItems = useCallback((newItems) => {
    setItems(newItems);
    if (isSharedRef.current) {
      set(ref(db, `fridges/${roomCodeRef.current}/items`), newItems);
    }
  }, []);

  // Firebase 실시간 리스너 — 읽기 전용, 절대 쓰지 않음
  useEffect(() => {
    if (!isShared) return;
    let isFirst = true;
    const itemsPath = ref(db, `fridges/${roomCode}/items`);
    const unsubscribe = onValue(itemsPath, (snapshot) => {
      const data = snapshot.val();
      if (isFirst && data === null) {
        // 빈 방 → 내 현재 아이템 올리기 (이때만 예외적으로 씀)
        const toUpload = currentItemsRef.current;
        if (toUpload.length > 0) set(itemsPath, toUpload);
      } else {
        const newItems = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        setItems(newItems); // persistItems 아닌 setItems 직접 호출 (Firebase 에코 방지)
      }
      isFirst = false;
    });
    return unsubscribe;
  }, [roomCode, isShared]);

  // notifyEmail Firebase 실시간 리스너 (공유 모드에서 방 이메일 설정 동기화)
  useEffect(() => {
    if (!isShared || !db) return;
    const emailPath = ref(db, `fridges/${roomCode}/notifyEmail`);
    const unsubscribe = onValue(emailPath, (snapshot) => {
      const val = snapshot.val() || "";
      const emails = val ? val.split(",").filter(Boolean) : [];
      setNotifyEmails(emails);
      localStorage.setItem("notify_email", val);
    });
    return unsubscribe;
  }, [roomCode, isShared]);

  const joinRoom = () => {
    const code = roomInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!code) return;
    localStorage.setItem("fridge_room", code);
    setRoomCode(code);
    setRoomInput("");
    setShowRoomSetup(false);
    showToast(`🤝 "${code}" 방에 연결됐어요!`);
  };

  const leaveRoom = () => {
    isSharedRef.current = false; // 즉시 비공유 모드로 전환
    localStorage.removeItem("fridge_room");
    setRoomCode("");
    setShowRoomSetup(false);
    showToast("👋 개인 모드로 전환됐어요");
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const addNotifyEmail = () => {
    const email = notifyEmailInput.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("❗ 올바른 이메일 주소를 입력해주세요"); return;
    }
    if (notifyEmails.includes(email)) {
      showToast("❗ 이미 등록된 이메일이에요"); return;
    }
    const newEmails = [...notifyEmails, email];
    setNotifyEmails(newEmails);
    setNotifyEmailInput("");
    const joined = newEmails.join(",");
    localStorage.setItem("notify_email", joined);
    if (isShared && db) set(ref(db, `fridges/${roomCode}/notifyEmail`), joined);
    showToast(`📧 "${email}" 추가됐어요!`);
  };

  const removeNotifyEmail = (email) => {
    const newEmails = notifyEmails.filter(e => e !== email);
    setNotifyEmails(newEmails);
    const joined = newEmails.join(",");
    localStorage.setItem("notify_email", joined);
    if (isShared && db) set(ref(db, `fridges/${roomCode}/notifyEmail`), joined || null);
    showToast(`📧 "${email}" 제거됐어요`);
  };

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
      "냉장": { s:"냉장 보관 시 약 5~7일 신선하게 유지돼요", t:"밀폐 용기에 넣어 냉장 보관하세요", fast:3, normal:7, long:30 },
      "냉동": { s:"냉동 보관 시 1~3개월 보관 가능해요", t:"소분하여 밀폐 후 냉동 보관하세요", fast:30, normal:60, long:90 },
    };

    const d = DB[key] || CAT_DEFAULT[_category] || CAT_DEFAULT["냉장"];
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
    persistItems([newItem, ...currentItemsRef.current]);
    setForm(p => ({ name:"", qty:"", unit:"g", category:p.category, expiry:"" }));
    await openShelfPopup(newItem.id, newItem.name, newItem.category, true);
  }, [form, openShelfPopup, persistItems]);

  const applyShelfLife = () => {
    if (!shelfPopup || shelfPopup.selectedOption===null) return;
    const opt = shelfPopup.options[shelfPopup.selectedOption];
    const expiry = addDays(opt.days);
    persistItems(currentItemsRef.current.map(i => i.id===shelfPopup.itemId ? { ...i, expiry } : i));
    showToast(`🎉 "${shelfPopup.itemName}" 기한 설정 완료!`);
    setShelfPopup(null);
  };

  const addItem = () => {
    if (!form.name.trim()) return;
    const newItem = { id:Date.now(), ...form, name:form.name.trim() };
    persistItems([newItem, ...currentItemsRef.current]);
    setForm(p => ({ name:"", qty:"", unit:"g", category:p.category, expiry:"" }));
    showToast(`🥬 "${newItem.name}" 추가됐어요!`);
  };

  const deleteItem = id => { persistItems(currentItemsRef.current.filter(i=>i.id!==id)); setSelected(prev=>prev.filter(s=>s!==id)); };

  // ── 쇼핑 목록 함수 ────────────────────────────────────────────────────────
  const persistShop = useCallback((newList) => {
    setShoppingList(newList);
    if (isSharedRef.current) set(ref(db, `fridges/${roomCodeRef.current}/shoppingList`), newList.length ? newList : null);
  }, []);

  const addShopItem = () => {
    if (!shopForm.name.trim()) return;
    const newItem = { id: Date.now(), name: shopForm.name.trim(), qty: shopForm.qty, unit: shopForm.unit, done: false };
    persistShop([...currentShopRef.current, newItem]);
    setShopForm(p => ({ ...p, name:"", qty:"" }));
  };

  const deleteShopItem = id => persistShop(currentShopRef.current.filter(i => i.id !== id));

  const toggleShopDone = id => persistShop(currentShopRef.current.map(i => i.id===id ? {...i, done:!i.done} : i));

  const moveCheckedToFridge = () => {
    const checked = currentShopRef.current.filter(i => i.done);
    if (!checked.length) return;
    const newFridgeItems = checked.map(i => ({ id: Date.now() + Math.random(), name: i.name, qty: i.qty, unit: i.unit, category:"냉장", expiry:"" }));
    persistItems([...newFridgeItems, ...currentItemsRef.current]);
    persistShop(currentShopRef.current.filter(i => !i.done));
    showToast(`🧊 ${checked.length}개 재료를 냉장고에 추가했어요!`);
  };
  const toggleSelect = id => setSelected(prev=>prev.includes(id)?prev.filter(s=>s!==id):[...prev,id]);

  const searchRecipeOn = (engine) => {
    const ingredients = selected.length>0 ? items.filter(i=>selected.includes(i.id)).map(i=>i.name) : items.map(i=>i.name);
    if (!ingredients.length) { showToast("❗ 재료를 먼저 추가해주세요"); return; }
    const query = encodeURIComponent(ingredients.join(" ") + " 요리");
    const urls = {
      google:  `https://www.google.com/search?q=${query}`,
      youtube: `https://www.youtube.com/results?search_query=${query}`,
      naver:   `https://search.naver.com/search.naver?query=${query}`,
    };
    window.open(urls[engine], "_blank");
  };

  const totalItems = items.length;
  const expiringSoon = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d>=0&&d<=7; }).length;
  const expired = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d<0; }).length;
  const noExpiry = items.filter(i=>!i.expiry).length;
  const alertItems = items.filter(i=>{ const d=daysUntil(i.expiry); return d!==null&&d<=7; });
  // selectedItems는 레시피 탭에서 selected + items 직접 사용으로 대체됨

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        {/* 공유 방 칩 버튼 — 연결 중일 때만 좌상단 표시 */}
        {isFirebaseReady && isShared && (
          <>
            {showRoomMenu && <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setShowRoomMenu(false)} />}
            <button className="room-chip" onClick={()=>setShowRoomMenu(v=>!v)}>
              👥 {roomCode}
            </button>
            {showRoomMenu && (
              <div className="room-chip-menu">
                <div className="room-chip-menu-code">공유 중인 방<br/><strong>{roomCode}</strong></div>
                <button className="btn btn-ghost" style={{width:"100%",justifyContent:"center",fontSize:".75rem"}} onClick={()=>{leaveRoom();setShowRoomMenu(false);}}>
                  연결 해제
                </button>
              </div>
            )}
          </>
        )}

        {/* 홈 화면 추가 버튼 */}
        {showInstallBtn && (
          <button className="install-btn" onClick={handleInstall}>
            📲 홈 화면에 추가
          </button>
        )}

        {/* iOS 안내 팝업 */}
        {showIosGuide && (
          <div className="ios-guide-overlay" onClick={() => setShowIosGuide(false)}>
            <div className="ios-guide-box" onClick={e => e.stopPropagation()}>
              <h3>📲 홈 화면에 추가하기</h3>
              <p>Safari 브라우저에서 아래 순서로 추가해주세요</p>
              <div className="ios-guide-step"><span>1️⃣</span> 하단 가운데 <strong>공유 버튼(□↑)</strong> 탭</div>
              <div className="ios-guide-step"><span>2️⃣</span> 스크롤해서 <strong>"홈 화면에 추가"</strong> 탭</div>
              <div className="ios-guide-step"><span>3️⃣</span> 우측 상단 <strong>"추가"</strong> 탭</div>
              <button className="btn btn-pink" style={{width:"100%",justifyContent:"center",marginTop:".8rem"}} onClick={() => setShowIosGuide(false)}>확인</button>
            </div>
          </div>
        )}

        <header className="header">
          <div className="header-clickable" onClick={() => setTab("fridge")} role="button" tabIndex={0} onKeyDown={e => e.key==="Enter" && setTab("fridge")}>
            <span className="header-deco">🧊</span>
            <h1 className="header-title">My <span>Fridge</span></h1>
            <p className="header-sub">재료 관리 · 레시피 추천 · 소비기한 알림</p>
          </div>
          <div className="stat-pills">
            <span className="stat-pill pill-total">🥕 전체 {totalItems}개</span>
            {expiringSoon>0&&<span className="stat-pill pill-warn">⏰ 임박 {expiringSoon}개</span>}
            {expired>0&&<span className="stat-pill pill-danger">❌ 만료 {expired}개</span>}
            {noExpiry>0&&<span className="stat-pill pill-none">🔖 미설정 {noExpiry}개</span>}
          </div>

          {/* 공유 방 패널 — 미연결 상태일 때만 표시 */}
          {isFirebaseReady && !isShared && (
              <div className="room-bar" style={{flexDirection:"column",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:".5rem",width:"100%"}}>
                  <span>👥 가족·친구와 공유하기</span>
                  <button className="btn btn-ghost" style={{fontSize:".7rem",padding:".25rem .65rem",marginLeft:"auto"}} onClick={()=>setShowRoomSetup(v=>!v)}>
                    {showRoomSetup?"닫기":"방 코드 설정"}
                  </button>
                </div>
                {showRoomSetup && (
                  <div className="room-input-row">
                    <input
                      value={roomInput}
                      onChange={e=>setRoomInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&joinRoom()}
                      placeholder="방 코드 입력 (예: 우리집, family123)"
                    />
                    <button className="btn btn-sky-out" onClick={joinRoom} disabled={!roomInput.trim()}>연결</button>
                  </div>
                )}
              </div>
          )}
        </header>

        <div className="tabs">
          <button className={`tab ${tab==="fridge"?"active":""}`} onClick={()=>setTab("fridge")}>🥬 냉장고</button>
          <button className={`tab t-recipe ${tab==="recipe"?"active":""}`} onClick={()=>setTab("recipe")}>🍳 레시피</button>
          <button className={`tab t-alert ${tab==="alert"?"active":""}`} onClick={()=>setTab("alert")}>
            🔔 소비기한{alertItems.length>0&&<span className="tab-badge">{alertItems.length}</span>}
          </button>
        </div>

        {/* ── 냉장고 탭 ── */}
        {tab==="fridge" && (
          <>
            {/* 쇼핑 목록 카드 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🛍️ 쇼핑 목록</h2>
                {shoppingList.filter(i=>i.done).length>0 && (
                  <button className="btn btn-mint" style={{fontSize:".72rem"}} onClick={moveCheckedToFridge}>
                    🧊 냉장고에 추가
                  </button>
                )}
              </div>
              <div className="shop-form">
                <div className="field">
                  <label>재료명</label>
                  <input value={shopForm.name} onChange={e=>setShopForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addShopItem()} placeholder="예: 두부, 계란" />
                </div>
                <div className="field">
                  <label>수량</label>
                  <input value={shopForm.qty} onChange={e=>setShopForm(p=>({...p,qty:e.target.value}))} placeholder="1" style={{width:"58px"}} />
                </div>
                <div className="field">
                  <label>단위</label>
                  <select value={shopForm.unit} onChange={e=>setShopForm(p=>({...p,unit:e.target.value}))} style={{width:"62px"}}>
                    {["개","g","kg","ml","L","봉","팩","줌"].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <button className="btn btn-pink btn-add-shop" onClick={addShopItem} style={{alignSelf:"flex-end"}}>+ 추가</button>
              </div>
              {shoppingList.length===0 ? (
                <div className="empty" style={{padding:"1.2rem 0"}}><span className="empty-icon" style={{fontSize:"1.8rem"}}>🛍️</span>살 재료를 추가해봐요!</div>
              ) : (
                <div className="item-list">
                  {shoppingList.map(item=>(
                    <div key={item.id} className={`shop-item${item.done?" done":""}`}>
                      <input type="checkbox" className="item-check" checked={!!item.done} onChange={()=>toggleShopDone(item.id)} />
                      <span className={`shop-item-name${item.done?" done":""}`}>{item.name}</span>
                      {item.qty&&<span className="item-qty">{item.qty}{item.unit}</span>}
                      <button className="item-del" onClick={()=>deleteShopItem(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {shoppingList.filter(i=>i.done).length>0&&(
                <p style={{fontSize:".7rem",color:"var(--text2)",fontWeight:600,marginTop:".75rem"}}>
                  ✅ 체크한 항목을 <strong style={{color:"var(--mint-d)"}}>냉장고에 추가</strong>하면 재료 목록으로 이동해요
                </p>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🛒 재료 추가하기</h2>
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
                💜 소비기한을 모를 땐 <strong style={{color:"var(--lav-d)"}}>✨ AI</strong>를 눌러보세요!
              </p>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🧺 냉장고 속 재료 ({totalItems})</h2>
                {selected.length>0&&<span className="selected-info">💗 {selected.length}개 선택됨</span>}
              </div>
              <div className="cat-filter">
                <button className={`cat-filter-btn ${!categoryFilter?"active-all":""}`} onClick={()=>setCategoryFilter(null)}>전체 {totalItems}</button>
                {CATEGORIES.map(cat=>{
                  const cnt = items.filter(i=>i.category===cat).length;
                  return <button key={cat} className={`cat-filter-btn ${categoryFilter===cat?`active-${cat}`:""}`} onClick={()=>setCategoryFilter(p=>p===cat?null:cat)}>{cat} {cnt}</button>;
                })}
              </div>
              {items.length===0 ? (
                <div className="empty"><span className="empty-icon">🥬</span>재료를 추가해봐요!</div>
              ) : (
                <div className="item-list">
                  {items.filter(item=>!categoryFilter||item.category===categoryFilter).sort((a,b)=>{
                    const da=daysUntil(a.expiry), db=daysUntil(b.expiry);
                    if(da===null&&db===null)return 0;
                    if(da===null)return 1;  // 기한 미설정은 맨 뒤
                    if(db===null)return -1;
                    return da-db;           // 짧은 순
                  }).map(item=>{
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
            <div className="card-header">
              <h2 className="card-title">🍳 레시피 검색</h2>
              {items.length>0 && (
                <button className="btn btn-ghost" style={{fontSize:".7rem",padding:".25rem .65rem"}}
                  onClick={()=>{
                    if(selected.length===items.length) setSelected([]);
                    else setSelected(items.map(i=>i.id));
                  }}>
                  {selected.length===items.length ? "✕ 전체 해제" : "✔ 전체 선택"}
                </button>
              )}
            </div>

            {/* 재료 선택 리스트 */}
            {items.length===0 ? (
              <div className="empty" style={{padding:"1rem 0"}}>
                <span className="empty-icon">🥬</span>냉장고 탭에서 재료를 추가해봐요!
              </div>
            ) : (
              <>
                <p style={{fontSize:".72rem",color:"var(--text2)",fontWeight:700,marginBottom:".5rem"}}>
                  재료 선택
                  {selected.length>0
                    ? <span style={{color:"var(--mint-d)",marginLeft:".4rem"}}>✔ {selected.length}개 선택됨</span>
                    : <span style={{color:"var(--text3)",marginLeft:".4rem",fontWeight:500}}>— 선택 없으면 전체 재료로 검색</span>
                  }
                </p>
                <div className="item-list" style={{maxHeight:"280px",overflowY:"auto"}}>
                  {[...items].sort((a,b)=>{
                    const da=daysUntil(a.expiry), db=daysUntil(b.expiry);
                    if(da===null&&db===null)return 0;
                    if(da===null)return 1;
                    if(db===null)return -1;
                    return da-db;
                  }).map(item=>{
                    const days=daysUntil(item.expiry);
                    const isSel=selected.includes(item.id);
                    return (
                      <div key={item.id} className={`item-row ${expClass(days)}`}
                        style={{cursor:"pointer",...(isSel?{outline:"2px solid var(--mint)",outlineOffset:"1px",background:"var(--mint-l, #eafaf3)"}:{})}}
                        onClick={()=>toggleSelect(item.id)}>
                        <input type="checkbox" className="item-check" checked={isSel} onChange={()=>toggleSelect(item.id)} onClick={e=>e.stopPropagation()} />
                        <span className="item-name">{item.name}</span>
                        {item.qty&&<span className="item-qty">{item.qty}{item.unit}</span>}
                        <span className="item-cat" style={{background:CAT_COLORS[item.category]+"33",color:CAT_TEXT[item.category],border:`1px solid ${CAT_COLORS[item.category]}`}}>{item.category}</span>
                        <span className="item-right">
                          {item.expiry
                            ? <span className={`item-exp ${expTextClass(days)}`}>{expLabel(days)}</span>
                            : <span className="item-exp exp-none">기한 미설정</span>
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <hr className="divider" style={{margin:".9rem 0"}}/>

            {/* 검색 버튼 */}
            <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
              <button className="btn btn-mint" onClick={()=>searchRecipeOn("google")} disabled={items.length===0} style={{flex:1,justifyContent:"center"}}>
                🔍 구글
              </button>
              <button className="btn btn-peach" onClick={()=>searchRecipeOn("youtube")} disabled={items.length===0} style={{flex:1,justifyContent:"center"}}>
                ▶ 유튜브
              </button>
              <button className="btn btn-lav" onClick={()=>searchRecipeOn("naver")} disabled={items.length===0} style={{flex:1,justifyContent:"center"}}>
                🟢 네이버
              </button>
            </div>
            <p style={{fontSize:".7rem",color:"var(--text3)",fontWeight:600,marginTop:".65rem"}}>
              선택한 재료 + "요리" 키워드로 새 창에서 검색해요 · {selected.length>0?`${selected.length}개 선택됨`:`전체 ${items.length}개 사용`}
            </p>
          </div>
        )}

        {/* ── 알림 탭 ── */}
        {tab==="alert" && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔔 소비기한 알림</h2>
              {alertItems.length>0&&<a href={makeMailLink(alertItems)} className="btn btn-peach" style={{textDecoration:"none",fontSize:".72rem"}}>📧 전체 메일 발송</a>}
            </div>

            {/* 자동 이메일 알림 설정 */}
            <div className="notify-email-box">
              <div className="notify-email-title">📬 자동 이메일 알림 설정</div>
              <div className="notify-email-desc">
                소비기한 <strong>3일 이내</strong> 재료가 있으면 <strong>매일 오전 9시</strong>에 등록된 모든 주소로 자동 발송돼요.
                {!isShared && <span style={{color:"var(--danger-d)"}}><br/>⚠️ 공유 방에 연결된 상태에서만 작동해요.</span>}
              </div>
              <div className="notify-email-row">
                <input
                  type="email"
                  value={notifyEmailInput}
                  onChange={e => setNotifyEmailInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNotifyEmail()}
                  placeholder={isShared ? "추가할 이메일 주소 입력" : "공유 방 연결 후 설정 가능해요"}
                  disabled={!isShared}
                />
                <button className="btn btn-peach" onClick={addNotifyEmail} disabled={!isShared || !notifyEmailInput.trim()}>+ 추가</button>
              </div>
              {notifyEmails.length > 0 && (
                <div className="notify-tag-list">
                  {notifyEmails.map(email => (
                    <span key={email} className="notify-tag">
                      ✉️ {email}
                      <button onClick={() => removeNotifyEmail(email)} title="제거">✕</button>
                    </span>
                  ))}
                </div>
              )}
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

      <ShelfPopup popup={shelfPopup} onClose={()=>setShelfPopup(null)} onApply={applyShelfLife} onSelect={i=>setShelfPopup(prev=>prev?{...prev,selectedOption:i}:null)} />
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
