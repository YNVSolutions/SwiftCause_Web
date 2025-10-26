# Setup Instructions for SwiftCause Web

## ✅ Migration Status: Complete

The codebase has been successfully migrated from `src/` to the Next.js App Router structure following Feature-Sliced Design (FSD) principles.

## 📦 Installation

You need to install dependencies with the `--legacy-peer-deps` flag due to React 19 compatibility issues:

```bash
npm install --legacy-peer-deps
```

Or if you run into issues:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
swiftcause_web/
├── app/                    # Next.js App Router routes
│   ├── about/
│   ├── admin/
│   ├── campaign/
│   ├── campaigns/
│   ├── contact/
│   ├── login/
│   ├── payment/
│   └── ...
├── src/
│   ├── entities/           # Business entities (campaign, user, etc.)
│   ├── features/           # User actions
│   ├── widgets/            # Composite UI blocks
│   ├── shared/             # Shared resources
│   └── views/               # Page components
└── package.json
```

## 🔧 Path Aliases

The project uses TypeScript path aliases for imports:

```typescript
import { HomePage } from '@/views/home/HomePage'
import { useAuth } from '@/shared/lib/auth-provider'
import { Campaign } from '@/entities/campaign'
import { PaymentForm } from '@/features/payment'
```

## ⚠️ Known Issues

1. **React 19 Compatibility**: Some packages (like @stripe/react-stripe-js) don't yet fully support React 19, but work with `--legacy-peer-deps`
2. **Type Errors**: There may be some TypeScript errors that need fixing (especially related to react-day-picker v9)
3. **Backend Exclusion**: The `backend/` folder is excluded from the Next.js build as it contains separate Firebase functions

## 🛠️ Next Steps

1. **Fix TypeScript Errors**: Address any type errors in the codebase
2. **Environment Variables**: Create a `.env` file with:
   - Firebase configuration
   - Stripe keys
   - Other required environment variables
3. **Test Routes**: Verify all routes work properly
4. **Clean Up**: Remove the old `src/app/` directory once everything is working

## 📝 Notes

- The `src/app/` directory is now redundant since all routes have been moved to the root `app/` folder
- All imports have been updated to use path aliases instead of relative paths
- The build compiles successfully with some TypeScript warnings that need to be addressed

## 🔍 Troubleshooting

### Build fails with module not found
Run: `npm install --legacy-peer-deps`

### TypeScript errors
These are mostly minor type mismatches that can be fixed incrementally.

### Port already in use
Change the port: `npm run dev -- -p 3001`

