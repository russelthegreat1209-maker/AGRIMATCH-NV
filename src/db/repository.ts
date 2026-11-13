import { desc, eq } from 'drizzle-orm';
import { db, isSqlConfigured } from './index.ts';
import {
  users,
  commodities,
  communityPosts,
  postComments,
  orders,
  privateMessages,
  aiHistory,
  nvatBulletins,
  moderationReports,
} from './schema.ts';

export async function upsertUserProfile(payload: {
  uid: string;
  name: string;
  organization?: string;
  email: string;
  role: string;
  phone?: string;
  municipality: string;
  barangay?: string;
  lat?: number;
  lng?: number;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  verified?: boolean;
  status?: string;
  strikeCount?: number;
  rating?: number;
  completedTradesCount?: number;
  warningMessages?: string[];
}) {
  if (!isSqlConfigured()) return { persisted: false, reason: 'sql_unconfigured' };
  try {
    await db
      .insert(users)
      .values({
        uid: payload.uid,
        name: payload.name,
        organization: payload.organization || '',
        email: payload.email,
        role: payload.role,
        phone: payload.phone || '',
        municipality: payload.municipality,
        barangay: payload.barangay || '',
        lat: payload.lat ?? 16.3861,
        lng: payload.lng ?? 121.1065,
        avatar: payload.avatar || '',
        coverPhoto: payload.coverPhoto || '',
        bio: payload.bio || '',
        verified: payload.verified ?? true,
        status: payload.status || 'ACTIVE',
        strikeCount: payload.strikeCount ?? 0,
        rating: payload.rating ?? 4.8,
        completedTradesCount: payload.completedTradesCount ?? 0,
        warningMessages: payload.warningMessages ?? [],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name: payload.name,
          organization: payload.organization || '',
          role: payload.role,
          phone: payload.phone || '',
          municipality: payload.municipality,
          barangay: payload.barangay || '',
          avatar: payload.avatar || '',
          coverPhoto: payload.coverPhoto || '',
          bio: payload.bio || '',
          verified: payload.verified ?? true,
          status: payload.status || 'ACTIVE',
          strikeCount: payload.strikeCount ?? 0,
          completedTradesCount: payload.completedTradesCount ?? 0,
          warningMessages: payload.warningMessages ?? [],
          updatedAt: new Date(),
        },
      });
    return { persisted: true };
  } catch (error) {
    console.warn('upsertUserProfile SQL warning:', error);
    return { persisted: false, reason: 'sql_error' };
  }
}

