// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   StatusBar,
//   FlatList,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";
// import Toast from "react-native-toast-message";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const BACKEND_URL = "https://exp://192.168.1.14:8081";
// const API_BASE = `${BACKEND_URL}/api/uservideo`;

// const PAGE_SIZE = 20;

// const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
// const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

// const SHORT_WIDTH = (SCREEN_WIDTH - 48) / 2;
// const SHORT_HEIGHT = SHORT_WIDTH * (16 / 9);

// // ────────────────────────────────────────────────
// // Normalize helpers
// // ────────────────────────────────────────────────
// const normalizeVideoListItem = (video = {}) => ({
//   id: video._id || video.id,
//   title: video.title || "Untitled video",
//   thumb: video.thumbnail
//     ? /^https?:\/\//i.test(video.thumbnail)
//       ? video.thumbnail.replace(/\\/g, "/")
//       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
//     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
//   thumbnail: video.thumbnail
//     ? /^https?:\/\//i.test(video.thumbnail)
//       ? video.thumbnail.replace(/\\/g, "/")
//       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
//     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
//   description: video.description || "",
//   views: Number(video.views || 0),
//   likesCount: Number(video.likesCount ?? video.likes ?? 0),
//   videoUrl: video.videoUrl
//     ? /^https?:\/\//i.test(video.videoUrl)
//       ? video.videoUrl.replace(/\\/g, "/")
//       : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
//     : "",
//   videoType: video.videoType || null,
//   raw: video,
//   isShort: false,
// });

// const normalizeShort = (video = {}) => ({
//   id: video._id || video.id,
//   title: video.title || "Untitled short",
//   thumbnail: video.thumbnail
//     ? /^https?:\/\//i.test(video.thumbnail)
//       ? video.thumbnail.replace(/\\/g, "/")
//       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
//     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
//   views: Number(video.views || 0),
//   likes: Number(video.likesCount ?? video.likes ?? 0),
//   videoUrl: video.videoUrl
//     ? /^https?:\/\//i.test(video.videoUrl)
//       ? video.videoUrl.replace(/\\/g, "/")
//       : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
//     : "",
//   videoType: video.videoType || "short",
//   raw: video,
//   isShort: true,
// });

// const SECTIONS = {
//   recommended: {
//     title: "Recommended Videos",
//     endpoint: "recommended",
//     normalize: normalizeVideoListItem,
//     isShort: false,
//   },
//   trending: {
//     title: "Trending Videos",
//     endpoint: "trending",
//     normalize: normalizeVideoListItem,
//     isShort: false,
//   },
//   latest: {
//     title: "Latest Videos",
//     endpoint: "latest",
//     normalize: normalizeVideoListItem,
//     isShort: false,
//   },
//   subscriptions: {
//     title: "Subscription Videos",
//     endpoint: "subscriptions",
//     normalize: normalizeVideoListItem,
//     isShort: false,
//   },
//   shorts: {
//     title: "Trending Shorts",
//     endpoint: "trending-shorts",
//     normalize: normalizeShort,
//     isShort: true,
//   },
//   "top-shorts": {
//     title: "Top Shorts",
//     endpoint: "top-shorts",
//     normalize: normalizeShort,
//     isShort: true,
//   },
// };

// // ────────────────────────────────────────────────
// // Components
// // ────────────────────────────────────────────────
// function MovieCard({ item, onPress, onAddToWatchLater }) {
//   const [adding, setAdding] = useState(false);

//   const handlePlus = async () => {
//     if (adding || !onAddToWatchLater) return;
//     setAdding(true);
//     try {
//       await onAddToWatchLater(item);
//     } finally {
//       setAdding(false);
//     }
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={() => onPress(item)}
//       style={styles.movieCard}
//     >
//       <Image
//         source={{ uri: item.thumb || item.thumbnail }}
//         style={styles.movieImage}
//         resizeMode="cover"
//       />
//       <View style={styles.movieOverlay}>
//         <Text style={styles.movieTitle} numberOfLines={2}>
//           {item.title}
//         </Text>
//         <Text style={styles.movieViews}>
//           {item.views?.toLocaleString() || 0} views
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// function ShortCard({ item, onPress }) {
//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={() => onPress(item)}
//       style={styles.shortCard}
//     >
//       <Image
//         source={{ uri: item.thumbnail || item.thumb }}
//         style={styles.shortImage}
//         resizeMode="cover"
//       />
//       <View style={styles.shortOverlay}>
//         <Text style={styles.shortTitle} numberOfLines={2}>
//           {item.title}
//         </Text>
//         <Text style={styles.shortViews}>
//           {item.views?.toLocaleString() || 0} views
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// // ────────────────────────────────────────────────
// // Main Screen
// // ────────────────────────────────────────────────
// export default function ViewAll() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { type } = route.params || {};

