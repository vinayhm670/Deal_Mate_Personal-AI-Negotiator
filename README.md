# DealMate — AI-Powered Shopping Negotiator

**Discover what you want. Negotiate what you can. Optimize what you pay.**

🌐 **Live Website: https://dealmate-ai-to-ai-shopping-negotiator.ai.studio

📂 **GitHub Repository: https://github.com/avi0nash001/Deal_Mate_Personal-AI-Negotiator

## About the Project

DealMate is an AI-powered shopping platform designed to make online shopping smarter, more affordable, and more convenient. Instead of simply displaying products and prices, DealMate aims to help users discover suitable products, negotiate prices, identify eligible coupons and offers, and evaluate opportunities to reduce their final purchase cost.

The platform brings product discovery, intelligent negotiation, deal analysis, and savings optimization together in one experience. Users can explore products based on their requirements and budget, assess available offers, and make more informed purchasing decisions.

## Key Features

* **AI-Powered Product Discovery:** Find products based on user requirements, preferences, and budget.
* **Intelligent Price Negotiation:** Use an AI-driven negotiation workflow to explore whether a better price can be obtained.
* **Real-Time Product Search:** Connect product discovery with live search capabilities where supported.
* **Coupon and Offer Intelligence:** Identify potentially applicable coupon codes, promotions, and merchant offers, subject to availability and eligibility.
* **Deal Optimization:** Evaluate product prices, eligible discounts, and offers to estimate the best available purchase option.
* **Budget-Friendly Shopping:** Help users compare purchase options and make decisions that align with their spending limits.
* **Integrated Shopping Experience:** Bring discovery, negotiation, and savings analysis into a unified platform.
* **🪔 Diwali Special Edition:** Live interactive fireworks and firecrackers simulation (Rockets, Chakri, Anar fountain, and sparkler cursor trail) with festive sound synthesis and customizable celebration controls.
* **⚡ Supabase Database Integration:** Built-in connection to Supabase for cloud persistence of deals, negotiation audit logs, and orders with automated local fallback.
* **🚀 Vercel Ready:** Preconfigured `vercel.json` for seamless zero-config deployment.

## 🚀 Deploying to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Diwali celebration, Supabase integration, and Vercel configuration"
   git push origin main
   ```
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository (`vinayhm670/Deal_Mate_Personal-AI-Negotiator`).
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables in Vercel (Optional)**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `GEMINI_API_KEY`: Your Google Gemini API Key
4. Click **Deploy**!

## ⚡ Supabase Setup (1-Click)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase project dashboard.
3. Copy the schema provided in the in-app **Supabase Modal** (or from `src/supabase.ts`) and click **Run**.
4. Copy your **Project URL** and **Anon Key** into your `.env` or paste them directly in the DealMate header Supabase dialog.


## How It Works

1. **Discover:** Search for a product that matches your needs.
2. **Compare:** Review available product options and prices.
3. **Negotiate:** Explore opportunities to obtain a better price.
4. **Optimize:** Evaluate eligible coupons, promotions, and other savings opportunities.
5. **Choose Your Deal:** Review the final estimated cost and proceed to the merchant when supported.

## Project Goal

DealMate aims to move beyond traditional product search and price comparison by exploring how AI can help shoppers make better purchasing decisions. Its long-term vision is to combine product discovery, AI-to-AI price negotiation, coupon intelligence, and deal optimization into a single, user-friendly shopping assistant.

## Try DealMate

Visit the live website to explore the application:

**https://dealmate-ai-to-ai-shopping-negotiator.ai.studio**

*Note: Feature availability depends on the current deployment, connected APIs, merchant support, and coupon eligibility. Prices and savings should be verified with the merchant before purchase.*
