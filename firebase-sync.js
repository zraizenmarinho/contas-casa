// ─────────────────────────────────────────────────────────
// Firebase Sync — sincronização em tempo real entre dispositivos
// ─────────────────────────────────────────────────────────
// COMO USAR:
// 1. Crie um projeto grátis em https://console.firebase.google.com
// 2. Em "Build → Firestore Database", crie um banco em modo TESTE
// 3. Em "Project settings → Your apps → Web", registre um app
// 4. Cole as credenciais abaixo no objeto FIREBASE_CONFIG
// 5. Em "Firestore → Rules", cole:
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /familias/{codigo}/contas/{doc} {
//            allow read, write: if true;
//          }
//        }
//      }
//
// Cada família escolhe um CÓDIGO único (ex: "silva-2026")
// e os dois cônjuges usam o mesmo código → sincroniza tudo.
// ─────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyC7pdd99ycUn9N4duPMi28IuZ6OH9J47DM",
  authDomain:        "contas-mv.firebaseapp.com",
  projectId:         "contas-mv",
  storageBucket:     "contas-mv.firebasestorage.app",
  messagingSenderId: "766688450552",
  appId:             "1:766688450552:web:9b65446ded412c295a680d",
};

(function () {
  const KEY_FAM = 'mv_familia_codigo';

  let db = null;
  let unsubscribe = null;
  let onChangeCallback = null;
  // Timestamp da última escrita local — usado para ignorar o snapshot "eco"
  // que Firebase dispara em resposta às nossas próprias escritas
  let lastWriteTime = 0;
  const WRITE_DEBOUNCE_MS = 2000;

  window.firebaseSync = {
    isConfigured() {
      return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "COLE_AQUI_SUA_API_KEY";
    },

    getCodigo() {
      return localStorage.getItem(KEY_FAM) || '';
    },

    setCodigo(codigo) {
      localStorage.setItem(KEY_FAM, codigo.trim().toLowerCase());
    },

    clearCodigo() {
      localStorage.removeItem(KEY_FAM);
      if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    },

    async init(onChange) {
      if (!this.isConfigured()) {
        console.warn('Firebase não configurado — usando apenas localStorage');
        return false;
      }
      const codigo = this.getCodigo();
      if (!codigo) return false;

      try {
        if (!window._firebaseLoaded) {
          const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
          const { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs } =
            await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');
          window._firebase = { initializeApp, getApps, getApp, getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs };
          window._firebaseLoaded = true;
        }
        const fb = window._firebase;
        // Evita "App already exists" ao reconectar
        const app = fb.getApps().length > 0 ? fb.getApp() : fb.initializeApp(FIREBASE_CONFIG);
        db = fb.getFirestore(app);
        onChangeCallback = onChange;

        if (unsubscribe) { unsubscribe(); unsubscribe = null; }

        const colRef = fb.collection(db, 'familias', codigo, 'contas');
        unsubscribe = fb.onSnapshot(colRef, (snap) => {
          // Ignora snapshots que chegam logo após uma escrita nossa (snapshot "eco")
          // para evitar que o estado local seja temporariamente sobrescrito
          if (Date.now() - lastWriteTime < WRITE_DEBOUNCE_MS) return;
          const contas = [];
          snap.forEach(d => contas.push({ id: d.id, ...d.data() }));
          if (onChangeCallback) onChangeCallback(contas);
        });
        return true;
      } catch (e) {
        console.error('Erro ao conectar Firebase:', e);
        return false;
      }
    },

    async saveConta(conta) {
      if (!db) return;
      lastWriteTime = Date.now();
      const codigo = this.getCodigo();
      const fb = window._firebase;
      const ref = fb.doc(db, 'familias', codigo, 'contas', conta.id);
      const { id, ...rest } = conta;
      await fb.setDoc(ref, rest);
    },

    async deleteConta(id) {
      if (!db) return;
      lastWriteTime = Date.now();
      const codigo = this.getCodigo();
      const fb = window._firebase;
      await fb.deleteDoc(fb.doc(db, 'familias', codigo, 'contas', id));
    },

    async saveBatch(contas) {
      if (!db) return;
      lastWriteTime = Date.now();
      const codigo = this.getCodigo();
      const fb = window._firebase;
      const batch = fb.writeBatch(db);
      contas.forEach(c => {
        const { id, ...rest } = c;
        batch.set(fb.doc(db, 'familias', codigo, 'contas', id), rest);
      });
      await batch.commit();
    },

    async clearAllContas() {
      if (!db) return;
      lastWriteTime = Date.now();
      const codigo = this.getCodigo();
      const fb = window._firebase;
      const snap = await fb.getDocs(fb.collection(db, 'familias', codigo, 'contas'));
      const batch = fb.writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    },

    async deleteContas(ids) {
      if (!db) return;
      lastWriteTime = Date.now();
      const codigo = this.getCodigo();
      const fb = window._firebase;
      const batch = fb.writeBatch(db);
      ids.forEach(id => batch.delete(fb.doc(db, 'familias', codigo, 'contas', id)));
      await batch.commit();
    },
  };
})();
