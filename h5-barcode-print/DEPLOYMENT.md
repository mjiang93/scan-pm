# 生产环境部署指南

## 1. 构建生产版本

```bash
cd h5-barcode-print
npm run build
```

构建完成后，会在 `dist` 目录生成生产环境的静态文件。

## 2. Nginx 配置

### 2.1 配置说明

项目使用 `/api` 作为 API 请求的基础路径，需要在 nginx 中配置代理转发到后端服务器。

关键配置：
- 前端静态文件：部署到 nginx 的 root 目录
- API 请求：`/api/*` 转发到后端服务器 `http://47.110.53.133:7077/`

### 2.2 配置步骤

1. 将 `dist` 目录上传到服务器（例如：`/var/www/h5-barcode-print/dist`）

2. 编辑 nginx 配置文件（通常在 `/etc/nginx/sites-available/` 或 `/etc/nginx/conf.d/`）

3. 添加或修改 server 配置（参考 `nginx.conf.example`）

4. 测试配置是否正确：
```bash
sudo nginx -t
```

5. 重新加载 nginx：
```bash
sudo nginx -s reload
# 或
sudo systemctl reload nginx
```

## 3. 请求流程

### 开发环境
```
浏览器 -> /api/xxx -> Vite Dev Server Proxy -> http://47.110.53.133:7077/xxx
```

### 生产环境
```
浏览器 -> /api/xxx -> Nginx Proxy -> http://47.110.53.133:7077/xxx
```

## 4. 验证部署

1. 访问前端页面：`http://your-domain.com`
2. 打开浏览器开发者工具 Network 面板
3. 执行登录或其他 API 操作
4. 检查请求 URL 是否为 `/api/xxx` 格式
5. 检查响应是否正常

## 5. 常见问题

### 5.1 API 请求 404

**原因**：nginx 代理配置不正确

**解决**：
- 检查 `location /api/` 配置是否正确
- 确认 `proxy_pass` 后端地址是否可访问
- 注意 `proxy_pass` 末尾的 `/` 会影响路径重写

### 5.2 跨域问题

**原因**：nginx 代理头设置不正确

**解决**：确保设置了以下代理头
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

### 5.3 前端路由刷新 404

**原因**：React Router 使用 BrowserRouter，刷新时 nginx 找不到对应文件

**解决**：配置 `try_files $uri $uri/ /index.html;`

### 5.4 静态资源加载失败

**原因**：资源路径配置问题

**解决**：
- 检查 `vite.config.ts` 中的 `base` 配置
- 如果部署在子目录，需要设置 `base: '/子目录/'`

## 6. 性能优化建议

1. **启用 Gzip 压缩**：减少传输大小
2. **设置静态资源缓存**：提高加载速度
3. **使用 CDN**：加速静态资源访问
4. **启用 HTTP/2**：提升并发性能

## 7. 安全建议

1. **使用 HTTPS**：保护数据传输安全
2. **设置安全头**：
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```
3. **限制请求大小**：防止恶意上传
```nginx
client_max_body_size 10M;
```