//   const section = SECTIONS[type];

//   const [page, setPage] = useState(1);
//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

//   useEffect(() => {
//     if (!section) return;

//     let active = true;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const token = await AsyncStorage.getItem("token");
//         if (!token) {
//           setError("Please login to view videos.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(
//           `${API_BASE}/${section.endpoint}?page=${page}&limit=${PAGE_SIZE}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (!res.ok) {
//           throw new Error(`Failed to load videos (${res.status})`);
//         }

//         const data = await res.json();

//         if (!active) return;

//         if (!data.success && data.success !== undefined) {
//           throw new Error(data.message || "Failed to load videos");
//         }

//         const list = Array.isArray(data.videos)
//           ? data.videos
//           : Array.isArray(data.data)
//           ? data.data
//           : Array.isArray(data)
//           ? data
//           : [];

//         setItems(list.map(section.normalize));
//         setTotal(Number(data.total) || list.length);
//       } catch (err) {
//         if (active) {
//           setError(err.message || "Failed to load videos.");
//           setItems([]);
//         }
//       } finally {
//         if (active) setLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       active = false;
//     };
//   }, [type, page, section]);

//   const handleItemClick = (item) => {
//     if (section?.isShort) {
//       navigation.navigate("MainTabs", {
//         screen: "Shorts",
//         params: { video: item },
//       });
//       return;
//     }

//     navigation.navigate("VideoDetail", {
//       id: item.id,
//       item,
//     });
//   };

//   const handleAddToWatchLater = async (item) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         Toast.show({ type: "error", text1: "Please login first" });
//         return;
//       }

//       const res = await fetch(`${API_BASE}/watch-later/${item.id}`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await res.json();

//       if (data.success) {
//         Toast.show({
//           type: "success",
//           text1: data.message || "Added to Watch Later",
//         });
//       } else {
//         Toast.show({
//           type: "error",
//           text1: data.message || "Failed to add",
//         });
//       }
//     } catch (err) {
//       console.error("Add to Watch Later error:", err);
//       Toast.show({ type: "error", text1: "Something went wrong" });
//     }
//   };

//   // ──── Section not found ────
//   if (!section) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="#000" />
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Section not found</Text>
//         </View>
//         <Text style={styles.emptyText}>Section not found.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <ArrowLeft size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {section.title}
//           </Text>
//           <Text style={styles.headerSubtitle}>
//             {total.toLocaleString()} videos
//           </Text>
//         </View>

//         <View style={{ width: 40 }} />
//       </View>

//       {/* Content */}
//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color="#FF0000" />
//           <Text style={styles.loadingText}>
//             Loading {section.title.toLowerCase()}...
//           </Text>
//         </View>
//       ) : error ? (
//         <View style={styles.center}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : items.length === 0 ? (
//         <View style={styles.center}>
//           <Text style={styles.emptyText}>No videos available right now.</Text>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             data={items}
//             keyExtractor={(item) => String(item.id)}
//             numColumns={2}
//             contentContainerStyle={styles.listContent}
//             columnWrapperStyle={styles.columnWrapper}
//             showsVerticalScrollIndicator={false}
//             renderItem={({ item }) =>
//               section.isShort ? (
//                 <ShortCard item={item} onPress={handleItemClick} />
//               ) : (
//                 <MovieCard
//                   item={item}
//                   onPress={handleItemClick}
//                   onAddToWatchLater={handleAddToWatchLater}
//                 />
//               )
//             }
//           />

//           {/* Pagination */}
//           <View style={styles.pagination}>
//             <TouchableOpacity
//               style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
//               onPress={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page <= 1}
//             >
//               <ChevronLeft size={16} color={page <= 1 ? "#555" : "#fff"} />
//               <Text
//                 style={[
//                   styles.pageBtnText,
//                   page <= 1 && styles.pageBtnTextDisabled,
//                 ]}
//               >
//                 Previous
//               </Text>
//             </TouchableOpacity>

//             <Text style={styles.pageInfo}>
//               Page {page} of {totalPages}
//             </Text>

