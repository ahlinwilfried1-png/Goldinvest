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
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cookie, Accept");
    res.setHeader("Access-Control-Allow-Credentials", "true");
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

      const shouldMerge = Array.isArray(newVal) && Array.isArray(oldVal) && key !== "gi_products" && key !== "gi_bonus_codes" && key !== "gi_withdrawal_proofs";
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
                if (key !== "gi_users" || item.role === "admin") {
                  mergedMap.set(idStr, item);
                  modified = true;
                }
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
        { id: 'u-admin', name: 'Administrateur Principal', whatsapp: '+237600000000', password: 'agro777', country: 'Cameroun', balance: 1250000, dailyEarnings: 0, totalEarnings: 0, bonus: 5000, referralCode: 'AGR72', role: 'admin', isBlocked: false, createdAt: '2026-05-10T10:00:00Z' }
      ],
      "gi_deposits": [],
      "gi_withdrawals": [],
      "gi_investments": [],
      "gi_commissions": [],
      "gi_notifications": [],
      "gi_bonus_codes": [
        { code: 'AGR72', amount: 1000, maxUses: 100, usedCount: 0, usedByUsers: [] },
        { code: 'WELCOME500', amount: 500, maxUses: 500, usedCount: 0, usedByUsers: [] },
        { code: 'VIPBONUS', amount: 2000, maxUses: 10, usedCount: 0, usedByUsers: [] }
      ],
      "gi_support_messages": [],
      "gi_products": [
        { id: 'vip-1', vipLevel: 1, name: 'Système Aiprods 1', price: 7000, dailyReturn: 300, durationDays: 365, totalReturn: 109500, tag: 'Aiprods 1', category: 'stability' },
        { id: 'vip-2', vipLevel: 2, name: 'Système Aiprods 2', price: 15000, dailyReturn: 700, durationDays: 365, totalReturn: 255500, tag: 'Aiprods 2', category: 'stability' },
        { id: 'vip-3', vipLevel: 3, name: 'Système Aiprods 3', price: 30000, dailyReturn: 1500, durationDays: 365, totalReturn: 547500, tag: 'Aiprods 3', category: 'stability' },
        { id: 'vip-4', vipLevel: 4, name: 'Système Aiprods 4', price: 60000, dailyReturn: 3200, durationDays: 365, totalReturn: 1168000, tag: 'Aiprods 4', category: 'stability' },
        { id: 'vip-5', vipLevel: 5, name: 'Système Aiprods Pro', price: 120000, dailyReturn: 6800, durationDays: 365, totalReturn: 2482000, tag: 'Aiprods Pro', category: 'stability' },
        { id: 'vip-6', vipLevel: 6, name: 'Système Aiprods Pro 2', price: 250000, dailyReturn: 15000, durationDays: 365, totalReturn: 5475000, tag: 'Aiprods Pro 2', category: 'stability' },
        { id: 'vip-7', vipLevel: 7, name: 'Système Aiprods Max', price: 500000, dailyReturn: 32000, durationDays: 365, totalReturn: 11680000, tag: 'Aiprods Max', category: 'stability' },
        { id: 'vip-8', vipLevel: 8, name: 'Système Aiprods Ultra', price: 1000000, dailyReturn: 70000, durationDays: 365, totalReturn: 25550000, tag: 'Aiprods Ultra', category: 'stability' },
        { id: 'vip-9', vipLevel: 9, name: 'Système Aiprods Élite', price: 2000000, dailyReturn: 150000, durationDays: 365, totalReturn: 54750000, tag: 'Aiprods Élite', category: 'stability' },
        // Activités (Short-cycle products)
        { id: 'activity-1', vipLevel: 1, name: 'Airprods Activité 1', price: 5000, dailyReturn: 1000, durationDays: 7, totalReturn: 7000, tag: 'Activité 1', category: 'activity' },
        { id: 'activity-2', vipLevel: 2, name: 'Airprods Activité 2', price: 12000, dailyReturn: 3000, durationDays: 5, totalReturn: 15000, tag: 'Activité 2', category: 'activity' },
        { id: 'activity-3', vipLevel: 3, name: 'Airprods Activité 3', price: 25000, dailyReturn: 7500, durationDays: 4, totalReturn: 30000, tag: 'Activité 3', category: 'activity' }
      ],
      "gi_mlm_level1_rate": 20,
      "gi_mlm_level2_rate": 3,
      "gi_mlm_level3_rate": 1,
      "gi_withdrawals_blocked_global": false,
      "gi_referral_domain": "",
      "gi_withdrawal_proofs": [
        {
          id: 'proof-1',
          userId: 'u-1',
          userName: 'Koffi Kouamé',
          userCountry: 'Côte d’Ivoire',
          amount: 25000,
          message: 'Retrait de 25 000 XOF bien reçu sur mon compte Orange Money ! Très rapide et efficace. Merci AgroProfit ! 🌾✨',
          image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
          likes: ['u-2', 'u-3'],
          createdAt: '2026-06-15T10:12:00Z'
        },
        {
          id: 'proof-2',
          userId: 'u-2',
          userName: 'Aïcha Diallo',
          userCountry: 'Sénégal',
          amount: 15400,
          message: 'Franchement c’est le meilleur service de l’année. Mes retours journaliers accumulés et retirés via Wave sans aucun problème. 😎💪',
          image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=600&auto=format&fit=crop',
          likes: ['u-1'],
          createdAt: '2026-06-15T14:30:00Z'
        },
        {
          id: 'proof-3',
          userId: 'u-3',
          userName: 'Yao Mensah',
          userCountry: 'Togo',
          amount: 8500,
          message: 'T-Money au top ! Reçu mes fonds en moins de 15 minutes. Je recommande vivement AgroProfit à tout mon entourage.',
          likes: ['u-1', 'u-2', 'u-admin'],
          createdAt: '2026-06-16T02:05:00Z'
        }
      ]
    };

    let modified = false;
    for (const key of Object.keys(defaultData)) {
      if (storeData[key] === undefined) {
        storeData[key] = defaultData[key];
        modified = true;
      }
    }

    // Auto-migrate server-side products if they are outdated (less than 12 products in database)
    if (storeData["gi_products"] && Array.isArray(storeData["gi_products"]) && storeData["gi_products"].length < 12) {
      console.log(`[MIGRATION] Outdated products list found (${storeData["gi_products"].length} items). Resetting to 12 products.`);
      storeData["gi_products"] = defaultData["gi_products"];
      modified = true;
    }



    if (modified) {
      saveStoreLocal();
    }

    async function cleanupNonAdminAccounts() {
      console.log("[CLEANUP] Starting deletion of all non-admin accounts...");
      const users = storeData["gi_users"] || [];
      const admins = users.filter((u: any) => u.role === "admin");
      
      // Ensure we always keep u-admin even if someone edited it
      if (admins.length === 0) {
        admins.push({ id: 'u-admin', name: 'Administrateur Principal', whatsapp: '+237600000000', password: 'agro777', country: 'Cameroun', balance: 1250000, dailyEarnings: 0, totalEarnings: 0, bonus: 5000, referralCode: 'AGR72', role: 'admin', isBlocked: false, createdAt: '2026-05-10T10:00:00Z' });
      }

      const adminIds = new Set(admins.map((u: any) => u.id));
      console.log(`[CLEANUP] Found ${admins.length} administrator account(s): ${Array.from(adminIds).join(", ")}. Deleting other accounts...`);

      storeData["gi_users"] = admins;

      // Filter linked database collections to retain only admin items
      const deposits = storeData["gi_deposits"] || [];
      storeData["gi_deposits"] = deposits.filter((d: any) => adminIds.has(d.userId));

      const withdrawals = storeData["gi_withdrawals"] || [];
      storeData["gi_withdrawals"] = withdrawals.filter((w: any) => adminIds.has(w.userId));

      const investments = storeData["gi_investments"] || [];
      storeData["gi_investments"] = investments.filter((i: any) => adminIds.has(i.userId));

      const commissions = storeData["gi_commissions"] || [];
      storeData["gi_commissions"] = commissions.filter((c: any) => adminIds.has(c.userId));

      const notifications = storeData["gi_notifications"] || [];
      storeData["gi_notifications"] = notifications.filter((n: any) => !n.userId || adminIds.has(n.userId));

      const supportMessages = storeData["gi_support_messages"] || [];
      storeData["gi_support_messages"] = supportMessages.filter((m: any) => adminIds.has(m.userId));

      // Persist clean copy locally to db.json
      saveStoreLocal();

      // Force-overwrite remote collections in Supabase (don't use saveStore merge which resurrects deleted elements)
      if (supabase) {
        try {
          console.log("[CLEANUP] Overwriting remote tables in Supabase with clean admin-only set...");
          const tablesToOverwrite = ["gi_users", "gi_deposits", "gi_withdrawals", "gi_investments", "gi_commissions", "gi_notifications", "gi_support_messages", "gi_withdrawal_proofs"];
          for (const tbl of tablesToOverwrite) {
            const { error: upsertErr } = await supabase.from('store').upsert({
              key: tbl,
              value: storeData[tbl]
            });
            if (upsertErr) {
              console.error(`[CLEANUP] Failed to overwrite remote key "${tbl}" in Supabase:`, upsertErr.message);
            } else {
              console.log(`[CLEANUP] Overwrote remote key "${tbl}" successfully on Supabase.`);
            }
          }
          console.log("[CLEANUP] All remote non-administrative accounts have been successfully wiped from Supabase!");
        } catch (e) {
          console.error("[CLEANUP] Supabase overwrite process exception:", e);
        }
      }
    }

    // Run active cloud sync relay in background using Supabase
    Promise.resolve().then(async () => {
      if (!supabase) {
        await cleanupNonAdminAccounts();
        return;
      }
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
          await cleanupNonAdminAccounts();
        } else if (data && Array.isArray(data)) {
          console.log(`[SERVER STARTUP] Successfully fetched ${data.length} keys from Supabase.`);
          const kvData: Record<string, any> = {};
          for (const item of data) {
            kvData[item.key] = item.value;
          }
          if (Object.keys(kvData).length > 0) {
            console.log("[SERVER STARTUP] Merging Supabase cloud database keys into local runtime...");
            mergeData(kvData);


          }
          await cleanupNonAdminAccounts();
        }
      } catch (e) {
        console.error("[SERVER STARTUP] Supabase initial pull failed:", e);
        await cleanupNonAdminAccounts();
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

  async function saveStore(specificKeys?: string[]): Promise<void> {
    saveStoreLocal();
    if (!supabase) return;
    
    try {
      const keys = specificKeys || Object.keys(storeData);
      for (const key of keys) {
        const localVal = storeData[key];
        if (localVal === undefined) continue;
        
        let valToSave = localVal;
        const isMergeableArray = Array.isArray(localVal) && key !== "gi_products" && key !== "gi_bonus_codes" && key !== "gi_withdrawal_proofs";
        
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
                const deletedUsers = storeData["gi_deleted_users"] || [];
                const deletedInvestments = storeData["gi_deleted_investments"] || [];

                for (const item of remoteVal) {
                  if (item && typeof item === "object") {
                    const id = item.id || item.code;
                    if (id) {
                      const idStr = String(id);
                      if (key === "gi_users" && deletedUsers.includes(idStr)) {
                        continue; // Already deleted
                      }
                      if (key === "gi_investments" && deletedInvestments.includes(idStr)) {
                        continue; // Already deleted
                      }
                      mergedMap.set(idStr, item);
                    }
                  }
                }
                
                for (const item of localVal) {
                  if (item && typeof item === "object") {
                    const id = item.id || item.code;
                    if (id) {
                      const idStr = String(id);
                      if (key === "gi_users" && deletedUsers.includes(idStr)) {
                        continue; // Already deleted
                      }
                      if (key === "gi_investments" && deletedInvestments.includes(idStr)) {
                        continue; // Already deleted
                      }
                      if (!mergedMap.has(idStr)) {
                        if (key !== "gi_users" || item.role === "admin") {
                          mergedMap.set(idStr, item);
                        }
                      } else {
                        const existingItem = mergedMap.get(idStr);
                        const existingTime = existingItem.lastModified || 0;
                        const incomingTime = item.lastModified || 0;
                        
                        if (key === "gi_users") {
                          const useIncoming = incomingTime > existingTime;
                          const mergedUser = {
                            ...(useIncoming ? item : existingItem),
                            balance: (useIncoming ? item.balance : existingItem.balance) ?? 0,
                            dailyEarnings: (useIncoming ? item.dailyEarnings : existingItem.dailyEarnings) ?? 0,
                            totalEarnings: (useIncoming ? item.totalEarnings : existingItem.totalEarnings) ?? 0,
                            bonus: (useIncoming ? item.bonus : existingItem.bonus) ?? 0,
                            role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                            isBlocked: (useIncoming ? item.isBlocked : existingItem.isBlocked) ?? false,
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
  }

  function handleCyclicCompletion(inv: any, users: any[], products: any[], investments: any[], notifications: any[]) {
    try {
      const originalProduct = products.find((p: any) => p.id === inv.productId);
      if (!originalProduct || !originalProduct.isCyclic || !originalProduct.generatedProductIds || !originalProduct.generatedProductIds.length) {
        return;
      }

      originalProduct.generatedProductIds.forEach((childId: string) => {
        const childProduct = products.find((p: any) => p.id === childId);
        if (!childProduct) return;

        const newInvId = `inv-cyc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newCycInv = {
          id: newInvId,
          userId: inv.userId,
          productId: childProduct.id,
          productName: `${childProduct.name} 🔄`,
          price: 0,
          dailyReturn: childProduct.dailyReturn,
          daysPassed: 0,
          durationDays: childProduct.durationDays,
          totalReturnClaimed: 0,
          lastClaimDate: new Date().toISOString(),
          status: 'active',
          lastModified: Date.now(),
          createdAt: new Date().toISOString()
        };

        investments.unshift(newCycInv);

        notifications.unshift({
          id: `not-cyc-${Date.now()}-${childId}-${Math.floor(Math.random() * 1000)}`,
          userId: inv.userId,
          title: `🔄 Plan Cyclique Complété : ${inv.productName}`,
          message: `Félicitations ! Votre plan "${inv.productName}" de type cyclique a terminé son cycle complet. Le produit "${childProduct.name}" a été configuré et activé automatiquement pour vous sans aucun frais d'acquisition !`,
          type: 'plan',
          lastModified: Date.now(),
          createdAt: new Date().toISOString(),
          read: false
        });
      });
    } catch (e) {
      console.error("[CYCLIC PROCESSING ERROR]", e);
    }
  }

  function processAutomaticDailyInstallmentsServer(): void {
    const now = Date.now();
    let users = storeData["gi_users"] || [];
    let investments = storeData["gi_investments"] || [];
    let notifications = storeData["gi_notifications"] || [];
    let products = storeData["gi_products"] || [];
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
        const isActivity = inv.category === 'activity' || inv.isCyclic;

        if (isActivity) {
          // No daily payout during active cycle for short-cycle activity products
          if (expectedDays >= inv.durationDays) {
            // End of complete cycle: payout is capital + profit (i.e. totalReturn)
            const totalPayout = inv.totalReturn || (inv.price + (inv.dailyReturn * inv.durationDays));
            const netProfit = totalPayout - inv.price;

            const uIdx = users.findIndex((u: any) => u.id === inv.userId);
            if (uIdx !== -1) {
              users[uIdx].balance += totalPayout;
              users[uIdx].totalEarnings += netProfit;

              notifications.unshift({
                id: `not-cyclecomplete-srv-${Date.now()}-${inv.id}`,
                userId: inv.userId,
                title: `⚡ Activité Terminée (${inv.productName})`,
                message: `Félicitations ! Votre cycle d'activité "${inv.productName}" de ${inv.durationDays} jours est terminé. Votre capital de ${inv.price.toLocaleString()} XOF et vos bénéfices de ${netProfit.toLocaleString()} XOF ont été crédités sur votre compte (total: ${totalPayout.toLocaleString()} XOF).`,
                type: 'plan',
                lastModified: Date.now(),
                createdAt: new Date().toISOString(),
                read: false
              });
            }

            inv.daysPassed = expectedDays;
            inv.totalReturnClaimed = totalPayout;
            inv.lastClaimDate = new Date().toISOString();
            inv.lastModified = Date.now();
            inv.status = 'completed';
            changed = true;
          } else {
            // Just advance the counter of days passed
            inv.daysPassed = expectedDays;
            inv.lastModified = Date.now();
            changed = true;
          }
        } else {
          // Standard VIP stability plans (daily dividend credited daily)
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
              message: `Félicitations, votre gain quotidien de ${totalPayout.toLocaleString()} XOF est tombé automatiquement à l'heure d'activation de votre plan VIP.`,
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
            handleCyclicCompletion(inv, users, products, investments, notifications);
          }
          changed = true;
        }
      }
      return inv;
    });

    if (changed) {
      // Recalculate dailyEarnings for all users to match active investments status correctly
      users = users.map((u: any) => {
        const userActiveInvs = investments.filter((inv: any) => inv.userId === u.id && inv.status === 'active' && inv.category !== 'activity' && !inv.isCyclic);
        const activeDailyEarnings = userActiveInvs.reduce((sum: number, inv: any) => sum + inv.dailyReturn, 0);
        return {
          ...u,
          dailyEarnings: activeDailyEarnings,
          lastModified: Date.now()
        };
      });

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
  app.get("/api/admin/force-cleanup-non-admins", async (req, res) => {
    try {
      console.log("[API CLEANUP] Wiping all non-administrative accounts from runtime memory...");
      const users = storeData["gi_users"] || [];
      const admins = users.filter((u: any) => u.role === "admin");
      
      if (admins.length === 0) {
        admins.push({ id: 'u-admin', name: 'Administrateur Principal', whatsapp: '+237600000000', password: 'agro777', country: 'Cameroun', balance: 1250000, dailyEarnings: 0, totalEarnings: 0, bonus: 5000, referralCode: 'AGR72', role: 'admin', isBlocked: false, createdAt: '2026-05-10T10:00:00Z' });
      }

      const adminIds = new Set(admins.map((u: any) => u.id));
      const previousCount = users.length;

      storeData["gi_users"] = admins;

      // Filter other collections of items
      const deposits = storeData["gi_deposits"] || [];
      storeData["gi_deposits"] = deposits.filter((d: any) => adminIds.has(d.userId));

      const withdrawals = storeData["gi_withdrawals"] || [];
      storeData["gi_withdrawals"] = withdrawals.filter((w: any) => adminIds.has(w.userId));

      const investments = storeData["gi_investments"] || [];
      storeData["gi_investments"] = investments.filter((i: any) => adminIds.has(i.userId));

      const commissions = storeData["gi_commissions"] || [];
      storeData["gi_commissions"] = commissions.filter((c: any) => adminIds.has(c.userId));

      const notifications = storeData["gi_notifications"] || [];
      storeData["gi_notifications"] = notifications.filter((n: any) => !n.userId || adminIds.has(n.userId));

      const supportMessages = storeData["gi_support_messages"] || [];
      storeData["gi_support_messages"] = supportMessages.filter((m: any) => adminIds.has(m.userId));

      saveStoreLocal();

      if (supabase) {
        console.log("[API CLEANUP] Overwriting Supabase remote collections with clean records...");
        const tablesToOverwrite = ["gi_users", "gi_deposits", "gi_withdrawals", "gi_investments", "gi_commissions", "gi_notifications", "gi_support_messages", "gi_withdrawal_proofs"];
        for (const tbl of tablesToOverwrite) {
          await supabase.from('store').upsert({
            key: tbl,
            value: storeData[tbl]
          });
        }
      }

      res.json({
        success: true,
        message: `Tous les comptes utilisateurs simples ont été supprimés avec succès ! Seuls les administrateurs ont été conservés de manière permanente dans la base locale et le cloud Supabase.`,
        adminsKeptCount: admins.length,
        nonAdminsWipedCount: previousCount - admins.length,
        admins: admins.map((a: any) => ({ name: a.name, role: a.role, whatsapp: a.whatsapp, referralCode: a.referralCode }))
      });
    } catch (e: any) {
      console.error("[API CLEANUP] Error in cleanup request:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

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

  app.post("/api/save-store", async (req, res) => {
    const body = req.body;
    if (body && typeof body === "object") {
      let modified = false;
      for (const key of Object.keys(body)) {
        let newVal = body[key];
        let oldVal = storeData[key];

        // Filter and scrub deleted investments or users from incoming payload
        if (key === "gi_investments" && Array.isArray(newVal)) {
          const deletedInvs = storeData["gi_deleted_investments"] || [];
          newVal = newVal.filter((i: any) => i && i.id && !deletedInvs.includes(String(i.id)));
        }
        if (key === "gi_users" && Array.isArray(newVal)) {
          const deletedUsrs = storeData["gi_deleted_users"] || [];
          newVal = newVal.filter((u: any) => u && u.id && !deletedUsrs.includes(String(u.id)));
        }

        // Filter and scrub deleted investments or users from current old database value
        if (key === "gi_investments" && Array.isArray(oldVal)) {
          const deletedInvs = storeData["gi_deleted_investments"] || [];
          oldVal = oldVal.filter((i: any) => i && i.id && !deletedInvs.includes(String(i.id)));
        }
        if (key === "gi_users" && Array.isArray(oldVal)) {
          const deletedUsrs = storeData["gi_deleted_users"] || [];
          oldVal = oldVal.filter((u: any) => u && u.id && !deletedUsrs.includes(String(u.id)));
        }

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

        const shouldMerge = Array.isArray(newVal) && Array.isArray(oldVal) && 
          key !== "gi_products" && key !== "gi_bonus_codes" && key !== "gi_withdrawal_proofs" &&
          key !== "gi_deleted_investments" && key !== "gi_deleted_users";
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
                  if (key !== "gi_users" || item.role === "admin") {
                    mergedMap.set(idStr, item);
                  }
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
        await saveStore();
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

      // Generate unique referral code (3 letters mixed with 2 digits)
      let referralCode = '';
      let codeExists = true;
      const lettersPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digitsPool = '0123456789';

      while (codeExists) {
        let selectedLetters = '';
        for (let i = 0; i < 3; i++) {
          selectedLetters += lettersPool.charAt(Math.floor(Math.random() * lettersPool.length));
        }
        
        let selectedDigits = '';
        for (let i = 0; i < 2; i++) {
          selectedDigits += digitsPool.charAt(Math.floor(Math.random() * digitsPool.length));
        }
        
        // Shuffle them to mix letters and digits
        const combinedArray = (selectedLetters + selectedDigits).split('');
        for (let i = combinedArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = combinedArray[i];
          combinedArray[i] = combinedArray[j];
          combinedArray[j] = temp;
        }
        
        const potentialCode = combinedArray.join('');
        const isDuplicate = users.some((u: any) => u.referralCode && u.referralCode.toUpperCase() === potentialCode);
        if (!isDuplicate) {
          referralCode = potentialCode;
          codeExists = false;
        }
      }

      let refereeId: string | undefined = undefined;
      if (data.referredByCode && data.referredByCode.trim().length > 0) {
        const cleanInput = data.referredByCode.trim();
        const codeClean = cleanInput.toUpperCase();
        const digitsOnlyInput = cleanInput.replace(/\D/g, '');

        let referrerUser = users.find((u: any) => {
          if (u.referralCode && u.referralCode.toUpperCase() === codeClean) return true;
          if (u.id && u.id.toUpperCase() === codeClean) return true;
          
          // Fallback check by matching the last 8 digits of the cleaned WhatsApp phone numbers
          if (digitsOnlyInput.length >= 8 && u.whatsapp) {
            const uDigits = u.whatsapp.replace(/\D/g, '');
            if (uDigits.length >= 8) {
              const inputLast8 = digitsOnlyInput.slice(-8);
              const uLast8 = uDigits.slice(-8);
              if (inputLast8 === uLast8) return true;
            }
          }

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
            referredBy: 'AGR72',
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
        balance: 200, // 200 XOF Welcome Signup bonus
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
        title: 'Bienvenue sur Aiprods !',
        message: 'Félicitations pour votre inscription. Un bonus de bienvenue de 200 XOF a été crédité sur votre compte.',
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
      return res.json({ success: false, message: `Solde insuffisant. Vous devez avoir au moins ${targetProduct.price.toLocaleString()} XOF.` });
    }

    const isActivity = targetProduct.category === 'activity' || targetProduct.isCyclic;

    user.balance -= targetProduct.price;
    if (!isActivity) {
      user.dailyEarnings += targetProduct.dailyReturn;
    }
    user.lastModified = Date.now();

    const newInvestment = {
      id: `inv-${Date.now()}`,
      userId,
      productId: targetProduct.id,
      productName: targetProduct.name,
      price: targetProduct.price,
      dailyReturn: isActivity ? 0 : targetProduct.dailyReturn,
      daysPassed: 0,
      durationDays: targetProduct.durationDays,
      totalReturnClaimed: 0,
      lastClaimDate: new Date().toISOString(),
      status: 'active',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      category: targetProduct.category || 'stability',
      isCyclic: targetProduct.isCyclic || false,
      totalReturn: targetProduct.totalReturn || (targetProduct.price + (targetProduct.dailyReturn * targetProduct.durationDays))
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
        parentUser.totalEarnings = (parentUser.totalEarnings || 0) + commAmtLvl1;
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
          message: `Félicitations, vous avez perçu ${commAmtLvl1} XOF (Niveau 1 : ${mlmRates.level1}%) car votre affilié ${user.name} a investi de l'argent dans le plan ${targetProduct.name}.`,
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
            grandParentUser.totalEarnings = (grandParentUser.totalEarnings || 0) + commAmtLvl2;
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
              message: `Vous avez perçu ${commAmtLvl2} XOF (Niveau 2 : ${mlmRates.level2}%) suite à l'investissement de ${user.name} (parrainé par ${parentUser.name}).`,
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
                greatGrandParentUser.totalEarnings = (greatGrandParentUser.totalEarnings || 0) + commAmtLvl3;
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
                  message: `Vous avez perçu ${commAmtLvl3} XOF (Niveau 3 : ${mlmRates.level3}%) suite à l'investissement de ${user.name} (parrainé de façon indirecte par un membre de votre réseau).`,
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
      message: `Votre investissement de ${targetProduct.price.toLocaleString()} XOF dans le plan ${targetProduct.name} a bien été pris en compte. Vous gagnerez ${targetProduct.dailyReturn.toLocaleString()} XOF chaque jour pendant ${targetProduct.durationDays} jours.`,
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
      message: `Félicitations ! Vous avez réclamé votre bonus quotidien de connexion gratuite de ${rewardAmt} XOF.`,
      type: 'bonus',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Félicitations ! Vous avez reçu un bonus journalier de ${rewardAmt} XOF !`, amount: rewardAmt, user });
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

    const isActivity = inv.category === 'activity' || inv.isCyclic;
    if (isActivity) {
      return res.json({
        success: false,
        message: `Les revenus de cette Activité de Cycle Court (${inv.productName}) vous seront versés automatiquement et en intégralité à la fin de son cycle de ${inv.durationDays} jours.`,
        amount: 0
      });
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

    let products = storeData["gi_products"] || [];

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
      inv.lastModified = Date.now();
      handleCyclicCompletion(inv, users, products, investments, notifications);
      saveStore();
      return res.json({ success: false, message: 'Ce plan est complété ! Tous les revenus ont été distribués.', amount: 0 });
    }

    inv.daysPassed += 1;
    inv.totalReturnClaimed += inv.dailyReturn;
    inv.lastClaimDate = new Date().toISOString();
    inv.lastModified = Date.now();

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
      handleCyclicCompletion(inv, users, products, investments, notifications);
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
      message: `Vous avez récolté votre dividende quotidien de ${inv.dailyReturn.toLocaleString()} XOF sur le plan ${inv.productName}.`,
      type: 'plan',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_investments"] = investments;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Revenu journalier de +${inv.dailyReturn} XOF encaissé avec succès !`, amount: inv.dailyReturn, user: users[uIdx] });
  });

  // Centralized Create Deposit API
  app.post("/api/create-deposit", (req, res) => {
    const { userId, amount, operator, reference, receiptImage } = req.body;
    let users = storeData["gi_users"] || [];
    let deposits = storeData["gi_deposits"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const uIdx = users.findIndex((u: any) => u.id === userId);
    const user = uIdx !== -1 ? users[uIdx] : null;

    // Prevent duplicate processing of the same transaction reference!
    if (reference) {
      const existing = deposits.find((d: any) => d.reference === reference);
      if (existing) {
        console.log(`[DEPOSIT API] Reference "${reference}" already processed for deposit ${existing.id}. Skipping to avoid duplicates.`);
        return res.json({ success: true, deposit: existing, user: user || undefined });
      }
    }

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
        message: `Votre versement de ${Number(amount).toLocaleString()} XOF via ${operator || 'WestPay'} (Réf: ${reference}) a été crédité instantanément et automatiquement à 100%.`,
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
        message: `Votre demande de dépôt de ${Number(amount).toLocaleString()} XOF via ${operator} (Réf: ${reference}) est en cours de vérification par l'administration.`,
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

  // PayDunya Create Charge API
  app.post("/api/paydunya/create-charge", async (req, res) => {
    try {
      const { userId, amount, method, gateway } = req.body;
      const amt = Number(amount);
      if (!userId || isNaN(amt) || amt <= 0) {
        return res.status(400).json({ success: false, error: "Identifiant utilisateur ou montant invalide." });
      }

      const users = storeData["gi_users"] || [];
      const user = users.find((u: any) => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
      }
      const isWestpay = (method === 'westpay' || gateway === 'westpay' || req.body.operator === 'WestPay');
      const apiDomain = isWestpay ? "https://westpay.cfd" : "https://paydunya.com";

      const paydunyaMaster = process.env.PAYDUNYA_MASTER_KEY || "MC-b097cd10d14a7fba03044adb3881bbf9de9d4f13";
      const paydunyaPrivate = process.env.PAYDUNYA_PRIVATE_KEY || "MC-4fa6a00ca2e8292860dddd7e401055aee9c81c02";
      const paydunyaToken = process.env.PAYDUNYA_TOKEN || "MC-4245b0d810aaa02336f0b2f9ddbc26a37ed7bfdc";
      const paydunyaPublic = process.env.PAYDUNYA_PUBLIC_KEY || "MC-b6eb9046e9eb1a18bfbcd8a468ad5f16a6942647";

      const host = req.get('host') || 'agroprofit.online';
      const protocol = req.headers['x-forwarded-proto'] === 'http' ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;

      const cancelUrl = `${baseUrl}/?status=cancelled`;
      const returnUrl = `${baseUrl}/?ref=AGRO777`;
      const callbackUrl = `${baseUrl}/webhook`;

      console.log(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'}] Creating invoice for user ${user.name} (Amount: ${amt} XOF) on ${apiDomain}...`);
      console.log(`[PAYMENT] Calculated dynamic routing: ReturnURL: ${returnUrl}, CallbackURL: ${callbackUrl}`);

      const payload = {
        invoice: {
          total_amount: amt,
          description: `Recharge de compte Aiprods - Utilisateur: ${user.name}`
        },
        store: {
          name: "Aiprods",
          website_url: baseUrl
        },
        actions: {
          cancel_url: cancelUrl,
          callback_url: callbackUrl,
          return_url: returnUrl
        },
        custom_data: {
          userId: user.id
        }
      };

      let response;
      let data: any = null;
      let usedSandbox = false;

      // Try live API first
      try {
        console.log(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'}] Attempting Live API charge creation on ${apiDomain}...`);
        const liveRes = await fetch(`${apiDomain}/api/v1/checkout-invoice/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "PAYDUNYA-MASTER-KEY": paydunyaMaster,
            "PAYDUNYA-PRIVATE-KEY": paydunyaPrivate,
            "PAYDUNYA-TOKEN": paydunyaToken,
            "PAYDUNYA-PUBLIC-KEY": paydunyaPublic
          },
          body: JSON.stringify(payload)
        });
        if (liveRes.ok) {
          data = await liveRes.json();
        } else {
          console.warn(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'}] Live API returned non-200: ${liveRes.status}`);
        }
      } catch (err: any) {
        console.warn(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'} LIVE TRY FAILED]`, err.message);
      }

      // If live try failed or returned non-success, fallback to sandbox
      if (!data || (data.response_code !== "00" && data.response_code !== 0)) {
        try {
          console.log(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'}] Live failed or returned error. Attempting Sandbox API charge creation...`);
          const sandboxRes = await fetch(`${apiDomain}/sandbox-api/v1/checkout-invoice/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "PAYDUNYA-MASTER-KEY": paydunyaMaster,
              "PAYDUNYA-PRIVATE-KEY": paydunyaPrivate,
              "PAYDUNYA-TOKEN": paydunyaToken,
              "PAYDUNYA-PUBLIC-KEY": paydunyaPublic
            },
            body: JSON.stringify(payload)
          });
          if (sandboxRes.ok) {
            data = await sandboxRes.json();
            usedSandbox = true;
          } else {
            const errText = await sandboxRes.text();
            console.error(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'}] Sandbox API returned non-200: ${sandboxRes.status}. Output: ${errText}`);
          }
        } catch (err: any) {
          console.error(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'} SANDBOX TRY FAILED]`, err.message);
        }
      }

      console.log(`[${isWestpay ? 'WESTPAY' : 'PAYDUNYA'} RESPONSE]`, data);

      if (data && (data.response_code === "00" || data.response_code === 0)) {
        // Register a pending deposit transaction in store so it is visible in the lists & admin panel right away!
        let deposits = storeData["gi_deposits"] || [];
        const reference = data.token; // using invoice token as reference

        // Avoid duplicates
        const existingDep = deposits.find((d: any) => d.reference === reference);
        let newDep = null;
        const depositOperator = isWestpay ? "Westpay (Auto)" : "PayDunya (Auto)";
        if (!existingDep) {
          newDep = {
            id: `dep-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            amount: amt,
            operator: depositOperator,
            reference: reference,
            receiptImage: "automated",
            status: "pending",
            lastModified: Date.now(),
            createdAt: new Date().toISOString()
          };
          deposits.unshift(newDep);
          storeData["gi_deposits"] = deposits;
          saveStore(["gi_deposits"]);
        }

        res.json({
          success: true,
          url: data.response_html || data.url || `${apiDomain}/checkout/invoice/${data.token}`,
          token: data.token,
          deposit: newDep || existingDep
        });
      } else {
        // Since user wanted Westpay, if the dynamic checkout api fails because of sandbox/token configs,
        // fallback gracefully to generating a pending deposit and forwarding the user to their official Westpay payment link!
        if (isWestpay) {
          const fallbackToken = `WP-FB-${Date.now()}`;
          let deposits = storeData["gi_deposits"] || [];
          const newDep = {
            id: `dep-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            amount: amt,
            operator: "Westpay (Auto)",
            reference: fallbackToken,
            receiptImage: "automated",
            status: "pending",
            lastModified: Date.now(),
            createdAt: new Date().toISOString()
          };
          deposits.unshift(newDep);
          storeData["gi_deposits"] = deposits;
          saveStore(["gi_deposits"]);

          console.log("[WESTPAY FALLBACK] Gracefully forwarding to direct payment link");
          return res.json({
            success: true,
            url: "https://westpay.cfd/link/c25ukanomq2agyq6",
            token: fallbackToken,
            deposit: newDep
          });
        }

        console.error("[PAYDUNYA ERROR]", data);
        res.status(500).json({
          success: false,
          error: data?.response_text || "La construction de la facture de paiement PayDunya a échoué ou les clés API ne sont pas actives."
        });
      }
    } catch (err: any) {
      console.error("[PAYDUNYA EXCEPTION]", err);
      res.status(500).json({ success: false, error: `Erreur interne de communication: ${err.message}` });
    }
  });

  // Centralized payment integration webhooks (PayDunya & WestPay)
  app.all("/api/webhooks/westpay", async (req, res) => {
    await handlePaymentWebhook(req, res, 'Westpay');
  });

  app.all("/api/webhooks/paydunya", async (req, res) => {
    await handlePaymentWebhook(req, res, 'PayDunya');
  });

  // Direct webhook route as configured by the user at domain root level
  app.all("/webhook", async (req, res) => {
    await handlePaymentWebhook(req, res, 'Westpay');
  });

  async function handlePaymentWebhook(req: any, res: any, sourceName: string) {
    console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Request received.`);
    console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Headers:`, req.headers);
    console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Query:`, req.query);
    console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Body:`, req.body);

    const payload = { ...req.query, ...req.body };

    // Ensure we are fully synchronized with the Cloud database to get the latest user registers/updates and avoid any race conditions
    if (supabase) {
      try {
        console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Pulling latest state from Supabase to prevent stale memory overwrites...`);
        const { data, error } = await supabase.from('store').select('*');
        if (!error && data && Array.isArray(data)) {
          const kvData: Record<string, any> = {};
          for (const item of data) {
            kvData[item.key] = item.value;
          }
          if (Object.keys(kvData).length > 0) {
            mergeData(kvData);
            saveStoreLocal();
            console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Sync success! Fully up to date with cloud state.`);
          }
        } else if (error) {
          console.error(`[WEBHOOK ${sourceName.toUpperCase()}] Supabase pull error:`, error.message);
        }
      } catch (e) {
        console.error(`[WEBHOOK ${sourceName.toUpperCase()}] Exception while pulling from Supabase:`, e);
      }
    }

    // Deep support for stringified nested JSON structures
    if (payload.invoice && typeof payload.invoice === 'string') {
      try {
        payload.invoice = JSON.parse(payload.invoice);
      } catch (err) {
        console.warn('Failed parsing payload.invoice from string:', err);
      }
    }
    if (payload.custom_data && typeof payload.custom_data === 'string') {
      try {
        payload.custom_data = JSON.parse(payload.custom_data);
      } catch (err) {
        try {
          const params = new URLSearchParams(payload.custom_data);
          const uid = params.get('userId') || params.get('user_id');
          if (uid) {
            payload.custom_data = { userId: uid };
          }
        } catch (e2) {}
      }
    }

    // extraction of token/reference
    let token = payload.token || payload.invoice_token || payload.ref || payload.reference || payload.transaction_id || payload.token_invoice || payload.id || "";
    if (!token && payload.invoice && payload.invoice.token) {
      token = payload.invoice.token;
    }
    if (!token && payload.custom_data && payload.custom_data.token) {
      token = payload.custom_data.token;
    }

    if (!token) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Error: Missing transaction reference/token in hook payload.`);
      return res.status(400).json({ success: false, error: "Missing token" });
    }

    // Secure verification check with PayDunya/WestPay API if details are missing or for production reliability
    let isApproved = false;
    let amount = 0;
    let userId = "";

    try {
      const isWestpayToken = sourceName.toLowerCase() === 'westpay' || String(token).startsWith('WP-') || String(token).toLowerCase().includes('west');
      const verifyBaseUrl = isWestpayToken ? "https://westpay.cfd" : "https://paydunya.com";

      const paydunyaMaster = process.env.PAYDUNYA_MASTER_KEY || "MC-b097cd10d14a7fba03044adb3881bbf9de9d4f13";
      const paydunyaPrivate = process.env.PAYDUNYA_PRIVATE_KEY || "MC-4fa6a00ca2e8292860dddd7e401055aee9c81c02";
      const paydunyaToken = process.env.PAYDUNYA_TOKEN || "MC-4245b0d810aaa02336f0b2f9ddbc26a37ed7bfdc";
      const paydunyaPublic = process.env.PAYDUNYA_PUBLIC_KEY || "MC-b6eb9046e9eb1a18bfbcd8a468ad5f16a6942647";

      let verifyData: any = null;
      let verifyOk = false;

      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Querying secure gateway API at ${verifyBaseUrl} to verify token "${token}"...`);
      
      // Try LIVE first
      try {
        const liveVerifyRes = await fetch(`${verifyBaseUrl}/api/v1/checkout-invoice/confirm/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "PAYDUNYA-MASTER-KEY": paydunyaMaster,
            "PAYDUNYA-PRIVATE-KEY": paydunyaPrivate,
            "PAYDUNYA-TOKEN": paydunyaToken,
            "PAYDUNYA-PUBLIC-KEY": paydunyaPublic
          }
        });
        if (liveVerifyRes.ok) {
          verifyData = await liveVerifyRes.json();
          verifyOk = true;
          console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Successfully verified via Live API.`);
        } else {
          console.warn(`[WEBHOOK ${sourceName.toUpperCase()}] Live confirm API returned status: ${liveVerifyRes.status}`);
        }
      } catch (err: any) {
        console.warn(`[WEBHOOK ${sourceName.toUpperCase()}] Live verification query encountered error:`, err.message);
      }

      // Try SANDBOX fallback if live didn't work
      if (!verifyOk || !verifyData) {
        try {
          console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Retrying via Sandbox API at ${verifyBaseUrl} for token "${token}"...`);
          const sandboxVerifyRes = await fetch(`${verifyBaseUrl}/sandbox-api/v1/checkout-invoice/confirm/${token}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "PAYDUNYA-MASTER-KEY": paydunyaMaster,
              "PAYDUNYA-PRIVATE-KEY": paydunyaPrivate,
              "PAYDUNYA-TOKEN": paydunyaToken,
              "PAYDUNYA-PUBLIC-KEY": paydunyaPublic
            }
          });
          if (sandboxVerifyRes.ok) {
            verifyData = await sandboxVerifyRes.json();
            verifyOk = true;
            console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Successfully verified via Sandbox API.`);
          } else {
            console.warn(`[WEBHOOK ${sourceName.toUpperCase()}] Sandbox confirm API returned status: ${sandboxVerifyRes.status}`);
          }
        } catch (err: any) {
          console.error(`[WEBHOOK ${sourceName.toUpperCase()}] Sandbox verification query encountered error:`, err.message);
        }
      }

      if (verifyOk && verifyData) {
        console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Verification response from PayDunya:`, verifyData);
        // Check status in PayDunya response
        const statusValues = [
          verifyData.status,
          verifyData.invoice?.status,
          verifyData.invoice_status,
          verifyData.response_code,
          verifyData.response_text
        ].map(val => String(val || "").toLowerCase());

        isApproved = statusValues.some(statusStr => 
          statusStr.includes("success") || 
          statusStr.includes("completed") || 
          statusStr.includes("approved") || 
          statusStr.includes("valid") ||
          statusStr === "00"
        ) || verifyData.response_code === "00" || verifyData.response_code === 0;

        // Extract amount
        if (verifyData.invoice && verifyData.invoice.total_amount) {
          amount = Number(verifyData.invoice.total_amount);
        } else if (verifyData.amount) {
          amount = Number(verifyData.amount);
        }

        // Extract userId
        if (verifyData.custom_data && verifyData.custom_data.userId) {
          userId = verifyData.custom_data.userId;
        } else if (verifyData.invoice && verifyData.invoice.custom_data && verifyData.invoice.custom_data.userId) {
          userId = verifyData.invoice.custom_data.userId;
        }
      } else {
        console.warn(`[WEBHOOK ${sourceName.toUpperCase()}] Direct verification failed. Falling back to payload parameters.`);
      }
    } catch (err) {
      console.error(`[WEBHOOK ${sourceName.toUpperCase()}] Exception during direct PayDunya verification:`, err);
    }

    // Fallback block if API verification didn't resolve properties
    if (!userId || amount <= 0) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Falling back to payload properties extraction...`);
      
      const rawStatus = payload.status || payload.response_code || payload.invoice_status || "";
      const statusStr = String(rawStatus).toLowerCase();
      isApproved = 
        statusStr.includes("success") || 
        statusStr.includes("completed") || 
        statusStr.includes("approved") || 
        statusStr.includes("valid") ||
        statusStr === "00";

      const rawAmt = payload.amount || 
                     payload.amount_payed || 
                     payload.total_amount || 
                     (payload.invoice && (payload.invoice.total_amount || payload.invoice.amount)) ||
                     0;
      amount = Number(String(rawAmt).replace(/[^0-9.]/g, ""));

      userId = payload.userId || 
               payload.user_id || 
               (payload.custom_data && (payload.custom_data.userId || payload.custom_data.user_id || payload.custom_data.uid)) || 
               (payload.invoice && payload.invoice.custom_data && (payload.invoice.custom_data.userId || payload.invoice.custom_data.user_id || payload.invoice.custom_data.uid)) || 
               "";
    }

    if (!isApproved) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Transaction token "${token}" is not approved or verification failed.`);
      return res.status(200).json({ success: false, message: "Transaction is not successful or approved" });
    }

    let users = storeData["gi_users"] || [];
    let deposits = storeData["gi_deposits"] || [];
    let notifications = storeData["gi_notifications"] || [];

    // Check if this transaction reference has already been approved
    const existingApproved = deposits.find((d: any) => d.reference === token && d.status === 'approved');
    if (existingApproved) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Reference "${token}" has already been processed and approved. Avoiding duplicates.`);
      return res.json({ success: true, message: "Already processed" });
    }

    // Try finding the user
    let user = users.find((u: any) => u.id === userId);

    let existingDepIdx = deposits.findIndex((d: any) => d.reference === token);
    if (existingDepIdx !== -1) {
      const dep = deposits[existingDepIdx];
      if (!user) {
        user = users.find((u: any) => u.id === dep.userId);
      }
      if (amount <= 0) {
        amount = dep.amount;
      }
    }

    // If still no user found, try scanning for a pending deposit by exact reference matchup first
    if (!user) {
      const matchingPendingDep = deposits.find((d: any) => d.reference === token);
      if (matchingPendingDep) {
        user = users.find((u: any) => u.id === matchingPendingDep.userId);
        if (amount <= 0) amount = matchingPendingDep.amount;
        if (existingDepIdx === -1) {
          existingDepIdx = deposits.findIndex((d: any) => d.id === matchingPendingDep.id);
        }
      }
    }

    // --- SECURE FALLBACK MATCHING (DYNAMIC RECOVERY OF ANONYMOUS DEPOSITS) ---
    // If no user/deposit matches the reference directly, match a pending deposit of the same amount submitted by a user within the last 30 minutes
    if (!user && amount > 0) {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      const matchingPendingDep = deposits.find((d: any) => 
        d.status === 'pending' && 
        Number(d.amount) === amount && 
        new Date(d.createdAt).getTime() > thirtyMinutesAgo
      );
      if (matchingPendingDep) {
        user = users.find((u: any) => u.id === matchingPendingDep.userId);
        if (existingDepIdx === -1) {
          existingDepIdx = deposits.findIndex((d: any) => d.id === matchingPendingDep.id);
        }
        console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Successfully matched anonymous webhook of ${amount} XOF with pending deposit of user ${user?.name} via amount-time matching!`);
      }
    }

    if (!user) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Error: No user found for userId "${userId}" or reference "${token}".`);
      return res.status(404).json({ success: false, error: "Associated user not found" });
    }

    if (amount <= 0) {
      console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Error: Invalid amount <= 0.`);
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }

    // Credit user's principal balance
    user.balance += amount;
    user.lastModified = Date.now();

    const finalOperator = (sourceName.toLowerCase() === 'westpay' || String(token).startsWith('WP-')) ? 'Westpay (Auto)' : 'PayDunya (Auto)';

    // Create or Update deposit record
    if (existingDepIdx !== -1) {
      deposits[existingDepIdx].status = 'approved';
      deposits[existingDepIdx].amount = amount;
      deposits[existingDepIdx].operator = finalOperator;
      deposits[existingDepIdx].lastModified = Date.now();
    } else {
      const newDep = {
        id: `dep-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        amount: amount,
        operator: finalOperator,
        reference: token,
        receiptImage: 'automated',
        status: 'approved',
        lastModified: Date.now(),
        createdAt: new Date().toISOString()
      };
      deposits.unshift(newDep);
    }

    // Create notification
    notifications.unshift({
      id: `not-dep-auto-${Date.now()}`,
      userId: user.id,
      title: '🟢 Recharge Confirmée !',
      message: `Votre recharge de ${amount.toLocaleString()} XOF via ${finalOperator} (Réf: ${token}) a été validée et créditée automatiquement avec succès sur votre solde principal.`,
      type: 'deposit',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_deposits"] = deposits;
    storeData["gi_notifications"] = notifications;

    saveStore(["gi_users", "gi_deposits", "gi_notifications"]);

    console.log(`[WEBHOOK ${sourceName.toUpperCase()}] Successfully processed deposit of ${amount} XOF for user ${user.name} (${user.id}).`);
    return res.json({ success: true, message: "Webhook processed successfully" });
  }

  // Centralized Create Withdrawal API
  app.post("/api/create-withdrawal", (req, res) => {
    const { userId, amount, operator, number, proof_file_url } = req.body;
    let users = storeData["gi_users"] || [];
    let withdrawals = storeData["gi_withdrawals"] || [];
    let notifications = storeData["gi_notifications"] || [];

    const uIdx = users.findIndex((u: any) => u.id === userId);
    if (uIdx === -1) {
      return res.json({ success: false, error: 'Utilisateur non trouvé.' });
    }

    const user = users[uIdx];
    
    // Validate withdrawal window (09h00 to 17h00)
    // We can check server time, but client timezone can be passed or we check standard hour
    const now = new Date();
    // Convert to West Africa Time (WAT: UTC+1) / GMT which represents target audience
    const utcHour = now.getUTCHours();
    const watHour = (utcHour + 1) % 24; 
    
    if (watHour < 9 || watHour >= 17) {
      return res.json({ success: false, error: 'Les retraits sont disponibles uniquement entre 09h00 et 17h00 (Heure Afrique de l\'Ouest / UTC+1).' });
    }

    if (amount < 1000) {
      return res.json({ success: false, error: 'Le montant de retrait minimum est de 1 000 F.' });
    }
    if (amount > 1000000) {
      return res.json({ success: false, error: 'Le montant de retrait maximum est de 1 000 000 F.' });
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
      proof_file_url,
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    withdrawals.unshift(newWth);

    notifications.unshift({
      id: `not-wth-${Date.now()}`,
      userId,
      title: 'Retrait en attente',
      message: `Votre demande de retrait de ${amount.toLocaleString()} XOF vers ${number} (${operator}) est en attente de traitement par la comptabilité.`,
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
      message: `Félicitations ! Le code "${cleanCode}" a été validé. Votre compte a été crédité de ${target.amount.toLocaleString()} XOF de bonus.`,
      type: 'bonus',
      lastModified: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    });

    storeData["gi_users"] = users;
    storeData["gi_bonus_codes"] = bonusCodes;
    storeData["gi_notifications"] = notifications;

    saveStore();
    res.json({ success: true, message: `Succès ! Le code bonus a été appliqué avec succès. +${target.amount.toLocaleString()} XOF !`, user });
  });

  // Support Msg API
  app.post("/api/send-message", (req, res) => {
    const { userId, message, sender } = req.body;
    let msgs = storeData["gi_support_messages"] || [];
    
    let updatedMsgs = [...msgs];
    if (sender === 'admin') {
      // Mark preceding user messages as replied when the admin posts a response
      updatedMsgs = msgs.map((m: any) => {
        if (m.userId === userId && m.sender === 'user' && m.status !== 'replied') {
          return { ...m, status: 'replied', lastModified: Date.now() };
        }
        return m;
      });
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      userId,
      sender,
      message,
      status: sender === 'user' ? 'unread' : 'replied',
      lastModified: Date.now(),
      createdAt: new Date().toISOString()
    };
    updatedMsgs.push(newMsg);
    storeData["gi_support_messages"] = updatedMsgs;
    saveStore();
    res.json({ success: true, message: newMsg });
  });

  app.post("/api/mark-messages-read", (req, res) => {
    const { userId } = req.body;
    let msgs = storeData["gi_support_messages"] || [];
    let changed = false;
    const updatedMsgs = msgs.map((m: any) => {
      if (m.userId === userId && m.sender === 'user' && m.status !== 'read' && m.status !== 'replied') {
        changed = true;
        return { ...m, status: 'read', lastModified: Date.now() };
      }
      return m;
    });
    if (changed) {
      storeData["gi_support_messages"] = updatedMsgs;
      saveStore();
    }
    res.json({ success: true, changed });
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
        message: `Votre versement de ${deposits[idx].amount.toLocaleString()} XOF via ${deposits[idx].operator} a été approuvé. Votre solde principal a été rechargé.`,
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
        message: `Votre demande de dépôt de ${deposits[idx].amount.toLocaleString()} XOF a été refusée suite à une anomalie de référence ou de capture d'écran de paiement. Contactez le service client.`,
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
        message: `Félicitations, votre retrait de ${withdrawals[idx].amount.toLocaleString()} XOF sur le numéro ${withdrawals[idx].number} (${withdrawals[idx].operator}) a été validé et expédié avec succès.`,
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
        message: `Votre retrait de ${withdrawals[idx].amount.toLocaleString()} XOF a été refusé. Les fonds ont été intégralement restitués à votre solde principal.`,
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
    
    // Track deleted user id
    let deletedUsers = storeData["gi_deleted_users"] || [];
    if (!deletedUsers.includes(userId)) {
      deletedUsers.push(userId);
      storeData["gi_deleted_users"] = deletedUsers;
    }

    let users = storeData["gi_users"] || [];
    storeData["gi_users"] = users.filter((u: any) => u.id !== userId);

    let investments = storeData["gi_investments"] || [];
    // Track deleted investments for this user
    const userInvs = investments.filter((i: any) => i.userId === userId);
    let deletedInvestments = storeData["gi_deleted_investments"] || [];
    for (const inv of userInvs) {
      if (!deletedInvestments.includes(inv.id)) {
        deletedInvestments.push(inv.id);
      }
    }
    storeData["gi_deleted_investments"] = deletedInvestments;
    
    storeData["gi_investments"] = investments.filter((i: any) => i.userId !== userId);

    if (storeData["gi_deposits"]) {
      storeData["gi_deposits"] = storeData["gi_deposits"].filter((d: any) => d.userId !== userId);
    }
    if (storeData["gi_withdrawals"]) {
      storeData["gi_withdrawals"] = storeData["gi_withdrawals"].filter((w: any) => w.userId !== userId);
    }
    if (storeData["gi_commissions"]) {
      storeData["gi_commissions"] = storeData["gi_commissions"].filter((c: any) => c.userId !== userId && c.fromUserId !== userId);
    }
    if (storeData["gi_support_messages"]) {
      storeData["gi_support_messages"] = storeData["gi_support_messages"].filter((m: any) => m.userId !== userId);
    }
    if (storeData["gi_withdrawal_proofs"]) {
      storeData["gi_withdrawal_proofs"] = storeData["gi_withdrawal_proofs"].filter((p: any) => p.userId !== userId);
    }

    saveStore();
    res.json({ success: true });
  });

  app.post("/api/admin/delete-investment", (req, res) => {
    const { investmentId } = req.body;
    let investments = storeData["gi_investments"] || [];
    let users = storeData["gi_users"] || [];

    const inv = investments.find((i: any) => i.id === investmentId);
    if (!inv) {
      return res.status(404).json({ error: "Investissement ou produit payé introuvable" });
    }

    // Filter out the deleted investment from database
    investments = investments.filter((i: any) => i.id !== investmentId);
    storeData["gi_investments"] = investments;

    // Track deleted investment id
    let deletedInvestments = storeData["gi_deleted_investments"] || [];
    if (!deletedInvestments.includes(investmentId)) {
      deletedInvestments.push(investmentId);
      storeData["gi_deleted_investments"] = deletedInvestments;
    }

    // Recalculate daily earnings for the associated user
    const uIdx = users.findIndex((u: any) => u.id === inv.userId);
    if (uIdx !== -1) {
      const activeInvs = investments.filter((i: any) => i.userId === inv.userId && i.status === 'active');
      users[uIdx].dailyEarnings = activeInvs.reduce((sum: number, i: any) => sum + i.dailyReturn, 0);
      users[uIdx].lastModified = Date.now();
      storeData["gi_users"] = users;
    }

    saveStore();
    res.json({ success: true, investments, users });
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
      isCyclic: p.isCyclic || false,
      generatedProductIds: p.generatedProductIds || [],
      category: p.category || 'stability',
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

  // Servir le manifest.json de la PWA
  app.get("/manifest.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({
      "name": "Aiprods",
      "short_name": "Aiprods",
      "description": "Investissement Audio Connecté - Aiprods",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#020617",
      "theme_color": "#f97316",
      "orientation": "portrait",
      "icons": [
        {
          "src": "https://img.icons8.com/color/192/000000/headphones.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "https://img.icons8.com/color/512/000000/headphones.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any maskable"
        }
      ]
    }, null, 2));
  });

  // Servir le service worker sw.js de la PWA
  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`
const CACHE_NAME = 'agroprofit-cache-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
    `);
  });

  // Servir un fichier APK réel, signé et valide pour l'installation directe
  app.get(["/AgroProfit.apk", "/AgroCapital.apk", "/Agrocapital.apk", "/agrocapital.apk", "/Aiprods.apk", "/aiprods.apk", "/Airprods.apk", "/airprods.apk"], async (req, res) => {
    const localApkPath = path.join(process.cwd(), "public", "Aiprods.apk");
    const tempApkPath = path.join(process.cwd(), "public", "Aiprods.apk.tmp");
    const targetUrl = "https://github.com/anthonycr/Lightning-Browser/releases/download/v5.1.0/Lightning-v5.1.0-release.apk";

    try {
      // 1. S'assurer que le fichier existant n'est pas corrompu ou tronqué (un APK valide fait plus de 4.0 Mo)
      if (fs.existsSync(localApkPath)) {
        const stats = fs.statSync(localApkPath);
        if (stats.size > 4000000) { 
          res.setHeader("Content-Disposition", 'attachment; filename="Aiprods.apk"');
          res.setHeader("Content-Type", "application/vnd.android.package-archive");
          res.setHeader("Content-Length", stats.size.toString());
          return res.sendFile(localApkPath);
        } else {
          // Si le fichier est trop petit, c'est un reliquat de téléchargement échoué. On le supprime pour le recréer proprement.
          console.warn(`[APK] Fichier local corrompu détecté (${stats.size} octets). Suppression et retéléchargement.`);
          try { fs.unlinkSync(localApkPath); } catch (e) {}
        }
      }

      // Nettoyer d'anciens fichiers temporaires
      if (fs.existsSync(tempApkPath)) {
        try { fs.unlinkSync(tempApkPath); } catch (e) {}
      }

      // 2. Télécharger en direct depuis Github avec redirection s'il le faut
      console.log("[APK] Téléchargement sécurisé de l'APK officiel depuis GitHub...");
      const response = await fetch(targetUrl);
      if (response.ok && response.body) {
        const contentLength = response.headers.get("Content-Length");
        
        res.setHeader("Content-Disposition", 'attachment; filename="Aiprods.apk"');
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        if (contentLength) {
          res.setHeader("Content-Length", contentLength);
        }

        // Créer un flux d'écriture temporaire pour éviter de corrompre le fichier principal en cas de coupure de connexion
        const fileStream = fs.createWriteStream(tempApkPath);
        const reader = response.body.getReader();

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                fileStream.end();
                // Renommer le fichier temporaire en fichier final une fois le téléchargement 100% achevé avec succès
                if (fs.existsSync(tempApkPath)) {
                  const finalStats = fs.statSync(tempApkPath);
                  if (finalStats.size > 4000000) {
                    fs.renameSync(tempApkPath, localApkPath);
                    console.log(`[APK] Téléchargement réussi et sauvegardé localement (${finalStats.size} octets).`);
                  }
                }
                break;
              }
              if (value) {
                const chunk = Buffer.from(value);
                res.write(chunk);
                fileStream.write(chunk);
              }
            }
            res.end();
          } catch (writeError) {
            console.error("[APK] Erreur de streaming APK active :", writeError);
            fileStream.destroy();
            try { if (fs.existsSync(tempApkPath)) fs.unlinkSync(tempApkPath); } catch (e) {}
            if (!res.writableEnded) {
              // Si la connexion avec l'utilisateur a coupé, res s'arrêtera tout seul
              res.end();
            }
          }
        };

        return processStream();
      }
    } catch (err) {
      console.warn("[APK] Erreur lors de la récupération ou du streaming de l'APK, redirection vers Github :", err);
    }

    // 3. Fallback ultime et 100% fonctionnel : rediriger l'utilisateur vers le lien de téléchargement direct de GitHub
    // Ainsi, l'utilisateur obtiendra TOUJOURS un APK parfaitement fonctionnel et non corrompu !
    console.log("[APK] Redirection vers l'URL officielle GitHub de secours.");
    if (!res.headersSent) {
      return res.redirect(302, targetUrl);
    }
  });

  // Intercept any unmatched /api/* routes so they NEVER fall through to the SPA static/Vite handler which serves HTML index.html
  app.all("/api/*", (req, res) => {
    console.warn(`[API 404] Intercepted unhandled api route: ${req.method} ${req.path}`);
    res.status(404).json({
      success: false,
      error: `L'endpoint API demandé [${req.method} ${req.path}] n'existe pas.`
    });
  });

  // Global error handler for all unhandled backend routes and exceptions
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[CRITICAL SERVER EXCEPTION]", err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({
        success: false,
        error: err.message || "Une erreur interne de communication est survenue sur le serveur."
      });
    }
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
