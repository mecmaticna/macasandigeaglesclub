import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1eQL8pfe1pn8_1Fl8xW672d-l8KSDrqc",
    authDomain: "macasandingeaglesclub.firebaseapp.com",
    databaseURL: "https://macasandingeaglesclub-default-rtdb.firebaseio.com",
    projectId: "macasandingeaglesclub",
    storageBucket: "macasandingeaglesclub.firebasestorage.app",
    messagingSenderId: "472538986202",
    appId: "1:472538986202:web:75e9885b6a867675c2d7e3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const IMGBB_API_KEY = "30ee5ce6b6900521725623cdae535620";

// --- AUTHENTICATION LOGIC ---
const loginBtn = document.getElementById('btn-login-exec');
if(loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) {
            alert("Login Failed: " + e.message);
        }
    };
}

document.getElementById('btn-logout').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const loginBox = document.getElementById('admin-login-box');
    const adminContent = document.getElementById('admin-content');
    if (user) {
        loginBox.style.display = 'none';
        adminContent.style.display = 'flex';
    } else {
        loginBox.style.display = 'flex';
        adminContent.style.display = 'none';
    }
});

// --- ORIGINAL DASHBOARD LOGIC ---
window.slideTo = (idx) => document.getElementById('slider').style.transform = `translateX(-${idx * 100}vw)`;
window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('active');

// [Insert your syncCollection, zoomImage, and uploadImg functions here exactly as they were]
// Note: Ensure functions used in HTML like 'handleDel' are attached to window.
window.handleDel = async (p, id) => { 
    if(confirm("Delete this entry?")) await remove(ref(db, `${p}/${id}`)); 
};