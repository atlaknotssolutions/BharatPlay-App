// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
//   Alert,
//   StatusBar,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   Bell,
//   Search,
//   MoreVertical,
//   Play,
//   ChevronDown,
//   ChevronRight,
//   ArrowLeft,
// } from "lucide-react-native";
// import { API_ORIGIN } from "../../config/api";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const BACKEND_URL = API_ORIGIN;
// const API_BASE = `${BACKEND_URL}/api/uservideo`;

// export default function SubscribedChannels() {
//   const route = useRoute();
//   const navigation = useNavigation<any>();
//   const { id } = (route.params || {}) as { id?: string | number };

//   // List mode (no id)
//   const [subscribedList, setSubscribedList] = useState([]);
//   const [listLoading, setListLoading] = useState(!id);

//   // Detail mode (with id)
//   const [channel, setChannel] = useState(null);
//   const [videos, setVideos] = useState([]);
//   const [isSubscribed, setIsSubscribed] = useState(true);
//   const [subscribersCount, setSubscribersCount] = useState(0);
//   const [subscribeLoading, setSubscribeLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("All");
//   const [loading, setLoading] = useState(!!id);

//   // Matches the screenshot tabs style
//   const tabs = ["All", "Today", "Videos", "Shorts", "Live", "Posts"];

//   const getMediaUrl = (path) => {
//     if (!path) return null;
//     const cleaned = String(path).replace(/\\/g, "/");
//     if (cleaned.startsWith("http")) return cleaned;
//     return `${BACKEND_URL}/${cleaned}`;
//   };

//   const formatCount = (num) => {
//     if (!num && num !== 0) return "0";
//     if (num >= 1_000_000_000)
//       return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
//     if (num >= 1_000_000)
//       return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
//     if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
//     return String(num);
//   };

//   // ─── LIST: subscribed channels ───
//   useEffect(() => {
//     if (id) return;

//     const fetchSubscribed = async () => {
//       try {
//         setListLoading(true);
//         const token = await AsyncStorage.getItem("token");
//         if (!token) {
//           setSubscribedList([]);
//           return;
//         }

//         const res = await fetch(`${API_BASE}/subscribed-channels`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await res.json();

//         const list =
//           data.channels ||
//           data.subscribedChannels ||
//           data.data ||
//           (Array.isArray(data) ? data : []);

//         setSubscribedList(Array.isArray(list) ? list : []);
//       } catch (err) {
//         console.error("Subscribed list error:", err);
//         setSubscribedList([]);
//       } finally {
//         setListLoading(false);
//       }
//     };

//     fetchSubscribed();
//   }, [id]);

//   // ─── DETAIL: single channel ───
//   useEffect(() => {
//     if (!id) return;

//     const fetchChannel = async () => {
//       try {
//         setLoading(true);
//         const token = await AsyncStorage.getItem("token");

//         const res = await fetch(`${API_BASE}/channel/${id}`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });

//         const data = await res.json();

//         if (data.success && data.channel) {
//           setChannel(data.channel);
//           setSubscribersCount(
//             data.channel.subscribersCount ?? data.channel.subscribers ?? 0,
//           );
//           setIsSubscribed(Boolean(data.channel.isSubscribed ?? true));
//           setVideos(data.videos || []);
//         } else {
//           setChannel(data.channel || { _id: id, name: "Channel" });
//           setVideos(data.videos || []);
//         }

//         if ((!data.videos || data.videos.length === 0) && token) {
//           try {
//             const vRes = await fetch(`${API_BASE}/channel/${id}/videos`, {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             if (vRes.ok) {
//               const vData = await vRes.json();
//               setVideos(vData.videos || []);
//             }
//           } catch (_) {}
//         }
//       } catch (err) {
//         console.error("Fetch channel error:", err);
//         setChannel(null);
//         setVideos([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChannel();
//   }, [id]);

//   // ─── Subscribe toggle ───
//   const handleSubscribe = async () => {
//     if (!id) return;
//     setSubscribeLoading(true);
//     const token = await AsyncStorage.getItem("token");

