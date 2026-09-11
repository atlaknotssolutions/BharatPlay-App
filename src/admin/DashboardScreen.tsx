import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Play, Plus, Check } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "./Navbar";
import TopicChips from "./TopicChips";

import { API_ORIGIN } from "../../config/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

const SHORT_WIDTH = (SCREEN_WIDTH - 44) / 2;
const SHORT_HEIGHT = SHORT_WIDTH * (16 / 9);

const BACKEND_URL = API_ORIGIN;
const API_BASE = `${BACKEND_URL}/api/uservideo`;

const toMediaUrl = (value: unknown, fallback: string) => {
  if (!value) return fallback;

  const path = String(value).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(path)) return path;

  return `${BACKEND_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
};

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const normalizeVideoListItem = (video: Record<string, any> = {}) => ({
  id: video._id || video.id,
  title: video.title || "Untitled video",
  thumb: toMediaUrl(
    video.thumbnail,
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  ),
  thumbnail: toMediaUrl(
    video.thumbnail,
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  ),
  description: video.description || "",
  views: Number(video.views || 0),
  likesCount: Number(video.likesCount ?? video.likes ?? 0),
  dislikesCount: Number(video.dislikesCount ?? 0),
  videoUrl: toMediaUrl(video.videoUrl, ""),
  videoType: video.videoType || null,
  raw: video,
  channel: video.channel || null,
  createdAt: video.createdAt || null,
  watchedPercent: Number(video.watchedPercent || 0),
  isLiked: Boolean(video.isLiked || video.userReaction === "like"),
  isDisliked: Boolean(video.isDisliked || video.userReaction === "dislike"),
});

const normalizeShort = (video = {}) => ({
  id: video._id || video.id,
  title: video.title || "Untitled short",
  thumbnail: toMediaUrl(
    video.thumbnail,
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  ),
  views: Number(video.views || 0),
  likes: Number(video.likesCount ?? video.likes ?? 0),
  comments: Number(video.comments || 0),
  videoUrl: toMediaUrl(video.videoUrl, ""),
  videoType: video.videoType || "short",
  raw: video,
  isShort: true,
});

const normalizeSubscriptionChannel = (channel = {}) => ({
  id: channel._id || channel.id || channel.channelId,
  title: channel.name || channel.channelName || "Subscribed Channel",
  thumb:
    channel.channelImage ||
    channel.avatar ||
    channel.image ||
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  thumbnail:
    channel.channelImage ||
    channel.avatar ||
    channel.image ||
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  description: channel.description || "",
  views: Number(channel.views || 0),
  raw: channel,
  channel: channel.channel || channel,
  isChannel: true,
  videoType: "channel",
});

const getArrayFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.videos)) return payload.videos;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.channels)) return payload.channels;
  if (Array.isArray(payload?.subscribedChannels))
    return payload.subscribedChannels;
  if (Array.isArray(payload?.subscribers)) return payload.subscribers;
  return [];
};

const fetchWithAuth = async (endpoint) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_BASE}/${endpoint}`, { headers });
    const data = await res.json().catch(() => ({}));
    return getArrayFromPayload(data);
  } catch (e) {
    console.warn(`Fetch error (${endpoint}):`, e);
    return [];
  }
};

// ────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────
function SectionHeader({ title, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <ChevronRight size={20} color="#a1a1aa" />
    </TouchableOpacity>
  );
}

function MovieCard({ item, onPress, onAddToWatchLater }) {
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePlus = async () => {
    if (adding || !onAddToWatchLater) return;
    setAdding(true);
    try {
      const result = await onAddToWatchLater(item);
      if (result?.success) {
        setSaved(true);
      }
    } finally {
      setAdding(false);
    }
  };

  const progress = Math.min(100, Math.max(0, item.watchedPercent || 0));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={styles.cardWrapper}
    >
      {/* Thumbnail */}
      <View style={styles.card}>
        <Image
          source={{ uri: item.thumb || item.thumbnail }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Subtle gradient + actions */}
        <View style={styles.cardOverlay}>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtnWhite}
              onPress={() => onPress(item)}
            >
              <Play size={14} color="#000" fill="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnBorder, adding && { opacity: 0.5 }]}
              onPress={handlePlus}
              disabled={adding}
            >
              {saved ? (
                <Check size={14} color="#fff" />
              ) : (
                <Plus size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        {progress > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        )}
      </View>

      {/* Title + Views (YouTube style - always visible) */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.viewsText}>
        {(item.views || 0).toLocaleString()} views
      </Text>
    </TouchableOpacity>
  );
}

