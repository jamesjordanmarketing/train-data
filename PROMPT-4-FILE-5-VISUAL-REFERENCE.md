# Export API Visual Reference

Visual diagrams and flowcharts for the Export API implementation.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│                    (Frontend / API Consumer)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Export API Endpoints                       │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ POST /export/   │  │ GET /status/[id]│  │ GET /download/  │ │
│  │ conversations   │  │                 │  │      [id]       │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │           │
│  ┌────────┴────────────────────┴─────────────────────┴────────┐ │
│  │               GET /export/history                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Validation Layer (Zod)                        │
│                                                                   │
│  • ExportRequestSchema    • FilterConfigSchema                  │
│  • ExportConfigSchema     • ExportHistoryQuerySchema            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ExportService Layer                         │
│                                                                   │
│  • createExportLog()      • updateExportLog()                   │
│  • getExportLog()         • listExportLogs()                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Supabase    │  │ Transformers │  │   Storage    │
│   Database   │  │              │  │   (Future)   │
│              │  │ • JSONL      │  │              │
│ • export_logs│  │ • JSON       │  │ • Supabase   │
│ • batch_jobs │  │ • CSV        │  │   Storage    │
│ • convos     │  │ • Markdown   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 Export Creation Flow

```
                    ┌─────────────┐
                    │   Client    │
                    │   Request   │
                    └──────┬──────┘
                           │
                           ▼
                ┌──────────────────┐
                │ Validate Request │
                │   (Zod Schema)   │
                └─────────┬────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Authenticate │
                   │     User     │
                   └──────┬───────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Apply Scope Filters  │
              │                       │
              │ • all → approved only │
              │ • selected → by IDs   │
              │ • filtered → criteria │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ Fetch Conversations   │
              │    from Database      │
              └───────────┬───────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
        < 500   │                   │   ≥ 500
    conversations│               conversations
                │                   │
                ▼                   ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   Synchronous    │  │    Background    │
    │   Processing     │  │    Processing    │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Fetch Turns      │  │ Create Batch Job │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     │
    ┌──────────────────┐           │
    │   Transform      │           │
    │   (Transformer)  │           │
    └────────┬─────────┘           │
             │                     │
             ▼                     │
    ┌──────────────────┐           │
    │ Generate File    │           │
    └────────┬─────────┘           │
             │                     │
             ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Create Export    │  │ Create Export    │
    │ Log (completed)  │  │ Log (queued)     │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  Return 201      │  │  Return 202      │
    │  with file_url   │  │  with export_id  │
    └──────────────────┘  └──────────────────┘
```

---

## 🔍 Status Check Flow

```
┌─────────────┐
│   Client    │
│   Request   │
│ GET /status │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Authenticate │
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Fetch Export Log │
│  from Database   │
└─────────┬────────┘
          │
    ┌─────┴─────┐
    │           │
 Found?      Not Found
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│Verify  │  │Return  │
│Owner   │  │  404   │
└───┬────┘  └────────┘
    │
┌───┴────┐
│        │
Owner?   Not Owner
│        │
▼        ▼
┌──────────────┐  ┌────────┐
│Check         │  │Return  │
│Expiration    │  │  403   │
└──────┬───────┘  └────────┘
       │
┌──────┴───────┐
│              │
Expired?     Valid
│              │
▼              ▼
┌──────────────┐  ┌──────────────┐
│Mark Expired  │  │Get Progress  │
│in Database   │  │(if queued)   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
        ┌──────────────┐
        │Return Status │
        │with Details  │
        └──────────────┘
```

---

## 📥 Download Flow

```
┌─────────────┐
│   Client    │
│   Request   │
│GET /download│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Authenticate │
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Fetch Export Log │
└─────────┬────────┘
          │
    ┌─────┴─────┐
    │           │
 Found?      Not Found
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│Verify  │  │Return  │
│Owner   │  │  404   │
└───┬────┘  └────────┘
    │
┌───┴────┐
│        │
Owner?   Not Owner
│        │
▼        ▼
┌──────────────┐  ┌────────┐
│Check Status  │  │Return  │
└──────┬───────┘  │  403   │
       │          └────────┘
   ┌───┴────┐
   │        │
Completed? Other
   │        │
   ▼        ▼
┌────────┐  ┌────────────┐
│Check   │  │Return Error│
│Expired │  │ • 410 (exp)│
└───┬────┘  │ • 425 (not)│
    │       │ • 500 (err)│
┌───┴──┐    └────────────┘
│      │
Valid  Expired
│      │
▼      ▼
┌──────────────┐  ┌────────┐
│Regenerate    │  │Return  │
│File from DB  │  │  410   │
└──────┬───────┘  └────────┘
       │
       ▼
┌──────────────┐
│Set Headers   │
│• Content-Type│
│• Disposition │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Increment     │
│Download Count│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Stream File   │
│Return 200    │
└──────────────┘
```

---

## 📜 History Retrieval Flow

```
┌─────────────┐
│   Client    │
│   Request   │
│GET /history │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│Parse Query   │
│Parameters    │
│• format      │
│• status      │
│• page        │
│• limit       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Validate with │
│  Zod Schema  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Authenticate  │
│    User      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│Build Filter      │
│Object            │
│• format filter   │
│• status filter   │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│Query Database    │
│• Filter by user  │
│• Apply filters   │
│• Paginate        │
│• Order by date   │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│Enhance Results   │
│• Extract filename│
│• Add status msg  │
│• Check download  │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│Calculate         │
│Pagination Meta   │
│• totalPages      │
│• hasNext/Prev    │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│Return 200        │
│• exports[]       │
│• pagination{}    │
└──────────────────┘
```

