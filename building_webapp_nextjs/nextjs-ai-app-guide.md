# Next.js TypeScript AI App - Complete Building Guide

## 🚀 Initial Setup & Installation

### 1. Create Next.js Project with TypeScript

```bash
# Using npx (recommended - always uses latest version)
npx create-next-app@latest my-ai-app --typescript --tailwind --eslint --app

# Or using npm (if you have create-next-app installed globally)
npm create next-app@latest my-ai-app --typescript --tailwind --eslint --app

# Navigate to project directory
cd my-ai-app
```

### 2. Install Additional Dependencies

```bash
# Install required dependencies
npm install @types/node @types/react @types/react-dom

# Install optional but recommended packages
npm install lucide-react clsx class-variance-authority
```

## 📁 Project Structure Setup

### 3. Create Required Directories

```bash
# Create the main source directories
mkdir -p src/app/api/runpod/run
mkdir -p src/app/api/runpod/status/[jobId]
mkdir -p src/lib
mkdir -p src/styles

# Verify structure
tree src/
```

Your project structure should look like:
```
src/
├── app/
│   ├── api/
│   │   └── runpod/
│   │       ├── run/
│   │       │   └── route.ts
│   │       └── status/
│   │           └── [jobId]/
│   │               └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
└── styles/
```

## 🔑 Environment Configuration

### 4. Setup Environment Variables

Create `.env.local` in your project root:

```bash
# Create environment file
touch .env.local
```

Add the following content to `.env.local`:

```env
# RunPod API Configuration
RUNPOD_API_KEY=rpa_your_runpod_api_key_here
RUNPOD_API_BASE_URL=https://api.runpod.ai/v2/your_endpoint_id_here

# Optional: Add other environment variables
NODE_ENV=development
```

### 5. Getting RunPod API Credentials

**To get your API Key:**
1. Go to [RunPod Console](https://runpod.io/console)
2. Navigate to **Account → Settings**
3. Scroll down to **API Keys** section
4. Generate or copy your API key
5. Replace `your_runpod_api_key_here` with your actual key

**To get your Endpoint URL:**
1. In RunPod Console, go to **Serverless**
2. Select your deployed endpoint
3. Click on **Requests** tab
4. Copy the endpoint ID from the URL (it looks like: `https://api.runpod.ai/v2/{endpoint_id}`)
5. Replace `your_endpoint_id_here` with your actual endpoint ID

## 📝 API Routes Implementation

### 6. Create RunPod API Routes

Copy the provided API route files to their respective locations:

**RunPod Run & Status Route:**
- Copy `/api` folder (run & status endpoint) to: `src/app/`

These files handle:
- Starting RunPod AI jobs with your prompts
- Polling job status until completion
- Error handling and response formatting

**Main Page Component:**
- Copy the RunPod integration scripts from the `runpod-scripts-only.md` file and integrate them into your `page.tsx` component.

## 🚀 Running the Application

### 7. Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

### 8. Accessing Your App

Open your browser and navigate to:
```bash
http://localhost:3000
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading:**
   - Make sure `.env.local` is in the project root
   - Restart the development server after adding environment variables
   - Check for typos in variable names

2. **API Routes Not Working:**
   - Verify file paths match exactly: `src/app/api/runpod/run/route.ts`
   - Ensure you're using the correct HTTP methods (POST/GET)
   - Check console for error messages

3. **TypeScript Errors:**
   - Run `npx tsc --noEmit` to check for type errors
   - Make sure all imports are correct
   - Verify interface definitions match your data

4. **RunPod Connection Issues:**
   - Double-check your API key and endpoint URL
   - Ensure your RunPod endpoint is deployed and running
   - Check RunPod console for any deployment issues

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RunPod API Documentation](https://docs.runpod.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore`