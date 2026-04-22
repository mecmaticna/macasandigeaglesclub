import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1eQL8pfe1pn8_1Fl8xW672d-l8KSDrqc",
    authDomain: "macasandingeaglesclub.firebaseapp.com",
    databaseURL: "https://macasandingeaglesclub-default-rtdb.firebaseio.com",
    projectId: "macasandingeaglesclub",
    storageBucket: "macasandingeaglesclub.firebasestorage.app",
    messagingSenderId: "472538986202",
    appId: "1:472538986202:web:75e9885b6a867675c2d7e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const IMGBB_API_KEY = "30ee5ce6b6900521725623cdae535620";
let currentActiveCard = null;

// --- AUTHENTICATION LOGIC ---
window.adminLogin = () => {
    const user = auth.currentUser;
    if(user) {
        document.getElementById('admin-panel').classList.add('active');
    } else {
        document.getElementById('login-modal').style.display = 'flex';
    }
};

window.closeLogin = () => document.getElementById('login-modal').style.display = 'none';

window.processLogin = () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('admin-panel').classList.add('active');
        })
        .catch(err => alert("Login Failed: " + err.message));
};

window.handleLogout = () => {
    signOut(auth).then(() => location.reload());
};

onAuthStateChanged(auth, (user) => {
    if (!user) document.getElementById('admin-panel').classList.remove('active');
});

// --- UI & SLIDER LOGIC ---
window.slideTo = (idx) => document.getElementById('slider').style.transform = `translateX(-${idx * 100}vw)`;

window.toggleAnnouncement = () => {
    const overlay = document.getElementById('announcement-overlay');
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
};

// Photo Zoom Functions
window.zoomImage = (el) => { 
    const overlay = document.getElementById('zoom-overlay');
    const zoomedImg = document.getElementById('main-zoomed-img');
    currentActiveCard = el.closest('.activity-card');
    zoomedImg.src = el.src;
    zoomedImg.dataset.orig = el.dataset.orig;
    zoomedImg.dataset.idx = el.dataset.idx;
    overlay.style.display = 'flex';
};

window.globalCloseZoom = () => document.getElementById('zoom-overlay').style.display = 'none';

window.globalChangePhoto = (dir) => {
    if(!currentActiveCard) return;
    const zoomedImg = document.getElementById('main-zoomed-img');
    const hiddenBatch = currentActiveCard.querySelectorAll('.activity-batch img');
    const allSrcs = [zoomedImg.dataset.orig, ...Array.from(hiddenBatch).map(i => i.src)];
    let currentIdx = (parseInt(zoomedImg.dataset.idx || 0) + dir + allSrcs.length) % allSrcs.length;
    zoomedImg.src = allSrcs[currentIdx];
    zoomedImg.dataset.idx = currentIdx;
};

// --- DATA SYNC LOGIC ---
onValue(ref(db, 'announcements'), (snap) => {
    const pubList = document.getElementById('public-ann-list');
    const admList = document.getElementById('admin-ann-list');
    pubList.innerHTML = ""; admList.innerHTML = "";
    snap.forEach((child) => {
        const item = child.val();
        pubList.insertAdjacentHTML('afterbegin', `<div class="ann-item-public"><b>${item.date}</b><br>${item.msg}</div>`);
        admList.insertAdjacentHTML('afterbegin', `
            <div class="data-item">
                <div class="data-info"><b>${item.date}</b><br>${item.msg}</div>
                <div class="data-actions">
                    <button class="action-btn btn-del" onclick="handleDel('announcements','${child.key}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`);
    });
    if(pubList.innerHTML === "") pubList.innerHTML = "No active announcements.";
});

