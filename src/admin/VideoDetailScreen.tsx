import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  FlatList,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ORIGIN } from "../../config/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BACKEND_URL = API_ORIGIN;
const API_BASE = `${BACKEND_URL}/api/uservideo`;

const AUTOPLAY_KEY = "videoo.autoplay";
const AUTOPLAY_COUNTDOWN_SECONDS = 5;

const FALLBACK_VIDEO = {
  id: 1,
  title: "Big Buck Bunny",
  channel: "Blender Foundation",
  description: "This video is being loaded from the server.",
  views: 0,
  videoUrl:
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnail:
    "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
};

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return "0:00";
  const safe = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatCount = (value) => {
  const n = Number(value) || 0;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
};

const resolveMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = String(value).replace(/\\/g, "/");
  if (normalized.startsWith("uploads/")) return `${BACKEND_URL}/${normalized}`;
  if (normalized.includes("uploads/"))
    return `${BACKEND_URL}/${normalized.split("uploads/").pop()}`;
  if (normalized.startsWith("/uploads/")) return `${BACKEND_URL}${normalized}`;
  return `${BACKEND_URL}/${normalized}`;
};

export default function VideoDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeId = route?.params?.id ?? route?.params?.videoId ?? 1;
  const routeVideo = route?.params?.item ?? route?.params?.video ?? null;

  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [videoDetails, setVideoDetails] = useState(
    routeVideo || FALLBACK_VIDEO,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [likesCount, setLikesCount] = useState(
    Number(routeVideo?.likesCount ?? routeVideo?.likes ?? 0),
  );
  const [dislikesCount, setDislikesCount] = useState(
    Number(routeVideo?.dislikesCount ?? routeVideo?.dislikes ?? 0),
  );
  const [liked, setLiked] = useState(Boolean(routeVideo?.isLiked));
  const [disliked, setDisliked] = useState(Boolean(routeVideo?.isDisliked));

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  // Autoplay + Up Next
  const [autoplay, setAutoplay] = useState(true);
  const [upNextOverlay, setUpNextOverlay] = useState(null);
  const [countdownLeft, setCountdownLeft] = useState(null);

  const [viewCounted, setViewCounted] = useState(false);

  // ==================== REFS ====================
  const controlsTimer = useRef(null);
  const lastTap = useRef(0);
  const lastTapSide = useRef(null);
  const countdownTimerRef = useRef(null);
  const nextTargetRef = useRef(null);
  const playedVideoIdsRef = useRef(new Set());
  const viewTracked = useRef(false);

  // ==================== MEDIA URLS ====================
  const resolvedVideoUrl = useMemo(() => {
    const candidate =
      videoDetails?.videoUrl ||
      videoDetails?.video ||
      videoDetails?.videofile ||
      videoDetails?.uri ||
      FALLBACK_VIDEO.videoUrl;
    return resolveMediaUrl(candidate) || FALLBACK_VIDEO.videoUrl;
  }, [videoDetails]);

  const resolvedThumbnail = useMemo(() => {
    const candidate =
      videoDetails?.thumbnail ||
      videoDetails?.thumb ||
      videoDetails?.poster ||
      FALLBACK_VIDEO.thumbnail;
    return resolveMediaUrl(candidate) || FALLBACK_VIDEO.thumbnail;
  }, [videoDetails]);

  // ==================== PLAYER ====================
  const player = useVideoPlayer(resolvedVideoUrl, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  // ==================== HELPERS (must be before useEvent) ====================
  const cancelCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    nextTargetRef.current = null;
    setUpNextOverlay(null);
    setCountdownLeft(null);
  }, []);

  const getNextUpNext = useCallback(() => {
    if (!suggestedVideos || suggestedVideos.length === 0) return null;
    const currentId = String(routeId);
    const filtered = suggestedVideos.filter(
      (v) => String(v._id || v.id) !== currentId,
    );
    return filtered[0] || null;
  }, [suggestedVideos, routeId]);

  const startCountdown = useCallback((next) => {
    if (countdownTimerRef.current) return;
    nextTargetRef.current = next;
    setUpNextOverlay(next);
    setCountdownLeft(AUTOPLAY_COUNTDOWN_SECONDS);

    countdownTimerRef.current = setInterval(() => {
      setCountdownLeft((prev) =>
        Math.max(0, (prev ?? AUTOPLAY_COUNTDOWN_SECONDS) - 1),
      );
    }, 1000);
  }, []);

  const handleVideoEnded = useCallback(() => {
    const next = getNextUpNext();
    if (!next) {
      setUpNextOverlay(null);
      setCountdownLeft(null);
      return;
    }

    if (autoplay) {
      startCountdown(next);
    } else {
      nextTargetRef.current = next;
      setUpNextOverlay(next);
      setCountdownLeft(null);
    }
  }, [getNextUpNext, autoplay, startCountdown]);

  // Unlock orientation
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => {});
    };
  }, []);

  // Load autoplay preference
  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(AUTOPLAY_KEY);
        if (value !== null) setAutoplay(value !== "false");
      } catch {}
    })();
  }, []);

  // Persist autoplay
  useEffect(() => {
    AsyncStorage.setItem(AUTOPLAY_KEY, String(autoplay)).catch(() => {});
  }, [autoplay]);

  // Reload video when URL changes
  useEffect(() => {
    if (!player || !resolvedVideoUrl) return;
    const load = async () => {
      try {
        await player.replaceAsync(resolvedVideoUrl);
        player.play();
      } catch (e) {
        console.warn("Video load error:", e);
      }
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
      setViewCounted(false);
      viewTracked.current = false;
      cancelCountdown();
    };
    load();
  }, [player, resolvedVideoUrl, cancelCountdown]);

  // Mute
  useEffect(() => {
    if (!player) return;
    try {
      player.muted = isMuted;
    } catch (e) {}
  }, [player, isMuted]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      cancelCountdown();
    };
  }, [cancelCountdown]);

  // ==================== PLAYER EVENTS ====================
  useEvent(player, "playingChange", (payload: { isPlaying: any }) => {
    setIsPlaying(Boolean(payload?.isPlaying));
  });

  useEvent(
    player,
    "timeUpdate",
    (payload: { currentTime: any; duration: any }) => {
      const t = Number(payload?.currentTime || 0);
      const d = Number(payload?.duration || 0);
      setCurrentTime(t);
      if (d > 0) setDuration(d);
    },
  );

  useEvent(player, "playToEnd", handleVideoEnded);

  // Auto-advance when countdown reaches 0
  useEffect(() => {
    if (countdownLeft === null) return;
    if (countdownLeft <= 0) {
      const target = nextTargetRef.current;
      cancelCountdown();
      if (target) {
        openSuggestedVideo(target);
      }
    }
  }, [countdownLeft, cancelCountdown]);

  // Track played videos
  useEffect(() => {
    return () => {
      if (routeId) playedVideoIdsRef.current.add(String(routeId));
    };
  }, [routeId]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchAll = async () => {
      if (!routeId) return;
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Video details
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/${routeId}`, { headers });
        const data = await res.json().catch(() => ({}));
        const payload = data?.video || data;
        if (payload) {
          setVideoDetails((prev) => ({ ...prev, ...payload }));
          setLikesCount(Number(payload.likesCount ?? payload.likes ?? 0));
          setDislikesCount(
            Number(payload.dislikesCount ?? payload.dislikes ?? 0),
          );
          setLiked(Boolean(payload.isLiked || payload.userReaction === "like"));
          setDisliked(
            Boolean(payload.isDisliked || payload.userReaction === "dislike"),
          );
          setIsSubscribed(Boolean(payload.isSubscribed));
          setSubscribersCount(
            Number(
              payload.channel?.subscribersCount ||
                payload.subscribersCount ||
                0,
            ),
          );
          if ((payload.watchedPercent || 0) >= 80) setViewCounted(true);
        }
      } catch (e) {
        console.warn("Video details error:", e);
      } finally {
        setLoading(false);
      }

      // Comments
      try {
        setCommentsLoading(true);
        const res = await fetch(`${API_BASE}/${routeId}/comments`, {
          headers,
        });
        const data = await res.json().catch(() => ({}));
        setComments(Array.isArray(data?.comments) ? data.comments : []);
      } catch (e) {
        console.warn("Comments error:", e);
      } finally {
        setCommentsLoading(false);
      }

      // Suggested / Related Videos
      try {
        setSuggestedLoading(true);
        let res = await fetch(`${API_BASE}/${routeId}/related`, { headers });
        let data = await res.json().catch(() => ({}));

        let list = [];
        if (Array.isArray(data?.videos)) list = data.videos;
        else if (Array.isArray(data?.data)) list = data.data;

        // Fallback to general list if related fails
        if (list.length === 0) {
          res = await fetch(`${API_BASE}?limit=15&exclude=${routeId}`, {
            headers,
          });
          data = await res.json().catch(() => ({}));
          if (Array.isArray(data?.videos)) list = data.videos;
          else if (Array.isArray(data?.data)) list = data.data;
          else if (Array.isArray(data)) list = data;
        }

        // Remove current + already played in this session
        const currentId = String(routeId);
        const watched = playedVideoIdsRef.current;
        list = list.filter((v) => {
          const vidId = String(v._id || v.id);
          return vidId !== currentId && !watched.has(vidId);
        });

        setSuggestedVideos(list.slice(0, 12));
      } catch (e) {
        console.warn("Suggested error:", e);
      } finally {
        setSuggestedLoading(false);
      }
    };

    fetchAll();
  }, [routeId]);

  // ==================== VIEW TRACKING ====================
  useEffect(() => {
    if (!routeId || viewTracked.current) return;
    viewTracked.current = true;

    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        await fetch(`${API_BASE}/${routeId}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchedPercent: 0,
            userId: user?._id || user?.id || null,
          }),
        });
      } catch {}
    })();
  }, [routeId]);

  // Count view at 80%
  useEffect(() => {
    if (!routeId || !duration || viewCounted) return;
    const percent = Math.min(100, Math.round((currentTime / duration) * 100));
    if (percent < 80) return;

    setViewCounted(true);
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        const res = await fetch(`${API_BASE}/${routeId}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            watchedPercent: percent,
            userId: user?._id || user?.id || null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.success && typeof data.views === "number") {
          setVideoDetails((prev) => ({ ...prev, views: data.views }));
        }
      } catch {}
    })();
  }, [currentTime, duration, routeId, viewCounted]);

  // ==================== CONTROLS ====================
  useEffect(() => {
    if (!showControls) return;
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(controlsTimer.current);
  }, [showControls, isPlaying]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleTogglePlayPause = () => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (e) {}
    showControlsTemporarily();
  };

  // Double tap seek
  const handleSideTap = (side) => {
    const now = Date.now();
    if (now - lastTap.current < 280 && lastTapSide.current === side) {
      if (player && duration) {
        const offset = side === "left" ? -10 : 10;
        const newTime = Math.max(0, Math.min(duration, currentTime + offset));
        player.currentTime = newTime;
        setCurrentTime(newTime);
      }
    } else {
      setShowControls((prev) => !prev);
    }
    lastTap.current = now;
    lastTapSide.current = side;
  };

  const handleSeek = (value) => {
    if (!player || !duration) return;
    try {
      const seekTo = Math.max(0, Math.min(duration, value * duration));
      player.currentTime = seekTo;
      setCurrentTime(seekTo);
    } catch (e) {}
  };

  // ==================== ACTIONS ====================
  const handleLike = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Login required", "Please login to like this video.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/${routeId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setLikesCount(Number(data.likes ?? likesCount));
        setDislikesCount(Number(data.dislikes ?? dislikesCount));
        setLiked(data.reaction === "like");
        setDisliked(data.reaction === "dislike");
      }
    } catch (e) {}
  };

  const handleDislike = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Login required", "Please login to dislike this video.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/${routeId}/dislike`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setLikesCount(Number(data.likes ?? likesCount));
        setDislikesCount(Number(data.dislikes ?? dislikesCount));
        setLiked(data.reaction === "like");
        setDisliked(data.reaction === "dislike");
      }
    } catch (e) {}
  };

  const handleSubscribe = async () => {
    const channelId = videoDetails?.channel?._id || videoDetails?.channel?.id;
    if (!channelId) return;

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Login required", "Please login to subscribe.");
      return;
    }

    setSubscribeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscribe/${channelId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setIsSubscribed(Boolean(data.subscribed));
        if (typeof data.subscribersCount === "number") {
          setSubscribersCount(data.subscribersCount);
        }
      }
    } catch (e) {
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !routeId) return;
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Login required", "Please login to comment.");
      return;
    }
    try {
      setCommentLoading(true);
      const res = await fetch(`${API_BASE}/${routeId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText: commentText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setComments((prev) => [
          {
            _id: Date.now().toString(),
            text: commentText.trim(),
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setCommentText("");
      }
    } catch (e) {
    } finally {
      setCommentLoading(false);
    }
  };

  const openSuggestedVideo = (item) => {
    cancelCountdown();
    const id = item._id || item.id;
    navigation.replace("VideoDetail", {
      id,
      videoId: id,
      item,
      video: item,
    });
  };

  const handleReplay = () => {
    if (player) {
      player.currentTime = 0;
      player.play();
    }
    cancelCountdown();
  };

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  // ==================== RENDER ====================
  const renderSuggestedItem = ({ item }) => {
    const thumb =
      resolveMediaUrl(item.thumbnail || item.thumb || item.poster) ||
      FALLBACK_VIDEO.thumbnail;

    return (
      <TouchableOpacity
        style={styles.suggestedCard}
        activeOpacity={0.85}
        onPress={() => openSuggestedVideo(item)}
      >
        <Image source={{ uri: thumb }} style={styles.suggestedThumb} />
        <View style={styles.suggestedInfo}>
          <Text style={styles.suggestedTitle} numberOfLines={2}>
            {item.title || "Untitled"}
          </Text>
          <Text style={styles.suggestedMeta} numberOfLines={1}>
            {item.channel?.name || item.channel || "Channel"} •{" "}
            {formatCount(item.views)} views
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
      >
        {/* ================= VIDEO PLAYER ================= */}
        <View style={styles.videoWrapper}>
          <VideoView
            player={player}
            style={styles.videoPlayer}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
          />

          {/* Left / Right double-tap zones */}
          <View style={styles.tapZones} pointerEvents="box-none">
            <Pressable
              style={styles.tapZone}
              onPress={() => handleSideTap("left")}
            />
            <Pressable
              style={styles.tapZone}
              onPress={() => handleSideTap("right")}
            />
          </View>

          {/* ========== UP NEXT OVERLAY ========== */}
          {upNextOverlay && (
            <View style={styles.upNextOverlay}>
              <View style={styles.upNextCard}>
                {countdownLeft !== null && (
                  <View style={styles.countdownRow}>
                    <Ionicons name="play-skip-forward" size={16} color="#fff" />
                    <Text style={styles.countdownText}>
                      Up next in {countdownLeft}s
                    </Text>
                  </View>
                )}

                <View style={styles.upNextBody}>
                  <Image
                    source={{
                      uri:
                        resolveMediaUrl(
                          upNextOverlay.thumbnail ||
                            upNextOverlay.thumb ||
                            upNextOverlay.poster,
                        ) || FALLBACK_VIDEO.thumbnail,
                    }}
                    style={styles.upNextThumb}
                  />
                  <View style={styles.upNextMeta}>
                    <Text style={styles.upNextTitle} numberOfLines={2}>
                      {upNextOverlay.title || "Next Video"}
                    </Text>
                    <Text style={styles.upNextChannel} numberOfLines={1}>
                      {upNextOverlay.channel?.name ||
                        upNextOverlay.channel ||
                        "Channel"}
                    </Text>
                  </View>
                </View>

                <View style={styles.upNextActions}>
                  <TouchableOpacity
                    style={styles.upNextBtn}
                    onPress={handleReplay}
                  >
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={styles.upNextBtnText}>Replay</Text>
                  </TouchableOpacity>

                  {countdownLeft !== null ? (
                    <TouchableOpacity
                      style={styles.upNextBtn}
                      onPress={cancelCountdown}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.upNextBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.upNextBtn, styles.upNextBtnPrimary]}
                      onPress={() => openSuggestedVideo(upNextOverlay)}
                    >
                      <Ionicons
                        name="play-skip-forward"
                        size={16}
                        color="#000"
                      />
                      <Text style={[styles.upNextBtnText, { color: "#000" }]}>
                        Play Next
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* ========== CONTROLS OVERLAY ========== */}
          {showControls && !upNextOverlay && (
            <View style={styles.playerControls} pointerEvents="box-none">
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={18} color="#fff" />
                  <Text style={styles.controlBtnText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.playerActions}>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={() => setIsMuted((previous) => !previous)}
                  >
                    <Ionicons
                      name={isMuted ? "volume-mute" : "volume-high"}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.controlBtnText}>
                      {isMuted ? "Sound off" : "Sound on"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={() => navigation.navigate("Copyright")}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.controlBtnText}>Copyright</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.centerPlay}
                onPress={handleTogglePlayPause}
                activeOpacity={0.85}
              >
                <View style={styles.playCircle}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color="#fff"
                  />
                </View>
                <Text style={styles.playHint}>
                  {isPlaying ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ================= INFO ================= */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>
            {videoDetails?.title || FALLBACK_VIDEO.title}
          </Text>
          <Text style={styles.meta}>
            {formatCount(videoDetails?.views || 0)} views •{" "}
            {videoDetails?.createdAt
              ? new Date(videoDetails.createdAt).toLocaleDateString()
              : "Recently"}
          </Text>

          <View style={styles.channelRow}>
            <Image
              source={{
                uri:
                  resolveMediaUrl(videoDetails?.channel?.channelImage) ||
                  resolvedThumbnail,
              }}
              style={styles.channelAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.channelName}>
                {videoDetails?.channel?.name ||
                  videoDetails?.channel ||
                  "Channel"}
              </Text>
              <Text style={styles.subscribersText}>
                {formatCount(subscribersCount)} subscribers
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                isSubscribed && styles.subscribedBtn,
              ]}
              onPress={handleSubscribe}
              disabled={subscribeLoading}
            >
              {subscribeLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isSubscribed ? "#fff" : "#000"}
                />
              ) : (
                <Text
                  style={[
                    styles.subscribeText,
                    isSubscribed && styles.subscribedText,
                  ]}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, liked && styles.actionBtnActive]}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? "thumbs-up" : "thumbs-up-outline"}
                size={18}
                color="#fff"
              />
              <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, disliked && styles.actionBtnActive]}
              onPress={handleDislike}
            >
              <Ionicons
                name={disliked ? "thumbs-down" : "thumbs-down-outline"}
                size={18}
                color="#fff"
              />
              <Text style={styles.actionText}>
                {formatCount(dislikesCount)}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            {videoDetails?.description || FALLBACK_VIDEO.description}
          </Text>
        </View>

        {/* ================= SUGGESTED VIDEOS ================= */}
        <View style={styles.suggestedSection}>
          <View style={styles.suggestedHeader}>
            <Text style={styles.sectionTitle}>Up next</Text>

            {/* Autoplay Toggle */}
            <View style={styles.autoplayRow}>
              <Text style={styles.autoplayLabel}>Autoplay</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  autoplay ? styles.switchOn : styles.switchOff,
                ]}
                onPress={() => setAutoplay((p) => !p)}
              >
                <View
                  style={[styles.switchThumb, autoplay && styles.switchThumbOn]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {suggestedLoading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
          ) : suggestedVideos.length > 0 ? (
            <FlatList
              data={suggestedVideos}
              keyExtractor={(item) => String(item._id || item.id)}
              renderItem={renderSuggestedItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            />
          ) : (
            <Text style={styles.emptyText}>No suggestions available</Text>
          )}
        </View>

        {/* ================= COMMENTS ================= */}
        <View style={styles.commentsCard}>
          <Text style={styles.sectionTitle}>Comments • {comments.length}</Text>

          <View style={styles.commentInputRow}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#888"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.postBtn,
                (!commentText.trim() || commentLoading) && { opacity: 0.5 },
              ]}
              onPress={handleCommentSubmit}
              disabled={!commentText.trim() || commentLoading}
            >
              {commentLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 14 }} />
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <View key={c._id || c.id} style={styles.commentItem}>
                <Text style={styles.commentText}>{c.text || c.comment}</Text>
                <Text style={styles.commentMeta}>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : "Just now"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No comments yet.</Text>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  tapZones: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
  },
  tapZone: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  playerControls: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    gap: 10,
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  videoTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 8,
    borderRadius: 20,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 18,
  },
  controlBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  centerPlay: {
    alignSelf: "center",
  },
  playCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  playHint: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 3,
  },
  bottomControls: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  slider: {
    width: "100%",
    height: 32,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
  },
  copyrightModal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  copyrightBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  copyrightSheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 30 : 18,
  },
  copyrightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  copyrightTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },
  copyrightSubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 5,
  },
  copyrightInput: {
    minHeight: 120,
    maxHeight: 180,
    color: "#fff",
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  copyrightSubmit: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    marginTop: 12,
  },
  copyrightSubmitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.45,
  },

  // ========== UP NEXT OVERLAY ==========
  upNextOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  upNextCard: {
    width: "88%",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  countdownText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  upNextBody: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  upNextThumb: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  upNextMeta: {
    flex: 1,
    justifyContent: "center",
  },
  upNextTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  upNextChannel: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
  upNextActions: {
    flexDirection: "row",
    gap: 10,
  },
  upNextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  upNextBtnPrimary: {
    backgroundColor: "#fff",
  },
  upNextBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // ========== INFO ==========
  infoCard: {
    backgroundColor: "#18181b",
    margin: 12,
    borderRadius: 14,
    padding: 14,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  meta: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 6,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 12,
  },
  channelAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#333",
  },
  channelName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  subscribersText: {
    color: "#a1a1aa",
    fontSize: 12,
    marginTop: 2,
  },
  subscribeBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  subscribedBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  subscribeText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  subscribedText: {
    color: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: "rgba(239,68,68,0.25)",
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: "#d4d4d8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },

  // ========== SUGGESTED ==========
  suggestedSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  autoplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoplayLabel: {
    color: "#ccc",
    fontSize: 13,
  },
  switch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchOn: {
    backgroundColor: "#2563eb",
  },
  switchOff: {
    backgroundColor: "#555",
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  switchThumbOn: {
    alignSelf: "flex-end",
  },
  suggestedCard: {
    width: 210,
    marginRight: 12,
    backgroundColor: "#18181b",
    borderRadius: 12,
    overflow: "hidden",
  },
  suggestedThumb: {
    width: "100%",
    height: 118,
    backgroundColor: "#222",
  },
  suggestedInfo: {
    padding: 10,
  },
  suggestedTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  suggestedMeta: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 4,
  },

  // ========== COMMENTS ==========
  commentsCard: {
    backgroundColor: "#18181b",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: "#0f0f0f",
    color: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 72,
    alignItems: "center",
  },
  postBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  commentItem: {
    backgroundColor: "#0f0f0f",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#262626",
  },
  commentText: {
    color: "#fff",
    fontSize: 14,
  },
  commentMeta: {
    color: "#a1a1aa",
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: "#a1a1aa",
    fontSize: 13,
    marginHorizontal: 14,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
