import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const supabaseUrl = process.env.SUPABASE_URL || "https://gepdalprxhdjiuxwxidv.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcGRhbHByeGhkaml1eHd4aWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk2MDIxMSwiZXhwIjoyMDk1NTM2MjExfQ.9_yn5Vn_bi45VGDFFQOU3RZTD3NsIUz_IvDDkQFYjCM";
  
  let supabase: any = null;
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log("[SUPABASE] Connected successfully to direct cloud database.");
    } catch (e) {
      console.error("[SUPABASE ERROR] Connection initialization failed:", e);
    }
  }

  // Set higher limits for payload transfers (e.g., receipt images)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Enable absolute CORS handles so that direct API requests made from external static hosts (like Vercel) are successfully authorized and handled
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Central Database file inside the container
  const dbPath = path.join(process.cwd(), "db.json");
  let storeData: Record<string, any> = {};

  function mergeData(payload: Record<string, any>): boolean {
    if (!payload || typeof payload !== "object") return false;
    let modified = false;
    for (const key of Object.keys(payload)) {
      const newVal = payload[key];
      const oldVal = storeData[key];

      if (oldVal === undefined) {
        storeData[key] = newVal;
        modified = true;
        continue;
      }

      const shouldMerge = Array.isArray(newVal) && Array.isArray(oldVal) && key !== "gi_products" && key !== "gi_bonus_codes";
      if (shouldMerge) {
        const mergedMap = new Map<string, any>();
        
        for (const item of oldVal) {
          if (item && typeof item === "object") {
            const id = item.id || item.code;
            if (id) {
              mergedMap.set(String(id), item);
            }
          }
        }

        for (const item of newVal) {
          if (item && typeof item === "object") {
            const id = item.id || item.code;
            if (id) {
              const idStr = String(id);
              if (!mergedMap.has(idStr)) {
                mergedMap.set(idStr, item);
                modified = true;
              } else {
                const existingItem = mergedMap.get(idStr);
                const existingTime = existingItem.lastModified || 0;
                const incomingTime = item.lastModified || 0;
                
                if (key === "gi_users") {
                  const useIncoming = incomingTime > existingTime;
                  const mergedUser = {
                    ...(useIncoming ? item : existingItem),
                    role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                    isBlocked: useIncoming ? (item.isBlocked !== undefined ? item.isBlocked : existingItem.isBlocked) : (existingItem.isBlocked !== undefined ? existingItem.isBlocked : item.isBlocked),
                    lastModified: Math.max(existingTime, incomingTime)
                  };
                  if (JSON.stringify(existingItem) !== JSON.stringify(mergedUser)) {
                    mergedMap.set(idStr, mergedUser);
                    modified = true;
                  }
                } else {
                  if (incomingTime > existingTime) {
                    mergedMap.set(idStr, item);
                    modified = true;
                  }
                }
              }
            }
          }
        }

        if (modified) {
          storeData[key] = Array.from(mergedMap.values());
        }
      } else {
        if (typeof newVal === "object" && typeof oldVal === "object" && newVal !== null && oldVal !== null) {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            storeData[key] = newVal;
            modified = true;
          }
        } else if (newVal !== oldVal) {
          storeData[key] = newVal;
          modified = true;
        }
      }
    }
    return modified;
  }

  function loadStore() {
    if (fs.existsSync(dbPath)) {
      try {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        storeData = JSON.parse(fileContent);
        console.log("State database loaded successfully from db.json");
      } catch (e) {
        console.error("Failed to parse db.json data, resetting:", e);
        storeData = {};
      }
    } else {
      storeData = {};
    }

    // Prefill central database with standard mock data if keys are absent
    const defaultData: Record<string, any> = {
      "gi_users": [
        { id: 'u-admin', name: 'Administrateur Principal', whatsapp: '+237600000000', password: 'agro777', country: 'Cameroun', balance: 1250000, dailyEarnings: 0, totalEarnings: 0, bonus: 5000, referralCode: 'AGRO777', role: 'admin', isBlocked: false, createdAt: '2026-05-10T10:00:00Z' },
        { id: 'u-1', name: 'Aline Ouédraogo', whatsapp: '+22670717273', password: 'user123', country: 'Burkina Faso', balance: 14200, dailyEarnings: 600, totalEarnings: 4200, bonus: 500, referralCode: 'ALINE226', referredBy: 'u-admin', role: 'user', isBlocked: false, createdAt: '2026-05-18T14:30:00Z' },
        { id: 'u-2', name: 'Koffi Kouamé', whatsapp: '+2250708091011', password: 'user123', country: 'Côte d’Ivoire', balance: 38000, dailyEarnings: 2500, totalEarnings: 15000, bonus: 1000, referralCode: 'KOFFI225', referredBy: 'u-1', role: 'user', isBlocked: false, createdAt: '2026-05-20T09:15:00Z' },
        { id: 'u-3', name: 'Moussa Diarra', whatsapp: '+22360616263', password: 'user123', country: 'Mali', balance: 2400, dailyEarnings: 0, totalEarnings: 0, bonus: 500, referralCode: 'MOUSSA223', referredBy: 'u-2', role: 'user', isBlocked: false, createdAt: '2026-05-22T16:45:00Z' },
        { id: 'u-1780484438134', name: 'Wilfried', whatsapp: '+23770903318', password: 'user123', country: 'Cameroun', balance: 200, dailyEarnings: 0, totalEarnings: 0, bonus: 200, referralCode: 'WIL818', referredBy: 'u-admin', role: 'user', isBlocked: false, createdAt: '2026-06-05T12:20:00.134Z', lastModified: 1780484438134 }
      ],
      "gi_deposits": [
        { id: 'dep-101', userId: 'u-2', userName: 'Koffi Kouamé', amount: 10000, operator: 'Orange Money (Ivory Coast)', reference: 'TXN-OM-293847293', receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop', status: 'approved', createdAt: '2026-05-20T09:30:00Z' },
        { id: 'dep-102', userId: 'u-1', userName: 'Aline Ouédraogo', amount: 3000, operator: 'Moov Money (Burkina)', reference: 'REF-MV-1029382', receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop', status: 'approved', createdAt: '2026-05-18T14:45:00Z' },
        { id: 'dep-103', userId: 'u-3', userName: 'Moussa Diarra', amount: 3000, operator: 'Orange Money (Mali)', reference: 'OM-TX-2236162', receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop', status: 'pending', createdAt: '2026-05-28T05:22:00Z' }
      ],
      "gi_withdrawals": [
        { id: 'wth-201', userId: 'u-2', userName: 'Koffi Kouamé', amount: 5000, operator: 'Wave (Ivory Coast)', number: '+2250708091011', status: 'approved', createdAt: '2026-05-24T18:00:00Z' },
        { id: 'wth-202', userId: 'u-1', userName: 'Aline Ouédraogo', amount: 2500, operator: 'Mobicash (Burkina)', number: '+22670717273', status: 'rejected', createdAt: '2026-05-22T10:11:00Z' }
      ],
      "gi_investments": [],
      "gi_commissions": [],
      "gi_notifications": [],
      "gi_bonus_codes": [
        { code: 'AGRO777', amount: 1000, maxUses: 100, usedCount: 3, usedByUsers: ['u-1', 'u-2', 'u-3'] },
        { code: 'WELCOME500', amount: 500, maxUses: 500, usedCount: 0, usedByUsers: [] },
        { code: 'VIPBONUS', amount: 2000, maxUses: 10, usedCount: 0, usedByUsers: [] }
      ],
      "gi_support_messages": [
        { id: 'm-1', userId: 'u-2', sender: 'user', message: 'Bonjour, j\'aimerais savoir comment effectuer un retrait ?', createdAt: '2026-05-24T10:00:00Z' },
        { id: 'm-2', userId: 'u-2', sender: 'admin', message: 'Bonjour ! Allez simplement dans l\'onglet "Retrait" de votre tableau de bord, entrez votre numéro de Mobile Money, sélectionnez votre opérateur et soumettez la demande. C\'est rapide et traité sous 2 heures !', createdAt: '2026-05-24T10:05:00Z' }
      ],
      "gi_products": [
        { id: 'vip-1', vipLevel: 1, name: 'P1', price: 7000, dailyReturn: 300, durationDays: 365, totalReturn: 109500, tag: 'P1' },
         { id: 'vip-2', vipLevel: 2, name: 'P2', price: 15000, dailyReturn: 700, durationDays: 365, totalReturn: 255500, tag: 'P2' },
         { id: 'vip-3', vipLevel: 3, name: 'P3', price: 30000, dailyReturn: 1500, durationDays: 365, totalReturn: 547500, tag: 'P3' },
         { id: 'vip-4', vipLevel: 4, name: 'P4', price: 60000, dailyReturn: 3200, durationDays: 365, totalReturn: 1168000, tag: 'P4' },
         { id: 'vip-5', vipLevel: 5, name: 'P5', price: 120000, dailyReturn: 6800, durationDays: 365, totalReturn: 2482000, tag: 'P5' },
         { id: 'vip-6', vipLevel: 6, name: 'P6', price: 250000, dailyReturn: 15000, durationDays: 365, totalReturn: 5475000, tag: 'P6' },
         { id: 'vip-7', vipLevel: 7, name: 'P7', price: 500000, dailyReturn: 32000, durationDays: 365, totalReturn: 11680000, tag: 'P7' }
      ],
      "gi_mlm_level1_rate": 20,
      "gi_mlm_level2_rate": 3,
      "gi_mlm_level3_rate": 1,
      "gi_withdrawals_blocked_global": false
    };

    let modified = false;
    for (const key of Object.keys(defaultData)) {
      if (storeData[key] === undefined) {
        storeData[key] = defaultData[key];
        modified = true;
      }
    }

    if (modified) {
      saveStoreLocal();
    }

    // Run active cloud sync relay in background using Supabase
    Promise.resolve().then(async () => {
      if (!supabase) return;
      try {
        console.log("[SERVER STARTUP] Fetching state from Supabase 'store' table...");
        const { data, error } = await supabase.from('store').select('*');
        if (error) {
          if (error.message && error.message.includes('relation "store" does not exist')) {
            console.warn("\n======================================================================");
            console.warn("[SUPABASE NOTICE] La table 'store' n'existe pas encore dans votre base de données Supabase !");
            console.warn("Veuillez vous rendre dans le Dashboard Supabase (onglet SQL Editor) et exécuter le script SQL suivant :");
            console.warn("\nCREATE TABLE store (\n  key TEXT PRIMARY KEY,\n  value JSONB NOT NULL,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n");
            console.warn("L'application utilise actuellement la copie de sauvegarde locale db.json tant que la table n'est pas configurée.");
            console.warn("======================================================================\n");
          } else {
            console.error("[SUPABASE ERROR] Failed to fetch startup state:", error);
          }
        } else if (data && Array.isArray(data)) {
          console.log(`[SERVER STARTUP] Successfully fetched ${data.length} keys from Supabase.`);
          const kvData: Record<string, any> = {};
          for (const item of data) {
            kvData[item.key] = item.value;
          }
          if (Object.keys(kvData).length > 0) {
            console.log("[SERVER STARTUP] Merging Supabase cloud database keys into local runtime...");
            const didMerge = mergeData(kvData);
            if (didMerge) {
              saveStoreLocal();
              console.log("[SERVER STARTUP] Local copy successfully synchronized with Supabase.");
            }
          } else {
            // State in Supabase is empty; let's upload our prefilled default entries right away to populate the cloud!
            console.log("[SERVER STARTUP] Supabase is empty. Populating default state directly to Supabase...");
            saveStore();
          }
        }
      } catch (e) {
        console.error("[SERVER STARTUP] Supabase initial pull failed:", e);
      }
    });
  }

  function saveStoreLocal() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(storeData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to db.json file:", e);
    }
  }

  function saveStore() {
    saveStoreLocal();
    if (!supabase) return;
    
    // Asynchronously upsert modified state keys to Supabase 'store' table in background
    Promise.resolve().then(async () => {
      try {
        const keys = Object.keys(storeData);
        for (const key of keys) {
          const localVal = storeData[key];
          if (localVal === undefined) continue;
          
          let valToSave = localVal;
          const isMergeableArray = Array.isArray(localVal) && key !== "gi_products" && key !== "gi_bonus_codes";
          
          if (isMergeableArray) {
            try {
              const { data: remoteRow, error: fetchErr } = await supabase
                .from('store')
                .select('value')
                .eq('key', key)
                .maybeSingle();
                
              if (!fetchErr && remoteRow && remoteRow.value) {
                const remoteVal = remoteRow.value;
                if (Array.isArray(remoteVal)) {
                  // Merge remote array and local array to avoid losing any items from other phones
                  const mergedMap = new Map<string, any>();
                  for (const item of remoteVal) {
                    if (item && typeof item === "object") {
                      const id = item.id || item.code;
                      if (id) mergedMap.set(String(id), item);
                    }
                  }
                  
                  for (const item of localVal) {
                    if (item && typeof item === "object") {
                      const id = item.id || item.code;
                      if (id) {
                        const idStr = String(id);
                        if (!mergedMap.has(idStr)) {
                          mergedMap.set(idStr, item);
                        } else {
                          const existingItem = mergedMap.get(idStr);
                          const existingTime = existingItem.lastModified || 0;
                          const incomingTime = item.lastModified || 0;
                          
                          if (key === "gi_users") {
                            const useIncoming = incomingTime > existingTime;
                            const mergedUser = {
                              ...(useIncoming ? item : existingItem),
                              role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                              isBlocked: useIncoming ? (item.isBlocked !== undefined ? item.isBlocked : existingItem.isBlocked) : (existingItem.isBlocked !== undefined ? existingItem.isBlocked : item.isBlocked),
                              lastModified: Math.max(existingTime, incomingTime)
                            };
                            mergedMap.set(idStr, mergedUser);
                          } else {
                            if (incomingTime >= existingTime) {
                              mergedMap.set(idStr, item);
                            }
                          }
                        }
                      }
                    }
                  }
                  valToSave = Array.from(mergedMap.values());
                  storeData[key] = valToSave; // Keep server runtime cache completely unified!
                }
              }
            } catch (e) {
              console.error(`[SUPABASE MERGE ERROR] Failed to fetch and merge existing remote key "${key}":`, e);
            }
          }
          
          const { error } = await supabase.from('store').upsert({
            key: key,
            value: valToSave,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

          if (error) {
            // Quietly abort loop if the store table doesn't exist to prevent terminal noise
            if (error.message && error.message.includes('relation "store" does not exist')) {
              break;
            }
            console.error(`[SUPABASE ERROR] Failed to upsert key "${key}":`, error);
          }
        }
        console.log("[SUPABASE] Cloud database synced with local modifications.");
        saveStoreLocal(); // Reflux changes back to disk
      } catch (e) {
        console.error("[SUPABASE ERROR] Failed to upsert store changes to database table:", e);
      }
    });
  }

  function processAutomaticDailyInstallmentsServer(): void {
    const now = Date.now();
    let users = storeData["gi_users"] || [];
    let investments = storeData["gi_investments"] || [];
    let notifications = storeData["gi_notifications"] || [];
    let changed = false;

    investments = investments.map((inv: any) => {
      if (inv.status === 'completed') return inv;

      const createdTime = new Date(inv.createdAt).getTime();
      const msDiff = now - createdTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // Calculate how many 24-hour periods should have fully passed since purchase
      let expectedDays = Math.floor(msDiff / oneDayMs);
      if (expectedDays > inv.durationDays) {
        expectedDays = inv.durationDays;
      }

      // If more days should have processed than currently tracked
      if (expectedDays > inv.daysPassed) {
        const missingDays = expectedDays - inv.daysPassed;
        const totalPayout = inv.dailyReturn * missingDays;

        // Find and credit the investor
        const uIdx = users.findIndex((u: any) => u.id === inv.userId);
        if (uIdx !== -1) {
          users[uIdx].balance += totalPayout;
          users[uIdx].totalEarnings += totalPayout;
          
          // Add a notifications alert to show the automatic payout
          notifications.unshift({
            id: `not-autodrop-srv-${Date.now()}-${inv.id}-${inv.daysPassed}`,
            userId: inv.userId,
            title: `💰 Gain automatique reçu (${inv.productName})`,
            message: `Félicitations, votre gain quotidien de ${totalPayout.toLocaleString()} FCFA est tombé automatiquement à l'heure d'activation de votre plan VIP.`,
            type: 'plan',
            lastModified: Date.now(),
            createdAt: new Date().toISOString(),
            read: false
          });
        }

        inv.daysPassed = expectedDays;
        inv.totalReturnClaimed += totalPayout;
        inv.lastClaimDate = new Date().toISOString();
        inv.lastModified = Date.now();

        if (inv.daysPassed >= inv.durationDays) {
          inv.status = 'completed';
        }
        changed = true;
      }
      return inv;
    });

    if (changed) {
      storeData["gi_users"] = users;
      storeData["gi_investments"] = investments;
      storeData["gi_notifications"] = notifications;
      saveStore();
    }
  }

  // Load store on startup
  loadStore();

  function normalizePhoneNumber(whatsapp: string, countryName?: string): string {
    let clean = (whatsapp || '').replace(/\D/g, '');
    if (clean.length === 0) return '';
    
    const codes: Record<string, string> = {
      'cameroun': '237',
      'burkina': '226',
      'cote': '225',
      'côte': '225',
      'mali': '223',
      'togo': '228',
      'benin': '229',
      'bénin': '229',
    };

    const lookupCountry = (countryName || '').toLowerCase();
    let prefix = '';
    for (const key of Object.keys(codes)) {
      if (lookupCountry.includes(key)) {
        prefix = codes[key];
        break;
      }
    }

    const knownPrefixes = Object.values(codes);
    const startsWithKnownPrefix = knownPrefixes.some(p => clean.startsWith(p));

    if (startsWithKnownPrefix) {
      return clean;
    }

    if (prefix) {
      return prefix + clean;
    }

    return clean;
  }

  // API endpoints to synchronize state
  app.get("/api/admin-diagnostics", (req, res) => {
    try {
      const usersInMem = storeData["gi_users"] || [];
      let usersInFile: any[] = [];
      const exists = fs.existsSync(dbPath);
      if (exists) {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        const parsed = JSON.parse(fileContent);
        usersInFile = parsed["gi_users"] || [];
      }
      res.json({
        success: true,
        totalUsersInMem: usersInMem.length,
        totalUsersInFile: usersInFile.length,
        timestamp: Date.now(),
        dbPath,
        dbExists: exists
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/get-store", async (req, res) => {
    // Process automatic daily earnings on the server to stay fully up-to-date
    try {
      processAutomaticDailyInstallmentsServer();
    } catch (e) {
      console.error("[SERVER GET-STORE] Error processing automatic payouts:", e);
    }

    // Intercept and merge the latest records from Supabase to stay continuously synchronized real-time across devices
    if (supabase) {
      try {
        const { data, error } = await supabase.from('store').select('*');
        if (error) {
          if (!error.message || !error.message.includes('relation "store" does not exist')) {
            console.error("[SERVER GET-STORE] Supabase error:", error);
          }
        } else if (data && Array.isArray(data)) {
          const kvData: Record<string, any> = {};
          for (const item of data) {
            kvData[item.key] = item.value;
          }
          if (Object.keys(kvData).length > 0) {
            mergeData(kvData);
            saveStoreLocal();
          }
        }
      } catch (e) {
        console.error("[SERVER GET-STORE] Failed to pull latest state from Supabase:", e);
      }
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const users = storeData["gi_users"] || [];
    console.log(`[DEBUG GET-STORE] Requesting entire store. Total users in DB: ${users.length}`);

    const targetAccounts = users.filter((u: any) => u.whatsapp && (u.whatsapp.includes('70903319') || u.whatsapp.includes('70903318')));
    if (targetAccounts.length > 0) {
      console.log(`[DEBUG GET-STORE] Found ${targetAccounts.length} user(s) matching target phone numbers:`);
      targetAccounts.forEach((u: any) => {
        console.log(` -> ID: ${u.id}, Name: ${u.name}, WhatsApp: ${u.whatsapp}, Country: ${u.country}, Role: ${u.role}, Device: ${u.device || 'Inconnu'}`);
      });
    } else {
      console.log(`[DEBUG GET-STORE] No user with '70903319' or '70903318' exists in server memory yet.`);
    }

    res.json(storeData);
  });

  app.post("/api/save-store", (req, res) => {
    const body = req.body;
    if (body && typeof body === "object") {
      let modified = false;
      for (const key of Object.keys(body)) {
        const newVal = body[key];
        const oldVal = storeData[key];

        console.log(`[DEBUG SAVE-STORE] Client requested update for key: "${key}". Incoming value duration/type: ${Array.isArray(newVal) ? `Array of length ${newVal.length}` : typeof newVal}. Existing server value: ${Array.isArray(oldVal) ? `Array of length ${oldVal.length}` : typeof oldVal}.`);

        // Check if target accounts are in the incoming payload
        if (Array.isArray(newVal)) {
          const targetsInPayload = newVal.filter((u: any) => u && u.whatsapp && (u.whatsapp.includes('70903319') || u.whatsapp.includes('70903318')));
          if (targetsInPayload.length > 0) {
            console.log(`[DEBUG SAVE-STORE] WARNING: Incoming payload for "${key}" contains target phone accounts:`);
            targetsInPayload.forEach((u: any) => {
              console.log(` -> Payload User - ID: ${u.id}, Name: ${u.name}, WhatsApp: ${u.whatsapp}, LastModified: ${u.lastModified}`);
            });
          }
        }

        const shouldMerge = Array.isArray(newVal) && Array.isArray(oldVal) && key !== "gi_products" && key !== "gi_bonus_codes";
        if (shouldMerge) {
          // Merge arrays by ID or Code and choose the item with the higher lastModified
          const mergedMap = new Map<string, any>();
          
          // First populated with existing server data
          for (const item of oldVal) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) {
                mergedMap.set(String(id), item);
              }
            }
          }

          // Then merge incoming items
          for (const item of newVal) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) {
                const idStr = String(id);
                if (!mergedMap.has(idStr)) {
                  mergedMap.set(idStr, item);
                } else {
                  const existingItem = mergedMap.get(idStr);
                  const existingTime = existingItem.lastModified || 0;
                  const incomingTime = item.lastModified || 0;
                  
                  if (key === "gi_users") {
                    const useIncoming = incomingTime > existingTime;
                    const mergedUser = {
                      ...(useIncoming ? item : existingItem),
                      role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                      isBlocked: useIncoming ? (item.isBlocked !== undefined ? item.isBlocked : existingItem.isBlocked) : (existingItem.isBlocked !== undefined ? existingItem.isBlocked : item.isBlocked),
                      lastModified: Math.max(existingTime, incomingTime)
                    };
                    mergedMap.set(idStr, mergedUser);
                  } else {
                    if (incomingTime > existingTime) {
                      mergedMap.set(idStr, item);
                    }
                  }
                }
              }
            }
          }

          const mergedArray = Array.from(mergedMap.values());
          console.log(`[DEBUG SAVE-STORE] Merged key "${key}". Resulting length: ${mergedArray.length}`);
          
          // Double check if any target user got lost or kept in the merge
          const targetsInMerged = mergedArray.filter((u: any) => u && u.whatsapp && (u.whatsapp.includes('70903319') || u.whatsapp.includes('70903318')));
          if (targetsInMerged.length > 0) {
            console.log(`[DEBUG SAVE-STORE] Target users present in merged store output:`);
            targetsInMerged.forEach((u: any) => {
              console.log(` -> Merged User - ID: ${u.id}, Name: ${u.name}, WhatsApp: ${u.whatsapp}`);
            });
          } else if (key === 'gi_users') {
            console.log(`[DEBUG SAVE-STORE] No target users are present in the final merged array for "gi_users".`);
          }

          storeData[key] = mergedArray;
          modified = true;
        } else {
          // Overwrite primitives directly
          storeData[key] = newVal;
          modified = true;
        }
      }

      if (modified) {
        saveStore();
      }
    }
    res.json({ success: true });
  });

  // Centralized Registration API
  app.post("/api/register", (req, res) => {
    try {
      const data = req.body;
      if (!data || !data.name || !data.whatsapp) {
        console.log(`[DEBUG REGISTER] Rejected incoming request - name or whatsapp missing:`, data);
        return res.json({ success: false, message: 'Le nom et le numéro de téléphone WhatsApp sont requis.' });
      }

      console.log(`[DEBUG REGISTER] Incoming signup request. Name: "${data.name}", Phone: "${data.whatsapp}", Country: "${data.country || 'Cameroun'}", Sponsor: "${data.referredByCode || 'Aucun'}", Device: "${data.device || 'Inconnu'}"`);

      let users = storeData["gi_users"] || [];
      
      // Check duplication with normalized phone number matching
      const dataNorm = normalizePhoneNumber(data.whatsapp, data.country);
      const existing = users.find((u: any) => {
        if (u.whatsapp === data.whatsapp) return true;
        const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
        if (dataNorm && uNorm && dataNorm === uNorm) {
          return true;
        }
        return false;
      });

      const isTargetNumber = data.whatsapp.includes('70903318') || data.whatsapp.includes('70903319') || (dataNorm && (dataNorm.includes('70903318') || dataNorm.includes('70903319')));
      if (isTargetNumber) {
        console.log(`[DEBUG REGISTER] Processing TARGET phone number: ${data.whatsapp} (Normalized: ${dataNorm}). Collision registered with existing user?: ${!!existing}`);
        if (existing) {
          console.log(`[DEBUG REGISTER] Collision detail is: ID: ${existing.id}, Name: ${existing.name}, WhatsApp: ${existing.whatsapp}, Country: ${existing.country}`);
        }
      }

      if (existing) {
        console.log(`[DEBUG REGISTER] Registration failed for ${data.whatsapp} - user already exists.`);
        return res.json({ success: false, message: 'Ce numéro WhatsApp est déjà enregistré sur notre plateforme.' });
      }

      // Generate unique referral code
      const usernameClean = data.name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const referralCode = `${usernameClean || 'AGRO'}${randomSuffix}`;

      let refereeId: string | undefined = undefined;
      if (data.referredByCode && data.referredByCode.trim().length > 0) {
        const cleanInput = data.referredByCode.trim();
        const codeClean = cleanInput.toUpperCase();
        const digitsOnlyInput = cleanInput.replace(/\D/g, '');

        let referrerUser = users.find((u: any) => {
          if (u.referralCode && u.referralCode.toUpperCase() === codeClean) return true;
          if (u.id && u.id.toUpperCase() === codeClean) return true;
          const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
          const sponsorNorm = normalizePhoneNumber(cleanInput, u.country);
          if (uNorm && sponsorNorm && uNorm === sponsorNorm) return true;
          return false;
        });

        // If sponsor not found, create a placeholder/phantom sponsor directly on the central DB to ensure MLM tree alignment!
        if (!referrerUser) {
          const phantomId = `u-ref-${Math.floor(100000 + Math.random() * 900000)}`;
          const codePrefix = codeClean.replace(/[0-9]/g, '');
          const phantomName = codePrefix ? (codePrefix.charAt(0) + codePrefix.slice(1).toLowerCase() + ' (Parrain)') : 'Sponsor VIP';
          referrerUser = {
            id: phantomId,
            name: phantomName,
            whatsapp: digitsOnlyInput ? `+${digitsOnlyInput}` : `+23769${Math.floor(1000000 + Math.random() * 9000000)}`,
            password: 'user123',
            country: data.country || 'Cameroun',
            balance: 1000,
            dailyEarnings: 0,
            totalEarnings: 0,
            bonus: 200,
            referralCode: codeClean,
            referredBy: 'AGRO777',
            role: 'user',
            isBlocked: false,
            lastModified: Date.now(),
            createdAt: new Date().toISOString()
          };
          users.push(referrerUser);
        }
        refereeId = referrerUser.id;
      }

      const isWpAdmin = data.whatsapp.replace(/\D/g, '').endsWith('22670903319') || data.whatsapp.replace(/\D/g, '') === '70903319';

      const newUser = {
        id: `u-${Date.now()}`,
        name: data.name,
        whatsapp: data.whatsapp,
        password: data.password || 'user123',
        country: data.country || 'Cameroun',
        balance: 200, // 200 FCFA Welcome Signup bonus
        dailyEarnings: 0,
        totalEarnings: 0,
        bonus: 200,
        referralCode,
        referredBy: refereeId,
        role: isWpAdmin ? 'admin' : 'user',
        isBlocked: false,
        device: data.device || 'Ordinateur',
        lastModified: Date.now(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      storeData["gi_users"] = users;

      // Standard welcome notification
      let notifications = storeData["gi_notifications"] || [];
      notifications.unshift({
        id: `not-${Date.now()}`,
        userId: newUser.id,
        title: 'Bienvenue sur AgroCapital !',
        message: 'Félicitations pour votre inscription. Un bonus de bienvenue de 200 FCFA a été crédité sur votre compte.',
        type: 'bonus',
        createdAt: new Date().toISOString(),
        lastModified: Date.now(),
        read: false
      });

      if (refereeId) {
        notifications.unshift({
          id: `not-ref-${Date.now()}`,
          userId: refereeId,
          title: 'Nouveau parrainage',
          message: `${newUser.name} s'est inscrit en utilisant votre lien. Vous recevrez 20% de commission sur ses investissements !`,
          type: 'info',
          createdAt: new Date().toISOString(),
          lastModified: Date.now(),
          read: false
        });
      }
      storeData["gi_notifications"] = notifications;

      saveStore();
      res.json({ success: true, user: newUser, message: 'Inscription réussie.' });
    } catch (error: any) {
      console.error('Registration server error:', error);
      res.json({ success: false, message: 'Erreur interne lors de l\'inscription: ' + error.message });
    }
  });

  // Centralized Login API
  app.post("/api/login", (req, res) => {
    const { whatsapp, password } = req.body;
    let users = storeData["gi_users"] || [];
    
    const user = users.find((u: any) => {
      if (u.whatsapp === whatsapp) return true;
      const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
      const inputNorm = normalizePhoneNumber(whatsapp, u.country);
      if (uNorm && inputNorm && uNorm === inputNorm) {
        return true;
      }
      return false;
    });

    if (whatsapp && whatsapp.includes('70903319')) {
      console.log(`[DEBUG LOGIN] Attempting login for phone: ${whatsapp}. Match found?: ${!!user}`);
      if (user) {
        console.log(`[DEBUG LOGIN] Matched user ID: ${user.id}, Name: ${user.name}, WhatsApp: ${user.whatsapp}, Country: ${user.country}`);
      }
    }

    if (!user) {
      return res.json({ success: false, message: 'Aucun utilisateur trouvé avec ce numéro WhatsApp.' });
    }
    if (user.isBlocked) {
      return res.json({ success: false, message: 'Ce compte a été bloqué par l\'administrateur. Veuillez contacter le support.' });
    }
    const expectedPassword = user.password || (user.role === 'admin' ? 'admin' : 'user123');
    if (password === expectedPassword) {
      return res.json({ success: true, user, message: 'Connexion réussie.' });
    }
    return res.json({ success: false, message: 'Mot de passe incorrect.' });
  });

  // Centralized Product Purchase and MLM 3 levels split API
  app.post("/api/buy-product", (req, res) => {
    const { userId, productId } = req.body;
    let users = storeData["gi_users"] || [];
    let products = storeData["gi_products"] || [];
    let investments = storeData["gi_investments"] || [];
    let commissions = storeData["gi_commissions"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const targetProduct = products.find((p: any) => p.id === productId);
    if (!targetProduct) {
      return res.json({ success: false, message: 'Le produit d\'investissement sélectionné est introuvable.' });
    }
    if (targetProduct.isBlocked) {
      return res.json({ success: false, message: 'Ce plan d\'investissement VIP est temporairement bloqué ou suspendu par l\'administration.' });
    }

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx === -1) {
      return res.json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const user = users[uIdx];
    if (user.balance < targetProduct.price) {
      return res.json({ success: false, message: `Solde insuffisant. Vous devez avoir au moins ${targetProduct.price.toLocaleString()} FCFA.` });
    }

    user.balance -= targetProduct.price;
    user.dailyEarnings += targetProduct.dailyReturn;
    user.lastModified = Date.now();

    const newInvestment = {
      id: `inv-${Date.now()}`,
      userId,
      productId: targetProduct.id,
      productName: targetProduct.name,
      price: targetProduct.price,
      dailyReturn: targetProduct.dailyReturn,
      daysPassed: 0,
      durationDays: targetProduct.durationDays,
      totalReturnClaimed: 0,
      lastClaimDate: new Date().toISOString(),
      status: 'active',
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    investments.unshift(newInvestment);

    // Fetch live MLM Rates
    const mlmRates = {
      level1: Number(storeData["gi_mlm_level1_rate"] || 20),
      level2: Number(storeData["gi_mlm_level2_rate"] || 3),
      level3: Number(storeData["gi_mlm_level3_rate"] || 1),
    };

    if (user.referredBy) {
      const cleanInput = user.referredBy.trim();
      const refClean = cleanInput.toUpperCase();
      const digitsOnlyInput = cleanInput.replace(/\D/g, '');

      const parentUser = users.find((u: any) => {
        if (u.id.toUpperCase() === refClean) return true;
        if (u.referralCode && u.referralCode.toUpperCase() === refClean) return true;
        if (digitsOnlyInput.length >= 6 && u.whatsapp) {
          const uDigits = u.whatsapp.replace(/\D/g, '');
          if (uDigits.endsWith(digitsOnlyInput) || digitsOnlyInput.endsWith(uDigits)) return true;
        }
        return false;
      });

      if (parentUser) {
        const commAmtLvl1 = Math.round(targetProduct.price * (mlmRates.level1 / 100));
        parentUser.balance += commAmtLvl1;
        parentUser.bonus += commAmtLvl1;
        parentUser.lastModified = Date.now();

        commissions.unshift({
          id: `com-${Date.now()}-1`,
          userId: parentUser.id,
          fromUserName: user.name,
          level: 1,
          amount: commAmtLvl1,
          lastModified: Date.now(),
          createdAt: new Date().toISOString()
        });

        notifications.unshift({
          id: `not-com1-${Date.now()}`,
          userId: parentUser.id,
          title: 'Commission MLM reçue !',
          message: `Félicitations, vous avez perçu ${commAmtLvl1} FCFA (Niveau 1 : ${mlmRates.level1}%) car votre affilié ${user.name} a investi de l'argent dans le plan ${targetProduct.name}.`,
          type: 'bonus',
          lastModified: Date.now(),
          createdAt: new Date().toISOString(),
          read: false
        });

        // Level 2 MLM
        if (parentUser.referredBy) {
          const cleanInput2 = parentUser.referredBy.trim();
          const refClean2 = cleanInput2.toUpperCase();
          const digitsOnlyInput2 = cleanInput2.replace(/\D/g, '');

          const grandParentUser = users.find((u: any) => {
            if (u.id.toUpperCase() === refClean2) return true;
            if (u.referralCode && u.referralCode.toUpperCase() === refClean2) return true;
            if (digitsOnlyInput2.length >= 6 && u.whatsapp) {
              const uDigits = u.whatsapp.replace(/\D/g, '');
              if (uDigits.endsWith(digitsOnlyInput2) || digitsOnlyInput2.endsWith(uDigits)) return true;
            }
            return false;
          });

          if (grandParentUser) {
            const commAmtLvl2 = Math.round(targetProduct.price * (mlmRates.level2 / 100));
            grandParentUser.balance += commAmtLvl2;
            grandParentUser.bonus += commAmtLvl2;
            grandParentUser.lastModified = Date.now();

            commissions.unshift({
              id: `com-${Date.now()}-2`,
              userId: grandParentUser.id,
              fromUserName: user.name,
              level: 2,
              amount: commAmtLvl2,
              lastModified: Date.now(),
              createdAt: new Date().toISOString()
            });

            notifications.unshift({
              id: `not-com2-${Date.now()}`,
              userId: grandParentUser.id,
              title: 'Commission MLM Niveau 2 !',
              message: `Vous avez perçu ${commAmtLvl2} FCFA (Niveau 2 : ${mlmRates.level2}%) suite à l'investissement de ${user.name} (parrainé par ${parentUser.name}).`,
              type: 'bonus',
              lastModified: Date.now(),
              createdAt: new Date().toISOString(),
              read: false
            });

            // Level 3 MLM
            if (grandParentUser.referredBy) {
              const cleanInput3 = grandParentUser.referredBy.trim();
              const refClean3 = cleanInput3.toUpperCase();
              const digitsOnlyInput3 = cleanInput3.replace(/\D/g, '');

              const greatGrandParentUser = users.find((u: any) => {
                if (u.id.toUpperCase() === refClean3) return true;
                if (u.referralCode && u.referralCode.toUpperCase() === refClean3) return true;
                if (digitsOnlyInput3.length >= 6 && u.whatsapp) {
                  const uDigits = u.whatsapp.replace(/\D/g, '');
                  if (uDigits.endsWith(digitsOnlyInput3) || digitsOnlyInput3.endsWith(uDigits)) return true;
                }
                return false;
              });

              if (greatGrandParentUser) {
                const commAmtLvl3 = Math.round(targetProduct.price * (mlmRates.level3 / 100));
                greatGrandParentUser.balance += commAmtLvl3;
                greatGrandParentUser.bonus += commAmtLvl3;
                greatGrandParentUser.lastModified = Date.now();

                commissions.unshift({
                  id: `com-${Date.now()}-3`,
                  userId: greatGrandParentUser.id,
                  fromUserName: user.name,
                  level: 3,
                  amount: commAmtLvl3,
                  lastModified: Date.now(),
                  createdAt: new Date().toISOString()
                });

                notifications.unshift({
                  id: `not-com3-${Date.now()}`,
                  userId: greatGrandParentUser.id,
                  title: 'Commission MLM Niveau 3 !',
                  message: `Vous avez perçu ${commAmtLvl3} FCFA (Niveau 3 : ${mlmRates.level3}%) suite à l'investissement de ${user.name} (parrainé de façon indirecte par un membre de votre réseau).`,
                  type: 'bonus',
                  lastModified: Date.now(),
                  createdAt: new Date().toISOString(),
                  read: false
                });
              }
            }
          }
        }
      }
    }

    notifications.unshift({
      id: `not-plan-${Date.now()}`,
      userId,
      title: 'Plan activé avec succès !',
      message: `Votre investissement de ${targetProduct.price.toLocaleString()} FCFA dans le plan ${targetProduct.name} a bien été pris en compte. Vous gagnerez ${targetProduct.dailyReturn.toLocaleString()} FCFA chaque jour pendant ${targetProduct.durationDays} jours.`,
      type: 'plan',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_investments"] = investments;
    storeData["gi_commissions"] = commissions;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Vous avez investi avec succès dans le plan ${targetProduct.name} !`, user });
  });

  // Centralized Daily Loyalty Reward claim API
  app.post("/api/claim-daily", (req, res) => {
    const { userId } = req.body;
    let users = storeData["gi_users"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx === -1) {
      return res.json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const user = users[uIdx];
    const rewardAmt = 50; // Standard daily connection reward

    user.balance += rewardAmt;
    user.bonus += rewardAmt;
    user.lastModified = Date.now();

    notifications.unshift({
      id: `not-daily-${Date.now()}`,
      userId,
      title: 'Récompense journalière obtenue',
      message: `Félicitations ! Vous avez réclamé votre bonus quotidien de connexion gratuite de ${rewardAmt} FCFA.`,
      type: 'bonus',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Félicitations ! Vous avez reçu un bonus journalier de ${rewardAmt} FCFA !`, amount: rewardAmt, user });
  });

  // Centralized Harvest Dailydividends claim API
  app.post("/api/claim-investment", (req, res) => {
    const { userId, investmentId } = req.body;
    let users = storeData["gi_users"] || [];
    let investments = storeData["gi_investments"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const invIdx = investments.findIndex((inv: any) => inv.id === investmentId && inv.userId === userId);
    if (invIdx === -1) {
      return res.json({ success: false, message: 'Investissement introuvable.', amount: 0 });
    }

    const inv = investments[invIdx];
    if (inv.status === 'completed') {
      return res.json({ success: false, message: 'Cet investissement est déjà arrivé à terme.', amount: 0 });
    }

    const now = Date.now();
    const createdTime = new Date(inv.createdAt).getTime();
    const msDiff = now - createdTime;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Calculate how many 24-hour periods should have fully passed since purchase
    let expectedDays = Math.floor(msDiff / oneDayMs);
    if (expectedDays > inv.durationDays) {
      expectedDays = inv.durationDays;
    }

    if (inv.daysPassed >= expectedDays) {
      const nextClaimTime = createdTime + (inv.daysPassed + 1) * oneDayMs;
      const nextDateObj = new Date(nextClaimTime);
      const hourStr = nextDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = nextDateObj.toLocaleDateString('fr-FR');
      return res.json({ 
        success: false, 
        message: `Le prochain versement pour ce plan sera disponible le ${dateStr} à ${hourStr} (exactement 24 heures après la dernière récolte ou activation).`, 
        amount: 0 
      });
    }

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
      inv.lastModified = Date.now();
      saveStore();
      return res.json({ success: false, message: 'Ce plan est complété ! Tous les revenus ont été distribués.', amount: 0 });
    }

    inv.daysPassed += 1;
    inv.totalReturnClaimed += inv.dailyReturn;
    inv.lastClaimDate = new Date().toISOString();
    inv.lastModified = Date.now();

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
    }

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].balance += inv.dailyReturn;
      users[uIdx].totalEarnings += inv.dailyReturn;
      users[uIdx].lastModified = Date.now();
    }

    notifications.unshift({
      id: `not-claim-${Date.now()}`,
      userId,
      title: 'Rendement quotidien récolté',
      message: `Vous avez récolté votre dividende quotidien de ${inv.dailyReturn.toLocaleString()} FCFA sur le plan ${inv.productName}.`,
      type: 'plan',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_investments"] = investments;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Revenu journalier de +${inv.dailyReturn} FCFA encaissé avec succès !`, amount: inv.dailyReturn, user: users[uIdx] });
  });

  // Centralized Create Deposit API
  app.post("/api/create-deposit", (req, res) => {
    const { userId, amount, operator, reference, receiptImage } = req.body;
    let users = storeData["gi_users"] || [];
    let deposits = storeData["gi_deposits"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const uIdx = users.findIndex((u: any) => u.id === userId);
    const user = uIdx !== -1 ? users[uIdx] : null;

    const isAutomated = receiptImage === 'automated_westpay' || receiptImage === 'automated';

    const newDep = {
      id: `dep-${Date.now()}`,
      userId,
      userName: user ? user.name : 'Utilisateur',
      amount: Number(amount),
      operator: operator || 'WestPay Direct',
      reference,
      receiptImage,
      status: isAutomated ? 'approved' : 'pending',
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    deposits.unshift(newDep);

    if (isAutomated && user) {
      user.balance += Number(amount);
      user.lastModified = Date.now();
    }

    if (isAutomated) {
      notifications.unshift({
        id: `not-dep-wp-${Date.now()}`,
        userId,
        title: 'Dépôt Automatique WestPay',
        message: `Votre versement de ${Number(amount).toLocaleString()} FCFA via ${operator || 'WestPay'} (Réf: ${reference}) a été crédité instantanément et automatiquement à 100%.`,
        type: 'deposit',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    } else {
      notifications.unshift({
        id: `not-dep-${Date.now()}`,
        userId,
        title: 'Dépôt soumis',
        message: `Votre demande de dépôt de ${Number(amount).toLocaleString()} FCFA via ${operator} (Réf: ${reference}) est en cours de vérification par l'administration.`,
        type: 'deposit',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    storeData["gi_deposits"] = deposits;
    storeData["gi_notifications"] = notifications;
    storeData["gi_users"] = users;

    saveStore();
    res.json({ success: true, deposit: newDep, user: user || undefined });
  });

  // Centralized Create Withdrawal API
  app.post("/api/create-withdrawal", (req, res) => {
    const { userId, amount, operator, number } = req.body;
    let users = storeData["gi_users"] || [];
    let withdrawals = storeData["gi_withdrawals"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx === -1) {
      return res.json({ success: false, error: 'Utilisateur non trouvé.' });
    }

    const user = users[uIdx];
    if (amount < 1000) {
      return res.json({ success: false, error: 'Le montant de retrait minimum est de 1 000 F.' });
    }
    if (user.balance < amount) {
      return res.json({ success: false, error: 'Solde insuffisant pour effectuer ce retrait.' });
    }

    user.balance -= amount;
    user.lastModified = Date.now();

    const fee = Math.round(amount * 0.12);
    const netAmount = amount - fee;

    const newWth = {
      id: `wth-${Date.now()}`,
      userId,
      userName: user.name,
      amount,
      operator,
      number,
      status: 'pending',
      fee,
      netAmount,
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    withdrawals.unshift(newWth);

    notifications.unshift({
      id: `not-wth-${Date.now()}`,
      userId,
      title: 'Retrait en attente',
      message: `Votre demande de retrait de ${amount.toLocaleString()} FCFA vers ${number} (${operator}) est en attente de traitement par la comptabilité.`,
      type: 'withdraw',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_withdrawals"] = withdrawals;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, withdrawal: newWth, user });
  });

  // Centralized Apply Promo Bonus Code API
  app.post("/api/apply-bonus", (req, res) => {
    const { userId, codeString } = req.body;
    const cleanCode = codeString.toUpperCase().trim();
    let users = storeData["gi_users"] || [];
    let bonusCodes = storeData["gi_bonus_codes"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const target = bonusCodes.find((b: any) => b.code.toUpperCase() === cleanCode);
    if (!target) {
      return res.json({ success: false, message: 'Code bonus invalide ou expiré.' });
    }
    if (target.usedCount >= target.maxUses) {
      return res.json({ success: false, message: 'Ce code bonus a déjà atteint sa limite maximale d\'utilisations.' });
    }
    if (target.usedByUsers.includes(userId)) {
      return res.json({ success: false, message: 'Vous avez déjà réclamé ce code bonus.' });
    }

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx === -1) {
      return res.json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const user = users[uIdx];
    user.balance += target.amount;
    user.bonus += target.amount;
    user.lastModified = Date.now();

    target.usedCount += 1;
    target.usedByUsers.push(userId);
    target.lastModified = Date.now();

    notifications.unshift({
      id: `not-code-${Date.now()}`,
      userId,
      title: 'Code promotionnel activé',
      message: `Félicitations ! Le code "${cleanCode}" a été validé. Votre compte a été crédité de ${target.amount.toLocaleString()} FCFA de bonus.`,
      type: 'bonus',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_bonus_codes"] = bonusCodes;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Succès ! Le code bonus a été appliqué avec succès. +${target.amount.toLocaleString()} FCFA !`, user });
  });

  // Support Msg API
  app.post("/api/send-message", (req, res) => {
    const { userId, message, sender } = req.body;
    let msgs = storeData["gi_support_messages"] || [];
    const newMsg = {
      id: `msg-${Date.now()}`,
      userId,
      sender,
      message,
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    msgs.push(newMsg);
    storeData["gi_support_messages"] = msgs;
    saveStore();
    res.json({ success: true, message: newMsg });
  });

  // Admin Account controls
  app.post("/api/admin/deposit-action", (req, res) => {
    const { depositId, action } = req.body; // 'approve' or 'reject'
    let deposits = storeData["gi_deposits"] || [];
    let users = storeData["gi_users"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const idx = deposits.findIndex((d: any) => d.id === depositId);
    if (idx === -1 || deposits[idx].status !== 'pending') {
      return res.json({ success: false, message: 'Dépôt introuvable ou déjà traité.' });
    }

    if (action === 'approve') {
      deposits[idx].status = 'approved';
      const uIdx = users.findIndex((u: any) => u.id === deposits[idx].userId);
      if (uIdx !== -1) {
        users[uIdx].balance += deposits[idx].amount;
        users[uIdx].lastModified = Date.now();
      }
      notifications.unshift({
        id: `not-dep-app-${Date.now()}`,
        userId: deposits[idx].userId,
        title: '💵 Dépôt validé !',
        message: `Votre versement de ${deposits[idx].amount.toLocaleString()} FCFA via ${deposits[idx].operator} a été approuvé. Votre solde principal a été rechargé.`,
        type: 'deposit',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    } else {
      deposits[idx].status = 'rejected';
      notifications.unshift({
        id: `not-dep-rej-${Date.now()}`,
        userId: deposits[idx].userId,
        title: '⚠️ Dépôt rejeté',
        message: `Votre demande de dépôt de ${deposits[idx].amount.toLocaleString()} FCFA a été refusée suite à une anomalie de référence ou de capture d'écran de paiement. Contactez le service client.`,
        type: 'deposit',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    deposits[idx].lastModified = Date.now();
    storeData["gi_deposits"] = deposits;
    storeData["gi_users"] = users;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/withdrawal-action", (req, res) => {
    const { withdrawalId, action } = req.body; // 'approve' or 'reject'
    let withdrawals = storeData["gi_withdrawals"] || [];
    let users = storeData["gi_users"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const idx = withdrawals.findIndex((w: any) => w.id === withdrawalId);
    if (idx === -1 || withdrawals[idx].status !== 'pending') {
      return res.json({ success: false, message: 'Retrait introuvable ou déjà traité.' });
    }

    if (action === 'approve') {
      withdrawals[idx].status = 'approved';
      notifications.unshift({
        id: `not-wth-app-${Date.now()}`,
        userId: withdrawals[idx].userId,
        title: '💸 Retrait envoyé !',
        message: `Félicitations, votre retrait de ${withdrawals[idx].amount.toLocaleString()} FCFA sur le numéro ${withdrawals[idx].number} (${withdrawals[idx].operator}) a été validé et expédié avec succès.`,
        type: 'withdraw',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    } else {
      withdrawals[idx].status = 'rejected';
      const uIdx = users.findIndex((u: any) => u.id === withdrawals[idx].userId);
      if (uIdx !== -1) {
        users[uIdx].balance += withdrawals[idx].amount;
        users[uIdx].lastModified = Date.now();
      }
      notifications.unshift({
        id: `not-wth-rej-${Date.now()}`,
        userId: withdrawals[idx].userId,
        title: '❌ Retrait rejeté',
        message: `Votre retrait de ${withdrawals[idx].amount.toLocaleString()} FCFA a été refusé. Les fonds ont été intégralement restitués à votre solde principal.`,
        type: 'withdraw',
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    withdrawals[idx].lastModified = Date.now();
    storeData["gi_withdrawals"] = withdrawals;
    storeData["gi_users"] = users;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/update-user", (req, res) => {
    const { userId, balance, bonus, role, password, referredBy, withdrawBlocked } = req.body;
    let users = storeData["gi_users"] || [];
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].balance = balance;
      users[idx].bonus = bonus;
      users[idx].role = role;
      if (withdrawBlocked !== undefined) {
        users[idx].withdrawBlocked = withdrawBlocked;
      }
      if (password && password.trim() !== '') {
        users[idx].password = password;
      }
      if (referredBy !== undefined) {
        if (referredBy === null || referredBy.trim() === '') {
          users[idx].referredBy = undefined;
        } else {
          const cleanRef = referredBy.trim();
          const cleanRefUpper = cleanRef.toUpperCase();
          const refDigits = cleanRef.replace(/\D/g, '');
          
          const matchedSponsor = users.find((u: any) => {
            if (u.id.toUpperCase() === cleanRefUpper) return true;
            if (u.referralCode && u.referralCode.toUpperCase() === cleanRefUpper) return true;
            if (refDigits.length >= 6 && u.whatsapp) {
              const uDigits = u.whatsapp.replace(/\D/g, '');
              if (uDigits.endsWith(refDigits) || refDigits.endsWith(uDigits)) return true;
            }
            return false;
          });
          users[idx].referredBy = matchedSponsor ? matchedSponsor.id : cleanRef;
        }
      }
      users[idx].lastModified = Date.now();
      saveStore();
      res.json({ success: true, user: users[idx] });
    } else {
      res.status(404).json({ error: 'Utilisateur introuvable' });
    }
  });

  app.post("/api/admin/block-user", (req, res) => {
    const { userId, isBlocked } = req.body;
    let users = storeData["gi_users"] || [];
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      users[idx].isBlocked = isBlocked;
      users[idx].lastModified = Date.now();
      saveStore();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Utilisateur introuvable' });
    }
  });

  app.post("/api/admin/delete-user", (req, res) => {
    const { userId } = req.body;
    let users = storeData["gi_users"] || [];
    storeData["gi_users"] = users.filter((u: any) => u.id !== userId);
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/update-mlm", (req, res) => {
    const { level1, level2, level3 } = req.body;
    storeData["gi_mlm_level1_rate"] = level1;
    storeData["gi_mlm_level2_rate"] = level2;
    storeData["gi_mlm_level3_rate"] = level3;
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/update-withdraw-block", (req, res) => {
    const { blocked } = req.body;
    storeData["gi_withdrawals_blocked_global"] = blocked;
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/create-bonus", (req, res) => {
    const { code, amount, maxUses } = req.body;
    let list = storeData["gi_bonus_codes"] || [];
    list.unshift({
      code: code.trim().toUpperCase(),
      amount,
      maxUses,
      usedCount: 0,
      usedByUsers: [],
      lastModified: Date.now()
    });
    storeData["gi_bonus_codes"] = list;
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/global-notification", (req, res) => {
    const { title, message } = req.body;
    let notifications = storeData["gi_notifications"] || [];
    notifications.unshift({
      id: `not-glob-${Date.now()}`,
      title,
      message,
      type: 'info',
      createdAt: new Date().toISOString(),
      lastModified: Date.now(),
      read: false
    });
    storeData["gi_notifications"] = notifications;
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/product/create", (req, res) => {
    const p = req.body;
    let list = storeData["gi_products"] || [];
    const id = `vip-${Date.now()}`;
    list.push({
      id,
      vipLevel: p.vipLevel || list.length + 1,
      name: p.name || 'Nouveau Produit VIP',
      price: p.price || 5000,
      dailyReturn: p.dailyReturn || 1000,
      durationDays: p.durationDays || 10,
      totalReturn: (p.dailyReturn || 1000) * (p.durationDays || 10),
      tag: p.tag || 'Special Offer',
      lastModified: Date.now()
    });
    storeData["gi_products"] = list;
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/product/delete", (req, res) => {
    const { productId } = req.body;
    let list = storeData["gi_products"] || [];
    storeData["gi_products"] = list.filter((p: any) => p.id !== productId);
    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/product/update", (req, res) => {
    const { productId, updatedP } = req.body;
    let list = storeData["gi_products"] || [];
    const idx = list.findIndex((p: any) => p.id === productId);
    if (idx !== -1) {
      const current = list[idx];
      const daily = updatedP.dailyReturn !== undefined ? updatedP.dailyReturn : current.dailyReturn;
      const days = updatedP.durationDays !== undefined ? updatedP.durationDays : current.durationDays;
      list[idx] = {
        ...current,
        ...updatedP,
        totalReturn: daily * days,
        lastModified: Date.now()
      };
      saveStore();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Produit introuvable' });
    }
  });

  app.post("/api/admin/product/toggle-block", (req, res) => {
    const { productId, isBlocked, reopenDateTime } = req.body;
    let list = storeData["gi_products"] || [];
    const idx = list.findIndex((p: any) => p.id === productId);
    if (idx !== -1) {
      list[idx].isBlocked = isBlocked;
      list[idx].reopenDateTime = isBlocked ? (reopenDateTime || undefined) : undefined;
      list[idx].lastModified = Date.now();
      saveStore();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Produit introuvable' });
    }
  });

  // API endpoints to synchronize state

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development, static fallback for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
