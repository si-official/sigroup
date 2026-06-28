# SI Group — sigroup.com.bd

## Project Structure

```
sigroup/
├── apps/
│   ├── main/       → www.sigroup.com.bd    (Next.js 14)
│   ├── shop/       → shop.sigroup.com.bd   (Next.js 14)
│   ├── school/     → school.sigroup.com.bd (Next.js 14)
│   └── portal/     → portal.sigroup.com.bd (Next.js 14)
│
├── backend/
│   ├── main/       → Main site API   (Laravel)
│   ├── shop/       → Shop API        (Laravel)
│   ├── school/     → School API      (Laravel)
│   └── portal/     → Portal API      (Laravel)
│
├── database/
│   ├── main/migrations/    → contacts, pages
│   ├── shop/migrations/    → products, orders, customers
│   ├── school/migrations/  → students, classes, results
│   └── portal/migrations/  → users, sessions, activity_logs
│
└── frontend/       → (legacy monorepo — replaced by apps/)
```

## প্রতিটা App সম্পূর্ণ আলাদা
প্রতিটা `apps/*` ফোল্ডার একটি স্বাধীন Next.js project।
পরে আলাদা server বা Vercel project হিসেবে deploy করা যাবে।

## Local Development

```bash
# Main site
cd apps/main && npm run dev       # http://localhost:3000

# Shop
cd apps/shop && npm run dev       # http://localhost:3001

# School
cd apps/school && npm run dev     # http://localhost:3002

# Portal
cd apps/portal && npm run dev     # http://localhost:3003
```

## Database (MySQL)

প্রতিটা subdomain এর নিজস্ব database থাকবে:

| App     | Database name        |
|---------|----------------------|
| main    | sigroup_main         |
| shop    | sigroup_shop         |
| school  | sigroup_school       |
| portal  | sigroup_portal       |

```bash
# Migration চালাতে
mysql -u root -p sigroup_main < database/main/migrations/001_create_contacts_table.sql
```