// ────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────
export default function NetflixStylePage() {
  const navigation = useNavigation();

  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("For you");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mixed feed for YouTube-like continuous scroll
  const [mixedFeed, setMixedFeed] = useState([]);

  const loadHomeData = useCallback(async () => {
    try {
      const [
        recommendedData,
        trendingData,
        latestData,
        subscriptionsData,
        shortsData,
      ] = await Promise.all([
        fetchWithAuth("recommended"),
        fetchWithAuth("trending"),
        fetchWithAuth("latest"),
        fetchWithAuth("subscribed-channels"),
        fetchWithAuth("trending-shorts"),
      ]);

      const rec = getArrayFromPayload(recommendedData).map(
        normalizeVideoListItem,
      );
      const tren = getArrayFromPayload(trendingData).map(
        normalizeVideoListItem,
      );
      const lat = getArrayFromPayload(latestData).map(normalizeVideoListItem);
      const subs = getArrayFromPayload(subscriptionsData).map(
        normalizeSubscriptionChannel,
      );
      const sh = getArrayFromPayload(shortsData).map(normalizeShort);

      setRecommended(rec);
      setTrending(tren);
      setLatest(lat);
      setSubscriptions(subs);
      setShorts(sh);

      // YouTube-style mixed algorithmic feed
      // Priority: Recommended → Trending → Latest (interleaved)
      const mixed = [];
      const maxLen = Math.max(rec.length, tren.length, lat.length);

      for (let i = 0; i < maxLen; i++) {
        if (rec[i]) mixed.push({ ...rec[i], feedType: "recommended" });
        if (tren[i]) mixed.push({ ...tren[i], feedType: "trending" });
        if (lat[i]) mixed.push({ ...lat[i], feedType: "latest" });
      }

      // Remove duplicates by id
      const unique = [];
      const seen = new Set();
      for (const item of mixed) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }

      setMixedFeed(unique);
    } catch (error) {
      console.warn("Home videos load error:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadHomeData();
      setLoading(false);
    };
    init();
  }, [loadHomeData]);

  useEffect(() => {
    if (selectedCategoryId) {
      // Backend category filter support hone pe yahan call karo
    }
  }, [selectedCategoryId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const isShortContent = (item) => {
    const rawTypes = item?.videoType ?? item?.raw?.videoType ?? [];
    const normalizedTypes = (Array.isArray(rawTypes) ? rawTypes : [rawTypes])
      .filter(Boolean)
      .map((type) => String(type).toLowerCase());

    return (
      Boolean(item?.isShort) ||
      normalizedTypes.some(
        (type) =>
          type === "short" || type === "shorts" || type.includes("short"),
      )
    );
  };

  const handleItemClick = (item) => {
    if (item?.isChannel) {
      navigation.navigate("SubscribedChannels", { id: item.id });
      return;
    }

    if (isShortContent(item)) {
      navigation.navigate("MainTabs", {
        screen: "Shorts",
        params: { video: item },
      });
      return;
    }

    navigation.navigate("VideoDetail", {
      id: item.id,
      item,
      video: item,
    });
  };

  const handleSectionPress = (type) => {
    navigation.navigate("ViewAll", { type });
  };

  const handleAddToWatchLater = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Toast.show({ type: "error", text1: "Please login first" });
        return { success: false };
      }

      const res = await fetch(`${API_BASE}/watch-later/${item.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (data.success) {
        Toast.show({
          type: "success",
          text1: data.message || "Added to Watch Later",
        });
        return { success: true };
      } else {
        Toast.show({
          type: "error",
          text1: data.message || "Failed to add",
        });
        return { success: false };
      }
    } catch (err) {
      console.error("Add to Watch Later error:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
      return { success: false };
    }
  };

  // ──── Horizontal Videos Section ────
  const renderHorizontalSection = (
    title,
    data,
    emptyMsg,
    type = "recommended",
  ) => (
    <View style={styles.section}>
      <SectionHeader title={title} onPress={() => handleSectionPress(type)} />

      {loading && data.length === 0 ? (
        <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />
      ) : data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {data.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              onPress={handleItemClick}
              onAddToWatchLater={handleAddToWatchLater}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>{emptyMsg}</Text>
      )}
    </View>
  );

  // ──── Shorts Grid ────
  const renderShortsGrid = (title) => (
    <View style={[styles.section, { marginBottom: 36 }]}>
      <SectionHeader
        title={title}
        onPress={() => handleSectionPress("shorts")}
      />

      {loading && shorts.length === 0 ? (
        <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />
      ) : shorts.length > 0 ? (
        <View style={styles.shortsGrid}>
          {shorts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.shortCard}
              onPress={() => handleItemClick(item)}
              activeOpacity={0.9}
            >
              <View style={styles.shortImageWrapper}>
                <Image
                  source={{
                    uri:
                      item.thumbnail ||
                      item.thumb ||
                      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
                  }}
                  style={styles.shortImage}
                  resizeMode="cover"
                />
                <View style={styles.shortOverlay}>
                  <Text style={styles.shortTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.shortViews}>
                    {Number(item.views || 0).toLocaleString()} views
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No shorts available right now.</Text>
      )}
    </View>
  );

  // ──── YouTube-style Vertical Mixed Feed Card ────
  const renderVerticalFeedItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleItemClick(item)}
      style={styles.verticalCard}
    >
      <View style={styles.verticalThumbWrapper}>
        <Image
          source={{ uri: item.thumb || item.thumbnail }}
          style={styles.verticalThumb}
          resizeMode="cover"
        />
        {item.watchedPercent > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, item.watchedPercent)}%` },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.verticalInfo}>
        <Text style={styles.verticalTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.verticalMeta}>
          {(item.views || 0).toLocaleString()} views
          {item.channel?.name ? ` • ${item.channel.name}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Navbar onMenuPress={() => {}} points={0} />

      <TopicChips
        onTopicChange={(topic, categoryId) => {
          setSelectedTopic(topic);
          setSelectedCategoryId(categoryId || null);
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        {/* ===== YouTube-like Continuous Feed (Algorithm mixed) ===== */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for you"
            onPress={() => handleSectionPress("recommended")}
          />

          {loading && mixedFeed.length === 0 ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />
          ) : mixedFeed.length > 0 ? (
            mixedFeed
              .slice(0, 12)
              .map((item) => (
                <View key={item.id}>{renderVerticalFeedItem({ item })}</View>
              ))
          ) : (
            <Text style={styles.emptyText}>
              No recommendations available right now.
            </Text>
          )}
        </View>

        {/* Horizontal sections remain for discovery */}
        {renderHorizontalSection(
          "Trending Videos",
          trending,
          "No trending videos available right now.",
          "trending",
        )}

        {renderShortsGrid("Trending Shorts")}

        {renderHorizontalSection(
          "Latest Videos",
          latest,
          "No latest videos available right now.",
          "latest",
        )}

        {renderHorizontalSection(
          "From Your Subscriptions",
          subscriptions,
          "Subscribe to channels to see their videos here.",
          "subscriptions",
        )}

        {renderShortsGrid("Top Shorts")}
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 6,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 12,
    gap: 14,
  },

  // ===== Horizontal Card (fixed title) =====
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#18181b",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    padding: 8,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtnWhite: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnBorder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    lineHeight: 17,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#dc2626",
  },
  viewsText: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 3,
  },
  emptyText: {
    color: "#a1a1aa",
    fontSize: 14,
    marginTop: 8,
  },

  // ===== Shorts =====
  shortsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  shortCard: {
    width: SHORT_WIDTH,
  },
  shortImageWrapper: {
    width: SHORT_WIDTH,
    height: SHORT_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#18181b",
  },
  shortImage: {
    width: "100%",
    height: "100%",
  },
  shortOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  shortTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
  shortViews: {
    color: "#cccccc",
    fontSize: 11,
    marginTop: 4,
  },

  // ===== YouTube-style Vertical Feed =====
  verticalCard: {
    marginBottom: 20,
  },
  verticalThumbWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#18181b",
  },
  verticalThumb: {
    width: "100%",
    height: "100%",
  },
  verticalInfo: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  verticalTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  verticalMeta: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
  },
});