//     if (!token) {
//       Alert.alert("Login required", "Please login to subscribe");
//       setSubscribeLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE}/subscribe/${id}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();

//       if (data.success) {
//         setIsSubscribed(data.subscribed);
//         if (typeof data.subscribersCount === "number") {
//           setSubscribersCount(data.subscribersCount);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSubscribeLoading(false);
//     }
//   };

//   const openChannel = (ch) => {
//     const channelId = ch._id || ch.id || ch.channelId;
//     if (!channelId) return;
//     navigation.push("SubscribedChannels", { id: channelId });
//   };

//   const openVideo = (video) => {
//     navigation.navigate("VideoDetail", {
//       id: video._id,
//       item: {
//         id: video._id,
//         title: video.title || video.name,
//         thumb: getMediaUrl(video.thumbnail),
//         videofile: getMediaUrl(
//           video.videofile || video.videoUrl || video.video,
//         ),
//         description: video.description || "",
//         views: video.views || 0,
//         likes: video.likesCount ?? video.likes ?? 0,
//         dislikes: video.dislikesCount ?? video.dislikes ?? 0,
//       },
//     });
//   };

//   // ═══════════════ LIST MODE (no id) ═══════════════
//   if (!id) {
//     if (listLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#FF0000" />
//           <Text style={styles.loadingText}>Loading subscriptions...</Text>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
//         <View style={styles.listHeader}>
//           <Text style={styles.listTitle}>Subscriptions</Text>
//           <Text style={styles.listSubtitle}>
//             {subscribedList.length} channel
//             {subscribedList.length !== 1 ? "s" : ""}
//           </Text>
//         </View>

//         {subscribedList.length === 0 ? (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No subscribed channels yet</Text>
//             <Text style={styles.emptyHint}>
//               Subscribe to channels to see them here
//             </Text>
//           </View>
//         ) : (
//           <FlatList
//             data={subscribedList}
//             keyExtractor={(item) =>
//               String(item._id || item.id || item.channelId)
//             }
//             contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//             renderItem={({ item: ch }) => {
//               const avatar =
//                 getMediaUrl(ch.channelImage || ch.avatar || ch.image) ||
//                 "https://via.placeholder.com/80";
//               const name = ch.name || ch.channelName || "Channel";
//               const subs =
//                 ch.subscribersCount ??
//                 ch.subscribers ??
//                 ch.subscriberCount ??
//                 0;

//               return (
//                 <TouchableOpacity
//                   style={styles.channelRow}
//                   activeOpacity={0.8}
//                   onPress={() => openChannel(ch)}
//                 >
//                   <Image source={{ uri: avatar }} style={styles.listAvatar} />
//                   <View style={styles.channelRowInfo}>
//                     <Text style={styles.channelRowName} numberOfLines={1}>
//                       {name}
//                     </Text>
//                     <Text style={styles.channelRowMeta}>
//                       {formatCount(subs)} subscribers
//                     </Text>
//                   </View>
//                   <ChevronRight size={20} color="#aaaaaa" />
//                 </TouchableOpacity>
//               );
//             }}
//           />
//         )}
//       </View>
//     );
//   }

//   // ═══════════════ DETAIL MODE (with id) ═══════════════
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#FF0000" />
//         <Text style={styles.loadingText}>Loading channel...</Text>
//       </View>
//     );
//   }

//   const avatarUrl =
//     getMediaUrl(channel?.channelImage) || "https://via.placeholder.com/150";

