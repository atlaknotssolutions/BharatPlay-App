// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   Image,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Dimensions,
// //   ActivityIndicator,
// //   StatusBar,
// //   FlatList,
// // } from "react-native";
// // import { useRoute, useNavigation } from "@react-navigation/native";
// // import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";
// // import Toast from "react-native-toast-message";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { API_ORIGIN } from "../../config/api";
// // import Navbar from "./Navbar";
// // import TopicChips from "./TopicChips";

// // const { width: SCREEN_WIDTH } = Dimensions.get("window");

// // const BACKEND_URL = API_ORIGIN;
// // const API_BASE = `${BACKEND_URL}/api/uservideo`;

// // const PAGE_SIZE = 20;

// // const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
// // const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

// // const SHORT_WIDTH = (SCREEN_WIDTH - 48) / 2;
// // const SHORT_HEIGHT = SHORT_WIDTH * (16 / 9);

// // // ────────────────────────────────────────────────
// // // Normalize helpers
// // // ────────────────────────────────────────────────
// // const normalizeVideoListItem = (video = {}) => ({
// //   id: video._id || video.id,
// //   title: video.title || "Untitled video",
// //   thumb: video.thumbnail
// //     ? /^https?:\/\//i.test(video.thumbnail)
// //       ? video.thumbnail.replace(/\\/g, "/")
// //       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
// //     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
// //   thumbnail: video.thumbnail
// //     ? /^https?:\/\//i.test(video.thumbnail)
// //       ? video.thumbnail.replace(/\\/g, "/")
// //       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
// //     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
// //   description: video.description || "",
// //   views: Number(video.views || 0),
// //   likesCount: Number(video.likesCount ?? video.likes ?? 0),
// //   videoUrl: video.videoUrl
// //     ? /^https?:\/\//i.test(video.videoUrl)
// //       ? video.videoUrl.replace(/\\/g, "/")
// //       : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
// //     : "",
// //   videoType: video.videoType || null,
// //   raw: video,
// //   isShort: false,
// // });

// // const normalizeShort = (video = {}) => ({
// //   id: video._id || video.id,
// //   title: video.title || "Untitled short",
// //   thumbnail: video.thumbnail
// //     ? /^https?:\/\//i.test(video.thumbnail)
// //       ? video.thumbnail.replace(/\\/g, "/")
// //       : `${BACKEND_URL}/${String(video.thumbnail).replace(/\\/g, "/")}`
// //     : "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
// //   views: Number(video.views || 0),
// //   likes: Number(video.likesCount ?? video.likes ?? 0),
// //   videoUrl: video.videoUrl
// //     ? /^https?:\/\//i.test(video.videoUrl)
// //       ? video.videoUrl.replace(/\\/g, "/")
// //       : `${BACKEND_URL}/${String(video.videoUrl).replace(/\\/g, "/")}`
// //     : "",
// //   videoType: video.videoType || "short",
// //   raw: video,
// //   isShort: true,
// // });

// // const SECTIONS = {
// //   recommended: {
// //     title: "Recommended for you",
// //     endpoint: "recommended",
// //     normalize: normalizeVideoListItem,
// //     isShort: false,
// //   },
// //   trending: {
// //     title: "Trending Videos",
// //     endpoint: "trending",
// //     normalize: normalizeVideoListItem,
// //     isShort: false,
// //   },
// //   latest: {
// //     title: "Latest Videos",
// //     endpoint: "latest",
// //     normalize: normalizeVideoListItem,
// //     isShort: false,
// //   },
// //   subscriptions: {
// //     title: "Subscription Videos",
// //     endpoint: "subscriptions",
// //     normalize: normalizeVideoListItem,
// //     isShort: false,
// //   },
// //   shorts: {
// //     title: "Trending Shorts",
// //     endpoint: "trending-shorts",
// //     normalize: normalizeShort,
// //     isShort: true,
// //   },
// //   "top-shorts": {
// //     title: "Top Shorts",
// //     endpoint: "top-shorts",
// //     normalize: normalizeShort,
// //     isShort: true,
// //   },
// // };

