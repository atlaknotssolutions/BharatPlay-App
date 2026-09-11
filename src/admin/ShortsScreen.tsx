import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  ListRenderItem,
  ViewToken,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  RouteProp,
  useRoute,
} from "@react-navigation/native";

import {
  API_ORIGIN,
  API_USERVIDEO,
} from "../../config/api";

const { height, width } = Dimensions.get("window");

/* =========================================================
   TYPES
========================================================= */

type ShortItem = {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  videoUrl: string;
  thumbnail?: string;
  isLiked?: boolean;
  channel?: any;
  raw?: any;
};

type ShortComment = {
  _id?: string;
  id?: string;

  text?: string;
  comment?: string;
  commentText?: string;

  createdAt?: string;

  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    image?: string;
    avatar?: string;
    profileImage?: string;
  };

  author?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    image?: string;
    avatar?: string;
    profileImage?: string;
  };

  userName?: string;
  userImage?: string;
};

type ShortsRouteParams = {
  Shorts:
    | {
        video?: Record<string, any>;
      }
    | undefined;
};

/* =========================================================
   URL HELPER
========================================================= */

const toVideoUrl = (value: unknown) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/uploads/")) {
    return `${API_ORIGIN}${normalized}`;
  }

  return `${API_ORIGIN}/${normalized.replace(/^\/+/, "")}`;
};

/* =========================================================
   NORMALIZE SHORT
========================================================= */

const normalizeShort = (
  video: Record<string, any> = {},
): ShortItem => {
  const id = String(
    video._id ||
      video.id ||
      `short-${Date.now()}-${Math.random()}`,
  );

  return {
    id,

    title:
      video.title ||
      video.name ||
      "Untitled Short",

    views:
      Number(video.views) ||
      Number(video.viewCount) ||
      0,

    likes:
      Number(video.likesCount) ||
      Number(video.likes) ||
      0,

    comments: Array.isArray(video.comments)
      ? video.comments.length
      : Number(video.comments) || 0,

    videoUrl: toVideoUrl(
      video.videoUrl ||
        video.video ||
        video.url ||
        video.file,
    ),

    thumbnail: toVideoUrl(
      video.thumbnail ||
        video.thumb ||
        video.poster ||
        "",
    ),

    isLiked:
      video.userReaction === "like" ||
      video.isLiked === true,

    channel: video.channel,

    raw: video,
  };
};

/* =========================================================
   PAYLOAD HELPER
========================================================= */

const getArrayFromPayload = (
  payload: unknown,
): Record<string, any>[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object"
  ) {
    const data = payload as {
      videos?: unknown;
      data?: unknown;
      shorts?: unknown;
      results?: unknown;
    };

    if (Array.isArray(data.videos)) {
      return data.videos;
    }

    if (Array.isArray(data.shorts)) {
      return data.shorts;
    }

    if (Array.isArray(data.results)) {
      return data.results;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }
  }

  return [];
};

/* =========================================================
   FORMAT COUNT
========================================================= */

const formatCount = (value: number) => {
  const n = Number(value) || 0;

  if (n >= 1_000_000) {
    return `${(n / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")}M`;
  }

  if (n >= 1_000) {
    return `${(n / 1_000)
      .toFixed(1)
      .replace(/\.0$/, "")}K`;
  }

  return String(n);
};

const formatViews = (value: number) => {
  return `${formatCount(value)} views`;
};

/* =========================================================
   VIDEO COMPONENT
========================================================= */

