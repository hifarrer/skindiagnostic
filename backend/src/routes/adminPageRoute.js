import { Router } from 'express';

const router = Router();

const ADMIN_CSS = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --sidebar-w: 240px;
  --sidebar-bg: #1e1e2d;
  --sidebar-hover: #2a2a3d;
  --sidebar-active: rgba(123,92,255,.18);
  --body-bg: #f4f6fb;
  --card-bg: #ffffff;
  --card-border: #e8ecf1;
  --text: #2a2f3c;
  --text-muted: #6b7280;
  --purple: #7B5CFF;
  --pink: #FF5EA8;
  --cyan: #5AD7FF;
  --orange: #FF8A4C;
  --green: #34d399;
  --red: #f87171;
  --gradient: linear-gradient(135deg, #7B5CFF, #FF5EA8);
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);
  --shadow-lg: 0 4px 24px rgba(0,0,0,.10);
  --font: 'Inter', system-ui, -apple-system, sans-serif;
  --transition: .2s ease;
}
html { height: 100%; }
body {
  font-family: var(--font);
  background: var(--body-bg);
  color: var(--text);
  height: 100%;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.hidden { display: none !important; }
.login-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1e1e2d 0%, #2d1b4e 50%, #1e1e2d 100%);
}
.login-card {
  width: 100%; max-width: 400px;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: var(--shadow-lg);
}
.login-logo { text-align: center; margin-bottom: 32px; }
.login-logo svg { margin-bottom: 12px; }
.login-logo h1 { font-size: 22px; font-weight: 800; color: var(--text); }
.login-logo h1 span { color: var(--purple); }
.login-logo p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.form-group { margin-bottom: 18px; }
.form-group label {
  display: block; font-size: 13px; font-weight: 600;
  color: var(--text-muted); margin-bottom: 6px;
}
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--card-border);
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 14px;
  background: #fafbfd; color: var(--text);
  transition: border var(--transition); outline: none;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(123,92,255,.12);
}
.form-error { color: var(--red); font-size: 13px; min-height: 20px; margin-bottom: 8px; }
.btn-primary {
  width: 100%; padding: 12px;
  background: var(--gradient);
  color: #fff; border: none; border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: opacity var(--transition), transform var(--transition);
}
.btn-primary:hover { opacity: .92; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.btn-secondary {
  padding: 8px 18px; background: #f0f0f5;
  color: var(--text); border: 1.5px solid var(--card-border);
  border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background var(--transition);
}
.btn-secondary:hover { background: #e5e5ef; }
.btn-danger {
  padding: 8px 18px; background: var(--red); color: #fff;
  border: none; border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity var(--transition);
}
.btn-danger:hover { opacity: .85; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-icon { display: inline-flex; align-items: center; gap: 6px; }
.app-shell { display: flex; height: 100vh; overflow: hidden; }
.sidebar {
  width: var(--sidebar-w); min-width: var(--sidebar-w);
  background: var(--sidebar-bg);
  display: flex; flex-direction: column;
  padding: 24px 14px 14px;
  transition: transform .3s ease; z-index: 100;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 10px 24px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  margin-bottom: 18px;
}
.sidebar-brand span { font-weight: 700; font-size: 17px; color: #fff; letter-spacing: .4px; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,.6); text-decoration: none;
  transition: background var(--transition), color var(--transition);
  border: none; background: none; cursor: pointer;
  width: 100%; text-align: left; font-family: var(--font);
}
.nav-item:hover { background: var(--sidebar-hover); color: rgba(255,255,255,.9); }
.nav-item.active { background: var(--sidebar-active); color: #fff; }
.nav-item.active svg { stroke: var(--purple); }
.nav-item svg { flex-shrink: 0; }
.sidebar-footer { border-top: 1px solid rgba(255,255,255,.08); padding-top: 10px; }
.logout-btn { color: rgba(255,255,255,.45); }
.logout-btn:hover { color: var(--red); background: rgba(248,113,113,.1); }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 28px; background: var(--card-bg);
  border-bottom: 1px solid var(--card-border); min-height: 64px;
}
.top-bar h2 { font-size: 18px; font-weight: 700; flex: 1; }
.admin-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(123,92,255,.08);
  color: var(--purple); font-size: 13px; font-weight: 600;
  padding: 6px 14px; border-radius: 20px;
}
.mobile-menu-btn {
  display: none; background: none; border: none; cursor: pointer;
  padding: 4px; color: var(--text);
}
.view-container { flex: 1; overflow-y: auto; padding: 28px; }
.stat-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px; margin-bottom: 28px;
}
.stat-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 22px 24px;
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.stat-card .stat-label {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .8px; color: var(--text-muted); margin-bottom: 8px;
}
.stat-card .stat-value { font-size: 28px; font-weight: 800; color: var(--text); }
.stat-card .stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
}
.stat-icon.purple { background: rgba(123,92,255,.12); color: var(--purple); }
.stat-icon.pink { background: rgba(255,94,168,.12); color: var(--pink); }
.stat-icon.cyan { background: rgba(90,215,255,.12); color: var(--cyan); }
.stat-icon.orange { background: rgba(255,138,76,.12); color: var(--orange); }
.chart-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px; margin-bottom: 28px;
}
.chart-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 22px 24px; box-shadow: var(--shadow);
}
.chart-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--text); }
.chart-card canvas { width: 100% !important; max-height: 280px; }
.table-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.table-toolbar .search-input {
  flex: 1; min-width: 200px; padding: 9px 14px;
  border: 1.5px solid var(--card-border); border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 13px; background: var(--card-bg);
  outline: none; transition: border var(--transition);
}
.table-toolbar .search-input:focus { border-color: var(--purple); }
.data-table-wrap {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; font-size: 13px; white-space: nowrap; }
.data-table th {
  background: #f9fafb; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .5px; font-size: 11px;
  border-bottom: 1px solid var(--card-border);
}
.data-table td { border-bottom: 1px solid #f3f4f6; }
.data-table tbody tr:hover { background: #f9fafb; }
.data-table tbody tr:last-child td { border-bottom: none; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(52,211,153,.12); color: #059669; }
.badge-inactive { background: rgba(107,114,128,.1); color: #6b7280; }
.badge-pending { background: rgba(255,138,76,.12); color: #c2410c; }
.badge-processing { background: rgba(90,215,255,.12); color: #0891b2; }
.badge-failed { background: rgba(248,113,113,.12); color: #dc2626; }
.user-link { color: var(--purple); font-weight: 600; text-decoration: none; transition: color var(--transition); }
.user-link:hover { color: var(--pink); text-decoration: underline; }
.user-detail-header { margin-bottom: 20px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; font-weight: 600; text-decoration: none; transition: color var(--transition); }
.back-link:hover { color: var(--purple); }
.user-profile-card { display: flex; align-items: center; gap: 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 24px 28px; box-shadow: var(--shadow); margin-bottom: 24px; }
.user-avatar-large { width: 56px; height: 56px; border-radius: 50%; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0; }
.user-profile-info h2 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
.user-email { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
.user-meta-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.meta-tag { font-size: 12px; color: var(--text-muted); font-weight: 500; background: #f0f0f5; padding: 3px 10px; border-radius: 12px; }
.detail-tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--card-border); margin-bottom: 20px; }
.detail-tab { padding: 10px 20px; border: none; background: none; font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color var(--transition), border-color var(--transition); }
.detail-tab:hover { color: var(--text); }
.detail-tab.active { color: var(--purple); border-bottom-color: var(--purple); }
.task-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--card-border); transition: transform var(--transition); }
.thumb-link:hover .task-thumb { transform: scale(1.1); }
.task-id-code { font-size: 11px; background: #f0f0f5; padding: 2px 8px; border-radius: 4px; color: var(--text-muted); word-break: break-all; white-space: normal; }
.analysis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.analysis-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
.analysis-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #f3f4f6; }
.analysis-thumb { width: 72px; height: 72px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--card-border); flex-shrink: 0; }
.analysis-meta { flex: 1; }
.analysis-date { font-size: 14px; font-weight: 600; color: var(--text); }
.analysis-task-id { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.analysis-task-id code { background: #f0f0f5; padding: 1px 6px; border-radius: 4px; }
.score-grid { display: flex; flex-direction: column; gap: 10px; }
.score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.score-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: capitalize; }
.score-value { font-size: 13px; font-weight: 700; color: var(--text); }
.score-bar { width: 100%; height: 6px; background: #f0f0f5; border-radius: 3px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 3px; background: var(--gradient); transition: width .4s ease; }
.empty-msg { text-align: center; color: var(--text-muted); padding: 30px; font-size: 14px; }
.text-muted { color: var(--text-muted); }
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; }
.pagination button {
  padding: 6px 14px; border: 1.5px solid var(--card-border);
  border-radius: var(--radius-sm); background: var(--card-bg);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  cursor: pointer; color: var(--text); transition: background var(--transition);
}
.pagination button:hover:not(:disabled) { background: #f0f0f5; }
.pagination button:disabled { opacity: .4; cursor: not-allowed; }
.pagination span { font-size: 13px; color: var(--text-muted); }
.plan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.plan-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow);
  position: relative; transition: transform var(--transition), box-shadow var(--transition);
}
.plan-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.plan-card.inactive { opacity: .55; }
.plan-card .plan-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.plan-card .plan-price { font-size: 28px; font-weight: 800; color: var(--purple); }
.plan-card .plan-price span { font-size: 14px; font-weight: 500; color: var(--text-muted); }
.plan-card .plan-desc { font-size: 13px; color: var(--text-muted); margin: 10px 0; }
.plan-card .plan-features { list-style: none; margin: 12px 0 18px; font-size: 13px; }
.plan-card .plan-features li { padding: 3px 0; color: var(--text-muted); }
.plan-card .plan-features li::before { content: "\\2713 "; color: var(--green); font-weight: 700; }
.plan-card .plan-actions { display: flex; gap: 8px; }
.plan-status-badge { position: absolute; top: 14px; right: 14px; }
.settings-section {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow); margin-bottom: 24px;
}
.settings-section h3 {
  font-size: 16px; font-weight: 700; margin-bottom: 20px;
  padding-bottom: 12px; border-bottom: 1px solid var(--card-border);
}
.settings-row { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
.settings-row input { flex: 1; }
.settings-row .btn-danger { flex-shrink: 0; align-self: flex-end; }
.password-form { max-width: 420px; }
.password-form .form-group { margin-bottom: 16px; }
.form-success { color: var(--green); font-size: 13px; min-height: 20px; margin-bottom: 8px; }
.modal-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,.4); backdrop-filter: blur(4px);
}
.modal {
  position: fixed; z-index: 910; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 92%; max-width: 520px; max-height: 85vh; overflow-y: auto;
  background: var(--card-bg); border-radius: 16px; box-shadow: var(--shadow-lg);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--card-border);
}
.modal-header h3 { font-size: 16px; font-weight: 700; }
.modal-close {
  background: none; border: none; font-size: 24px; color: var(--text-muted);
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.modal-close:hover { color: var(--text); }
.modal-body { padding: 24px; }
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 2000;
  display: flex; flex-direction: column; gap: 8px;
}
.toast {
  padding: 12px 20px; border-radius: var(--radius-sm);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  color: #fff; box-shadow: var(--shadow-lg); animation: toastIn .3s ease;
}
.toast.success { background: #059669; }
.toast.error { background: var(--red); }
.toast.info { background: var(--purple); }
@keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.spinner {
  display: inline-block; width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .6s linear infinite;
}
.spinner-dark { border-color: rgba(0,0,0,.1); border-top-color: var(--purple); }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state {
  display: flex; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-muted); font-size: 14px; gap: 12px;
}
@media (max-width: 768px) {
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .mobile-menu-btn { display: block; }
  .view-container { padding: 18px; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .top-bar { padding: 14px 18px; }
}
@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr; }
  .login-card { margin: 16px; padding: 28px 22px; }
}`;

const ADMIN_JS = `(function(){
'use strict';
var API='/api/admin';
var token=localStorage.getItem('admin_token');
var currentView='dashboard';
var charts={};
var $=function(s){return document.querySelector(s)};
var loginOverlay=$('#login-overlay'),appShell=$('#app-shell'),viewContainer=$('#view-container'),pageTitle=$('#page-title'),adminName=$('#admin-name'),modalBackdrop=$('#modal-backdrop'),modal=$('#modal'),modalTitle=$('#modal-title'),modalBody=$('#modal-body');
var toastContainer=document.querySelector('.toast-container');
if(!toastContainer){toastContainer=document.createElement('div');toastContainer.className='toast-container';document.body.appendChild(toastContainer)}
function toast(msg,type){type=type||'info';var el=document.createElement('div');el.className='toast '+type;el.textContent=msg;toastContainer.appendChild(el);setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove()},300)},3000)}
async function api(path,opts){opts=opts||{};var headers={'Content-Type':'application/json'};if(token)headers['Authorization']='Bearer '+token;var res=await fetch(API+path,Object.assign({},opts,{headers:headers}));if(res.status===401){logout();throw new Error('Session expired')}var data=await res.json();if(!res.ok)throw new Error(data.error||'Request failed');return data}
function showLogin(){loginOverlay.classList.remove('hidden');appShell.classList.add('hidden')}
function showApp(){loginOverlay.classList.add('hidden');appShell.classList.remove('hidden');route()}
function logout(){token=null;localStorage.removeItem('admin_token');showLogin()}
$('#login-form').addEventListener('submit',async function(e){e.preventDefault();var errEl=$('#login-error'),btn=$('#login-btn'),username=$('#login-username').value.trim(),password=$('#login-password').value;errEl.textContent='';btn.disabled=true;btn.innerHTML='<span class="spinner"></span>';try{var data=await api('/login',{method:'POST',body:JSON.stringify({username:username,password:password})});token=data.token;localStorage.setItem('admin_token',token);adminName.textContent=data.admin.username;showApp()}catch(err){errEl.textContent=err.message}finally{btn.disabled=false;btn.textContent='Sign In'}});
$('#logout-btn').addEventListener('click',logout);
function openModal(title,html){modalTitle.textContent=title;modalBody.innerHTML=html;modal.classList.remove('hidden');modalBackdrop.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden');modalBackdrop.classList.add('hidden')}
$('#modal-close').addEventListener('click',closeModal);
modalBackdrop.addEventListener('click',closeModal);
var sidebar=$('.sidebar');
$('#mobile-menu-btn').addEventListener('click',function(){sidebar.classList.toggle('open')});
var views={dashboard:renderDashboard,users:renderUsers,plans:renderPlans,settings:renderSettings};
var titles={dashboard:'Dashboard',users:'Users',plans:'Subscription Plans',settings:'Settings'};
function route(){var hash=location.hash.replace('#','')||'dashboard';var udm=hash.match(/^user\\/(\\d+)$/);if(udm){currentView='users';pageTitle.textContent='User Detail';document.querySelectorAll('.nav-item[data-view]').forEach(function(el){el.classList.toggle('active',el.dataset.view==='users')});sidebar.classList.remove('open');destroyCharts();renderUserDetail(udm[1]);return}if(!views[hash]){location.hash='#dashboard';return}currentView=hash;pageTitle.textContent=titles[hash];document.querySelectorAll('.nav-item[data-view]').forEach(function(el){el.classList.toggle('active',el.dataset.view===hash)});sidebar.classList.remove('open');destroyCharts();views[hash]()}
window.addEventListener('hashchange',route);
function destroyCharts(){Object.values(charts).forEach(function(c){c.destroy()});charts={}}
function fmtDate(d){if(!d)return '\\u2014';return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
function fmtMoney(n){return '$'+Number(n).toFixed(2)}
function escHtml(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
async function renderDashboard(){viewContainer.innerHTML='<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';try{var r=await Promise.all([api('/stats/overview'),api('/stats/users-over-time?days=30&period=day'),api('/stats/tasks-over-time?days=30'),api('/stats/subscriptions')]);var overview=r[0],usersOT=r[1],tasksOT=r[2],subStats=r[3];viewContainer.innerHTML='<div class="stat-grid"><div class="stat-card"><div class="stat-icon purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-label">Total Users</div><div class="stat-value">'+overview.totalUsers+'</div></div><div class="stat-card"><div class="stat-icon pink"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div class="stat-label">Active Subscriptions</div><div class="stat-value">'+overview.activeSubscriptions+'</div></div><div class="stat-card"><div class="stat-icon cyan"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="stat-label">Monthly Revenue</div><div class="stat-value">'+fmtMoney(overview.monthlyRevenue)+'</div></div><div class="stat-card"><div class="stat-icon orange"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div class="stat-label">Total Tasks</div><div class="stat-value">'+overview.totalTasks+'</div></div></div><div class="chart-grid"><div class="chart-card"><h3>User Growth (30 days)</h3><canvas id="chart-user-growth"></canvas></div><div class="chart-card"><h3>Task Activity (30 days)</h3><canvas id="chart-tasks"></canvas></div><div class="chart-card"><h3>Subscription Distribution</h3><canvas id="chart-subs"></canvas></div></div>';var ugLabels=usersOT.data.map(function(r){return fmtDate(r.date)});var ugData=usersOT.data.map(function(r){return parseInt(r.count,10)});charts.userGrowth=new Chart($('#chart-user-growth'),{type:'line',data:{labels:ugLabels,datasets:[{label:'New Users',data:ugData,borderColor:'#7B5CFF',backgroundColor:'rgba(123,92,255,.1)',fill:true,tension:.4,pointRadius:3,pointBackgroundColor:'#7B5CFF'}]},options:chartOpts('')});var taskTypes=[...new Set(tasksOT.data.map(function(r){return r.task_type}))];var taskDates=[...new Set(tasksOT.data.map(function(r){return r.date}))].sort();var taskColors=['#FF5EA8','#7B5CFF','#5AD7FF','#FF8A4C','#34d399'];var taskDatasets=taskTypes.map(function(type,i){return{label:type.replace(/_/g,' '),data:taskDates.map(function(d){var found=tasksOT.data.find(function(r){return r.date===d&&r.task_type===type});return found?parseInt(found.count,10):0}),backgroundColor:taskColors[i%taskColors.length],borderRadius:4}});charts.tasks=new Chart($('#chart-tasks'),{type:'bar',data:{labels:taskDates.map(fmtDate),datasets:taskDatasets},options:Object.assign({},chartOpts(''),{plugins:{legend:{display:taskTypes.length>1}}})});var subLabels=subStats.data.map(function(r){return r.name});var subData=subStats.data.map(function(r){return parseInt(r.count,10)});charts.subs=new Chart($('#chart-subs'),{type:'doughnut',data:{labels:subLabels,datasets:[{data:subData,backgroundColor:['#7B5CFF','#FF5EA8','#5AD7FF','#FF8A4C','#34d399']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}})}catch(err){viewContainer.innerHTML='<div class="loading-state" style="color:var(--red)">'+escHtml(err.message)+'</div>'}}
function chartOpts(yTitle){return{responsive:true,interaction:{intersect:false,mode:'index'},scales:{x:{grid:{display:false}},y:{beginAtZero:true,title:{display:!!yTitle,text:yTitle},grid:{color:'#f0f0f5'}}},plugins:{legend:{display:false}}}}
var usersPage=1,usersSearch='';
async function renderUsers(){viewContainer.innerHTML='<div class="table-toolbar"><input class="search-input" id="user-search" placeholder="Search by email or name..." value="'+escHtml(usersSearch)+'" /><button class="btn-secondary btn-icon" id="user-search-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search</button></div><div id="users-table-area"><div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div></div>';$('#user-search-btn').addEventListener('click',function(){usersSearch=$('#user-search').value;usersPage=1;loadUsersTable()});$('#user-search').addEventListener('keydown',function(e){if(e.key==='Enter'){usersSearch=e.target.value;usersPage=1;loadUsersTable()}});loadUsersTable()}
async function loadUsersTable(){var area=$('#users-table-area');if(!area)return;area.innerHTML='<div class="loading-state"><div class="spinner spinner-dark"></div></div>';try{var data=await api('/users?page='+usersPage+'&limit=15&search='+encodeURIComponent(usersSearch));var totalPages=Math.ceil(data.total/data.limit)||1;var rows=data.users.map(function(u){return '<tr><td>'+u.id+'</td><td><a href="#user/'+u.id+'" class="user-link">'+(escHtml(u.name)||'\\u2014')+'</a></td><td>'+escHtml(u.email)+'</td><td>'+(escHtml(u.plan_name)||'None')+'</td><td><span class="badge '+(u.subscription_status==='active'?'badge-active':'badge-inactive')+'">'+u.subscription_status+'</span></td><td>'+fmtDate(u.created_at)+'</td><td><button class="btn-secondary btn-sm" onclick="window.__editUser('+u.id+')">Edit</button> <button class="btn-danger btn-sm" onclick="window.__deleteUser('+u.id+',\\''+escHtml(u.email).replace(/'/g,"\\\\'")+'\\')" >Delete</button></td></tr>'}).join('');if(!rows)rows='<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px">No users found</td></tr>';area.innerHTML='<div class="data-table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="pagination"><button id="users-prev" '+(usersPage<=1?'disabled':'')+'>Prev</button><span>Page '+usersPage+' of '+totalPages+'</span><button id="users-next" '+(usersPage>=totalPages?'disabled':'')+'>Next</button></div>';var prevBtn=$('#users-prev'),nextBtn=$('#users-next');if(prevBtn)prevBtn.addEventListener('click',function(){usersPage--;loadUsersTable()});if(nextBtn)nextBtn.addEventListener('click',function(){usersPage++;loadUsersTable()})}catch(err){area.innerHTML='<div class="loading-state" style="color:var(--red)">'+escHtml(err.message)+'</div>'}}
window.__editUser=async function(id){try{var d=await api('/users/'+id);var user=d.user;var plans=(await api('/plans')).plans;var planOpts=plans.map(function(p){return '<option value="'+p.id+'" '+(user.subscription_plan_id==p.id?'selected':'')+'>'+escHtml(p.name)+' ('+fmtMoney(p.price)+')</option>'}).join('');openModal('Edit User','<form id="edit-user-form"><div class="form-group"><label>Name</label><input name="name" value="'+(escHtml(user.name)||'')+'" /></div><div class="form-group"><label>Email</label><input name="email" type="email" value="'+escHtml(user.email)+'" required /></div><div class="form-group"><label>Subscription Plan</label><select name="subscription_plan_id"><option value="">None</option>'+planOpts+'</select></div><div class="form-group"><label>Subscription Status</label><select name="subscription_status"><option value="inactive" '+(user.subscription_status==='inactive'?'selected':'')+'>Inactive</option><option value="active" '+(user.subscription_status==='active'?'selected':'')+'>Active</option></select></div><div id="edit-user-error" class="form-error"></div><button type="submit" class="btn-primary">Save Changes</button></form>');$('#edit-user-form').addEventListener('submit',async function(e){e.preventDefault();var fd=new FormData(e.target);var body={name:fd.get('name'),email:fd.get('email'),subscription_plan_id:fd.get('subscription_plan_id')?parseInt(fd.get('subscription_plan_id'),10):null,subscription_status:fd.get('subscription_status')};try{await api('/users/'+id,{method:'PUT',body:JSON.stringify(body)});closeModal();toast('User updated','success');loadUsersTable()}catch(err){$('#edit-user-error').textContent=err.message}})}catch(err){toast(err.message,'error')}};
window.__deleteUser=async function(id,email){if(!confirm('Delete user "'+email+'"? This cannot be undone.'))return;try{await api('/users/'+id,{method:'DELETE'});toast('User deleted','success');loadUsersTable()}catch(err){toast(err.message,'error')}};
async function renderUserDetail(userId){viewContainer.innerHTML='<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';try{var r=await Promise.all([api('/users/'+userId),api('/users/'+userId+'/tasks?limit=100'),api('/users/'+userId+'/analyses')]);var user=r[0].user,tasks=r[1].tasks,analyses=r[2].analyses;var taskTypeLabel=function(t){return t.replace(/_/g,' ').replace(/\\b\\w/g,function(c){return c.toUpperCase()})};var statusBadge=function(s){var colors={completed:'badge-active',pending:'badge-pending',processing:'badge-processing',failed:'badge-failed'};return '<span class="badge '+(colors[s]||'badge-inactive')+'">'+s+'</span>'};var taskRows=tasks.length?tasks.map(function(t){var meta=typeof t.metadata==='string'?JSON.parse(t.metadata):(t.metadata||{});var preview='';if(t.result_url){preview='<a href="'+escHtml(t.result_url)+'" target="_blank" class="thumb-link"><img src="'+escHtml(t.result_url)+'" class="task-thumb" alt="result" /></a>'}else if(meta.resultImageUrl){preview='<a href="'+escHtml(meta.resultImageUrl)+'" target="_blank" class="thumb-link"><img src="'+escHtml(meta.resultImageUrl)+'" class="task-thumb" alt="result" /></a>'}return '<tr><td>'+taskTypeLabel(t.task_type)+'</td><td>'+statusBadge(t.status)+'</td><td>'+(preview||'<span class="text-muted">\\u2014</span>')+'</td><td><code class="task-id-code">'+escHtml(t.task_id)+'</code></td><td>'+fmtDate(t.created_at)+'</td></tr>'}).join(''):'<tr><td colspan="5" class="empty-msg">No tasks found</td></tr>';var analysisCards=analyses.length?analyses.map(function(a){var scores=typeof a.scores==='string'?JSON.parse(a.scores):(a.scores||{});var scoreItems=Object.keys(scores).map(function(key){var val=scores[key];var label=key.replace(/_/g,' ').replace(/\\b\\w/g,function(c){return c.toUpperCase()});var numVal=typeof val==='object'?(val.value!==undefined?val.value:(val.score!==undefined?val.score:'\\u2014')):val;var pct=typeof numVal==='number'?Math.round(numVal):null;return '<div class="score-item"><div class="score-header"><span class="score-label">'+escHtml(label)+'</span><span class="score-value">'+(pct!==null?pct:escHtml(String(numVal)))+'</span></div>'+(pct!==null?'<div class="score-bar"><div class="score-bar-fill" style="width:'+Math.min(pct,100)+'%"></div></div>':'')+'</div>'}).join('');return '<div class="analysis-card"><div class="analysis-header">'+(a.image_url?'<a href="'+escHtml(a.image_url)+'" target="_blank"><img src="'+escHtml(a.image_url)+'" class="analysis-thumb" alt="photo" /></a>':'')+'<div class="analysis-meta"><div class="analysis-date">'+fmtDate(a.created_at)+'</div><div class="analysis-task-id">Task: <code>'+escHtml(a.task_id)+'</code></div></div></div>'+(scoreItems?'<div class="score-grid">'+scoreItems+'</div>':'<p class="text-muted">No scores available</p>')+'</div>'}).join(''):'<div class="empty-msg">No skin analysis results found</div>';viewContainer.innerHTML='<div class="user-detail-header"><a href="#users" class="back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Users</a></div><div class="user-profile-card"><div class="user-avatar-large">'+escHtml((user.name||user.email||'?')[0].toUpperCase())+'</div><div class="user-profile-info"><h2>'+(escHtml(user.name)||'Unnamed User')+'</h2><p class="user-email">'+escHtml(user.email)+'</p><div class="user-meta-tags"><span class="badge '+(user.subscription_status==='active'?'badge-active':'badge-inactive')+'">'+user.subscription_status+'</span><span class="meta-tag">Plan: '+(escHtml(user.plan_name)||'None')+'</span><span class="meta-tag">Joined: '+fmtDate(user.created_at)+'</span><span class="meta-tag">Tasks: '+tasks.length+'</span><span class="meta-tag">Analyses: '+analyses.length+'</span></div></div></div><div class="detail-tabs"><button class="detail-tab active" data-tab="tasks">Tasks ('+tasks.length+')</button><button class="detail-tab" data-tab="analyses">Skin Analyses ('+analyses.length+')</button></div><div id="tab-tasks" class="detail-tab-content"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Type</th><th>Status</th><th>Preview</th><th>Task ID</th><th>Date</th></tr></thead><tbody>'+taskRows+'</tbody></table></div></div><div id="tab-analyses" class="detail-tab-content" style="display:none"><div class="analysis-grid">'+analysisCards+'</div></div>';document.querySelectorAll('.detail-tab').forEach(function(tab){tab.addEventListener('click',function(){document.querySelectorAll('.detail-tab').forEach(function(t){t.classList.remove('active')});tab.classList.add('active');document.querySelectorAll('.detail-tab-content').forEach(function(c){c.style.display='none'});document.getElementById('tab-'+tab.dataset.tab).style.display=''})})}catch(err){viewContainer.innerHTML='<div class="loading-state" style="color:var(--red)">'+escHtml(err.message)+'</div>'}}
async function renderPlans(){viewContainer.innerHTML='<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';try{var d=await api('/plans');var plans=d.plans;var cards=plans.map(function(p){var features=(Array.isArray(p.features)?p.features:[]).map(function(f){return '<li>'+escHtml(String(f).replace(/_/g,' '))+'</li>'}).join('');return '<div class="plan-card '+(p.is_active?'':'inactive')+'"><span class="plan-status-badge badge '+(p.is_active?'badge-active':'badge-inactive')+'">'+(p.is_active?'Active':'Inactive')+'</span><div class="plan-name">'+escHtml(p.name)+'</div><div class="plan-price">'+fmtMoney(p.price)+' <span>/mo</span></div><div class="plan-desc">'+escHtml(p.description)+'</div><ul class="plan-features">'+(features||'<li>No features listed</li>')+'</ul><div class="plan-actions"><button class="btn-secondary btn-sm" onclick="window.__editPlan('+p.id+')">Edit</button>'+(p.is_active?'<button class="btn-danger btn-sm" onclick="window.__deactivatePlan('+p.id+')">Deactivate</button>':'')+' <button class="btn-danger btn-sm" onclick="window.__deletePlanPermanent('+p.id+', \\''+escHtml(p.name).replace(/'/g,"\\'")+'\\')">Delete</button></div></div>'}).join('');viewContainer.innerHTML='<div class="table-toolbar" style="margin-bottom:20px"><button class="btn-primary" style="width:auto;padding:10px 22px" id="create-plan-btn">+ New Plan</button></div><div class="plan-grid">'+cards+'</div>';$('#create-plan-btn').addEventListener('click',function(){openPlanModal()})}catch(err){viewContainer.innerHTML='<div class="loading-state" style="color:var(--red)">'+escHtml(err.message)+'</div>'}}
function openPlanModal(plan){var isEdit=!!plan;openModal(isEdit?'Edit Plan':'Create Plan','<form id="plan-form"><div class="form-group"><label>Name</label><input name="name" value="'+escHtml(plan?plan.name:'')+'" required /></div><div class="form-group"><label>Price ($/mo)</label><input name="price" type="number" step="0.01" min="0" value="'+(plan?plan.price:'')+'" required /></div><div class="form-group"><label>Description</label><textarea name="description" rows="2">'+escHtml(plan?plan.description:'')+'</textarea></div><div class="form-group"><label>Features (comma-separated)</label><input name="features" value="'+escHtml((plan&&plan.features?plan.features:[]).join(', '))+'" /></div><div class="form-group"><label>Stripe Price ID (optional)</label><input name="stripe_price_id" value="'+escHtml(plan?plan.stripe_price_id||'':'')+'" /></div><div class="form-group"><label>Active</label><select name="is_active"><option value="true" '+((!plan||plan.is_active!==false)?'selected':'')+'>Yes</option><option value="false" '+((plan&&plan.is_active===false)?'selected':'')+'>No</option></select></div><div id="plan-form-error" class="form-error"></div><button type="submit" class="btn-primary">'+(isEdit?'Save Changes':'Create Plan')+'</button></form>');$('#plan-form').addEventListener('submit',async function(e){e.preventDefault();var fd=new FormData(e.target);var body={name:fd.get('name'),price:parseFloat(fd.get('price')),description:fd.get('description'),features:fd.get('features').split(',').map(function(s){return s.trim()}).filter(Boolean),stripe_price_id:fd.get('stripe_price_id')||null,is_active:fd.get('is_active')==='true'};try{if(isEdit){await api('/plans/'+plan.id,{method:'PUT',body:JSON.stringify(body)});toast('Plan updated','success')}else{await api('/plans',{method:'POST',body:JSON.stringify(body)});toast('Plan created','success')}closeModal();renderPlans()}catch(err){$('#plan-form-error').textContent=err.message}})}
window.__editPlan=async function(id){try{var d=await api('/plans');var plan=d.plans.find(function(p){return p.id===id});if(!plan)throw new Error('Plan not found');openPlanModal(plan)}catch(err){toast(err.message,'error')}};
window.__deactivatePlan=async function(id){if(!confirm('Deactivate this plan?'))return;try{await api('/plans/'+id,{method:'DELETE'});toast('Plan deactivated','success');renderPlans()}catch(err){toast(err.message,'error')}};
window.__deletePlanPermanent=async function(id,name){if(!confirm('Permanently delete plan "'+name+'"? Users on this plan will have their plan cleared. This cannot be undone.'))return;try{await api('/plans/'+id+'/permanent',{method:'DELETE'});toast('Plan deleted','success');renderPlans()}catch(err){toast(err.message,'error')}};
async function renderSettings(){viewContainer.innerHTML='<div class="loading-state"><div class="spinner spinner-dark"></div> Loading...</div>';try{var d=await api('/settings');var settings=d.settings;var settingsRows=settings.map(function(s,i){return '<div class="settings-row" data-idx="'+i+'"><input class="setting-key" value="'+escHtml(s.key)+'" placeholder="Key" /><input class="setting-val" value="'+escHtml(typeof s.value==='string'?s.value:JSON.stringify(s.value))+'" placeholder="Value" /><button class="btn-danger btn-sm setting-remove" title="Remove">\\u2715</button></div>'}).join('');viewContainer.innerHTML='<div class="settings-section"><h3>Site Settings</h3><div id="settings-rows">'+settingsRows+'</div><div style="display:flex;gap:10px;margin-top:14px"><button class="btn-secondary btn-sm" id="add-setting-btn">+ Add Setting</button><button class="btn-primary" style="width:auto;padding:8px 22px" id="save-settings-btn">Save Settings</button></div><div id="settings-msg" class="form-success" style="margin-top:10px"></div></div><div class="settings-section"><h3>Change Admin Password</h3><form id="password-form" class="password-form"><div class="form-group"><label>Current Password</label><input name="currentPassword" type="password" required /></div><div class="form-group"><label>New Password</label><input name="newPassword" type="password" required minlength="6" /></div><div class="form-group"><label>Confirm New Password</label><input name="confirmPassword" type="password" required minlength="6" /></div><div id="pw-error" class="form-error"></div><div id="pw-success" class="form-success"></div><button type="submit" class="btn-primary" style="width:auto;padding:10px 28px">Update Password</button></form></div>';$('#add-setting-btn').addEventListener('click',function(){var container=$('#settings-rows');var div=document.createElement('div');div.className='settings-row';div.innerHTML='<input class="setting-key" placeholder="Key" /><input class="setting-val" placeholder="Value" /><button class="btn-danger btn-sm setting-remove" title="Remove">\\u2715</button>';container.appendChild(div);bindRemoveButtons()});bindRemoveButtons();$('#save-settings-btn').addEventListener('click',async function(){var rows=document.querySelectorAll('.settings-row');var payload=[];rows.forEach(function(r){var key=r.querySelector('.setting-key').value.trim();var val=r.querySelector('.setting-val').value.trim();if(!key)return;try{val=JSON.parse(val)}catch(e){}payload.push({key:key,value:val})});try{await api('/settings',{method:'PUT',body:JSON.stringify({settings:payload})});$('#settings-msg').textContent='Settings saved!';toast('Settings saved','success');setTimeout(function(){var m=$('#settings-msg');if(m)m.textContent=''},3000)}catch(err){toast(err.message,'error')}});$('#password-form').addEventListener('submit',async function(e){e.preventDefault();var fd=new FormData(e.target);var errEl=$('#pw-error'),sucEl=$('#pw-success');errEl.textContent='';sucEl.textContent='';if(fd.get('newPassword')!==fd.get('confirmPassword')){errEl.textContent='Passwords do not match';return}try{await api('/password',{method:'PUT',body:JSON.stringify({currentPassword:fd.get('currentPassword'),newPassword:fd.get('newPassword')})});sucEl.textContent='Password updated successfully!';e.target.reset();toast('Password updated','success')}catch(err){errEl.textContent=err.message}})}catch(err){viewContainer.innerHTML='<div class="loading-state" style="color:var(--red)">'+escHtml(err.message)+'</div>'}}
function bindRemoveButtons(){document.querySelectorAll('.setting-remove').forEach(function(btn){btn.onclick=function(){btn.closest('.settings-row').remove()}})}
async function init(){if(!token){showLogin();return}try{var data=await api('/me');adminName.textContent=data.admin.username;showApp()}catch(e){showLogin()}}
init();
})();`;

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>SkinDiagnostics.ai — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>${ADMIN_CSS}</style>
</head>
<body>
<div id="login-overlay" class="login-overlay">
<div class="login-card">
<div class="login-logo">
<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><defs><linearGradient id="lg" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#7B5CFF"/><stop offset=".55" stop-color="#FF5EA8"/><stop offset="1" stop-color="#5AD7FF"/></linearGradient></defs><path d="M30 6c2 8-2 14-10 18 8-2 14 2 18 10-2-8 2-14 10-18-8 2-14-2-18-10Z" fill="url(#lg)" opacity=".95"/><path d="M16 28c1.5 6-1.5 10.5-7.5 13.5 6-1.5 10.5 1.5 13.5 7.5-1.5-6 1.5-10.5 7.5-13.5-6 1.5-10.5-1.5-13.5-7.5Z" fill="url(#lg)" opacity=".85"/></svg>
<h1>SkinDiagnostics<span>.ai</span></h1>
<p>Admin Dashboard</p>
</div>
<form id="login-form" autocomplete="off">
<div class="form-group"><label for="login-username">Username</label><input id="login-username" type="text" placeholder="admin" required autofocus/></div>
<div class="form-group"><label for="login-password">Password</label><input id="login-password" type="password" placeholder="Password" required/></div>
<div id="login-error" class="form-error"></div>
<button type="submit" class="btn-primary" id="login-btn">Sign In</button>
</form>
</div>
</div>
<div id="app-shell" class="app-shell hidden">
<aside class="sidebar">
<div class="sidebar-brand"><svg viewBox="0 0 64 64" fill="none" width="30" height="30"><defs><linearGradient id="lg2" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#7B5CFF"/><stop offset=".55" stop-color="#FF5EA8"/><stop offset="1" stop-color="#5AD7FF"/></linearGradient></defs><path d="M30 6c2 8-2 14-10 18 8-2 14 2 18 10-2-8 2-14 10-18-8 2-14-2-18-10Z" fill="url(#lg2)" opacity=".95"/><path d="M16 28c1.5 6-1.5 10.5-7.5 13.5 6-1.5 10.5 1.5 13.5 7.5-1.5-6 1.5-10.5 7.5-13.5-6 1.5-10.5-1.5-13.5-7.5Z" fill="url(#lg2)" opacity=".85"/></svg><span>Admin</span></div>
<nav class="sidebar-nav">
<a href="#dashboard" class="nav-item active" data-view="dashboard"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg><span>Dashboard</span></a>
<a href="#users" class="nav-item" data-view="users"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Users</span></a>
<a href="#plans" class="nav-item" data-view="plans"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><span>Plans</span></a>
<a href="#settings" class="nav-item" data-view="settings"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Settings</span></a>
</nav>
<div class="sidebar-footer"><button id="logout-btn" class="nav-item logout-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span>Logout</span></button></div>
</aside>
<main class="main-content">
<header class="top-bar"><button id="mobile-menu-btn" class="mobile-menu-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><h2 id="page-title">Dashboard</h2><div class="top-bar-right"><span id="admin-name" class="admin-badge">admin</span></div></header>
<div id="view-container" class="view-container"></div>
</main>
</div>
<div id="modal-backdrop" class="modal-backdrop hidden"></div>
<div id="modal" class="modal hidden"><div class="modal-header"><h3 id="modal-title">Modal</h3><button id="modal-close" class="modal-close">&times;</button></div><div id="modal-body" class="modal-body"></div></div>
<script>${ADMIN_JS}</script>
</body>
</html>`;

router.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ADMIN_HTML);
});

export default router;