// // // ────────────────────────────────────────────────
// // // Components
// // // ────────────────────────────────────────────────
// // function MovieCard({ item, onPress }) {
// //   return (
// //     <TouchableOpacity
// //       activeOpacity={0.9}
// //       onPress={() => onPress(item)}
// //       style={styles.movieCard}
// //     >
// //       <Image
// //         source={{ uri: item.thumb || item.thumbnail }}
// //         style={styles.movieImage}
// //         resizeMode="cover"
// //       />
// //       <View style={styles.movieOverlay}>
// //         <Text style={styles.movieTitle} numberOfLines={2}>
// //           {item.title}
// //         </Text>
// //         <Text style={styles.movieViews}>
// //           {item.views?.toLocaleString() || 0} views
// //         </Text>
// //       </View>
// //     </TouchableOpacity>
// //   );
// // }

// // function ShortCard({ item, onPress }) {
// //   return (
// //     <TouchableOpacity
// //       activeOpacity={0.9}
// //       onPress={() => onPress(item)}
// //       style={styles.shortCard}
// //     >
// //       <Image
// //         source={{ uri: item.thumbnail || item.thumb }}
// //         style={styles.shortImage}
// //         resizeMode="cover"
// //       />
// //       <View style={styles.shortOverlay}>
// //         <Text style={styles.shortTitle} numberOfLines={2}>
// //           {item.title}
// //         </Text>
// //         <Text style={styles.shortViews}>
// //           {item.views?.toLocaleString() || 0} views
// //         </Text>
// //       </View>
// //     </TouchableOpacity>
// //   );
// // }

// // // ────────────────────────────────────────────────
// // // Main Screen
// // // ────────────────────────────────────────────────
// // export default function ViewAll() {
// //   const route = useRoute();
// //   const navigation = useNavigation();
// //   const { type } = route.params || {};

// //   const section = SECTIONS[type];

// //   const [page, setPage] = useState(1);
// //   const [items, setItems] = useState([]);
// //   const [total, setTotal] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   // TopicChips state (optional – agar filter lagana ho)
// //   const [selectedTopic, setSelectedTopic] = useState("For you");
// //   const [selectedCategoryId, setSelectedCategoryId] = useState(null);

// //   const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

// //   useEffect(() => {
// //     if (!section) return;

// //     let active = true;

// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         setError(null);

// //         const token = await AsyncStorage.getItem("token");
// //         if (!token) {
// //           setError("Please login to view videos.");
// //           setLoading(false);
// //           return;
// //         }

// //         const res = await fetch(
// //           `${API_BASE}/${section.endpoint}?page=${page}&limit=${PAGE_SIZE}`,
// //           {
// //             headers: { Authorization: `Bearer ${token}` },
// //           },
// //         );

// //         if (!res.ok) {
// //           throw new Error(`Failed to load videos (${res.status})`);
// //         }

// //         const data = await res.json();

// //         if (!active) return;

// //         if (!data.success && data.success !== undefined) {
// //           throw new Error(data.message || "Failed to load videos");
// //         }

// //         const list = Array.isArray(data.videos)
// //           ? data.videos
// //           : Array.isArray(data.data)
// //             ? data.data
// //             : Array.isArray(data)
// //               ? data
// //               : [];

// //         setItems(list.map(section.normalize));
// //         setTotal(Number(data.total) || list.length);
// //       } catch (err) {
// //         if (active) {
// //           setError(err.message || "Failed to load videos.");
// //           setItems([]);
// //         }
// //       } finally {
// //         if (active) setLoading(false);
// //       }
// //     };

// //     fetchData();

// //     return () => {
// //       active = false;
// //     };
// //   }, [type, page, section]);