//   // Shorts-style card (matches screenshot)
//   const renderShortCard = ({ item: video }) => (
//     <TouchableOpacity
//       style={styles.shortCard}
//       activeOpacity={0.9}
//       onPress={() => openVideo(video)}
//     >
//       <Image
//         source={{
//           uri:
//             getMediaUrl(video.thumbnail) ||
//             "https://via.placeholder.com/180x320",
//         }}
//         style={styles.shortThumb}
//       />
//       <View style={styles.shortOverlay}>
//         <Text style={styles.shortTitle} numberOfLines={2}>
//           {video.title || video.name}
//         </Text>
//         <Text style={styles.shortViews}>{formatCount(video.views)} views</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   // Normal video row
//   const renderVideo = ({ item: video }) => (
//     <TouchableOpacity
//       style={styles.videoRow}
//       activeOpacity={0.8}
//       onPress={() => openVideo(video)}
//     >
//       <View style={styles.thumbWrapper}>
//         <Image
//           source={{
//             uri:
//               getMediaUrl(video.thumbnail) ||
//               "https://via.placeholder.com/246x138",
//           }}
//           style={styles.thumb}
//         />
//         <View style={styles.durationBadge}>
//           <Text style={styles.durationText}>{video.duration || "0:00"}</Text>
//         </View>
//       </View>

//       <View style={styles.videoInfo}>
//         <Text style={styles.videoTitle} numberOfLines={2}>
//           {video.title || video.name}
//         </Text>
//         <Text style={styles.videoMeta} numberOfLines={1}>
//           {formatCount(video.views)} views
//           {video.createdAt
//             ? ` • ${new Date(video.createdAt).toLocaleDateString()}`
//             : ""}
//         </Text>
//       </View>

//       <TouchableOpacity style={styles.moreBtn} hitSlop={10}>
//         <MoreVertical size={18} color="#aaaaaa" />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

//       {/* Top bar matching YouTube */}
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//           hitSlop={12}
//         >
//           <ArrowLeft size={24} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.topBarRight}>
//           <TouchableOpacity style={styles.iconBtn}>
//             <Bell size={22} color="#fff" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconBtn}>
//             <Search size={22} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Channel Header - Avatar + Name (YouTube style) */}
//         <View style={styles.channelHeader}>
//           <Image source={{ uri: avatarUrl }} style={styles.avatar} />
//           <Text style={styles.channelName} numberOfLines={1}>
//             {channel?.name || "Channel Name"}
//           </Text>
//           <Text style={styles.handleText}>
//             @
//             {channel?.handle ||
//               channel?.name?.replace(/\s+/g, "")?.toLowerCase() ||
//               "channel"}
//             {"  •  "}
//             {formatCount(subscribersCount)} subscribers
//             {"  •  "}
//             {formatCount(channel?.videoCount || videos.length)} videos
//           </Text>

//           {/* Subscribe button */}
//           <TouchableOpacity
//             style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
//             onPress={handleSubscribe}
//             disabled={subscribeLoading}
//             activeOpacity={0.85}
//           >
//             {subscribeLoading ? (
//               <ActivityIndicator
//                 size="small"
//                 color={isSubscribed ? "#fff" : "#0f0f0f"}
//               />
//             ) : isSubscribed ? (
//               <>
//                 <Bell size={16} color="#fff" />
//                 <Text style={styles.subscribedText}>Subscribed</Text>
//                 <ChevronDown size={16} color="#fff" />
//               </>
//             ) : (
//               <Text style={styles.subscribeText}>Subscribe</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Tabs - exact style from screenshot */}
//         <View style={styles.tabsContainer}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.tabsScroll}
//           >
//             {tabs.map((tab) => (
//               <TouchableOpacity
//                 key={tab}
//                 style={[styles.tab, activeTab === tab && styles.tabActive]}
//                 onPress={() => setActiveTab(tab)}
//               >
//                 <Text
//                   style={[
//                     styles.tabText,
//                     activeTab === tab && styles.tabTextActive,
//                   ]}
//                 >
//                   {tab}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Shorts Section (matches the screenshot card) */}
//         {(activeTab === "All" || activeTab === "Shorts") &&
//           videos.length > 0 && (
//             <View style={styles.shortsSection}>
//               <View style={styles.sectionHeader}>
//                 <View style={styles.shortsTitleRow}>
//                   <View style={styles.shortsIcon}>
//                     <Play size={14} color="#fff" fill="#fff" />
//                   </View>
//                   <Text style={styles.sectionTitle}>Shorts</Text>
//                   <ChevronRight size={18} color="#fff" />
//                 </View>
//               </View>

