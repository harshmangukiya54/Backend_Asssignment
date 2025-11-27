# Example curl / PowerShell requests

Create organization

```powershell
curl -Method POST http://localhost:8000/org/create -ContentType 'application/json' -Body '{"organization_name":"acme","email":"admin@acme.com","password":"secret123"}'
```

Admin login

```powershell
curl -Method POST http://localhost:8000/admin/login -ContentType 'application/json' -Body '{"email":"admin@acme.com","password":"secret123"}'
```

Delete organization (with bearer token)

```powershell
curl -Method DELETE http://localhost:8000/org/delete -ContentType 'application/json' -Headers @{ Authorization = 'Bearer <TOKEN>' } -Body '{"organization_name":"acme"}'
```

Get organization

```powershell
curl http://localhost:8000/org/get?organization_name=acme
```