function ShortVideo({
  item,
  isActive,
  muted,
  onProgress,
}: {
  item: ShortItem;
  isActive: boolean;
  muted: boolean;
  onProgress: (
    currentTime: number,
    duration: number,
  ) => void;
}) {
  const player = useVideoPlayer(
    item.videoUrl,
    (videoPlayer) => {
      videoPlayer.loop = true;
      videoPlayer.muted = muted;
    },
  );

  /* -------------------------------------------------------
     PLAY / PAUSE
  ------------------------------------------------------- */

  useEffect(() => {
    try {
      player.muted = muted;

      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    } catch (error) {
      console.warn(
        "Video play/pause error:",
        error,
      );
    }
  }, [
    isActive,
    muted,
    player,
  ]);

  /* -------------------------------------------------------
     VIDEO PROGRESS
  ------------------------------------------------------- */

  useEffect(() => {
    const subscription = player.addListener(
      "timeUpdate",
      (event: any) => {
        const currentTime =
          Number(event?.currentTime) || 0;

        const duration =
          Number(event?.duration) ||
          Number(player.duration) ||
          0;

        onProgress(
          currentTime,
          duration,
        );
      },
    );

    return () => {
      subscription?.remove();
    };
  }, [
    player,
    onProgress,
  ]);

  if (!item.videoUrl) {
    return (
      <View style={styles.videoError}>
        <Ionicons
          name="videocam-off-outline"
          size={50}
          color="#777"
        />

        <Text style={styles.videoErrorText}>
          Video unavailable
        </Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

/* =========================================================
   COMMENT AVATAR
========================================================= */

function CommentAvatar({
  comment,
}: {
  comment: ShortComment;
}) {
  const image =
    comment.user?.image ||
    comment.user?.avatar ||
    comment.user?.profileImage ||
    comment.author?.image ||
    comment.author?.avatar ||
    comment.author?.profileImage ||
    comment.userImage;

  if (image) {
    return (
      <Image
        source={{
          uri: toVideoUrl(image),
        }}
        style={styles.commentAvatarImage}
      />
    );
  }

  return (
    <View style={styles.commentAvatar}>
      <Ionicons
        name="person"
        size={17}
        color="#fff"
      />
    </View>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function ShortsScreen() {
  const route =
    useRoute<
      RouteProp<
        ShortsRouteParams,
        "Shorts"
      >
    >();

  const selectedVideo =
    route?.params?.video;

  const [shortsData, setShortsData] =
    useState<ShortItem[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [liked, setLiked] =
    useState<Record<string, boolean>>({});

  const [likeCount, setLikeCount] =
    useState<Record<string, number>>({});

  const [muted, setMuted] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingAction, setLoadingAction] =
    useState<string | null>(null);

  /* COMMENTS */

  const [comments, setComments] =
    useState<ShortComment[]>([]);

  const [commentsVisible, setCommentsVisible] =
    useState(false);

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentText, setCommentText] =
    useState("");

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const [
    commentForVideo,
    setCommentForVideo,
  ] = useState<ShortItem | null>(null);

  const viewReportedRef =
    useRef<Record<string, number>>({});

  const listRef =
    useRef<FlatList<ShortItem>>(null);

  /* =======================================================
     FETCH SHORTS
  ======================================================= */

  const loadShorts = useCallback(
    async () => {
      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem(
            "token",
          );

        const response = await fetch(
          `${API_USERVIDEO}/trending-shorts`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          },
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`,
          );
        }

        const data =
          await response.json();

        const list =
          getArrayFromPayload(data);

        let normalized =
          list.map(normalizeShort);

        /* ---------------------------------------------
           OPENED VIDEO
        --------------------------------------------- */

        if (selectedVideo) {
          const selected =
            normalizeShort(
              selectedVideo.raw ||
                selectedVideo,
            );

          const exists =
            normalized.some(
              (item) =>
                item.id === selected.id,
            );

          if (!exists) {
            normalized = [
              selected,
              ...normalized,
            ];
          } else {
            normalized = [
              selected,
              ...normalized.filter(
                (item) =>
                  item.id !== selected.id,
              ),
            ];
          }
        }

        setShortsData(normalized);

        const likedMap: Record<
          string,
          boolean
        > = {};

        const countMap: Record<
          string,
          number
        > = {};

        normalized.forEach((item) => {
          likedMap[item.id] =
            Boolean(item.isLiked);

          countMap[item.id] =
            item.likes;
        });

        setLiked(likedMap);
        setLikeCount(countMap);
        setCurrentIndex(0);
      } catch (error) {
        console.warn(
          "Shorts load error:",
          error,
        );

        setShortsData([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedVideo],
  );

  useEffect(() => {
    loadShorts();
  }, [loadShorts]);

  /* =======================================================
     VIEWABILITY
  ======================================================= */

  const onViewableItemsChanged =
    useCallback(
      ({
        viewableItems,
      }: {
        viewableItems: ViewToken[];
      }) => {
        const visible =
          viewableItems.find(
            (item) =>
              item.isViewable &&
              item.index != null,
          );

        if (
          visible &&
          visible.index != null
        ) {
          setCurrentIndex(
            visible.index,
          );
        }
      },
      [],
    );

  const viewabilityConfig =
    useMemo(
      () => ({
        itemVisiblePercentThreshold: 80,
      }),
      [],
    );

  /* =======================================================
     LIKE
  ======================================================= */

  const toggleLike = async (
    item: ShortItem,
  ) => {
    const token =
      await AsyncStorage.getItem(
        "token",
      );

    if (!token) {
      Alert.alert(
        "Login Required",
        "Please login to like this short.",
      );

      return;
    }

    if (
      loadingAction ===
      `like-${item.id}`
    ) {
      return;
    }

    const previous =
      Boolean(liked[item.id]);

    const previousCount =
      likeCount[item.id] ??
      item.likes;

    const optimistic =
      !previous;

    setLiked((prev) => ({
      ...prev,
      [item.id]: optimistic,
    }));

    setLikeCount((prev) => ({
      ...prev,
      [item.id]: Math.max(
        0,
        previousCount +
          (optimistic ? 1 : -1),
      ),
    }));

    setLoadingAction(
      `like-${item.id}`,
    );

    try {
      const response =
        await fetch(
          `${API_USERVIDEO}/${item.id}/like`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Like failed",
        );
      }

      if (
        typeof data.likes ===
        "number"
      ) {
        setLikeCount((prev) => ({
          ...prev,
          [item.id]:
            data.likes,
        }));
      }

      if (
        typeof data.liked ===
        "boolean"
      ) {
        setLiked((prev) => ({
          ...prev,
          [item.id]:
            data.liked,
        }));
      }
    } catch (error) {
      console.warn(
        "Like error:",
        error,
      );

      setLiked((prev) => ({
        ...prev,
        [item.id]:
          previous,
      }));

      setLikeCount((prev) => ({
        ...prev,
        [item.id]:
          previousCount,
      }));

      Alert.alert(
        "Error",
        "Unable to update like.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  /* =======================================================
     VIEW TRACKING
  ======================================================= */

  const trackView =
    useCallback(
      async (
        item: ShortItem,
        currentTime: number,
        duration: number,
      ) => {
        if (
          !duration ||
          duration <= 0
        ) {
          return;
        }

        const percent = Math.min(
          100,
          Math.round(
            (currentTime /
              duration) *
              100,
          ),
        );

        const previous =
          viewReportedRef
            .current[item.id] || 0;

        let checkpoint = 0;

        if (
          percent >= 80 &&
          previous < 80
        ) {
          checkpoint = 80;
        } else if (
          percent >= 25 &&
          previous < 25
        ) {
          checkpoint = 25;
        }

        if (!checkpoint) {
          return;
        }

        viewReportedRef.current[
          item.id
        ] = checkpoint;

        try {
          const token =
            await AsyncStorage.getItem(
              "token",
            );

          const rawUser =
            await AsyncStorage.getItem(
              "user",
            );

          let userId:
            | string
            | null = null;

          try {
            const user =
              rawUser
                ? JSON.parse(rawUser)
                : null;

            userId =
              user?._id ||
              user?.id ||
              null;
          } catch {}

          const response =
            await fetch(
              `${API_USERVIDEO}/${item.id}/view`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",

                  ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                      }
                    : {}),
                },

                body: JSON.stringify({
                  watchedPercent:
                    checkpoint,
                  userId,
                }),
              },
            );

          const data =
            await response.json();

          if (
            data.success &&
            typeof data.views ===
              "number"
          ) {
            setShortsData(
              (prev) =>
                prev.map(
                  (short) =>
                    short.id ===
                    item.id
                      ? {
                          ...short,
                          views:
                            data.views,
                        }
                      : short,
                ),
            );
          }
        } catch (error) {
          console.warn(
            "View tracking error:",
            error,
          );
        }
      },
      [],
    );

  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare = async (
    item: ShortItem,
  ) => {
    try {
      const shareUrl =
        `bharatplay://shorts/${item.id}`;

      await Share.share({
        title:
          item.title ||
          "Bharat Play Short",

        message:
          `${item.title || "Watch this short"}\n\n${shareUrl}`,
      });
    } catch (error) {
      console.warn(
        "Share error:",
        error,
      );
    }
  };

  /* =======================================================
     GET CHANNEL ID
  ======================================================= */

  const getChannelId = (
    item: ShortItem,
  ) => {
    const channel =
      item.channel ||
      item.raw?.channel;

    if (!channel) {
      return null;
    }

    if (
      typeof channel ===
      "string"
    ) {
      return channel;
    }

    return (
      channel._id ||
      channel.id ||
      null
    );
  };

  /* =======================================================
     SUBSCRIBE
  ======================================================= */

  const handleSubscribe =
    async (
      item: ShortItem,
    ) => {
      const token =
        await AsyncStorage.getItem(
          "token",
        );

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login to subscribe.",
        );

        return;
      }

      const channelId =
        getChannelId(item);

      if (!channelId) {
        Alert.alert(
          "Error",
          "Channel not found.",
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_USERVIDEO}/subscribe/${channelId}`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            },
          );

        const data =
          await response.json();

        if (response.ok && data.success) {
          Alert.alert(
            "Success",
            data.message ||
              "Subscribed successfully",
          );
        } else {
          Alert.alert(
            "Error",
            data.message ||
              "Failed to subscribe",
          );
        }
      } catch (error) {
        console.warn(
          "Subscribe error:",
          error,
        );

        Alert.alert(
          "Error",
          "Something went wrong.",
        );
      }
    };

  /* =======================================================
     LOAD COMMENTS
  ======================================================= */

  const loadComments = async (
    item: ShortItem,
  ) => {
    setCommentForVideo(item);
    setCommentsVisible(true);
    setCommentsLoading(true);

    try {
      const token =
        await AsyncStorage.getItem(
          "token",
        );

      const response =
        await fetch(
          `${API_USERVIDEO}/${item.id}/comments`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      const list =
        Array.isArray(
          data?.comments,
        )
          ? data.comments
          : Array.isArray(
              data?.data,
            )
          ? data.data
          : Array.isArray(
              data,
            )
          ? data
          : [];

      setComments(list);
    } catch (error) {
      console.warn(
        "Comments load error:",
        error,
      );

      setComments([]);

      Alert.alert(
        "Error",
        "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  /* =======================================================
     CLOSE COMMENTS
  ======================================================= */

  const closeComments =
    () => {
      setCommentsVisible(false);
      setCommentText("");
      setCommentForVideo(null);
    };

  /* =======================================================
     SUBMIT COMMENT
  ======================================================= */

  const handleCommentSubmit =
    async () => {
      const text =
        commentText.trim();

      const item =
        commentForVideo ||
        shortsData[currentIndex];

      if (
        !text ||
        !item ||
        commentSubmitting
      ) {
        return;
      }

      const token =
        await AsyncStorage.getItem(
          "token",
        );

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login to comment.",
        );

        return;
      }

      setCommentSubmitting(
        true,
      );

      try {
        const rawUser =
          await AsyncStorage.getItem(
            "user",
          );

        let user: any = null;

        try {
          user = rawUser
            ? JSON.parse(rawUser)
            : null;
        } catch {}

        const userName =
          user?.name ||
          user?.username ||
          user?.fullName ||
          "User";

        const userImage =
          user?.image ||
          user?.avatar ||
          user?.profileImage ||
          "";

        const response =
          await fetch(
            `${API_USERVIDEO}/${item.id}/comment`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                commentText:
                  text,

                userName,

                userImage,
              }),
            },
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Unable to post comment",
          );
        }

        /* ---------------------------------------------
           NEW COMMENT
        --------------------------------------------- */

        const newComment: ShortComment = {
          _id:
            data?.comment?._id ||
            data?.data?._id ||
            String(
              Date.now(),
            ),

          text,

          commentText:
            text,

          createdAt:
            new Date().toISOString(),

          user: {
            name: userName,
            username:
              user?.username,
            image:
              userImage,
          },
        };

        setComments(
          (previous) => [
            newComment,
            ...previous,
          ],
        );

        setCommentText("");

        /* ---------------------------------------------
           UPDATE COMMENT COUNT
        --------------------------------------------- */

        setShortsData(
          (previous) =>
            previous.map(
              (short) =>
                short.id ===
                item.id
                  ? {
                      ...short,
                      comments:
                        short.comments +
                        1,
                    }
                  : short,
            ),
        );
      } catch (error: any) {
        console.warn(
          "Comment submit error:",
          error,
        );

        Alert.alert(
          "Comment Failed",
          error?.message ||
            "Please try again.",
        );
      } finally {
        setCommentSubmitting(
          false,
        );
      }
    };

  /* =======================================================
     COMMENT USERNAME
  ======================================================= */

  const getCommentUsername = (
    comment: ShortComment,
  ) => {
    return (
      comment.user?.name ||
      comment.user?.username ||
      comment.author?.name ||
      comment.author?.username ||
      comment.userName ||
      "User"
    );
  };

  /* =======================================================
     COMMENT TEXT
  ======================================================= */

  const getCommentText = (
    comment: ShortComment,
  ) => {
    return (
      comment.text ||
      comment.commentText ||
      comment.comment ||
      ""
    );
  };

  /* =======================================================
     RENDER COMMENT
  ======================================================= */

  const renderComment = ({
    item: comment,
  }: {
    item: ShortComment;
  }) => {
    return (
      <View style={styles.commentItem}>
        <CommentAvatar
          comment={comment}
        />

        <View
          style={styles.commentBody}
        >
          <Text
            style={
              styles.commentAuthor
            }
          >
            {getCommentUsername(
              comment,
            )}
          </Text>

          <Text
            style={
              styles.commentValue
            }
          >
            {getCommentText(
              comment,
            )}
          </Text>

          <View
            style={
              styles.commentMeta
            }
          >
            <TouchableOpacity>
              <Text
                style={
                  styles.commentReply
                }
              >
                Reply
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.commentLikeButton
              }
            >
              <Ionicons
                name="heart-outline"
                size={17}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /* =======================================================
     RENDER VIDEO ITEM
  ======================================================= */

  const renderItem:
    ListRenderItem<ShortItem> =
    useCallback(
      ({
        item,
        index,
      }) => {
        const isActive =
          index ===
          currentIndex;

        const currentLikes =
          likeCount[item.id] ??
          item.likes;

        return (
          <View
            style={
              styles.videoContainer
            }
          >
            {/* VIDEO */}

            <ShortVideo
              item={item}
              isActive={isActive}
              muted={muted}
              onProgress={(
                currentTime,
                duration,
              ) => {
                if (isActive) {
                  trackView(
                    item,
                    currentTime,
                    duration,
                  );
                }
              }}
            />

            {/* DARK OVERLAY */}

            <View
              pointerEvents="none"
              style={
                styles.overlay
              }
            />

            {/* TOP BAR */}

            <View
              style={
                styles.topBar
              }
            >
              <Text
                style={
                  styles.shortsHeader
                }
              >
                Shorts
              </Text>

              <TouchableOpacity
                style={
                  styles.topIcon
                }
                onPress={() =>
                  Alert.alert(
                    "More",
                    "More options",
                  )
                }
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* BOTTOM LEFT */}

            <View
              style={
                styles.bottomLeft
              }
            >
              {/* CHANNEL */}

              <View
                style={
                  styles.channelRow
                }
              >
                <View
                  style={
                    styles.channelAvatar
                  }
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color="#fff"
                  />
                </View>

                <Text
                  style={
                    styles.channelName
                  }
                  numberOfLines={
                    1
                  }
                >
                  {item.channel
                    ?.name ||
                    item.raw?.channel
                      ?.name ||
                    "Bharat Play"}
                </Text>

                {getChannelId(
                  item,
                ) && (
                  <TouchableOpacity
                    style={
                      styles.subscribeBtn
                    }
                    onPress={() =>
                      handleSubscribe(
                        item,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.subscribeText
                      }
                    >
                      Subscribe
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* TITLE */}

              <Text
                style={
                  styles.title
                }
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {/* VIEWS */}

              <Text
                style={
                  styles.views
                }
              >
                {formatViews(
                  item.views,
                )}
              </Text>

              {/* AUDIO */}

              <View
                style={
                  styles.audioRow
                }
              >
                <MaterialCommunityIcons
                  name="music-note"
                  size={16}
                  color="#fff"
                />

                <Text
                  style={
                    styles.audioText
                  }
                >
                  Original Audio
                </Text>
              </View>
            </View>

            {/* RIGHT ACTIONS */}

            <View
              style={
                styles.rightButtons
              }
            >
              {/* LIKE */}

              <TouchableOpacity
                style={
                  styles.iconBtn
                }
                onPress={() =>
                  toggleLike(
                    item,
                  )
                }
              >
                <Ionicons
                  name={
                    liked[
                      item.id
                    ]
                      ? "heart"
                      : "heart-outline"
                  }
                  size={34}
                  color={
                    liked[
                      item.id
                    ]
                      ? "#ff2d55"
                      : "#fff"
                  }
                />

                <Text
                  style={
                    styles.iconText
                  }
                >
                  {formatCount(
                    currentLikes,
                  )}
                </Text>
              </TouchableOpacity>

              {/* COMMENTS */}

              <TouchableOpacity
                style={
                  styles.iconBtn
                }
                onPress={() =>
                  loadComments(
                    item,
                  )
                }
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={31}
                  color="#fff"
                />

                <Text
                  style={
                    styles.iconText
                  }
                >
                  {formatCount(
                    item.comments,
                  )}
                </Text>
              </TouchableOpacity>

              {/* SHARE */}

              <TouchableOpacity
                style={
                  styles.iconBtn
                }
                onPress={() =>
                  handleShare(
                    item,
                  )
                }
              >
                <Ionicons
                  name="share-social-outline"
                  size={32}
                  color="#fff"
                />

                <Text
                  style={
                    styles.iconText
                  }
                >
                  Share
                </Text>
              </TouchableOpacity>

              {/* MUTE */}

              <TouchableOpacity
                style={
                  styles.iconBtn
                }
                onPress={() =>
                  setMuted(
                    (prev) =>
                      !prev,
                  )
                }
              >
                <Ionicons
                  name={
                    muted
                      ? "volume-mute"
                      : "volume-high"
                  }
                  size={31}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* MORE */}

              <TouchableOpacity
                style={
                  styles.iconBtn
                }
                onPress={() =>
                  Alert.alert(
                    "More",
                    "More options",
                  )
                }
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* PROGRESS */}

            {isActive && (
              <View
                style={
                  styles.progressIndicator
                }
              />
            )}
          </View>
        );
      },
      [
        currentIndex,
        liked,
        likeCount,
        muted,
        trackView,
      ],
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <View
        style={
          styles.loaderWrap
        }
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
        />

        <ActivityIndicator
          size="large"
          color="#fff"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading shorts...
        </Text>
      </View>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!shortsData.length) {
    return (
      <View
        style={
          styles.loaderWrap
        }
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
        />

        <Ionicons
          name="videocam-off-outline"
          size={50}
          color="#777"
        />

        <Text
          style={
            styles.emptyText
          }
        >
          No shorts available yet.
        </Text>
      </View>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent={false}
      />

      <FlatList
        ref={listRef}
        data={shortsData}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={
          false
        }
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onViewableItemsChanged={
          onViewableItemsChanged
        }
        viewabilityConfig={
          viewabilityConfig
        }
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        getItemLayout={(
          _,
          index,
        ) => ({
          length: height,
          offset:
            height * index,
          index,
        })}
      />

      {/* =================================================
          YOUTUBE STYLE COMMENTS BOTTOM SHEET
      ================================================= */}

      <Modal
        visible={
          commentsVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeComments
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalRoot
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {/* BACKDROP */}

          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.commentsBackdrop
            }
            onPress={
              closeComments
            }
          />

          {/* SHEET */}

          <View
            style={
              styles.commentsSheet
            }
          >
            {/* HANDLE */}

            <View
              style={
                styles.commentsHandle
              }
            />

            {/* HEADER */}

            <View
              style={
                styles.commentsHeader
              }
            >
              <Text
                style={
                  styles.commentsTitle
                }
              >
                Comments{" "}
                {comments.length >
                0
                  ? `(${comments.length})`
                  : ""}
              </Text>

              <TouchableOpacity
                onPress={
                  closeComments
                }
                style={
                  styles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* COMMENTS */}

            {commentsLoading ? (
              <View
                style={
                  styles.commentsState
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#fff"
                />

                <Text
                  style={
                    styles.commentsStateText
                  }
                >
                  Loading comments...
                </Text>
              </View>
            ) : comments.length ===
              0 ? (
              <View
                style={
                  styles.commentsState
                }
              >
                <View
                  style={
                    styles.emptyCommentIcon
                  }
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={34}
                    color="#fff"
                  />
                </View>

                <Text
                  style={
                    styles.noCommentsTitle
                  }
                >
                  No comments yet
                </Text>

                <Text
                  style={
                    styles.noCommentsSubtitle
                  }
                >
                  Be the first to comment
                </Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(
                  comment,
                  index,
                ) =>
                  String(
                    comment._id ||
                      comment.id ||
                      index,
                  )
                }
                renderItem={
                  renderComment
                }
                style={
                  styles.commentsList
                }
                contentContainerStyle={
                  styles.commentsContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* INPUT */}

            <View
              style={
                styles.commentInputContainer
              }
            >
              <View
                style={
                  styles.inputAvatar
                }
              >
                <Ionicons
                  name="person"
                  size={17}
                  color="#fff"
                />
              </View>

              <View
                style={
                  styles.commentInputWrapper
                }
              >
                <TextInput
                  value={
                    commentText
                  }
                  onChangeText={
                    setCommentText
                  }
                  placeholder="Add a comment..."
                  placeholderTextColor="#94a3b8"
                  style={
                    styles.commentInput
                  }
                  multiline
                  maxLength={500}
                  returnKeyType="default"
                />

                {commentText.trim()
                  .length > 0 && (
                  <Text
                    style={
                      styles.characterCount
                    }
                  >
                    {
                      commentText.length
                    }
                    /500
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.commentSend,
                  (!commentText.trim() ||
                    commentSubmitting) &&
                    styles.commentSendDisabled,
                ]}
                onPress={
                  handleCommentSubmit
                }
                disabled={
                  !commentText.trim() ||
                  commentSubmitting
                }
              >
                {commentSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <Ionicons
                    name="send"
                    size={19}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },

    loaderWrap: {
      flex: 1,
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      color: "#aaa",
      marginTop: 12,
      fontSize: 14,
    },

    emptyText: {
      color: "#aaa",
      marginTop: 15,
      fontSize: 15,
    },

    /* VIDEO */

    videoContainer: {
      width,
      height,
      backgroundColor: "#000",
      position: "relative",
    },

    video: {
      ...StyleSheet.absoluteFill,
    },

    videoError: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "#111",
      alignItems: "center",
      justifyContent: "center",
    },

    videoErrorText: {
      color: "#aaa",
      marginTop: 10,
      fontSize: 14,
    },

    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        "rgba(0,0,0,0.16)",
    },

    /* TOP */

    topBar: {
      position: "absolute",
      top:
        Platform.OS === "ios"
          ? 55
          : 25,
      left: 16,
      right: 16,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    shortsHeader: {
      color: "#fff",
      fontSize: 21,
      fontWeight: "800",
    },

    topIcon: {
      width: 40,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    /* BOTTOM */

    bottomLeft: {
      position: "absolute",
      left: 16,
      right: 82,
      bottom:
        Platform.OS === "ios"
          ? 110
          : 80,
    },

    channelRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 10,
    },

    channelAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "rgba(255,255,255,0.22)",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 9,
    },

    channelName: {
      flex: 1,
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },

    subscribeBtn: {
      marginLeft: 10,
      borderWidth: 1,
      borderColor: "#fff",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    subscribeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },

    title: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 5,
      textShadowColor:
        "rgba(0,0,0,0.8)",
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      textShadowRadius: 3,
    },

    views: {
      color:
        "rgba(255,255,255,0.85)",
      fontSize: 13,
      marginBottom: 8,
    },

    audioRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    audioText: {
      color:
        "rgba(255,255,255,0.85)",
      fontSize: 13,
      marginLeft: 6,
    },

    /* RIGHT BUTTONS */

    rightButtons: {
      position: "absolute",
      right: 10,
      bottom:
        Platform.OS === "ios"
          ? 115
          : 85,
      alignItems:
        "center",
    },

    iconBtn: {
      alignItems:
        "center",
      justifyContent:
        "center",
      minWidth: 52,
      marginBottom: 20,
    },

    iconText: {
      color: "#fff",
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
      textShadowColor:
        "rgba(0,0,0,0.6)",
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      textShadowRadius: 2,
    },

    progressIndicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor:
        "rgba(255,255,255,0.8)",
    },

    /* =====================================================
       COMMENTS MODAL
    ===================================================== */

    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },

    commentsBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        "rgba(0,0,0,0.55)",
    },

    commentsSheet: {
      height:
        Platform.OS === "ios"
          ? height * 0.72
          : height * 0.75,

      backgroundColor:
        "#111318",

      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,

      overflow: "hidden",
    },

    commentsHandle: {
      width: 42,
      height: 4,
      borderRadius: 10,
      backgroundColor:
        "#64748b",

      alignSelf: "center",
      marginTop: 9,
      marginBottom: 4,
    },

    commentsHeader: {
      height: 55,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",

      paddingHorizontal: 18,

      borderBottomWidth: 1,
      borderBottomColor:
        "#262b35",
    },

    commentsTitle: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    commentsList: {
      flex: 1,
    },

    commentsContent: {
      paddingTop: 10,
      paddingBottom: 20,
    },

    /* COMMENT */

    commentItem: {
      flexDirection:
        "row",
      paddingHorizontal: 16,
      paddingVertical: 13,
    },

    commentAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#334155",

      alignItems:
        "center",
      justifyContent:
        "center",

      marginRight: 11,
    },

    commentAvatarImage: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#334155",
      marginRight: 11,
    },

    commentBody: {
      flex: 1,
    },

    commentAuthor: {
      color: "#e2e8f0",
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 4,
    },

    commentValue: {
      color: "#f8fafc",
      fontSize: 14,
      lineHeight: 20,
    },

    commentMeta: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 7,
    },

    commentReply: {
      color: "#94a3b8",
      fontSize: 12,
      fontWeight: "600",
    },

    commentLikeButton: {
      marginLeft: 18,
    },

    /* EMPTY COMMENTS */

    commentsState: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingBottom: 30,
    },

    commentsStateText: {
      color: "#94a3b8",
      marginTop: 12,
      fontSize: 14,
    },

    emptyCommentIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor:
        "#262b35",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    noCommentsTitle: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      marginTop: 16,
    },

    noCommentsSubtitle: {
      color: "#94a3b8",
      fontSize: 13,
      marginTop: 5,
    },

    /* INPUT */

    commentInputContainer: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",

      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom:
        Platform.OS === "ios"
          ? 28
          : 12,

      backgroundColor:
        "#151820",

      borderTopWidth: 1,
      borderTopColor:
        "#262b35",
    },

    inputAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        "#334155",

      alignItems:
        "center",
      justifyContent:
        "center",

      marginRight: 8,
      marginBottom: 2,
    },

    commentInputWrapper: {
      flex: 1,
      minHeight: 42,
      maxHeight: 100,

      backgroundColor:
        "#222733",

      borderRadius: 21,

      paddingLeft: 15,
      paddingRight: 10,

      justifyContent:
        "center",
    },

    commentInput: {
      color: "#fff",
      fontSize: 14,
      minHeight: 42,
      maxHeight: 85,
      paddingVertical: 10,
      paddingRight: 25,
    },

    characterCount: {
      position: "absolute",
      right: 10,
      bottom: 4,
      color: "#64748b",
      fontSize: 9,
    },

    commentSend: {
      width: 42,
      height: 42,
      borderRadius: 21,

      backgroundColor:
        "#ff2d55",

      alignItems:
        "center",
      justifyContent:
        "center",

      marginLeft: 8,
      marginBottom: 1,
    },

    commentSendDisabled: {
      backgroundColor:
        "#3b404b",
    },
  });