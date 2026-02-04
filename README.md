# AI-Powered Productivity Tools

AI-powered productivity tools exist to help people **do more high-quality work in less time** by letting artificial intelligence handle or assist with thinking-heavy, repetitive, or time-consuming tasks.

## Core Purpose

At their core, these tools are designed to:

1. **Automate routine work** - Let AI handle repetitive tasks so you can focus on what matters most
2. **Enhance decision making** - Get AI-powered insights and recommendations to make better decisions faster
3. **Boost efficiency** - Streamline workflows and eliminate bottlenecks with intelligent automation
4. **Augment creativity** - Use AI as a creative partner to explore new ideas and possibilities

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with TypeScript and integrated with [Vercel Speed Insights](https://vercel.com/docs/speed-insights).

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shona-cmd/AI-Powered-Productivity-Tools.git
cd AI-Powered-Productivity-Tools
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## Vercel Speed Insights Integration

This project is integrated with **Vercel Speed Insights** to monitor and optimize performance metrics in real-time. The integration is already set up and will automatically start collecting data once deployed to Vercel.

### How it Works

- The `SpeedInsights` component from `@vercel/speed-insights/next` is included in the root layout (`app/layout.tsx`)
- Once deployed to Vercel, it tracks Core Web Vitals and other performance metrics
- Data can be viewed in the Vercel dashboard under the Speed Insights tab

### Enabling Speed Insights

1. Deploy your app to Vercel
2. Navigate to your project in the Vercel dashboard
3. Click on the **Speed Insights** tab
4. Click **Enable** to start collecting data

After deployment, the tracking script will be available at `/_vercel/speed-insights/script.js`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights) - learn about monitoring performance
- [Speed Insights Package](https://vercel.com/docs/speed-insights/package) - API reference for the package

## License

This project is open source and available under the MIT License.