---

## 🗂️ Data Model

```
┌─────────────────────────────────────────┐
│           export_logs Table             │
├─────────────────────────────────────────┤
│ • id (UUID, PK)                         │
│ • export_id (UUID, Unique)              │
│ • user_id (UUID, FK)                    │
│ • timestamp (Timestamptz)               │
│ • format (text)                         │
│ • config (JSONB)                        │
│ • conversation_count (int)              │
│ • file_size (bigint, nullable)          │
│ • status (text)                         │
│ • file_url (text, nullable)             │
│ • expires_at (timestamptz, nullable)    │
│ • error_message (text, nullable)        │
│ • created_at (timestamptz)              │
│ • updated_at (timestamptz)              │
└─────────────────────────────────────────┘
          │
          │ Foreign Key
          ▼
┌─────────────────────────────────────────┐
│            auth.users Table             │
│  (Supabase Authentication)              │
└─────────────────────────────────────────┘

          ┌───────────────┐
          │  batch_jobs   │
          │     Table     │
          ├───────────────┤
          │ • export_id   │
          │ • status      │
          │ • progress    │
          │ • total_items │
          └───────────────┘
```

---

## 🎨 Export Format Decision Tree

```
                    ┌──────────────┐
                    │ Choose Format│
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │   AI     │    │ Analysis │   │  Human   │
    │ Training │    │          │   │  Review  │
    └─────┬────┘    └─────┬────┘   └─────┬────┘
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │  JSONL   │    │CSV / JSON│   │ Markdown │
    └──────────┘    └──────────┘   └──────────┘
          │               │               │
          ▼               ▼               ▼
    • Line-delim    • Structured   • Formatted
    • Compact       • Tabular      • Readable
    • Standard      • Excel-ready  • Comments
```

---

## 🔐 Security Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│Extract x-user-id │
│   (Dev Mode)     │
│                  │
│ Production:      │
│ Get user from    │
│ Supabase session │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
  Valid?   Invalid
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Proceed │ │Return  │
│        │ │  401   │
└───┬────┘ └────────┘
    │
    ▼
┌────────────┐
│ RLS Check  │
│ user_id =  │
│ $user_id   │
└──────┬─────┘
       │
  ┌────┴────┐
  │         │
Match?   No Match
  │         │
  ▼         ▼
┌────┐   ┌────┐
│200 │   │403 │
└────┘   └────┘
```

---

## 📊 Performance Characteristics

```
Conversation Count vs Processing Time

Time (s)
  ^
15│                                    ┌─────
  │                                  ┌─┘
  │                                ┌─┘
10│                              ┌─┘
  │                            ┌─┘
  │                          ┌─┘
 5│                      ┌───┘
  │                  ┌───┘
  │              ┌───┘
  │          ┌───┘
  │      ┌───┘
 0└──────┴─────────┴─────────┴─────────> Conversations
    0   100      200      300    400    500+
                                         │
                                         ▼
                                    Background
                                      Queue
```

---

## 🔄 State Diagram

```
┌─────────┐
│ QUEUED  │◄─────────┐
└────┬────┘          │
     │               │
     ▼               │
┌─────────┐          │
│PROCESSING│         │
└────┬────┘          │
     │               │
 ┌───┴────┐          │
 │        │          │
 ▼        ▼          │
┌─────┐ ┌──────────┐ │
│FAILED│ │COMPLETED │ │
└─────┘ └─────┬────┘ │
              │      │
         (24 hours)  │
              │      │
              ▼      │
        ┌─────────┐  │
        │ EXPIRED │  │
        └─────────┘  │
              │      │
              └──────┘
           (Re-export)
```

---

## 📈 Success Metrics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                  Export Analytics                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Total Exports Today: ████████████████ 42               │
│                                                         │
│  By Format:                                             │
│    JSONL   ████████████████████████ 60%                │
│    CSV     ██████████████ 25%                          │
│    JSON    ███████ 10%                                 │
│    MD      ███ 5%                                      │
│                                                         │
│  By Status:                                             │
│    Completed ████████████████████████████ 85%          │
│    Queued    ████████ 10%                              │
│    Failed    ███ 5%                                    │
│                                                         │
│  Avg Processing Time: 3.2s                              │
│  Avg File Size: 1.2 MB                                  │
│  Success Rate: 95%                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Decision Matrix

**Need to export conversations?**

```
START
  │
  ├─ Small dataset (<100)
  │    └─► Use scope: "all", format: "jsonl"
  │         Synchronous processing
  │
  ├─ Specific conversations
  │    └─► Use scope: "selected"
  │         Provide conversationIds[]
  │
  ├─ Filter by quality
  │    └─► Use scope: "filtered"
  │         Set qualityScoreMin
  │
  ├─ Large dataset (>500)
  │    └─► Automatic background processing
  │         Poll status endpoint
  │
  ├─ For AI training
  │    └─► format: "jsonl"
  │
  ├─ For analysis
  │    └─► format: "csv" or "json"
  │
  └─ For documentation
       └─► format: "markdown"
```

---

**Last Updated:** October 31, 2025  
**Version:** 1.0