//             <TouchableOpacity
//               style={[
//                 styles.pageBtn,
//                 page >= totalPages && styles.pageBtnDisabled,
//               ]}
//               onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page >= totalPages}
//             >
//               <Text
//                 style={[
//                   styles.pageBtnText,
//                   page >= totalPages && styles.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//               <ChevronRight
//                 size={16}
//                 color={page >= totalPages ? "#555" : "#fff"}
//               />
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// // ────────────────────────────────────────────────
// // Styles
// // ────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#1f1f1f",
//   },
//   backBtn: {
//     padding: 8,
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   headerSubtitle: {
//     color: "#aaaaaa",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: {
//     color: "#aaaaaa",
//     marginTop: 12,
//     fontSize: 14,
//   },
//   errorText: {
//     color: "#f87171",
//     fontSize: 15,
//     textAlign: "center",
//   },
//   emptyText: {
//     color: "#aaaaaa",
//     fontSize: 15,
//     textAlign: "center",
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },

//   // Movie Card (16:9)
//   movieCard: {
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT + 52,
//     borderRadius: 10,
//     overflow: "hidden",
//     backgroundColor: "#18181b",
//   },
//   movieImage: {
//     width: "100%",
//     height: CARD_HEIGHT,
//   },
//   movieOverlay: {
//     padding: 8,
//   },
//   movieTitle: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//     lineHeight: 17,
//   },
//   movieViews: {
//     color: "#aaaaaa",
//     fontSize: 11,
//     marginTop: 3,
//   },

//   // Short Card (vertical)
//   shortCard: {
//     width: SHORT_WIDTH,
//     height: SHORT_HEIGHT,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#18181b",
//   },
//   shortImage: {
//     width: "100%",
//     height: "100%",
//   },
//   shortOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 10,
//     backgroundColor: "rgba(0,0,0,0.55)",
//   },
//   shortTitle: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//     lineHeight: 17,
//   },
//   shortViews: {
//     color: "#cccccc",
//     fontSize: 11,
//     marginTop: 4,
//   },

//   // Pagination
//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#1f1f1f",
//     gap: 16,
//   },
//   pageBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#272727",
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     gap: 4,
//   },
//   pageBtnDisabled: {
//     opacity: 0.4,
//   },
//   pageBtnText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   pageBtnTextDisabled: {
//     color: "#555",
//   },
//   pageInfo: {
//     color: "#aaaaaa",
//     fontSize: 13,
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image, // ← Fixed
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ORIGIN } from "../../config/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKEND_URL = API_ORIGIN;
const API_BASE = `${BACKEND_URL}/api/uservideo`;

const PAGE_SIZE = 20;

const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

const SHORT_WIDTH = (SCREEN_WIDTH - 48) / 2;
const SHORT_HEIGHT = SHORT_WIDTH * (16 / 9);

// ────────────────────────────────────────────────
// Normalize helpers
// ────────────────────────────────────────────────
const normalizeVideoListItem = (video = {}) => ({
  id: video._id || video.id,
  title: video.title || "Untitled video",
  thumb: video.thumbnail
    ? /^https?:\/\//i.test(video.thumbnail)
      ? video.thumbnail.replace(/\\/g, "/")
      : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
    : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  thumbnail: video.thumbnail
    ? /^https?:\/\//i.test(video.thumbnail)
      ? video.thumbnail.replace(/\\/g, "/")
      : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
    : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  description: video.description || "",
  views: Number(video.views || 0),
  likesCount: Number(video.likesCount ?? video.likes ?? 0),
  videoUrl: video.videoUrl
    ? /^https?:\/\//i.test(video.videoUrl)
      ? video.videoUrl.replace(/\\/g, "/")
      : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
    : "",
  videoType: video.videoType || null,
  raw: video,
  isShort: false,
});

const normalizeShort = (video = {}) => ({
  id: video._id || video.id,
  title: video.title || "Untitled short",
  thumbnail: video.thumbnail
    ? /^https?:\/\//i.test(video.thumbnail)
      ? video.thumbnail.replace(/\\/g, "/")
      : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
    : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
  views: Number(video.views || 0),
  likes: Number(video.likesCount ?? video.likes ?? 0),
  videoUrl: video.videoUrl
    ? /^https?:\/\//i.test(video.videoUrl)
      ? video.videoUrl.replace(/\\/g, "/")
      : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
    : "",
  videoType: video.videoType || "short",
  raw: video,
  isShort: true,
});

