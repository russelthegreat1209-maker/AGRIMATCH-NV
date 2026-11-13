import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(),
    name: text('name').notNull(),
    organization: text('organization'),
    email: text('email').notNull(),
    role: text('role').notNull(),
    phone: text('phone'),
    municipality: text('municipality').notNull(),
    barangay: text('barangay'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    avatar: text('avatar'),
    coverPhoto: text('cover_photo'),
    bio: text('bio'),
    verified: boolean('verified').default(true).notNull(),
    status: text('status').default('ACTIVE').notNull(),
    strikeCount: integer('strike_count').default(0).notNull(),
    rating: doublePrecision('rating').default(4.8),
    completedTradesCount: integer('completed_trades_count').default(0).notNull(),
    warningMessages: jsonb('warning_messages').$type<string[]>().default([]),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_users_role_municipality').on(table.role, table.municipality),
    index('idx_users_status').on(table.status),
  ]
);

export const commodities = pgTable(
  'commodities',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    supplierUid: text('supplier_uid').notNull(),
    supplierName: text('supplier_name').notNull(),
    supplierRole: text('supplier_role').notNull(),
    municipality: text('municipality').notNull(),
    barangay: text('barangay'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    availableKg: integer('available_kg').notNull(),
    pricePerKg: doublePrecision('price_per_kg').notNull(),
    farmgatePricePhp: doublePrecision('farmgate_price_php'),
    minOrderKg: integer('min_order_kg').default(20).notNull(),
    qualityGrade: text('quality_grade').notNull(),
    aiSuggestedGrade: text('ai_suggested_grade'),
    manualGradeOverride: boolean('manual_grade_override').default(false),
    verificationStatus: text('verification_status').default('PENDING').notNull(),
    aiAuthenticityScore: integer('ai_authenticity_score').default(90).notNull(),
    aiVisionNotes: text('ai_vision_notes'),
    harvestDate: text('harvest_date'),
    imageUrl: text('image_url'),
    notes: text('notes'),
    postedAt: timestamp('posted_at').defaultNow(),
  },
  (table) => [
    index('idx_commodities_status_category_muni').on(
      table.verificationStatus,
      table.category,
      table.municipality
    ),
    index('idx_commodities_supplier_uid').on(table.supplierUid),
    index('idx_commodities_posted_at').on(table.postedAt),
  ]
);

export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  authorMunicipality: text('author_municipality').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likes: jsonb('likes').$type<string[]>().default([]),
  reactions: jsonb('reactions').$type<Record<string, string[]>>().default({}),
  commentsCount: integer('comments_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postComments = pgTable('post_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  commodityId: text('commodity_id').notNull(),
  commodityName: text('commodity_name').notNull(),
  buyerUid: text('buyer_uid').notNull(),
  buyerName: text('buyer_name').notNull(),
  supplierUid: text('supplier_uid').notNull(),
  supplierName: text('supplier_name').notNull(),
  quantityKg: integer('quantity_kg').notNull(),
  listedPricePerKg: doublePrecision('listed_price_per_kg').notNull(),
  proposedPricePerKg: doublePrecision('proposed_price_per_kg').notNull(),
  totalAmountPhp: doublePrecision('total_amount_php').notNull(),
  status: text('status').notNull(),
  deliveryMode: text('delivery_mode').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  paymentOption: text('payment_option').notNull(),
  supplierConfirmedSent: boolean('supplier_confirmed_sent').default(false).notNull(),
  buyerConfirmedReceived: boolean('buyer_confirmed_received').default(false).notNull(),
  chatThreadId: text('chat_thread_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const privateMessages = pgTable('private_messages', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull(),
  senderUid: text('sender_uid').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  recipientUid: text('recipient_uid'),
  text: text('text').notNull(),
  isOrderCard: boolean('is_order_card').default(false),
  orderId: text('order_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiHistory = pgTable('ai_history', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  userRole: text('user_role').notNull(),
  agentType: text('agent_type').notNull(),
  prompt: text('prompt').notNull(),
  responseSummary: text('response_summary').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  poweredByGemini: boolean('powered_by_gemini').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const nvatBulletins = pgTable('nvat_bulletins', {
  id: text('id').primaryKey(),
  bulletinDate: text('bulletin_date').notNull(),
  rawText: text('raw_text').notNull(),
  items: jsonb('items').$type<unknown[]>().notNull(),
  executiveSummary: jsonb('executive_summary').$type<string[]>().default([]),
  publishedByUid: text('published_by_uid'),
  googleSheetUrl: text('google_sheet_url'),
  processedAt: timestamp('processed_at').defaultNow(),
});

export const moderationReports = pgTable('moderation_reports', {
  id: text('id').primaryKey(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetUserUid: text('target_user_uid').notNull(),
  targetUserName: text('target_user_name').notNull(),
  targetPreview: text('target_preview').notNull(),
  reporterUid: text('reporter_uid').notNull(),
  reporterName: text('reporter_name').notNull(),
  reason: text('reason').notNull(),
  status: text('status').default('PENDING').notNull(),
  resolutionAction: text('resolution_action'),
  resolvedByUid: text('resolved_by_uid'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});
