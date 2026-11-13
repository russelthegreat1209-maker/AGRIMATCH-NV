import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  MessageSquare,
  Heart,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  User,
  Users,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  X,
  Filter,
  Camera,
  Layers,
  Building2,
  Tag,
} from 'lucide-react';
import { CommunityPost, NvatMarketItem, StakeholderRole } from '../types';

export const CommunityChatModule: React.FC = () => {
  const {
    currentUser,
    communityPosts,
    createCommunityPost,
    likeCommunityPost,
    addPostComment,
    startPrivateChatWithUser,
    addNotification,
    nvatReport,
    publishStructuredNvatBulletin,
    environmentMode,
    t,
  } = useApp();

  // Active view: 'feed' (Facebook-style wall) or 'bulletins' (NVAT market price ingestion)
  const [activeView, setActiveView] = useState<'feed' | 'bulletins'>('feed');

  // Post composer state
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('Update');
  const [postImage, setPostImage] = useState<string>('');
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<string>('ALL');

  // Comments open state per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-01': true,
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // User Profile Inspection Modal (opened when clicking author avatar or name)
  const [inspectedUser, setInspectedUser] = useState<{
    id: string;
    name: string;
    role: StakeholderRole;
    avatar: string;
    coverPhoto?: string;
    municipality: string;
    barangay?: string;
    phone?: string;
    bio?: string;
    verified?: boolean;
  } | null>(null);

  // Raw bulletin ingestion state
  const [rawNvatInput, setRawNvatInput] = useState('');
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [stagedItems, setStagedItems] = useState<NvatMarketItem[]>([]);

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

  const filteredPosts = communityPosts.filter((post) => {
    if (selectedFeedFilter === 'ALL') return true;
    return post.category === selectedFeedFilter;
  });

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
            Real-time harvest updates, pest concerns, trading requests, and direct private negotiations
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
          {/* Main Feed Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Post Composer Card */}
            <div className="p-5 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={
                    currentUser?.avatar ||
                    '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp'
                  }
                  alt={currentUser?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#91EAAF] shrink-0"
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

                  {/* Image Preview if uploaded */}
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

                  {/* Actions & Category Bar */}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPostImage(
                            '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp'
                          )
                        }
                        className="p-1.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-bold flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add Photo</span>
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
                  {environmentMode === 'production'
                    ? 'In Live Mode, you are connected to the real-time database. Be the first to share an update!'
                    : 'Switch category or post your farm update above.'}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLikedByMe = currentUser ? post.likes.includes(currentUser.id) : false;
                const isExpanded = !!expandedComments[post.id];

                return (
                  <div
                    key={post.id}
                    className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3.5 hover:border-[#91EAAF] transition-colors text-left"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div
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
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#91EAAF] group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-[#1F4B2C] group-hover:text-emerald-800 transition-colors">
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
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Attached Photo */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-neutral-200 max-h-72">
                        <img
                          src={post.imageUrl}
                          alt="Farm update capture"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Post Stats (Likes & Comments counts) */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                      <span className="flex items-center gap-1 font-bold text-neutral-700">
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        <span>{post.likes.length} likes</span>
                      </span>
                      <span className="font-semibold">{post.comments.length} comments</span>
                    </div>

                    {/* Action Buttons: Like | Comment | Direct Private Message */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100 text-xs font-bold">
                      <button
                        onClick={() => likeCommunityPost(post.id)}
                        className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          isLikedByMe
                            ? 'bg-red-50 text-red-600 font-black'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLikedByMe ? 'fill-red-500 text-red-500' : ''}`}
                        />
                        <span>{isLikedByMe ? 'Liked' : 'Like'}</span>
                      </button>

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
                        <span>Comment</span>
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
                        {/* New Comment Input */}
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              currentUser?.avatar ||
                              '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp'
                            }
                            alt="You"
                            className="w-7 h-7 rounded-full object-cover border border-[#91EAAF]"
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

                        {/* List of Comments */}
                        {post.comments.length > 0 && (
                          <div className="space-y-2 pl-2 border-l-2 border-neutral-200">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-2.5 rounded-2xl bg-neutral-50 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div
                                    onClick={() =>
                                      setInspectedUser({
                                        id: comment.authorId,
                                        name: comment.authorName,
                                        role: comment.authorRole,
                                        avatar: comment.authorAvatar,
                                        municipality: 'Nueva Vizcaya',
                                      })
                                    }
                                    className="flex items-center gap-2 cursor-pointer group"
                                  >
                                    <img
                                      src={comment.authorAvatar}
                                      alt={comment.authorName}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span className="font-bold text-[#1F4B2C] group-hover:underline">
                                      {comment.authorName}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-neutral-200 text-neutral-700">
                                      {comment.authorRole}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-neutral-400">
                                    {comment.timestamp}
                                  </span>
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

          {/* Sidebar Column: Active Agricultural Stakeholders & Live Bulletin Snippet */}
          <div className="space-y-4">
            {/* Quick Stakeholder Connect Card */}
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
                    municipality: 'Kayapa (Highlands)',
                    specialty: 'Highland Cabbage & Carrots',
                    avatar:
                      '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121743_0000_c74c3479.webp',
                  },
                  {
                    id: 'farmer_02',
                    name: 'Aling Teresita Pascual',
                    role: 'Farmer' as StakeholderRole,
                    municipality: 'Bambang (Lowlands)',
                    specialty: 'Red Creole Onions & Garlic',
                    avatar:
                      '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121815_0000_3e33f2ef.webp',
                  },
                  {
                    id: 'coop_01',
                    name: 'Kasibu Citrus Growers',
                    role: 'Cooperative' as StakeholderRole,
                    municipality: 'Kasibu Valley',
                    specialty: 'Satsuma Mandarins & Ponkan',
                    avatar:
                      '/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121731_0000_3693cdfa.webp',
                  },
                ].map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#91EAAF] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1F4B2C] truncate">{u.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{u.municipality}</p>
                      </div>
                    </div>

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

            {/* Prevailing NVAT Pricing Snapshot */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1F4B2C] to-[#2E6B3E] text-white shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/20">
                <span className="text-xs font-bold text-[#C3E956] uppercase tracking-wider">
                  Prevailing NVAT Bambang
                </span>
                <span className="text-[10px] font-mono text-[#91EAAF]">Live Feed</span>
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
                Open Full NVAT Market Ledger →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HUMAN-IN-THE-LOOP NVAT PRICE BULLETIN INGESTION */}
      {activeView === 'bulletins' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border-2 border-[#91EAAF] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-black text-[#1F4B2C]">
                  Human-in-the-Loop NVAT Market Price Ingestion
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Document intake (PDF, photo, raw bulletin text) with anti-hallucination validation before publishing
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-black">
                Official Ingestion Engine
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
                onClick={() => {
                  if (!rawNvatInput.trim()) return;
                  setIsAiStructuring(true);
                  setTimeout(() => {
                    publishStructuredNvatBulletin(nvatReport.items, 'NVAT Terminal Ingestion');
                    setIsAiStructuring(false);
                    addNotification('NVAT Price Bulletin approved and published to live tables!', 'success');
                  }, 600);
                }}
                className="px-5 py-2 rounded-xl btn-sprout text-xs font-black flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#1F4B2C]" />
                <span>Validate & Publish to Public Bulletin</span>
              </button>
            </div>
          </div>

          {/* Current Pinned Standardized Table */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-md space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">
              Currently Pinned Commodity Benchmarks ({nvatReport.items.length} Commodities)
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4FFFC] text-[#1F4B2C] font-black border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Prevailing Price</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Data Source</th>
                    <th className="p-3">Volume Traded</th>
                    <th className="p-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {nvatReport.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-[#1F4B2C]">{item.commodityName}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-semibold">{item.unitOfMeasure || 'kg'}</td>
                      <td className="p-3 font-bold text-[#4D7111] tabular-nums">₱{item.prevailingPricePhp}/kg</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.priceType || 'Confirmed'}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-500">{item.originalDataSource || 'NVAT Bambang'}</td>
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

      {/* USER PROFILE INSPECTION MODAL (When author avatar or name is clicked) */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#91EAAF] overflow-hidden text-left">
            {/* Cover Photo */}
            <div className="h-28 bg-gradient-to-r from-[#1F4B2C] to-[#4D7111] relative">
              <img
                src={
                  inspectedUser.coverPhoto ||
                  '/assets/aistudio/file_000000000e5c8209a20727869a247797_07ecb429.jpg'
                }
                alt="Cover"
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => setInspectedUser(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-6 pt-0 relative space-y-4">
              <div className="flex items-end justify-between -mt-12 mb-2">
                <img
                  src={inspectedUser.avatar}
                  alt={inspectedUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                />
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#1F4B2C] text-[#C3E956]">
                  {inspectedUser.role}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-[#1F4B2C]">{inspectedUser.name}</h3>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                </div>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4D7111]" />
                  <span>{inspectedUser.municipality}, Nueva Vizcaya</span>
                </p>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                {inspectedUser.bio || 'Active verified agricultural stakeholder in Nueva Vizcaya.'}
              </p>

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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
