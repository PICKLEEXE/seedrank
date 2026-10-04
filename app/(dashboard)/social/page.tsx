"use client";

import { useEffect, useState } from "react";
import {
  Linkedin,
  Plus,
  Calendar,
  BarChart3,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  MousePointerClick,
  Trash2,
  Edit,
  Send,
  Sparkles,
  Clock,
  CheckCircle,
  FileText,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";

interface LinkedInPost {
  id: string;
  content: string;
  hook: string | null;
  cta: string | null;
  hashtags: string[];
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  createdAt: string;
}

const STATUS_FILTERS = [
  { key: "all", label: "All Posts" },
  { key: "draft", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published", label: "Published" },
];

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  draft: { color: "bg-gray-100 text-gray-600", icon: FileText, label: "Draft" },
  scheduled: { color: "bg-purple-100 text-purple-700", icon: Clock, label: "Scheduled" },
  published: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Published" },
  generating: { color: "bg-yellow-100 text-yellow-700", icon: Sparkles, label: "Generating" },
};

function formatDateTime(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export default function LinkedInAutopilotPage() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);

  const [composeForm, setComposeForm] = useState({
    content: "",
    hashtags: "",
    scheduledFor: "",
  });

  const [generateForm, setGenerateForm] = useState({
    articleTitle: "",
    tone: "professional",
  });

  async function fetchPosts() {
    const res = await fetch("/api/social/linkedin");
    const data = await res.json();
    setPosts(data.posts || []);
    setConnected(data.connected || false);
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = posts.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  const publishedPosts = posts.filter((p) => p.status === "published");
  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const draftPosts = posts.filter((p) => p.status === "draft");

  const totalImpressions = publishedPosts.reduce((s, p) => s + p.impressions, 0);
  const totalEngagement = publishedPosts.reduce(
    (s, p) => s + p.likes + p.comments + p.shares,
    0
  );
  const avgEngagementRate =
    publishedPosts.length > 0 && totalImpressions > 0
      ? ((totalEngagement / totalImpressions) * 100).toFixed(1)
      : "0.0";
  const totalClicks = publishedPosts.reduce((s, p) => s + p.clicks, 0);

  async function handleGenerate() {
    setGenerating(true);
    const res = await fetch("/api/social/linkedin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(generateForm),
    });
    const data = await res.json();
    if (data.post) {
      setComposeForm({
        content: data.post.content,
        hashtags: (data.post.hashtags || []).join(", "),
        scheduledFor: "",
      });
      setShowGenerate(false);
      setShowCompose(true);
    }
    setGenerating(false);
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const hashtags = composeForm.hashtags
      .split(",")
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);

    if (editingPost) {
      await fetch(`/api/social/linkedin/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: composeForm.content,
          hashtags,
          scheduledFor: composeForm.scheduledFor || null,
          status: composeForm.scheduledFor ? "scheduled" : "draft",
        }),
      });
    } else {
      await fetch("/api/social/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: composeForm.content,
          hashtags,
          scheduledFor: composeForm.scheduledFor || null,
        }),
      });
    }

    setSaving(false);
    setShowCompose(false);
    setEditingPost(null);
    setComposeForm({ content: "", hashtags: "", scheduledFor: "" });
    fetchPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/social/linkedin/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function openEdit(post: LinkedInPost) {
    setEditingPost(post);
    setComposeForm({
      content: post.content,
      hashtags: post.hashtags.join(", "),
      scheduledFor: post.scheduledFor
        ? new Date(post.scheduledFor).toISOString().slice(0, 16)
        : "",
    });
    setShowCompose(true);
  }

  function closeCompose() {
    setShowCompose(false);
    setEditingPost(null);
    setComposeForm({ content: "", hashtags: "", scheduledFor: "" });
  }

  const charCount = composeForm.content.length;
  const charLimit = 3000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Autopilot</h1>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
              Beta
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Generate, schedule, and publish LinkedIn posts from your articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Generate
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Linkedin className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">LinkedIn Connection</p>
              <p className="text-blue-100 text-sm">
                {connected
                  ? "Your account is connected. Posts will publish automatically."
                  : "Connect your LinkedIn account to enable autopilot publishing."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {connected ? (
              <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                <CheckCircle className="h-4 w-4" /> Connected
              </span>
            ) : (
              <button className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                Connect LinkedIn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Posts"
          value={posts.length.toString()}
          icon={FileText}
          iconColor="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Impressions"
          value={formatNumber(totalImpressions)}
          icon={Eye}
          iconColor="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Engagement Rate"
          value={avgEngagementRate + "%"}
          icon={BarChart3}
          iconColor="text-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Link Clicks"
          value={formatNumber(totalClicks)}
          icon={MousePointerClick}
          iconColor="text-orange-500"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Scheduled"
          value={scheduledPosts.length.toString()}
          icon={Calendar}
          iconColor="text-indigo-500"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* Status Tabs + Posts List */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 text-xs text-gray-400">
                {key === "draft"
                  ? draftPosts.length
                  : key === "scheduled"
                  ? scheduledPosts.length
                  : publishedPosts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Linkedin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No posts yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            Create your first LinkedIn post or let AI generate one from your articles.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowGenerate(true)}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              Generate with AI
            </button>
            <button
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Write a Post
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => {
            const config = statusConfig[post.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Status + Date row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                      {post.scheduledFor && post.status === "scheduled" && (
                        <span className="text-xs text-gray-400">
                          {formatDateTime(post.scheduledFor)}
                        </span>
                      )}
                      {post.publishedAt && post.status === "published" && (
                        <span className="text-xs text-gray-400">
                          {formatDateTime(post.publishedAt)}
                        </span>
                      )}
                    </div>

                    {/* Post content preview */}
                    <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-4">
                      {post.content}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement stats for published posts */}
                    {post.status === "published" && (
                      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
                        <EngagementStat icon={Eye} value={post.impressions} label="Views" />
                        <EngagementStat icon={ThumbsUp} value={post.likes} label="Likes" />
                        <EngagementStat
                          icon={MessageSquare}
                          value={post.comments}
                          label="Comments"
                        />
                        <EngagementStat icon={Share2} value={post.shares} label="Shares" />
                        <EngagementStat
                          icon={MousePointerClick}
                          value={post.clicks}
                          label="Clicks"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {post.status !== "published" && (
                      <button
                        onClick={() => openEdit(post)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose / Edit Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPost ? "Edit Post" : "New LinkedIn Post"}
              </h2>
              <button
                onClick={closeCompose}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSavePost} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Content
                </label>
                <textarea
                  value={composeForm.content}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, content: e.target.value })
                  }
                  rows={8}
                  required
                  maxLength={charLimit}
                  placeholder="Write your LinkedIn post here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      charCount > charLimit * 0.9
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {charCount}/{charLimit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={composeForm.hashtags}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, hashtags: e.target.value })
                  }
                  placeholder="SEO, ContentMarketing, AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate with commas. 3 to 5 hashtags is recommended for reach.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={composeForm.scheduledFor}
                  onChange={(e) =>
                    setComposeForm({
                      ...composeForm,
                      scheduledFor: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to save as draft. Set a date to schedule it.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCompose}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || composeForm.content.trim().length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    "Saving..."
                  ) : composeForm.scheduledFor ? (
                    <>
                      <Calendar className="h-4 w-4" /> Schedule
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Save Draft
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  AI Post Generator
                </h2>
              </div>
              <button
                onClick={() => setShowGenerate(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Enter your article topic or title and AI will generate a
                LinkedIn post optimized for engagement.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Title or Topic
                </label>
                <input
                  type="text"
                  value={generateForm.articleTitle}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      articleTitle: e.target.value,
                    })
                  }
                  placeholder="e.g. How to Rank #1 on Google in 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone
                </label>
                <select
                  value={generateForm.tone}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, tone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="bold">Bold and Direct</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerate(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={
                    generating || generateForm.articleTitle.trim().length === 0
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function EngagementStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      <span className="text-xs font-medium text-gray-700">
        {formatNumber(value)}
      </span>
      <span className="text-xs text-gray-400 hidden sm:inline">{label}</span>
    </div>
  );
}