// //   const handleItemClick = (item) => {
// //     if (section?.isShort) {
// //       navigation.navigate("MainTabs", {
// //         screen: "Shorts",
// //         params: { video: item },
// //       });
// //       return;
// //     }

// //     navigation.navigate("VideoDetail", {
// //       id: item.id,
// //       item,
// //     });
// //   };

// //   const handleAddToWatchLater = async (item) => {
// //     try {
// //       const token = await AsyncStorage.getItem("token");
// //       if (!token) {
// //         Toast.show({ type: "error", text1: "Please login first" });
// //         return;
// //       }

// //       const res = await fetch(`${API_BASE}/watch-later/${item.id}`, {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "Content-Type": "application/json",
// //         },
// //       });

// //       const data = await res.json();

// //       if (data.success) {
// //         Toast.show({
// //           type: "success",
// //           text1: data.message || "Added to Watch Later",
// //         });
// //       } else {
// //         Toast.show({
// //           type: "error",
// //           text1: data.message || "Failed to add",
// //         });
// //       }
// //     } catch (err) {
// //       console.error("Add to Watch Later error:", err);
// //       Toast.show({ type: "error", text1: "Something went wrong" });
// //     }
// //   };

// //   if (!section) {
// //     return (
// //       <View style={styles.container}>
// //         <StatusBar barStyle="light-content" backgroundColor="#000" />
// //         <Navbar onMenuPress={() => {}} points={0} />
// //         <View style={styles.header}>
// //           <TouchableOpacity
// //             onPress={() => navigation.goBack()}
// //             style={styles.backBtn}
// //           >
// //             <ArrowLeft size={24} color="#fff" />
// //           </TouchableOpacity>
// //           <Text style={styles.headerTitle}>Section not found</Text>
// //         </View>
// //         <Text style={styles.emptyText}>Section not found.</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" backgroundColor="#000" />

// //       {/* ===== Navbar + TopicChips (top pe) ===== */}
// //       <Navbar onMenuPress={() => {}} points={0} />

// //       <TopicChips
// //         onTopicChange={(topic, categoryId) => {
// //           setSelectedTopic(topic);
// //           setSelectedCategoryId(categoryId || null);
// //         }}
// //       />

// //       {/* Section Header with Back */}
// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backBtn}
// //         >
// //           <ArrowLeft size={24} color="#fff" />
// //         </TouchableOpacity>

// //         <View style={styles.headerCenter}>
// //           <Text style={styles.headerTitle} numberOfLines={1}>
// //             {section.title}
// //           </Text>
// //           <Text style={styles.headerSubtitle}>
// //             {total.toLocaleString()} videos
// //           </Text>
// //         </View>

// //         <View style={{ width: 40 }} />
// //       </View>

// //       {/* Content */}
// //       {loading ? (
// //         <View style={styles.center}>
// //           <ActivityIndicator size="large" color="#FF0000" />
// //           <Text style={styles.loadingText}>
// //             Loading {section.title.toLowerCase()}...
// //           </Text>
// //         </View>
// //       ) : error ? (
// //         <View style={styles.center}>
// //           <Text style={styles.errorText}>{error}</Text>
// //         </View>
// //       ) : items.length === 0 ? (
// //         <View style={styles.center}>
// //           <Text style={styles.emptyText}>No videos available right now.</Text>
// //         </View>
// //       ) : (
// //         <>
// //           <FlatList
// //             data={items}
// //             keyExtractor={(item) => String(item.id)}
// //             numColumns={2}
// //             contentContainerStyle={styles.listContent}
// //             columnWrapperStyle={styles.columnWrapper}
// //             showsVerticalScrollIndicator={false}
// //             renderItem={({ item }) =>
// //               section.isShort ? (
// //                 <ShortCard item={item} onPress={handleItemClick} />
// //               ) : (
// //                 <MovieCard item={item} onPress={handleItemClick} />
// //               )
// //             }
// //           />