export async function saveCommodityRecord(payload: {
  id: string;
  name: string;
  category: string;
  supplierUid: string;
  supplierName: string;
  supplierRole: string;
  municipality: string;
  barangay?: string;
  lat?: number;
  lng?: number;
  availableKg: number;
  pricePerKg: number;
  farmgatePricePhp?: number;
  minOrderKg?: number;
  qualityGrade: string;
  aiSuggestedGrade?: string;
  manualGradeOverride?: boolean;
  verificationStatus?: string;
  aiAuthenticityScore?: number;
  aiVisionNotes?: string;
  harvestDate?: string;
  imageUrl?: string;
  notes?: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(commodities)
      .values({
        id: payload.id,
        name: payload.name,
        category: payload.category,
        supplierUid: payload.supplierUid,
        supplierName: payload.supplierName,
        supplierRole: payload.supplierRole,
        municipality: payload.municipality,
        barangay: payload.barangay || '',
        lat: payload.lat ?? 16.3861,
        lng: payload.lng ?? 121.1065,
        availableKg: payload.availableKg,
        pricePerKg: payload.pricePerKg,
        farmgatePricePhp: payload.farmgatePricePhp ?? payload.pricePerKg,
        minOrderKg: payload.minOrderKg ?? 20,
        qualityGrade: payload.qualityGrade,
        aiSuggestedGrade: payload.aiSuggestedGrade || payload.qualityGrade,
        manualGradeOverride: Boolean(payload.manualGradeOverride),
        verificationStatus: payload.verificationStatus || 'PENDING',
        aiAuthenticityScore: payload.aiAuthenticityScore ?? 92,
        aiVisionNotes: payload.aiVisionNotes || '',
        harvestDate: payload.harvestDate || '',
        imageUrl: payload.imageUrl || '',
        notes: payload.notes || '',
      })
      .onConflictDoUpdate({
        target: commodities.id,
        set: {
          availableKg: payload.availableKg,
          pricePerKg: payload.pricePerKg,
          qualityGrade: payload.qualityGrade,
          verificationStatus: payload.verificationStatus || 'PENDING',
          aiAuthenticityScore: payload.aiAuthenticityScore ?? 92,
          aiVisionNotes: payload.aiVisionNotes || '',
        },
      });
    return { persisted: true };
  } catch (error) {
    console.warn('saveCommodityRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function saveCommunityPostRecord(payload: {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  authorMunicipality: string;
  category: string;
  content: string;
  imageUrl?: string;
  likes?: string[];
  reactions?: Record<string, string[]>;
  commentsCount?: number;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(communityPosts)
      .values({
        id: payload.id,
        authorUid: payload.authorUid,
        authorName: payload.authorName,
        authorRole: payload.authorRole,
        authorMunicipality: payload.authorMunicipality,
        category: payload.category,
        content: payload.content,
        imageUrl: payload.imageUrl || '',
        likes: payload.likes ?? [],
        reactions: payload.reactions ?? {},
        commentsCount: payload.commentsCount ?? 0,
      })
      .onConflictDoUpdate({
        target: communityPosts.id,
        set: {
          likes: payload.likes ?? [],
          reactions: payload.reactions ?? {},
          commentsCount: payload.commentsCount ?? 0,
        },
      });
    return { persisted: true };
  } catch (error) {
    console.warn('saveCommunityPostRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function deleteCommunityPostRecord(postId: string) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db.delete(communityPosts).where(eq(communityPosts.id, postId));
    await db.delete(postComments).where(eq(postComments.postId, postId));
    return { persisted: true };
  } catch (error) {
    console.warn('deleteCommunityPostRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function savePostCommentRecord(payload: {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  text: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(postComments)
      .values({
        id: payload.id,
        postId: payload.postId,
        authorUid: payload.authorUid,
        authorName: payload.authorName,
        authorRole: payload.authorRole,
        text: payload.text,
      })
      .onConflictDoNothing();
    return { persisted: true };
  } catch (error) {
    console.warn('savePostCommentRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function saveOrderRecord(payload: {
  id: string;
  commodityId: string;
  commodityName: string;
  buyerUid: string;
  buyerName: string;
  supplierUid: string;
  supplierName: string;
  quantityKg: number;
  listedPricePerKg: number;
  proposedPricePerKg: number;
  totalAmountPhp: number;
  status: string;
  deliveryMode: string;
  deliveryLocation: string;
  paymentOption: string;
  supplierConfirmedSent: boolean;
  buyerConfirmedReceived: boolean;
  chatThreadId: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(orders)
      .values(payload)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          status: payload.status,
          supplierConfirmedSent: payload.supplierConfirmedSent,
          buyerConfirmedReceived: payload.buyerConfirmedReceived,
          updatedAt: new Date(),
        },
      });
    return { persisted: true };
  } catch (error) {
    console.warn('saveOrderRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function savePrivateMessageRecord(payload: {
  id: string;
  threadId: string;
  senderUid: string;
  senderName: string;
  senderRole: string;
  recipientUid?: string;
  text: string;
  isOrderCard?: boolean;
  orderId?: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(privateMessages)
      .values({
        id: payload.id,
        threadId: payload.threadId,
        senderUid: payload.senderUid,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        recipientUid: payload.recipientUid || '',
        text: payload.text,
        isOrderCard: Boolean(payload.isOrderCard),
        orderId: payload.orderId || '',
      })
      .onConflictDoNothing();
    return { persisted: true };
  } catch (error) {
    console.warn('savePrivateMessageRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function saveAiHistoryRecord(payload: {
  id?: string;
  userUid: string;
  userRole: string;
  agentType: string;
  prompt: string;
  responseSummary: string;
  metadata?: Record<string, unknown>;
  poweredByGemini?: boolean;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db.insert(aiHistory).values({
      id: payload.id || `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userUid: payload.userUid,
      userRole: payload.userRole,
      agentType: payload.agentType,
      prompt: payload.prompt,
      responseSummary: payload.responseSummary,
      metadata: payload.metadata ?? {},
      poweredByGemini: Boolean(payload.poweredByGemini),
    });
    return { persisted: true };
  } catch (error) {
    console.warn('saveAiHistoryRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function saveNvatBulletinRecord(payload: {
  id: string;
  bulletinDate: string;
  rawText: string;
  items: unknown[];
  executiveSummary?: string[];
  publishedByUid?: string;
  googleSheetUrl?: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(nvatBulletins)
      .values({
        id: payload.id,
        bulletinDate: payload.bulletinDate,
        rawText: payload.rawText,
        items: payload.items,
        executiveSummary: payload.executiveSummary ?? [],
        publishedByUid: payload.publishedByUid || 'master_admin',
        googleSheetUrl: payload.googleSheetUrl || '',
      })
      .onConflictDoUpdate({
        target: nvatBulletins.id,
        set: {
          items: payload.items,
          executiveSummary: payload.executiveSummary ?? [],
          googleSheetUrl: payload.googleSheetUrl || '',
        },
      });
    return { persisted: true };
  } catch (error) {
    console.warn('saveNvatBulletinRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function createModerationReportRecord(payload: {
  id: string;
  targetType: string;
  targetId: string;
  targetUserUid: string;
  targetUserName: string;
  targetPreview: string;
  reporterUid: string;
  reporterName: string;
  reason: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .insert(moderationReports)
      .values({
        id: payload.id,
        targetType: payload.targetType,
        targetId: payload.targetId,
        targetUserUid: payload.targetUserUid,
        targetUserName: payload.targetUserName,
        targetPreview: payload.targetPreview,
        reporterUid: payload.reporterUid,
        reporterName: payload.reporterName,
        reason: payload.reason,
        status: 'PENDING',
      })
      .onConflictDoNothing();
    return { persisted: true };
  } catch (error) {
    console.warn('createModerationReportRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function resolveModerationReportRecord(payload: {
  id: string;
  status: string;
  resolutionAction: string;
  resolvedByUid: string;
}) {
  if (!isSqlConfigured()) return { persisted: false };
  try {
    await db
      .update(moderationReports)
      .set({
        status: payload.status,
        resolutionAction: payload.resolutionAction,
        resolvedByUid: payload.resolvedByUid,
        resolvedAt: new Date(),
      })
      .where(eq(moderationReports.id, payload.id));
    return { persisted: true };
  } catch (error) {
    console.warn('resolveModerationReportRecord SQL warning:', error);
    return { persisted: false };
  }
}

export async function listDatabaseOverview() {
  if (!isSqlConfigured()) {
    return {
      sqlConnected: false,
      users: [],
      commodities: [],
      communityPosts: [],
      orders: [],
      privateMessages: [],
      aiHistory: [],
      nvatBulletins: [],
      moderationReports: [],
    };
  }
  try {
    const [
      usersRows,
      commoditiesRows,
      postsRows,
      ordersRows,
      messagesRows,
      aiRows,
      bulletinsRows,
      reportsRows,
    ] = await Promise.all([
      db.select().from(users).limit(100),
      db.select().from(commodities).limit(100),
      db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(100),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
      db.select().from(privateMessages).orderBy(desc(privateMessages.createdAt)).limit(200),
      db.select().from(aiHistory).orderBy(desc(aiHistory.createdAt)).limit(100),
      db.select().from(nvatBulletins).orderBy(desc(nvatBulletins.processedAt)).limit(50),
      db.select().from(moderationReports).orderBy(desc(moderationReports.createdAt)).limit(100),
    ]);

    return {
      sqlConnected: true,
      users: usersRows,
      commodities: commoditiesRows,
      communityPosts: postsRows,
      orders: ordersRows,
      privateMessages: messagesRows,
      aiHistory: aiRows,
      nvatBulletins: bulletinsRows,
      moderationReports: reportsRows,
    };
  } catch (error) {
    console.warn('listDatabaseOverview SQL warning:', error);
    return {
      sqlConnected: false,
      users: [],
      commodities: [],
      communityPosts: [],
      orders: [],
      privateMessages: [],
      aiHistory: [],
      nvatBulletins: [],
      moderationReports: [],
    };
  }
}
