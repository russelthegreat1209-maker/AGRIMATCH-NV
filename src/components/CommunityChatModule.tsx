import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Filter,
  Camera,
  Flag,
  Calendar,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import {
  CommunityPost,
  ModerationReport,
  NvatMarketItem,
  ReactionType,
  StakeholderRole,
} from '../types';
import { UserAvatar } from './UserAvatar';
import { REAL_CROP_GALLERY } from '../data/cropAssets';
import {
  aggregateReactions,
  parseNvatTextToStructured,
  REACTION_TYPES,
} from '../utils/agriMath';

const REACTION_META: Record<ReactionType, { label: string; emoji: string; pillClass: string }> = {
  heart: { label: 'Heart', emoji: '❤️', pillClass: 'bg-rose-50 text-rose-700 border-rose-300' },
  wow: { label: 'Wow', emoji: '😮', pillClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  sad: { label: 'Sad', emoji: '😢', pillClass: 'bg-sky-50 text-sky-800 border-sky-300' },
  care: { label: 'Care', emoji: '🤗', pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  angry: { label: 'Angry', emoji: '😡', pillClass: 'bg-red-50 text-red-700 border-red-300' },
};

export const CommunityChatModule: React.FC = () => {
  const {
    currentUser,
    accounts,
    commodities,
    communityPosts,
    createCommunityPost,
    reactToPost,
    addPostComment,
    startPrivateChatWithUser,
    openMarketplaceToCommodity,
    submitModerationReport,
    requestedCommunityView,
    setRequestedCommunityView,
    nvatReport,
    nvatArchive,
    selectedNvatDate,
    setSelectedNvatDate,
    publishStructuredNvatBulletin,
    exportCurrentBulletinToSheets,
    addNotification,
    t,
  } = useApp();

  const [activeView, setActiveView] = useState<'feed' | 'bulletins'>('feed');

  useEffect(() => {
    if (requestedCommunityView) {
      setActiveView(requestedCommunityView);
      setRequestedCommunityView(null);
    }
  }, [requestedCommunityView, setRequestedCommunityView]);

  // Post composer state
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('Update');
  const [postImage, setPostImage] = useState<string>('');
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<string>('ALL');

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-01': true,
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // User Profile Inspection Modal
  const [inspectedUser, setInspectedUser] = useState<{
    id: string;
    name: string;
    role: StakeholderRole;
    avatar: string;
    coverPhoto?: string;
    municipality: string;
    bio?: string;
    verified?: boolean;
  } | null>(null);

  // Moderation Report Modal
  const [reportTarget, setReportTarget] = useState<{
    targetType: ModerationReport['targetType'];
    targetId: string;
    targetUserId: string;
    targetUserName: string;
    targetPreview: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Google Sheets OAuth confirmation dialog
  const [isSheetsConfirmOpen, setIsSheetsConfirmOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Raw bulletin ingestion state
  const [rawNvatInput, setRawNvatInput] = useState('');
  const [isAiStructuring, setIsAiStructuring] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    createCommunityPost(postContent.trim(), postCategory, postImage || undefined);
    setPostContent('');
    setPostImage('');
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handleConfirmSheetsExport = async () => {
    setIsExportingSheets(true);
    try {
      await exportCurrentBulletinToSheets(nvatReport);
      setIsSheetsConfirmOpen(false);
    } catch (err) {
      addNotification(
        err instanceof Error
          ? err.message
          : 'Google Sheets export requires completing the Google authorization popup.',
        'alert'
      );
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportReason.trim()) return;
    submitModerationReport({
      ...reportTarget,
      reason: reportReason.trim(),
    });
    setReportTarget(null);
    setReportReason('');
  };

  const filteredPosts = communityPosts.filter((post) => {
    if (selectedFeedFilter === 'ALL') return true;
    return post.category === selectedFeedFilter;
  });

  const inspectedAccountRecord = inspectedUser
    ? accounts.find((a) => a.id === inspectedUser.id)
    : undefined;
  const inspectedUserCommodities = inspectedUser
    ? commodities.filter(
        (c) => c.supplierId === inspectedUser.id && c.verificationStatus !== 'REJECTED'
      )
    : [];

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-black uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Social Agriculture & Verified Community Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            Producers & Buyers Community Wall
          </h2>
          <p className="text-xs text-neutral-600 font-medium max-w-2xl mt-1">
            Harvest updates, multi-reaction discussions, clickable producer profiles, and NVAT historical bulletins
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveView('feed')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'feed'
                ? 'bg-[#1F4B2C] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.communityWall}</span>
          </button>
          <button
            onClick={() => setActiveView('bulletins')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeView === 'bulletins'
                ? 'bg-[#1F4B2C] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.nvatBulletins}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FACEBOOK-STYLE COMMUNITY SOCIAL FEED */}
      {activeView === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Post Composer Card */}
            <div className="p-5 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md space-y-3">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={currentUser?.name || 'Producer'}
                  avatar={currentUser?.avatar}
                  role={currentUser?.role}
                  sizeClass="w-10 h-10"
                  className="border-2 border-[#91EAAF]"
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={`What's happening on your farm, ${
                      currentUser ? currentUser.name.split(' ')[0] : 'Producer'
                    }? Share harvest updates, concerns, or trading requests...`}
                    className="w-full p-3 text-xs rounded-2xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#4D7111] transition-colors leading-relaxed"
                  />

                  {postImage && (
                    <div className="relative rounded-2xl overflow-hidden border border-neutral-200 max-h-48 w-fit">
                      <img src={postImage} alt="Preview" className="h-40 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setPostImage('')}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-neutral-400">Category:</span>
                      {(
                        ['Update', 'Concern', 'Harvest News', 'Price Advisory', 'Question'] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPostCategory(cat)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            postCategory === cat
                              ? 'bg-[#1F4B2C] text-[#C3E956]'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="p-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setPostImage(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = REAL_CROP_GALLERY[communityPosts.length % REAL_CROP_GALLERY.length].url;
                          setPostImage(next);
                        }}
                        className="p-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sample Crop Photo</span>
                      </button>

                      <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim()}
                        className="px-5 py-2 rounded-full btn-forest text-xs font-black shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#C3E956]" />
                        <span>Post Update</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold text-neutral-600">
              <span className="text-[10px] font-black uppercase text-neutral-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['ALL', 'Harvest News', 'Concern', 'Update', 'Price Advisory', 'Question'].map(
                (filterCat) => (
                  <button
                    key={filterCat}
                    onClick={() => setSelectedFeedFilter(filterCat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                      selectedFeedFilter === filterCat
                        ? 'bg-[#1F4B2C] text-[#C3E956] shadow-xs'
                        : 'bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {filterCat}
                  </button>
                )
              )}
            </div>

            {/* Posts Stream */}
            {filteredPosts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-neutral-200 text-center text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-sm font-bold text-[#1F4B2C]">No posts in this category yet.</p>
                <p className="text-xs text-neutral-500">
                  Switch category or post your farm update above.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const userId = currentUser?.id || 'guest_user';
                const agg = aggregateReactions(post.reactions, post.likes);
                const isExpanded = !!expandedComments[post.id];

                return (
                  <div
                    key={post.id}
                    className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3.5 hover:border-[#91EAAF] transition-colors text-left"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setInspectedUser({
                            id: post.authorId,
                            name: post.authorName,
                            role: post.authorRole,
                            avatar: post.authorAvatar,
                            municipality: post.authorMunicipality,
                            bio: 'Verified active participant in Nueva Vizcaya digital agricultural exchange.',
                            verified: true,
                          })
                        }
                        className="flex items-center gap-3 cursor-pointer group text-left"
                      >
                        <UserAvatar
                          name={post.authorName}
                          avatar={post.authorAvatar}
                          role={post.authorRole}
                          sizeClass="w-11 h-11"
                          className="border-2 border-[#91EAAF] group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-[#1F4B2C] group-hover:underline">
                              {post.authorName}
                            </h4>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-[#1F4B2C] text-[#C3E956]">
                              {post.authorRole}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#4D7111]" />
                            <span>{post.authorMunicipality}</span> • <span>{post.timestamp}</span>
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                          {post.category}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              targetType: 'POST',
                              targetId: post.id,
                              targetUserId: post.authorId,
                              targetUserName: post.authorName,
                              targetPreview: post.content.slice(0, 70),
                            })
                          }
                          className="p-1.5 rounded-full text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Report post"
                          aria-label="Report post"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-neutral-200 max-h-72">
                        <img
                          src={post.imageUrl}
                          alt="Farm update capture"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Multi-Reaction Summary & Comments Count */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-neutral-700 mr-1">
                          {agg.total} reactions
                        </span>
                        {REACTION_TYPES.filter((r) => agg.counts[r] > 0).map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-700"
                          >
                            <span>{REACTION_META[r].emoji}</span>
                            <span>{agg.counts[r]}</span>
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold">{post.comments.length} comments</span>
                    </div>

                    {/* 5-Reaction Interactive Picker Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {REACTION_TYPES.map((rType) => {
                        const meta = REACTION_META[rType];
                        const isMine =
                          post.reactions?.[rType]?.includes(userId) ||
                          (rType === 'heart' && !post.reactions && post.likes.includes(userId));
                        return (
                          <button
                            key={rType}
                            type="button"
                            onClick={() => reactToPost(post.id, rType)}
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-all ${
                              isMine
                                ? `${meta.pillClass} shadow-xs scale-105`
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                            {agg.counts[rType] > 0 && (
                              <span className="font-mono text-[10px]">({agg.counts[rType]})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Comment & Private Message Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs font-bold">
                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-700" />
                        <span>Comments ({post.comments.length})</span>
                      </button>

                      <button
                        onClick={() =>
                          startPrivateChatWithUser({
                            id: post.authorId,
                            name: post.authorName,
                            role: post.authorRole,
                            avatar: post.authorAvatar,
                          })
                        }
                        className="py-2 rounded-xl bg-[#1F4B2C]/10 hover:bg-[#1F4B2C] text-[#1F4B2C] hover:text-[#C3E956] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Private Chat</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-neutral-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={currentUser?.name || 'You'}
                            avatar={currentUser?.avatar}
                            role={currentUser?.role}
                            sizeClass="w-7 h-7"
                            textSizeClass="text-[10px]"
                            className="border border-[#91EAAF]"
                          />
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="Write a comment or price response..."
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#4D7111]"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-1.5 rounded-xl btn-forest text-xs font-bold"
                          >
                            Reply
                          </button>
                        </div>

                        {post.comments.length > 0 && (
                          <div className="space-y-2 pl-2 border-l-2 border-neutral-200">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-2.5 rounded-2xl bg-neutral-50 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setInspectedUser({
                                        id: comment.authorId,
                                        name: comment.authorName,
                                        role: comment.authorRole,
                                        avatar: comment.authorAvatar,
                                        municipality: 'Nueva Vizcaya',
                                      })
                                    }
                                    className="flex items-center gap-2 cursor-pointer group text-left"
                                  >
                                    <UserAvatar
                                      name={comment.authorName}
                                      avatar={comment.authorAvatar}
                                      role={comment.authorRole}
                                      sizeClass="w-6 h-6"
                                      textSizeClass="text-[9px]"
                                    />
                                    <span className="font-bold text-[#1F4B2C] group-hover:underline">
                                      {comment.authorName}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-neutral-200 text-neutral-700">
                                      {comment.authorRole}
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-neutral-400">
                                      {comment.timestamp}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReportTarget({
                                          targetType: 'COMMENT',
                                          targetId: comment.id,
                                          targetUserId: comment.authorId,
                                          targetUserName: comment.authorName,
                                          targetPreview: comment.text.slice(0, 70),
                                        })
                                      }
                                      className="p-1 rounded-full text-neutral-400 hover:text-red-600"
                                      title="Report comment"
                                    >
                                      <Flag className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-neutral-700 pl-7 leading-relaxed font-medium">
                                  {comment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-[#91EAAF] shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4D7111]" />
                  Active Hub Producers
                </h4>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'farmer_01',
                    name: 'Mang Ramon Dela Cruz',
                    role: 'Farmer' as StakeholderRole,
                    municipality: 'Kayapa',
                    avatar: '',
                  },
                  {
                    id: 'farmer_02',
                    name: 'Aling Teresita Pascual',
                    role: 'Farmer' as StakeholderRole,
                    municipality: 'Bambang',
                    avatar: '',
                  },
                  {
                    id: 'coop_01',
                    name: 'Kasibu Citrus Growers Multipurpose Coop',
                    role: 'Cooperative' as StakeholderRole,
                    municipality: 'Kasibu',
                    avatar: '',
                  },
                ].map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedUser({
                          id: u.id,
                          name: u.name,
                          role: u.role,
                          avatar: u.avatar,
                          municipality: u.municipality,
                          verified: true,
                        })
                      }
                      className="flex items-center gap-2 min-w-0 text-left group"
                    >
                      <UserAvatar
                        name={u.name}
                        avatar={u.avatar}
                        role={u.role}
                        sizeClass="w-8 h-8"
                        textSizeClass="text-[10px]"
                        className="border border-[#91EAAF]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1F4B2C] truncate group-hover:underline">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate">{u.municipality}</p>
                      </div>
                    </button>

                    <button
                      onClick={() => startPrivateChatWithUser(u)}
                      className="px-2.5 py-1 rounded-xl btn-forest text-[10px] font-bold shrink-0"
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1F4B2C] to-[#2E6B3E] text-white shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/20">
                <span className="text-xs font-bold text-[#C3E956] uppercase tracking-wider">
                  Prevailing NVAT Bambang
                </span>
                <span className="text-[10px] font-mono text-[#91EAAF]">{nvatReport.date}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {nvatReport.items.slice(0, 4).map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="font-medium text-neutral-200">{it.commodityName}</span>
                    <span className="font-bold text-[#C3E956] tabular-nums">₱{it.prevailingPricePhp}/kg</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveView('bulletins')}
                className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-[#F4FFFC] text-xs font-bold text-center transition-colors"
              >
                Open NVAT Bulletins & Past Dates →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: NVAT DAILY PRICE BULLETINS + PAST DATES ARCHIVE + GOOGLE SHEETS SYNC */}
      {activeView === 'bulletins' && (
        <div className="space-y-6">
          {/* Past Dates Archive Selector */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F4B2C]">
                <Calendar className="w-4 h-4 text-[#4D7111]" />
                <span>NVAT Daily Bulletins Archive (Select Any Past Date)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetsConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Sync Bulletin ({nvatReport.date}) to Google Sheets</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {nvatArchive.map((rep) => {
                const isSelected = rep.date === nvatReport.date;
                return (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => setSelectedNvatDate(rep.date)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1F4B2C] text-[#C3E956] border-[#1F4B2C] shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rep.date}</span>
                    <span className="text-[10px] opacity-80">({rep.items.length} items)</span>
                  </button>
                );
              })}
            </div>

            {nvatReport.googleSheetUrl && (
              <a
                href={nvatReport.googleSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Exported Google Sheet for {nvatReport.date}</span>
              </a>
            )}
          </div>

          {/* Admin / DA Price Ingestion Panel */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-black text-[#1F4B2C]">
                  Human-in-the-Loop NVAT Market Price Ingestion
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Insert NVAT daily bulletin paragraphs to structure and publish to the dated archive
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-black">
                Ingestion Engine
              </span>
            </div>

            <textarea
              rows={4}
              value={rawNvatInput}
              onChange={(e) => setRawNvatInput(e.target.value)}
              placeholder="Paste raw daily bulletin text from NVAT Bambang or DA Region 2..."
              className="w-full p-3.5 text-xs rounded-2xl border border-neutral-300 bg-neutral-50 font-mono"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setRawNvatInput(
                    `NVAT Bambang Daily Bulletin: Highland Cabbage at Php 32/kg with 42 tons traded. Red Onions prevailing at Php 98/kg with 18 tons inbound. Satsuki Tomatoes trading at Php 52/kg, Satsuma Mandarins at Php 75/kg.`
                  );
                }}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-50 text-neutral-700"
              >
                Load Kayapa Harvest Sample
              </button>
              <button
                disabled={!rawNvatInput.trim() || isAiStructuring}
                onClick={async () => {
                  if (!rawNvatInput.trim()) return;
                  setIsAiStructuring(true);
                  const today = new Date().toISOString().split('T')[0];
                  try {
                    const res = await fetch('/api/ai/nvat-parse', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ rawText: rawNvatInput, defaultDate: today }),
                    });
                    const data = res.ok ? await res.json() : { items: null };
                    const parsed: NvatMarketItem[] =
                      Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map((it: any, idx: number) => {
                            const prev = Number(it.prevailingPricePhp) || 35;
                            const previous = Number(it.previousPricePhp) || prev;
                            const variance = Math.round(((prev - previous) / Math.max(previous, 1)) * 1000) / 10;
                            return {
                              id: `nvat-${Date.now()}-${idx}`,
                              commodityName: String(it.commodityName || 'NVAT Commodity'),
                              category: (it.category as any) || 'Highland Vegetables',
                              minPricePhp: Number(it.minPricePhp) || Math.round(prev * 0.9),
                              maxPricePhp: Number(it.maxPricePhp) || Math.round(prev * 1.1),
                              prevailingPricePhp: prev,
                              previousPricePhp: previous,
                              priceVariancePercent: variance,
                              estimatedVolumeTradedTons: Number(it.estimatedVolumeTradedTons) || 15,
                              marketTrendStatus: variance > 2 ? 'Surging' : variance < -2 ? 'Declining' : 'Stable',
                              date: today,
                              unitOfMeasure: 'PHP / kg',
                              priceType: 'Confirmed',
                              originalDataSource: 'NVAT Daily Bulletin, Bambang',
                              requiresReview: false,
                              lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PHT',
                            };
                          })
                        : parseNvatTextToStructured(rawNvatInput, today);
                    publishStructuredNvatBulletin(parsed, 'NVAT Terminal Ingestion');
                  } catch {
                    publishStructuredNvatBulletin(parseNvatTextToStructured(rawNvatInput, today), 'NVAT Terminal Ingestion');
                  } finally {
                    setIsAiStructuring(false);
                  }
                }}
                className="px-5 py-2 rounded-xl btn-sprout text-xs font-black flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-[#1F4B2C] ${isAiStructuring ? 'animate-spin' : ''}`} />
                <span>{isAiStructuring ? 'Parsing Bulletin...' : 'Validate & Publish to Public Bulletin'}</span>
              </button>
            </div>
          </div>

          {/* Selected Date Standardized Table */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">
                NVAT Commodity Benchmarks — {nvatReport.date} ({nvatReport.items.length} Commodities)
              </h4>
              <span className="text-xs font-semibold text-neutral-500">
                Source: NVAT Bambang Trading Post
              </span>
            </div>

            {nvatReport.executiveSummary.length > 0 && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-700">
                {nvatReport.executiveSummary.map((line, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-[#F4FFFC] border border-[#91EAAF]/60 font-medium">
                    {line}
                  </li>
                ))}
              </ul>
            )}

            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4FFFC] text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Range (₱/kg)</th>
                    <th className="p-3">Prevailing Price</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Volume Traded</th>
                    <th className="p-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {nvatReport.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">{item.commodityName}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-mono text-neutral-600">
                        ₱{item.minPricePhp}–₱{item.maxPricePhp}
                      </td>
                      <td className="p-3 font-bold text-[#4D7111] tabular-nums">₱{item.prevailingPricePhp}/kg</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.priceType || 'Confirmed'}
                        </span>
                      </td>
                      <td className="p-3 tabular-nums">{item.estimatedVolumeTradedTons} MT</td>
                      <td className="p-3 font-bold">{item.marketTrendStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE INSPECTION MODAL (Includes Posted Commodities clickable to Marketplace) */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#91EAAF] overflow-hidden text-left my-8">
            <div className="h-28 bg-gradient-to-r from-[#1F4B2C] to-[#4D7111] relative">
              {inspectedAccountRecord?.coverPhoto && (
                <img
                  src={inspectedAccountRecord.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-85"
                />
              )}
              <button
                onClick={() => setInspectedUser(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 pt-0 relative space-y-4">
              <div className="flex items-end justify-between -mt-12 mb-2">
                <UserAvatar
                  name={inspectedUser.name}
                  avatar={inspectedAccountRecord?.avatar || inspectedUser.avatar}
                  role={inspectedUser.role}
                  sizeClass="w-20 h-20"
                  textSizeClass="text-xl"
                  className="border-4 border-white shadow-lg"
                />
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#1F4B2C] text-[#C3E956]">
                  {inspectedUser.role}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-[#1F4B2C]">{inspectedUser.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {inspectedAccountRecord?.completedTradesCount ?? 0} Completed Deals
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {inspectedAccountRecord?.strikeCount ?? 0} Strikes
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4D7111]" />
                  <span>{inspectedAccountRecord?.municipality || inspectedUser.municipality}, Nueva Vizcaya</span>
                </p>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                {inspectedAccountRecord?.bio ||
                  inspectedUser.bio ||
                  'Active verified agricultural stakeholder in Nueva Vizcaya.'}
              </p>

              {/* Supplier's Posted Commodities — Tappable to Jump Directly to Marketplace & Highlight */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#4D7111]" />
                  Posted Commodities ({inspectedUserCommodities.length})
                </h4>

                {inspectedUserCommodities.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    No active produce listings posted by this stakeholder yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {inspectedUserCommodities.map((crop) => (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => {
                          setInspectedUser(null);
                          openMarketplaceToCommodity(crop.id);
                        }}
                        className="w-full p-2.5 rounded-2xl bg-[#F4FFFC] hover:bg-[#C3E956]/30 border border-[#91EAAF] flex items-center justify-between gap-3 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={crop.imageUrl}
                            alt={crop.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#1F4B2C] truncate">{crop.name}</p>
                            <p className="text-[10px] text-neutral-600">
                              {crop.availableKg.toLocaleString()} kg · ₱{crop.pricePerKg}/kg · {crop.qualityGrade}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black shrink-0">
                          Buy in Market →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex gap-2">
                <button
                  onClick={() => {
                    startPrivateChatWithUser({
                      id: inspectedUser.id,
                      name: inspectedUser.name,
                      role: inspectedUser.role,
                      avatar: inspectedUser.avatar,
                    });
                    setInspectedUser(null);
                  }}
                  className="flex-1 py-2.5 rounded-full btn-forest text-xs font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-[#C3E956]" />
                  <span>Private Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedUser;
                    setInspectedUser(null);
                    setReportTarget({
                      targetType: 'ACCOUNT',
                      targetId: target.id,
                      targetUserId: target.id,
                      targetUserName: target.name,
                      targetPreview: `${target.role} profile (${target.municipality})`,
                    });
                  }}
                  className="px-3.5 py-2.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE SHEETS EXPORT EXPLICIT CONFIRMATION MODAL */}
      {isSheetsConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#91EAAF] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-[#1F4B2C] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                Confirm Export to Google Sheets
              </h3>
              <button
                onClick={() => setIsSheetsConfirmOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              This will create a new Google Spreadsheet titled{' '}
              <strong>AgriMatch NV - NVAT Daily Commodity Bulletin ({nvatReport.date})</strong>{' '}
              in your Google Drive with {nvatReport.items.length} commodity pricing rows and AI executive notes. You may be prompted to authorize Google Sheets access.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSheetsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExportingSheets}
                onClick={handleConfirmSheetsExport}
                className="px-4 py-2 rounded-xl btn-forest text-xs font-black disabled:opacity-50"
              >
                {isExportingSheets ? 'Exporting to Google Sheets...' : 'Confirm & Create Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODERATION REPORT MODAL */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-red-800 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Report Content / Stakeholder
              </h3>
              <button
                onClick={() => setReportTarget(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Reporting <strong>{reportTarget.targetUserName}</strong> ({reportTarget.targetType}): "{reportTarget.targetPreview}"
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="State reason for Master Admin review..."
                className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
