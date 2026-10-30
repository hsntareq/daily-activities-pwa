import { Category } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-web-dev',
    name: 'Web Development',
    slug: 'web-development',
    emoji: '💻',
    iconName: 'Code',
    color: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-frontend', categoryId: 'cat-web-dev', name: 'Frontend & UI', emoji: '🎨', description: 'Next.js, Tailwind, React, animations' },
      { id: 'sub-backend', categoryId: 'cat-web-dev', name: 'Backend & API', emoji: '⚙️', description: 'Node.js, databases, server actions' },
      { id: 'sub-bugfix', categoryId: 'cat-web-dev', name: 'Bug Fixes & QA', emoji: '🐞', description: 'Debugging, test coverage, code review' },
      { id: 'sub-deployment', categoryId: 'cat-web-dev', name: 'DevOps & Deploy', emoji: '🚀', description: 'CI/CD, Cloud, Vercel, Docker' },
    ]
  },
  {
    id: 'cat-social-media',
    name: 'Social Media',
    slug: 'social-media',
    emoji: '📱',
    iconName: 'Share2',
    color: '#ec4899', // Pink
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-content-calendar', categoryId: 'cat-social-media', name: 'Content Calendar', emoji: '📅', description: 'Post scheduling & strategy' },
      { id: 'sub-reels-shorts', categoryId: 'cat-social-media', name: 'Reels & Shorts', emoji: '🎬', description: 'Short-form viral content' },
      { id: 'sub-community', categoryId: 'cat-social-media', name: 'Community Engagement', emoji: '💬', description: 'DMs, comments, audience replies' },
      { id: 'sub-analytics', categoryId: 'cat-social-media', name: 'Insights & Metrics', emoji: '📊', description: 'Reach, impressions, conversions' },
    ]
  },
  {
    id: 'cat-video',
    name: 'Video Production',
    slug: 'video',
    emoji: '🎥',
    iconName: 'Video',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-scripting', categoryId: 'cat-video', name: 'Scripting & Storyboard', emoji: '📝', description: 'Outlines, scripts, concept draft' },
      { id: 'sub-recording', categoryId: 'cat-video', name: 'Filming & Audio', emoji: '🎙️', description: 'Camera setup, voiceover, shoots' },
      { id: 'sub-video-edit', categoryId: 'cat-video', name: 'Editing & Color Grade', emoji: '✂️', description: 'Premiere, DaVinci, cutdowns' },
      { id: 'sub-thumbnail', categoryId: 'cat-video', name: 'Thumbnails & Assets', emoji: '🖼️', description: 'CTR thumbnails, posters, titling' },
    ]
  },
  {
    id: 'cat-digital-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    emoji: '📈',
    iconName: 'TrendingUp',
    color: '#10b981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-seo', categoryId: 'cat-digital-marketing', name: 'SEO & Search Ads', emoji: '🔍', description: 'Keyword ranking, Google Ads, backlinks' },
      { id: 'sub-email-campaigns', categoryId: 'cat-digital-marketing', name: 'Email Newsletters', emoji: '📧', description: 'Drip campaigns, lead nurturing' },
      { id: 'sub-funnel', categoryId: 'cat-digital-marketing', name: 'Conversion Funnels', emoji: '🎯', description: 'Landing pages, A/B testing' },
      { id: 'sub-influencers', categoryId: 'cat-digital-marketing', name: 'Brand Partnerships', emoji: '🤝', description: 'Sponsors & affiliate outreach' },
    ]
  },
  {
    id: 'cat-mobile-app',
    name: 'Mobile App',
    slug: 'mobile-app',
    emoji: '📲',
    iconName: 'Smartphone',
    color: '#8b5cf6', // Purple
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-react-native', categoryId: 'cat-mobile-app', name: 'React Native / Flutter', emoji: '⚡', description: 'Cross-platform app logic' },
      { id: 'sub-app-ui', categoryId: 'cat-mobile-app', name: 'Mobile UX & Haptics', emoji: '✨', description: 'Touch gestures, micro-interactions' },
      { id: 'sub-app-store', categoryId: 'cat-mobile-app', name: 'App Store / Play Store', emoji: '📦', description: 'Submissions, review guidelines' },
      { id: 'sub-push-notifications', categoryId: 'cat-mobile-app', name: 'Push & Background Sync', emoji: '🔔', description: 'Local notifications, FCM' },
    ]
  },
  {
    id: 'cat-ecommerce',
    name: 'E-commerce',
    slug: 'ecommerce',
    emoji: '🛍️',
    iconName: 'ShoppingBag',
    color: '#f59e0b', // Amber
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-inventory', categoryId: 'cat-ecommerce', name: 'Product Catalog & Stock', emoji: '🏷️', description: 'SKUs, pricing, stock levels' },
      { id: 'sub-order-processing', categoryId: 'cat-ecommerce', name: 'Order Fulfillment', emoji: '📦', description: 'Packing, tracking, dispatch' },
      { id: 'sub-promotions', categoryId: 'cat-ecommerce', name: 'Discounts & Flash Sales', emoji: '🏷️', description: 'Coupons, bundle offers' },
      { id: 'sub-returns', categoryId: 'cat-ecommerce', name: 'Refunds & Returns', emoji: '🔄', description: 'Customer dispute resolution' },
    ]
  },
  {
    id: 'cat-client-comm',
    name: 'Client Communication',
    slug: 'client-communication',
    emoji: '🤝',
    iconName: 'MessagesSquare',
    color: '#06b6d4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-discovery-call', categoryId: 'cat-client-comm', name: 'Discovery & Sync Calls', emoji: '📞', description: 'Onboarding, demo calls, updates' },
      { id: 'sub-proposals', categoryId: 'cat-client-comm', name: 'Quotes & Proposals', emoji: '📑', description: 'Scope of work, estimates' },
      { id: 'sub-contracts-invoices', categoryId: 'cat-client-comm', name: 'Invoices & Payments', emoji: '💳', description: 'Billing, milestones, follow-ups' },
      { id: 'sub-feedback', categoryId: 'cat-client-comm', name: 'Client Feedback & Sign-off', emoji: '✅', description: 'Approvals, revisions' },
    ]
  },
  {
    id: 'cat-delivery',
    name: 'Delivery & Logistics',
    slug: 'delivery',
    emoji: '🚚',
    iconName: 'Truck',
    color: '#14b8a6', // Teal
    bgColor: 'rgba(20, 184, 166, 0.12)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-milestone-dispatch', categoryId: 'cat-delivery', name: 'Milestone Handoff', emoji: '🏁', description: 'Project deliverables dispatch' },
      { id: 'sub-shipping', categoryId: 'cat-delivery', name: 'Physical Shipping', emoji: '📮', description: 'Courier, waybill, tracking' },
      { id: 'sub-client-handoff', categoryId: 'cat-delivery', name: 'Handover & Walkthrough', emoji: '🔑', description: 'Credentials, documentation guide' },
    ]
  },
  {
    id: 'cat-routines',
    name: 'Daily Routines & Care',
    slug: 'routines',
    emoji: '⏰',
    iconName: 'HeartPulse',
    color: '#a855f7', // Purple/Violet
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    createdAt: Date.now(),
    subCategories: [
      { id: 'sub-medicine', categoryId: 'cat-routines', name: 'Medicine & Health', emoji: '💊', description: 'Scheduled prescriptions, vitamins' },
      { id: 'sub-walking', categoryId: 'cat-routines', name: 'Walking & Cardio', emoji: '🚶‍♂️', description: 'Daily step goals, dog walking' },
      { id: 'sub-playtime', categoryId: 'cat-routines', name: 'Playtime & Downtime', emoji: '🎮', description: 'Family, pet playtime, mental break' },
      { id: 'sub-rent', categoryId: 'cat-routines', name: 'Rent & Monthly Bills', emoji: '🏠', description: 'Rent collection, utility payments' },
    ]
  }
];
