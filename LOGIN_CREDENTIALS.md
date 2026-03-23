# Demo login — Manager

| Field    | Value               |
|----------|---------------------|
| **Email**    | `manager@salon.com` |
| **Password** | `password`          |

- Manager panel URL after login: `/manager`
- Same demo password is used for other staff demo accounts on the login page (**Quick Setup**).

## Backend: ensure Manager user exists

Manager needs a `tenantId` in the database. After at least one salon (tenant) exists:

```bash
cd salon_backend
npm run seed:manager
```

This creates or updates the Manager user on the **first tenant** in MongoDB.