// //           {/* Pagination */}
// //           <View style={styles.pagination}>
// //             <TouchableOpacity
// //               style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
// //               onPress={() => setPage((p) => Math.max(p - 1, 1))}
// //               disabled={page <= 1}
// //             >
// //               <ChevronLeft size={16} color={page <= 1 ? "#555" : "#fff"} />
// //               <Text
// //                 style={[
// //                   styles.pageBtnText,
// //                   page <= 1 && styles.pageBtnTextDisabled,
// //                 ]}
// //               >
// //                 Previous
// //               </Text>
// //             </TouchableOpacity>

// //             <Text style={styles.pageInfo}>
// //               Page {page} of {totalPages}
// //             </Text>

// //             <TouchableOpacity
// //               style={[
// //                 styles.pageBtn,
// //                 page >= totalPages && styles.pageBtnDisabled,
// //               ]}
// //               onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
// //               disabled={page >= totalPages}
// //             >
// //               <Text
// //                 style={[
// //                   styles.pageBtnText,
// //                   page >= totalPages && styles.pageBtnTextDisabled,
// //                 ]}
// //               >
// //                 Next
// //               </Text>
// //               <ChevronRight
// //                 size={16}
// //                 color={page >= totalPages ? "#555" : "#fff"}
// //               />
// //             </TouchableOpacity>
// //           </View>
// //         </>
// //       )}
// //     </View>
// //   );
// // }

// // // ────────────────────────────────────────────────
// // // Styles
// // // ────────────────────────────────────────────────
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#000",
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 12,
// //     paddingVertical: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#1f1f1f",
// //   },
// //   backBtn: {
// //     padding: 8,
// //   },
// //   headerCenter: {
// //     flex: 1,
// //     alignItems: "center",
// //   },
// //   headerTitle: {
// //     color: "#fff",
// //     fontSize: 18,
// //     fontWeight: "700",
// //   },
// //   headerSubtitle: {
// //     color: "#aaaaaa",
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   center: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 20,
// //   },
// //   loadingText: {
// //     color: "#aaaaaa",
// //     marginTop: 12,
// //     fontSize: 14,
// //   },
// //   errorText: {
// //     color: "#f87171",
// //     fontSize: 15,
// //     textAlign: "center",
// //   },
// //   emptyText: {
// //     color: "#aaaaaa",
// //     fontSize: 15,
// //     textAlign: "center",
// //   },
// //   listContent: {
// //     padding: 16,
// //     paddingBottom: 20,
// //   },
// //   columnWrapper: {
// //     justifyContent: "space-between",
// //     marginBottom: 16,
// //   },

// //   // Movie Card
// //   movieCard: {
// //     width: CARD_WIDTH,
// //     borderRadius: 10,
// //     overflow: "hidden",
// //     backgroundColor: "#18181b",
// //   },
// //   movieImage: {
// //     width: "100%",
// //     height: CARD_HEIGHT,
// //   },
// //   movieOverlay: {
// //     padding: 8,
// //   },
// //   movieTitle: {
// //     color: "#fff",
// //     fontSize: 13,
// //     fontWeight: "600",
// //     lineHeight: 17,
// //   },
// //   movieViews: {
// //     color: "#aaaaaa",
// //     fontSize: 11,
// //     marginTop: 3,
// //   },

// //   // Short Card
// //   shortCard: {
// //     width: SHORT_WIDTH,
// //     height: SHORT_HEIGHT,
// //     borderRadius: 12,
// //     overflow: "hidden",
// //     backgroundColor: "#18181b",
// //   },
// //   shortImage: {
// //     width: "100%",
// //     height: "100%",
// //   },
// //   shortOverlay: {
// //     position: "absolute",
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     padding: 10,
// //     backgroundColor: "rgba(0,0,0,0.55)",
// //   },
// //   shortTitle: {
// //     color: "#fff",
// //     fontSize: 13,
// //     fontWeight: "600",
// //     lineHeight: 17,
// //   },
// //   shortViews: {
// //     color: "#cccccc",
// //     fontSize: 11,
// //     marginTop: 4,
// //   },