//               <FlatList
//                 data={videos.slice(0, 8)}
//                 keyExtractor={(item) => item._id + "-short"}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
//                 renderItem={renderShortCard}
//               />
//             </View>
//           )}

//         {/* Videos list */}
//         {(activeTab === "All" ||
//           activeTab === "Videos" ||
//           activeTab === "Today") && (
//           <View style={styles.videosSection}>
//             {videos.length === 0 ? (
//               <Text style={styles.emptyText}>
//                 No videos found for this channel.
//               </Text>
//             ) : (
//               <FlatList
//                 data={videos}
//                 keyExtractor={(item) => item._id}
//                 renderItem={renderVideo}
//                 scrollEnabled={false}
//               />
//             )}
//           </View>
//         )}

//         <View style={{ height: 50 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 5,
//     backgroundColor: "#0f0f0f",
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#0f0f0f",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#aaaaaa",
//     marginTop: 25,
//     fontSize: 14,
//   },

//   // Top bar
//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#0f0f0f",
//   },
//   backBtn: {
//     padding: 4,
//   },
//   topBarRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   iconBtn: {
//     padding: 8,
//   },

//   // List mode
//   listHeader: {
//     paddingHorizontal: 16,
//     paddingTop: 50,
//     paddingBottom: 8,
//   },
//   listTitle: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "700",
//   },
//   listSubtitle: {
//     color: "#aaaaaa",
//     fontSize: 13,
//     marginTop: 4,
//   },
//   emptyBox: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 80,
//   },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   emptyHint: {
//     color: "#717171",
//     fontSize: 13,
//     marginTop: 6,
//   },
//   channelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//   },
//   listAvatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "#272727",
//   },
//   channelRowInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   channelRowName: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   channelRowMeta: {
//     color: "#aaaaaa",
//     fontSize: 12,
//     marginTop: 2,
//   },

