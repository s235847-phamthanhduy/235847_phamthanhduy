# 235847_phamthanhduy
## Chạy backend bằng Docker

```bash
docker pull phamthanhduy/backend:latest
docker run -d -p 5000:5000 \
  -e MONGODB_URI="<chuỗi kết nối Atlas>" \
  -e CORS_ORIGIN="*" \
  phamthanhduy/backend:latest
```

Docker Hub: https://hub.docker.com/r/phamthanhduy/backend
## Chạy frontend bằng Docker

```bash
docker pull phamthanhduy/frontend:latest
docker run -d -p 3000:80 \
  -e API_URL=http://localhost:5000 \
  phamthanhduy/frontend:latest
```

Truy cập: http://localhost:3000

Docker Hub: https://hub.docker.com/r/phamthanhduy/frontend

## URL triển khai
- Backend API: https://api-235847.onrender.com
- Health check: https://api-235847.onrender.com/health