// //   // Pagination
// //   pagination: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingVertical: 16,
// //     paddingHorizontal: 16,
// //     borderTopWidth: 1,
// //     borderTopColor: "#1f1f1f",
// //     gap: 16,
// //   },
// //   pageBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#272727",
// //     paddingVertical: 8,
// //     paddingHorizontal: 14,
// //     borderRadius: 8,
// //     gap: 4,
// //   },
// //   pageBtnDisabled: {
// //     opacity: 0.4,
// //   },
// //   pageBtnText: {
// //     color: "#fff",
// //     fontSize: 13,
// //     fontWeight: "500",
// //   },
// //   pageBtnTextDisabled: {
// //     color: "#555",
// //   },
// //   pageInfo: {
// //     color: "#aaaaaa",
// //     fontSize: 13,
// //   },
// // });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   StatusBar,
//   FlatList,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ArrowLeft,
//   Home,
//   PlaySquare,
//   Users,
//   Library,
//   Clapperboard,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_ORIGIN } from "../../config/api";
// import Navbar from "./Navbar";
// import TopicChips from "./TopicChips";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const BACKEND_URL = API_ORIGIN;
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
//     title: "Recommended for you",
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
// function MovieCard({ item, onPress }) {
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
// // Bottom Tabs Component
// // ────────────────────────────────────────────────
// function BottomTabs({ activeTab = "home" }) {
//   const navigation = useNavigation();

//   const tabs = [
//     { key: "home", label: "Home", icon: Home, screen: "MainTabs" },
//     { key: "shorts", label: "Shorts", icon: Clapperboard, screen: "Shorts" },
//     { key: "subscriptions", label: "Subs", icon: Users, screen: "Subscriptions" },
//     { key: "library", label: "Library", icon: Library, screen: "Library" },
//   ];

//   const handleTabPress = (tab) => {
//     if (tab.key === "home") {
//       navigation.navigate("MainTabs", { screen: "Home" });
//     } else if (tab.key === "shorts") {
//       navigation.navigate("MainTabs", { screen: "Shorts" });
//     } else if (tab.key === "subscriptions") {
//       navigation.navigate("MainTabs", { screen: "Subscriptions" });
//     } else if (tab.key === "library") {
//       navigation.navigate("MainTabs", { screen: "Library" });
//     }
//   };

//   return (
//     <View style={styles.bottomTabs}>
//       {tabs.map((tab) => {
//         const Icon = tab.icon;
//         const isActive = activeTab === tab.key;

//         return (
//           <TouchableOpacity
//             key={tab.key}
//             style={styles.tabItem}
//             onPress={() => handleTabPress(tab)}
//             activeOpacity={0.7}
//           >
//             <Icon
//               size={22}
//               color={isActive ? "#fff" : "#a1a1aa"}
//               strokeWidth={isActive ? 2.5 : 2}
//             />
//             <Text
//               style={[
//                 styles.tabLabel,
//                 isActive && styles.tabLabelActive,
//               ]}
//             >
//               {tab.label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
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

//   const [selectedTopic, setSelectedTopic] = useState("For you");
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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
//           },
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
//             ? data.data
//             : Array.isArray(data)
//               ? data
//               : [];

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

//   if (!section) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="#000" />
//         <Navbar onMenuPress={() => {}} points={0} />
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backBtn}
//           >
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Section not found</Text>
//         </View>
//         <Text style={styles.emptyText}>Section not found.</Text>
//         <BottomTabs activeTab="home" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />

//       {/* ===== Navbar + TopicChips (top pe) ===== */}
//       <Navbar onMenuPress={() => {}} points={0} />

//       <TopicChips
//         onTopicChange={(topic, categoryId) => {
//           setSelectedTopic(topic);
//           setSelectedCategoryId(categoryId || null);
//         }}
//       />