//   // Channel header (YouTube style)
//   channelHeader: {
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 16,
//   },
//   avatar: {
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//     backgroundColor: "#272727",
//     marginBottom: 12,
//   },
//   channelName: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   handleText: {
//     color: "#aaaaaa",
//     fontSize: 13,
//     marginTop: 6,
//     textAlign: "center",
//   },
//   subscribeBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 14,
//     backgroundColor: "#fff",
//     paddingVertical: 9,
//     paddingHorizontal: 18,
//     borderRadius: 20,
//   },
//   subscribedBtn: {
//     backgroundColor: "#272727",
//   },
//   subscribeText: {
//     color: "#0f0f0f",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   subscribedText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // Tabs (exact match to screenshot)
//   tabsContainer: {
//     borderBottomWidth: 1,
//     borderBottomColor: "#272727",
//   },
//   tabsScroll: {
//     paddingHorizontal: 8,
//   },
//   tab: {
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     marginHorizontal: 2,
//   },
//   tabActive: {
//     borderBottomWidth: 2.5,
//     borderBottomColor: "#fff",
//   },
//   tabText: {
//     color: "#aaaaaa",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   tabTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   // Shorts section
//   shortsSection: {
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   sectionHeader: {
//     paddingHorizontal: 16,
//     marginBottom: 12,
//   },
//   shortsTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   shortsIcon: {
//     width: 22,
//     height: 22,
//     borderRadius: 4,
//     backgroundColor: "#FF0000",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   shortCard: {
//     width: 150,
//     height: 260,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#1a1a1a",
//   },
//   shortThumb: {
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

//   // Videos
//   videosSection: {
//     paddingHorizontal: 12,
//     paddingTop: 12,
//   },
//   videoRow: {
//     flexDirection: "row",
//     marginBottom: 16,
//     gap: 10,
//   },
//   thumbWrapper: {
//     width: SCREEN_WIDTH * 0.42,
//     aspectRatio: 16 / 9,
//     borderRadius: 10,
//     overflow: "hidden",
//     backgroundColor: "#1a1a1a",
//   },
//   thumb: {
//     width: "100%",
//     height: "100%",
//   },
//   durationBadge: {
//     position: "absolute",
//     bottom: 4,
//     right: 4,
//     backgroundColor: "rgba(0,0,0,0.85)",
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//     borderRadius: 3,
//   },
//   durationText: {
//     color: "#fff",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   videoInfo: {
//     flex: 1,
//     paddingTop: 2,
//   },
//   videoTitle: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//     lineHeight: 18,
//   },
//   videoMeta: {
//     color: "#aaaaaa",
//     fontSize: 12,
//     marginTop: 4,
//   },
//   moreBtn: {
//     paddingTop: 5,
//     paddingLeft: 4,
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  Search,
  MoreVertical,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { API_ORIGIN } from "../../config/api";
import Navbar from "./Navbar";
import TopicChips from "./TopicChips";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKEND_URL = API_ORIGIN;
const API_BASE = `${BACKEND_URL}/api/uservideo`;

export default function SubscribedChannels() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { id } = (route.params || {}) as { id?: string | number };

  // List mode (no id)
  const [subscribedList, setSubscribedList] = useState([]);
  const [listLoading, setListLoading] = useState(!id);

  // Detail mode (with id)
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(!!id);

  // TopicChips state
  const [selectedTopic, setSelectedTopic] = useState("For you");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Matches the screenshot tabs style
  const tabs = ["All", "Today", "Videos", "Shorts", "Live", "Posts"];

  const getMediaUrl = (path) => {
    if (!path) return null;
    const cleaned = String(path).replace(/\\/g, "/");
    if (cleaned.startsWith("http")) return cleaned;
    return `${BACKEND_URL}/${cleaned}`;
  };

  const formatCount = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(num);
  };

  // ─── LIST: subscribed channels ───
  useEffect(() => {
    if (id) return;

    const fetchSubscribed = async () => {
      try {
        setListLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setSubscribedList([]);
          return;
        }

        const res = await fetch(`${API_BASE}/subscribed-channels`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const list =
          data.channels ||
          data.subscribedChannels ||
          data.data ||
          (Array.isArray(data) ? data : []);

        setSubscribedList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Subscribed list error:", err);
        setSubscribedList([]);
      } finally {
        setListLoading(false);
      }
    };

    fetchSubscribed();
  }, [id]);

  // ─── DETAIL: single channel ───
  useEffect(() => {
    if (!id) return;

    const fetchChannel = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const res = await fetch(`${API_BASE}/channel/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();

        if (data.success && data.channel) {
          setChannel(data.channel);
          setSubscribersCount(
            data.channel.subscribersCount ?? data.channel.subscribers ?? 0,
          );
          setIsSubscribed(Boolean(data.channel.isSubscribed ?? true));
          setVideos(data.videos || []);
        } else {
          setChannel(data.channel || { _id: id, name: "Channel" });
          setVideos(data.videos || []);
        }

        if ((!data.videos || data.videos.length === 0) && token) {
          try {
            const vRes = await fetch(`${API_BASE}/channel/${id}/videos`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (vRes.ok) {
              const vData = await vRes.json();
              setVideos(vData.videos || []);
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error("Fetch channel error:", err);
        setChannel(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  // ─── Subscribe toggle ───
  const handleSubscribe = async () => {
    if (!id) return;
    setSubscribeLoading(true);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Login required", "Please login to subscribe");
      setSubscribeLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/subscribe/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setIsSubscribed(data.subscribed);
        if (typeof data.subscribersCount === "number") {
          setSubscribersCount(data.subscribersCount);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSubscribeLoading(false);
    }
  };

  const openChannel = (ch) => {
    const channelId = ch._id || ch.id || ch.channelId;
    if (!channelId) return;
    navigation.push("SubscribedChannels", { id: channelId });
  };

  const openVideo = (video) => {
    navigation.navigate("VideoDetail", {
      id: video._id,
      item: {
        id: video._id,
        title: video.title || video.name,
        thumb: getMediaUrl(video.thumbnail),
        videofile: getMediaUrl(
          video.videofile || video.videoUrl || video.video,
        ),
        description: video.description || "",
        views: video.views || 0,
        likes: video.likesCount ?? video.likes ?? 0,
        dislikes: video.dislikesCount ?? video.dislikes ?? 0,
      },
    });
  };

  // ═══════════════ LIST MODE (no id) ═══════════════
  if (!id) {
    if (listLoading) {
      return (
        <View style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
          <Navbar onMenuPress={() => {}} points={0} />
          <TopicChips
            onTopicChange={(topic, categoryId) => {
              setSelectedTopic(topic);
              setSelectedCategoryId(categoryId || null);
            }}
          />
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>Loading subscriptions...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

        {/* Navbar + TopicChips */}
        <Navbar onMenuPress={() => {}} points={0} />
        <TopicChips
          onTopicChange={(topic, categoryId) => {
            setSelectedTopic(topic);
            setSelectedCategoryId(categoryId || null);
          }}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Subscriptions</Text>
          <Text style={styles.listSubtitle}>
            {subscribedList.length} channel
            {subscribedList.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {subscribedList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No subscribed channels yet</Text>
            <Text style={styles.emptyHint}>
              Subscribe to channels to see them here
            </Text>
          </View>
        ) : (
          <FlatList
            data={subscribedList}
            keyExtractor={(item) =>
              String(item._id || item.id || item.channelId)
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            renderItem={({ item: ch }) => {
              const avatar =
                getMediaUrl(ch.channelImage || ch.avatar || ch.image) ||
                "https://via.placeholder.com/80";
              const name = ch.name || ch.channelName || "Channel";
              const subs =
                ch.subscribersCount ??
                ch.subscribers ??
                ch.subscriberCount ??
                0;

              return (
                <TouchableOpacity
                  style={styles.channelRow}
                  activeOpacity={0.8}
                  onPress={() => openChannel(ch)}
                >
                  <Image source={{ uri: avatar }} style={styles.listAvatar} />
                  <View style={styles.channelRowInfo}>
                    <Text style={styles.channelRowName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.channelRowMeta}>
                      {formatCount(subs)} subscribers
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#aaaaaa" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  // ═══════════════ DETAIL MODE (with id) ═══════════════
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
        <Navbar onMenuPress={() => {}} points={0} />
        <TopicChips
          onTopicChange={(topic, categoryId) => {
            setSelectedTopic(topic);
            setSelectedCategoryId(categoryId || null);
          }}
        />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading channel...</Text>
        </View>
      </View>
    );
  }

  const avatarUrl =
    getMediaUrl(channel?.channelImage) || "https://via.placeholder.com/150";

  // Shorts-style card
  const renderShortCard = ({ item: video }) => (
    <TouchableOpacity
      style={styles.shortCard}
      activeOpacity={0.9}
      onPress={() => openVideo(video)}
    >
      <Image
        source={{
          uri:
            getMediaUrl(video.thumbnail) ||
            "https://via.placeholder.com/180x320",
        }}
        style={styles.shortThumb}
      />
      <View style={styles.shortOverlay}>
        <Text style={styles.shortTitle} numberOfLines={2}>
          {video.title || video.name}
        </Text>
        <Text style={styles.shortViews}>{formatCount(video.views)} views</Text>
      </View>
    </TouchableOpacity>
  );

  // Normal video row
  const renderVideo = ({ item: video }) => (
    <TouchableOpacity
      style={styles.videoRow}
      activeOpacity={0.8}
      onPress={() => openVideo(video)}
    >
      <View style={styles.thumbWrapper}>
        <Image
          source={{
            uri:
              getMediaUrl(video.thumbnail) ||
              "https://via.placeholder.com/246x138",
          }}
          style={styles.thumb}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration || "0:00"}</Text>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title || video.name}
        </Text>
        <Text style={styles.videoMeta} numberOfLines={1}>
          {formatCount(video.views)} views
          {video.createdAt
            ? ` • ${new Date(video.createdAt).toLocaleDateString()}`
            : ""}
        </Text>
      </View>

      <TouchableOpacity style={styles.moreBtn} hitSlop={10}>
        <MoreVertical size={18} color="#aaaaaa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* Navbar + TopicChips */}
      <Navbar onMenuPress={() => {}} points={0} />
      <TopicChips
        onTopicChange={(topic, categoryId) => {
          setSelectedTopic(topic);
          setSelectedCategoryId(categoryId || null);
        }}
      />

      {/* Top bar matching YouTube */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Channel Header */}
        <View style={styles.channelHeader}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.channelName} numberOfLines={1}>
            {channel?.name || "Channel Name"}
          </Text>
          <Text style={styles.handleText}>
            @
            {channel?.handle ||
              channel?.name?.replace(/\s+/g, "")?.toLowerCase() ||
              "channel"}
            {"  •  "}
            {formatCount(subscribersCount)} subscribers
            {"  •  "}
            {formatCount(channel?.videoCount || videos.length)} videos
          </Text>

          {/* Subscribe button */}
          <TouchableOpacity
            style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
            onPress={handleSubscribe}
            disabled={subscribeLoading}
            activeOpacity={0.85}
          >
            {subscribeLoading ? (
              <ActivityIndicator
                size="small"
                color={isSubscribed ? "#fff" : "#0f0f0f"}
              />
            ) : isSubscribed ? (
              <>
                <Bell size={16} color="#fff" />
                <Text style={styles.subscribedText}>Subscribed</Text>
                <ChevronDown size={16} color="#fff" />
              </>
            ) : (
              <Text style={styles.subscribeText}>Subscribe</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shorts Section */}
        {(activeTab === "All" || activeTab === "Shorts") &&
          videos.length > 0 && (
            <View style={styles.shortsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.shortsTitleRow}>
                  <View style={styles.shortsIcon}>
                    <Play size={14} color="#fff" fill="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>Shorts</Text>
                  <ChevronRight size={18} color="#fff" />
                </View>
              </View>

              <FlatList
                data={videos.slice(0, 8)}
                keyExtractor={(item) => item._id + "-short"}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
                renderItem={renderShortCard}
              />
            </View>
          )}

        {/* Videos list */}
        {(activeTab === "All" ||
          activeTab === "Videos" ||
          activeTab === "Today") && (
          <View style={styles.videosSection}>
            {videos.length === 0 ? (
              <Text style={styles.emptyText}>
                No videos found for this channel.
              </Text>
            ) : (
              <FlatList
                data={videos}
                keyExtractor={(item) => item._id}
                renderItem={renderVideo}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaaaaa",
    marginTop: 16,
    fontSize: 14,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0f0f0f",
  },
  backBtn: {
    padding: 4,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 8,
  },

  // List mode
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  listSubtitle: {
    color: "#aaaaaa",
    fontSize: 13,
    marginTop: 4,
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHint: {
    color: "#717171",
    fontSize: 13,
    marginTop: 6,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  listAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#272727",
  },
  channelRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  channelRowName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  channelRowMeta: {
    color: "#aaaaaa",
    fontSize: 12,
    marginTop: 2,
  },

  // Channel header
  channelHeader: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#272727",
    marginBottom: 12,
  },
  channelName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  handleText: {
    color: "#aaaaaa",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  subscribeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  subscribedBtn: {
    backgroundColor: "#272727",
  },
  subscribeText: {
    color: "#0f0f0f",
    fontWeight: "600",
    fontSize: 14,
  },
  subscribedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  tabsScroll: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 2,
  },
  tabActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#aaaaaa",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Shorts section
  shortsSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  shortsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shortsIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  shortCard: {
    width: 150,
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  shortThumb: {
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

  // Videos
  videosSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  videoRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  thumbWrapper: {
    width: SCREEN_WIDTH * 0.42,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  videoInfo: {
    flex: 1,
    paddingTop: 2,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  videoMeta: {
    color: "#aaaaaa",
    fontSize: 12,
    marginTop: 4,
  },
  moreBtn: {
    paddingTop: 5,
    paddingLeft: 4,
  },
});