const SECTIONS = {
  recommended: {
    title: "Recommended for you",
    endpoint: "recommended",
    normalize: normalizeVideoListItem,
    isShort: false,
  },
  trending: {
    title: "Trending Videos",
    endpoint: "trending",
    normalize: normalizeVideoListItem,
    isShort: false,
  },
  latest: {
    title: "Latest Videos",
    endpoint: "latest",
    normalize: normalizeVideoListItem,
    isShort: false,
  },
  subscriptions: {
    title: "Subscription Videos",
    endpoint: "subscriptions",
    normalize: normalizeVideoListItem,
    isShort: false,
  },
  shorts: {
    title: "Trending Shorts",
    endpoint: "trending-shorts",
    normalize: normalizeShort,
    isShort: true,
  },
  "top-shorts": {
    title: "Top Shorts",
    endpoint: "top-shorts",
    normalize: normalizeShort,
    isShort: true,
  },
};

// ────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────
function MovieCard({ item, onPress, onAddToWatchLater }) {
  const [adding, setAdding] = useState(false);

  const handlePlus = async () => {
    if (adding || !onAddToWatchLater) return;
    setAdding(true);
    try {
      await onAddToWatchLater(item);
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={styles.movieCard}
    >
      <Image
        source={{ uri: item.thumb || item.thumbnail }}
        style={styles.movieImage}
        resizeMode="cover"
      />
      <View style={styles.movieOverlay}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.movieViews}>
          {item.views?.toLocaleString() || 0} views
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ShortCard({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={styles.shortCard}
    >
      <Image
        source={{ uri: item.thumbnail || item.thumb }}
        style={styles.shortImage}
        resizeMode="cover"
      />
      <View style={styles.shortOverlay}>
        <Text style={styles.shortTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.shortViews}>
          {item.views?.toLocaleString() || 0} views
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────
export default function ViewAll() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params || {};

  const section = SECTIONS[type];

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  useEffect(() => {
    if (!section) return;

    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setError("Please login to view videos.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE}/${section.endpoint}?page=${page}&limit=${PAGE_SIZE}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to load videos (${res.status})`);
        }

        const data = await res.json();

        if (!active) return;

        if (!data.success && data.success !== undefined) {
          throw new Error(data.message || "Failed to load videos");
        }

        const list = Array.isArray(data.videos)
          ? data.videos
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        setItems(list.map(section.normalize));
        setTotal(Number(data.total) || list.length);
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load videos.");
          setItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [type, page, section]);

  const handleItemClick = (item) => {
    if (section?.isShort) {
      navigation.navigate("MainTabs", {
        screen: "Shorts",
        params: { video: item },
      });
      return;
    }

    navigation.navigate("VideoDetail", {
      id: item.id,
      item,
    });
  };

  const handleAddToWatchLater = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Toast.show({ type: "error", text1: "Please login first" });
        return;
      }

      const res = await fetch(`${API_BASE}/watch-later/${item.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        Toast.show({
          type: "success",
          text1: data.message || "Added to Watch Later",
        });
      } else {
        Toast.show({
          type: "error",
          text1: data.message || "Failed to add",
        });
      }
    } catch (err) {
      console.error("Add to Watch Later error:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };

  if (!section) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Section not found</Text>
        </View>
        <Text style={styles.emptyText}>Section not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {section.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {total.toLocaleString()} videos
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>
            Loading {section.title.toLowerCase()}...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No videos available right now.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              section.isShort ? (
                <ShortCard item={item} onPress={handleItemClick} />
              ) : (
                <MovieCard
                  item={item}
                  onPress={handleItemClick}
                  onAddToWatchLater={handleAddToWatchLater}
                />
              )
            }
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              onPress={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} color={page <= 1 ? "#555" : "#fff"} />
              <Text
                style={[
                  styles.pageBtnText,
                  page <= 1 && styles.pageBtnTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Page {page} of {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageBtn,
                page >= totalPages && styles.pageBtnDisabled,
              ]}
              onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  page >= totalPages && styles.pageBtnTextDisabled,
                ]}
              >
                Next
              </Text>
              <ChevronRight
                size={16}
                color={page >= totalPages ? "#555" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#000",
    paddingTop: 50,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#aaaaaa",
    fontSize: 12,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#aaaaaa",
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: "#f87171",
    fontSize: 15,
    textAlign: "center",
  },
  emptyText: {
    color: "#aaaaaa",
    fontSize: 15,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Movie Card
  movieCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#18181b",
  },
  movieImage: {
    width: "100%",
    height: CARD_HEIGHT,
  },
  movieOverlay: {
    padding: 8,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
  movieViews: {
    color: "#aaaaaa",
    fontSize: 11,
    marginTop: 3,
  },

  // Short Card
  shortCard: {
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

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
    gap: 16,
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#272727",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  pageBtnTextDisabled: {
    color: "#555",
  },
  pageInfo: {
    color: "#aaaaaa",
    fontSize: 13,
  },
});