function syncCollection(path, displayId, adminListId, type) {
    onValue(ref(db, path), (snap) => {
        const display = displayId ? document.getElementById(displayId) : null;
        const adminList = document.getElementById(adminListId);
        if(display) display.innerHTML = ""; adminList.innerHTML = "";
        
        if(type === 'member') {
            let tableHtml = `<table class="member-table"><thead><tr><th>Member Details</th><th>Position</th><th>Joined</th></tr></thead><tbody>`;
            snap.forEach((child) => {
                const item = child.val();
                tableHtml += `<tr><td><img src="${item.img}" class="member-avatar"><b>${item.name}</b></td><td>${item.position}</td><td>${item.date}</td></tr>`;
                adminList.insertAdjacentHTML('afterbegin', `
                    <div class="data-item">
                        <div class="data-info"><b>${item.name}</b><br>${item.position}</div>
                        <div class="data-actions">
                            <button class="action-btn btn-del" onclick="handleDel('${path}','${child.key}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`);
            });
            document.getElementById('registry-container').innerHTML = tableHtml + `</tbody></table>`;
        } else {
            snap.forEach((child) => {
                const item = child.val();
                if(type === 'activity' && display) {
                    let imgs = Array.isArray(item.img) ? item.img : [item.img];
                    display.insertAdjacentHTML('beforeend', `<div class="activity-card"><div class="activity-photo-wrapper"><img src="${imgs[0]}" data-orig="${imgs[0]}" data-idx="0" class="activity-photo" onclick="zoomImage(this)"></div><h4 class="gold-text">${item.name}</h4><p class="sub-text">${item.position}</p><div class="activity-batch">${imgs.slice(1).map(u => `<img src="${u}">`).join('')}</div></div>`);
                } else if(display) {
                    display.insertAdjacentHTML('beforeend', `<div class="officer-card"><img src="${item.img}" class="officer-photo"><h4 class="gold-text">${item.name}</h4><p class="sub-text">${item.position}</p></div>`);
                }
                adminList.insertAdjacentHTML('afterbegin', `
                    <div class="data-item">
                        <div class="data-info"><b>${item.name}</b><br>${item.position}</div>
                        <div class="data-actions">
                            <button class="action-btn btn-del" onclick="handleDel('${path}','${child.key}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`);
            });
        }
    });
}

// Start syncing
syncCollection('officers', 'display-officers', 'admin-off-list', 'officer');
syncCollection('charters', 'display-chartered', 'admin-cha-list', 'charter');
syncCollection('members', null, 'admin-mem-list', 'member');
syncCollection('activities', 'display-activities', 'admin-act-list', 'activity');

// --- DATA SAVING LOGIC ---
async function uploadImg(file) {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: fd });
    const j = await res.json(); return j.success ? j.data.url : null;
}

window.saveData = async (type) => {
    const pre = type === 'officer' ? 'off' : type === 'charter' ? 'cha' : type === 'activity' ? 'act' : 'mem';
    const btn = document.getElementById(`${pre}-btn`); btn.innerText = "Processing...";
    let data = { name: document.getElementById(`${pre}-name`).value, position: document.getElementById(`${pre}-pos`).value };
    if(type === 'member') data.date = document.getElementById('mem-date').value;
    const files = document.getElementById(`${pre}-file`).files;
    if(files.length > 0) {
        if(type === 'activity') {
            let urls = []; for(let f of files) { const url = await uploadImg(f); if(url) urls.push(url); } data.img = urls;
        } else { data.img = await uploadImg(files[0]); }
    }
    await push(ref(db, type === 'officer' ? 'officers' : type === 'charter' ? 'charters' : type === 'activity' ? 'activities' : 'members'), data);
    location.reload();
};

window.saveAnnouncement = async () => {
    await push(ref(db, 'announcements'), { msg: document.getElementById('ann-text').value, date: document.getElementById('ann-date').value });
    document.getElementById('ann-text').value = "";
};

window.handleDel = async (p, id) => { if(confirm("Are you sure you want to delete this entry?")) await remove(ref(db, `${p}/${id}`)); };

window.showPane = (pane, el) => {
    document.querySelectorAll('.admin-section-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById('pane-' + pane).classList.add('active'); el.classList.add('active');
};