# Security Configuration Guide

## 🔐 Required Environment Variables

This application requires the following environment variables to be set. **NEVER commit actual secret values to the repository.**

### Required Secrets

1. **JWT_SECRET** - Used for signing JWT tokens
   - Minimum 32 characters
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   
2. **COOKIE_SECRET** - Used for signing cookies
   - Minimum 32 characters
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **DATABASE_URL** - PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`

### Setting Secrets in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables** or **Add variable**
4. Add each required secret:
   - Variable name: `JWT_SECRET`
   - Value: Your generated secret (paste the output from the generation command)
   - Click **Save**
5. Repeat for `COOKIE_SECRET`, `DATABASE_URL`, and other required variables

### Generate Secrets Locally

Run these commands to generate strong secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add them to Netlify's environment variables.

## 🚫 What NOT to Do

❌ **DO NOT** hardcode secrets in your code  
❌ **DO NOT** commit `.env` files with real secrets  
❌ **DO NOT** use fallback values like `'your-secret-key'` or `'default-secret'`  
❌ **DO NOT** include secrets in documentation files  

## ✅ What TO Do

✅ **DO** use environment variables for all secrets  
✅ **DO** set secrets in Netlify's environment variables  
✅ **DO** commit `.env.example` with placeholders only  
✅ **DO** fail fast if required secrets are missing  
✅ **DO** use strong, randomly generated secrets  

## 📝 Local Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Generate secrets locally:
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> .env
   node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> .env
   ```

3. Edit `.env` and fill in other required values (DATABASE_URL, etc.)

4. **NEVER commit your `.env` file** (it's in `.gitignore`)

## 🔍 Netlify Secrets Scanner

Netlify's secrets scanner will block builds if it detects:
- Hard-coded secret values in source code
- Secret patterns in committed files
- Exposed credentials in build output

To resolve scanner issues:
1. Remove all hard-coded secrets from source code
2. Use environment variables: `process.env.SECRET_NAME`
3. Add proper validation that fails if secrets are missing
4. Set real secrets in Netlify's environment variables

## 🛡️ Security Best Practices

1. **Rotate secrets regularly** - Change JWT_SECRET and COOKIE_SECRET periodically
2. **Use different secrets per environment** - Don't reuse production secrets in development
3. **Limit secret access** - Only give team members access to secrets they need
4. **Monitor secret usage** - Review Netlify logs for unauthorized access attempts
5. **Use secret management tools** - Consider using services like AWS Secrets Manager or HashiCorp Vault for production

## 📚 Additional Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Secrets Scanning Docs](https://ntl.fyi/configure-secrets-scanning)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