//       {/* Section Header with Back */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
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
//                 <MovieCard item={item} onPress={handleItemClick} />
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

//       {/* ===== Bottom Tabs ===== */}
//       <BottomTabs activeTab="home" />
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

//   // Movie Card
//   movieCard: {
//     width: CARD_WIDTH,
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

//   // Short Card
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

//   // ===== Bottom Tabs =====
//   bottomTabs: {
//     flexDirection: "row",
//     backgroundColor: "#0f0f0f",
//     borderTopWidth: 1,
//     borderTopColor: "#222",
//     paddingBottom: 8,
//     paddingTop: 8,
//     paddingHorizontal: 8,
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 4,
//   },
//   tabLabel: {
//     color: "#a1a1aa",
//     fontSize: 11,
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   tabLabelActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Play,
  Plus,
  Users,
  User,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ORIGIN } from "../../config/api";
import Navbar from "./Navbar";
import TopicChips from "./TopicChips";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKEND_URL = API_ORIGIN;
const API_BASE = `${BACKEND_URL}/api/uservideo`;

const PAGE_SIZE = 20;

const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

const SHORT_WIDTH = (SCREEN_WIDTH - 48) / 2;
const SHORT_HEIGHT = SHORT_WIDTH * (16 / 9);

const TAB_BAR_HEIGHT = 64;

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
function MovieCard({ item, onPress }) {
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
// Bottom Tab Bar
// ────────────────────────────────────────────────
function BottomTabBar({ navigation }) {
  const tabs = [
    { key: "Home", label: "Home", icon: Home, screen: "Home" },
    { key: "Shorts", label: "Shorts", icon: Play, screen: "Shorts" },
    { key: "Create", label: "Create", icon: Plus, screen: "Create", isCenter: true },
    { key: "Subscriptions", label: "Subscriptions", icon: Users, screen: "Subscriptions" },
    { key: "You", label: "You", icon: User, screen: "You" },
  ];

  const handleTabPress = (tab) => {
    if (tab.key === "Create") {
      // Create screen / modal
      navigation.navigate("MainTabs", { screen: "Create" });
      return;
    }
    navigation.navigate("MainTabs", { screen: tab.screen });
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isCenter = tab.isCenter;

        if (isCenter) {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.centerTab}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.8}
            >
              <View style={styles.centerButton}>
                <Plus size={26} color="#000" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <Icon size={22} color="#fff" strokeWidth={1.8} />
            <Text style={styles.tabLabel}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
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

  const [selectedTopic, setSelectedTopic] = useState("For you");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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

  if (!section) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Navbar onMenuPress={() => {}} points={0} />
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
        <BottomTabBar navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ===== Navbar + TopicChips ===== */}
      <Navbar onMenuPress={() => {}} points={0} />

      <TopicChips
        onTopicChange={(topic, categoryId) => {
          setSelectedTopic(topic);
          setSelectedCategoryId(categoryId || null);
        }}
      />

      {/* Section Header with Back */}
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
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: TAB_BAR_HEIGHT + 24 }, // gap for bottom tabs
            ]}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              section.isShort ? (
                <ShortCard item={item} onPress={handleItemClick} />
              ) : (
                <MovieCard item={item} onPress={handleItemClick} />
              )
            }
          />

          {/* Pagination */}
          <View style={[styles.pagination, { marginBottom: TAB_BAR_HEIGHT }]}>
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

      {/* ===== Bottom Tabs ===== */}
      <BottomTabBar navigation={navigation} />
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
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Movie Card
  movieCard: {
    width: CARD_WIDTH,
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

  // ===== Bottom Tab Bar =====
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 10 : 0),
    backgroundColor: "#0f0f0f",
    borderTopWidth: 1,
    borderTopColor: "#272727",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 35 : 75,
    paddingTop: 46
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  centerTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});