# IP Address Detection Guide

This guide explains how to ensure proper IP address detection for user banning and security features.

## 🔍 Current Implementation

The system now uses an enhanced IP detection method that tries multiple sources:

1. **X-Forwarded-For** header (most common for proxies/load balancers)
2. **X-Real-IP** header (nginx and other proxies)
3. **CF-Connecting-IP** header (Cloudflare)
4. **X-Client-IP** header (some proxies)
5. **socket.handshake.address** (direct connection)
6. **socket.request.connection.remoteAddress** (fallback)
7. **socket.conn.remoteAddress** (alternative fallback)

## 🔧 For Development Environment

In development, if all methods return `127.0.0.1`, the system will:
- Generate a unique fake IP based on the socket ID
- Format: `192.168.X.Y` (where X.Y are derived from socket ID)
- This ensures each user gets a unique "IP" for testing ban functionality

## 🌐 For Production Environment

### Nginx Configuration

If using Nginx as a reverse proxy, add these headers:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration

If using Apache as a reverse proxy:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Pass real IP
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-For %{REMOTE_ADDR}s
</VirtualHost>
```

### Cloudflare Configuration

If using Cloudflare, the system automatically checks for `CF-Connecting-IP` header.

No additional configuration needed - Cloudflare automatically adds this header.

### AWS ALB/ELB Configuration

For AWS Application Load Balancer, ensure these headers are passed:
- `X-Forwarded-For`
- `X-Forwarded-Proto`

The ALB automatically adds these by default.

## 🧪 Testing IP Detection

To test if IP detection is working correctly:

1. **Check Console Logs**: Look for these messages when a user connects:
   ```
   🔍 IP from X-Forwarded-For: 192.168.1.100
   🔍 IP from X-Real-IP: 192.168.1.100
   🔧 Generated development IP: 192.168.45.123 for socket abc123
   ```

2. **Ban a User**: When you ban someone, check the console for:
   ```
   🚫 IP BAN ADDED: User 123, IP 192.168.1.100 banned from group 45 by 108
   ```

3. **Check IP Bans Menu**: Open the "IP Bans" menu to see the actual IP addresses being stored.

## 🚨 Troubleshooting

### Problem: Still getting 127.0.0.1

**Possible causes:**
1. No reverse proxy configured
2. Reverse proxy not passing IP headers
3. Multiple layers of proxies (each needs configuration)

**Solutions:**
1. Configure your reverse proxy (see above)
2. Check proxy logs to ensure headers are being set
3. Use browser developer tools to check request headers

### Problem: Getting wrong IP addresses

**Possible causes:**
1. Multiple proxies in chain
2. CDN not configured properly
3. Load balancer configuration

**Solutions:**
1. Check the order of IPs in `X-Forwarded-For`
2. Configure each proxy layer to preserve client IP
3. Use specific headers for your CDN (like `CF-Connecting-IP`)

## 📊 IP Detection Priority

The system checks IP sources in this order:
1. **X-Forwarded-For** (first IP only)
2. **X-Real-IP**
3. **CF-Connecting-IP** 
4. **X-Client-IP**
5. **Socket handshake address**
6. **Connection remote address**
7. **Socket connection remote address**
8. **Generated development IP** (fallback)

## 🔒 Security Considerations

- **IP Spoofing**: In production, ensure only trusted proxies can set IP headers
- **Multiple IPs**: X-Forwarded-For can contain multiple IPs - we use the first (original client)
- **IPv6**: The system handles both IPv4 and IPv6 addresses
- **Development IPs**: Generated IPs are consistent per socket for testing

## 📝 Logs and Debugging

Enable detailed IP detection logging by checking the console output:
- `🔍` indicates IP detection attempts
- `⚠️` indicates all methods returned localhost
- `🔧` indicates development IP generation
- `🚫` indicates IP ban operations 