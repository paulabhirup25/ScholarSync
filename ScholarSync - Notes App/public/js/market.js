// js/market.js

// Import Firebase (No changes here)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyCphj2AXbDXFi7lWJwprJnxP2Q6PGJJKiM",
  authDomain: "scholarsync-notes.firebaseapp.com",
  projectId: "scholarsync-notes",
  storageBucket: "scholarsync-notes.firebasestorage.app",
  messagingSenderId: "995928677798",
  appId: "1:995928677798:web:0f1264db31b51589f64367",
  measurementId: "G-0E7DGWBB77"
};

//Initialize

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const userAvatar = document.getElementById('user-avatar');
const loginPrompt = document.getElementById('login-prompt');
const formContainer = document.getElementById('post-form-container');
const feed = document.getElementById('requests-feed');
const phoneInput = document.getElementById('req-contact');

// 1. Auth Logic
window.login = () => signInWithPopup(auth, provider).catch(console.error);
if(loginBtn) loginBtn.addEventListener('click', window.login);

if(userAvatar) {
    userAvatar.addEventListener('click', () => {
        if(confirm("Logout?")) signOut(auth).then(() => location.reload());
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.classList.add('hidden');
        loginPrompt.classList.add('hidden');
        userAvatar.classList.remove('hidden');
        userAvatar.src = user.photoURL;
        formContainer.classList.remove('hidden');

        // Auto-fill phone if saved
        const savedPhone = localStorage.getItem('userPhone');
        if (savedPhone) phoneInput.value = savedPhone;
    } else {
        loginBtn.classList.remove('hidden');
        loginPrompt.classList.remove('hidden');
        userAvatar.classList.add('hidden');
        formContainer.classList.add('hidden');
    }
});

// 2. Post Request (Updated with Country Code & Details)
window.postRequest = async () => {
    const user = auth.currentUser;
    if(!user) return alert("Please login first!");

    const title = document.getElementById('req-title').value;
    const details = document.getElementById('req-details').value; // New Field
    const budget = document.getElementById('req-budget').value;
    const countryCode = document.getElementById('req-country').value;
    const number = document.getElementById('req-contact').value;

    if(!title || !budget || !number) return alert("Please fill required fields");

    // Combine Country Code + Number
    const fullContact = countryCode + number;
    
    // Save plain number to local storage for convenience
    localStorage.setItem('userPhone', number);

    const btn = document.querySelector('button[onclick="postRequest()"]');
    btn.innerText = "Posting...";
    btn.disabled = true;

    try {
        await addDoc(collection(db, "requests"), {
            title: title,
            details: details,
            budget: budget,
            contact: fullContact,
            userPhoto: user.photoURL,
            userName: user.displayName,
            userId: user.uid, // Important for "Withdraw" logic
            createdAt: new Date()
        });
        
        alert("Request Posted!");
        document.getElementById('req-title').value = '';
        document.getElementById('req-details').value = '';
        document.getElementById('req-budget').value = '';
        // We keep the phone number filled for convenience
        
    } catch (e) {
        console.error("Error:", e);
        alert("Error posting.");
    } finally {
        btn.innerText = "Post Request";
        btn.disabled = false;
    }
};

// 3. Withdraw (Delete) Logic
window.withdrawRequest = async (docId) => {
    if(confirm("Are you sure you want to delete this request?")) {
        try {
            await deleteDoc(doc(db, "requests", docId));
        } catch(e) {
            console.error(e);
            alert("Error deleting.");
        }
    }
};

// 4. Accept Logic (The Safety Layer)
window.acceptRequest = (btnId, contact, name, title) => {
    const user = auth.currentUser;
    if (!user) {
        alert("🔒 Please login to accept requests.");
        window.login();
        return;
    }

    const btn = document.getElementById(btnId);
    
    // Change button to WhatsApp style
    btn.innerHTML = `
        <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            Chat Now
        </span>
    `;
    btn.classList.remove('bg-slate-900', 'dark:bg-indigo-600');
    btn.classList.add('bg-green-600', 'hover:bg-green-700');
    
    // Set the click action to actually open WhatsApp now
    const whatsappUrl = `https://wa.me/${contact}?text=Hi ${name}, I saw your request for "${title}" on ScholarSync. I can help.`;
    btn.onclick = () => window.open(whatsappUrl, '_blank');
};

// 5. Render Feed
const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    feed.innerHTML = '';
    const currentUser = auth.currentUser;

    if (snapshot.empty) {
        feed.innerHTML = '<p class="text-center text-gray-400">No requests yet.</p>';
        return;
    }

    snapshot.forEach((docSnap) => {
        const req = docSnap.data();
        const docId = docSnap.id;
        const date = req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now';
        
        // Determine what button to show
        let actionButton = '';
        
        if (currentUser && req.userId === currentUser.uid) {
            // CASE 1: I am the owner -> Show "Withdraw"
            actionButton = `
                <button onclick="withdrawRequest('${docId}')" 
                        class="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-2 transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Withdraw
                </button>
            `;
        } else {
            // CASE 2: I am a tutor -> Show "Accept" (Safe Mode)
            const btnId = `btn-${docId}`;
            actionButton = `
                <button id="${btnId}" onclick="acceptRequest('${btnId}', '${req.contact}', '${req.userName}', '${req.title}')" 
                        class="bg-slate-900 dark:bg-indigo-600 hover:opacity-90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md">
                    Accept Request
                </button>
            `;
        }

        const card = `
            <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                
                <div class="flex justify-between items-start">
                    <div class="flex gap-4">
                        <img src="${req.userPhoto}" class="w-10 h-10 rounded-full border border-gray-100">
                        <div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">${req.title}</h3>
                            <div class="flex items-center gap-3 text-sm">
                                <span class="text-gray-500 dark:text-gray-400">${req.userName}</span>
                                <span class="text-gray-300">•</span>
                                <span class="text-gray-400 text-xs">${date}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap">
                        ₹${req.budget}
                    </div>
                </div>

                ${req.details ? `<p class="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">${req.details}</p>` : ''}
                
                <div class="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-700/50">
                    ${actionButton}
                </div>
            </div>
        `;
        feed.innerHTML += card;
    });
});