import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set higher limits for payload transfers (e.g., receipt images)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Central Database file inside the container
  const dbPath = path.join(process.cwd(), "db.json");
  let storeData: Record<string, any> = {};

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
        { id: 'u-3', name: 'Moussa Diarra', whatsapp: '+22360616263', password: 'user123', country: 'Mali', balance: 2400, dailyEarnings: 0, totalEarnings: 0, bonus: 500, referralCode: 'MOUSSA223', referredBy: 'u-2', role: 'user', isBlocked: false, createdAt: '2026-05-22T16:45:00Z' }
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
      saveStore();
    }
  }

  function saveStore() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(storeData, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to db.json file:", e);
    }
  }

  // Load store on startup
  loadStore();

  // API endpoints to synchronize state
  app.get("/api/get-store", (req, res) => {
    res.json(storeData);
  });

  app.post("/api/save-store", (req, res) => {
    const body = req.body;
    if (body && typeof body === "object") {
      for (const key of Object.keys(body)) {
        const newVal = body[key];
        const oldVal = storeData[key];

        if (Array.isArray(newVal) && Array.isArray(oldVal)) {
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
                  if (incomingTime >= existingTime) {
                    mergedMap.set(idStr, item);
                  }
                }
              }
            }
          }

          storeData[key] = Array.from(mergedMap.values());
        } else {
          // Overwrite single primitives or single configs with the newest
          storeData[key] = newVal;
        }
      }

      saveStore();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid store data" });
    }
  });

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
