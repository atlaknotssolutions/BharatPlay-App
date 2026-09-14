// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
//   Image,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
//   SafeAreaView,
//   KeyboardAvoidingView,
// } from "react-native";
// import {
//   Edit,
//   Video as VideoIcon,
//   Plus,
//   X,
//   ChevronDown,
// } from "lucide-react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";

// // ⚠️ Apna API base yahan daalo
// const API_BASE = "https://exp://192.168.1.14:8081/api";
// const API_CATEGORY = "https://exp://192.168.1.14:8081/api/category";
// const BACKEND_URL = "https://exp://192.168.1.14:8081";

// const STATIC_CATEGORIES = [
//   { _id: "1", name: "Gaming" },
//   { _id: "2", name: "Education" },
//   { _id: "3", name: "Entertainment" },
//   { _id: "4", name: "Music" },
//   { _id: "5", name: "Technology" },
//   { _id: "6", name: "Sports" },
//   { _id: "7", name: "Cooking" },
//   { _id: "8", name: "Travel" },
// ];

// export default function ChannelScreen({ navigation }) {
//   const [channels, setChannels] = useState([]);
//   const [selectedChannelId, setSelectedChannelId] = useState(null);
//   const [channel, setChannel] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Create Channel Modal
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newChannel, setNewChannel] = useState({
//     name: "",
//     channelDescription: "",
//     category: "",
//     channelImageUri: null,
//     channelBannerUri: null,
//     contactemail: "",
//   });
//   const [createError, setCreateError] = useState("");
//   const [creating, setCreating] = useState(false);

//   // Upload Video Modal
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedUploadChannelId, setSelectedUploadChannelId] = useState("");
//   const [videoUri, setVideoUri] = useState(null);
//   const [videoName, setVideoName] = useState("");
//   const [videoDescription, setVideoDescription] = useState("");
//   const [videoCategory, setVideoCategory] = useState("");
//   const [thumbnailUri, setThumbnailUri] = useState(null);
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // ================= HELPERS =================
//   const getToken = async () => {
//     return await AsyncStorage.getItem("token");
//   };

//   // ================= FETCH CATEGORIES =================
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch(API_CATEGORY);
//         if (!res.ok) throw new Error("Failed");
//         const data = await res.json();
//         setCategories(
//           Array.isArray(data) && data.length > 0 ? data : STATIC_CATEGORIES,
//         );
//       } catch (e) {
//         setCategories(STATIC_CATEGORIES);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // ================= FETCH USER CHANNELS =================
//   useEffect(() => {
//     const fetchChannels = async () => {
//       const token = await getToken();
//       if (!token) {
//         setLoading(false);
//         setShowCreateModal(true);
//         return;
//       }

//       try {
//         setLoading(true);
//         const res = await fetch(`${API_BASE}/uservideo/channel`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) throw new Error("Failed to fetch channels");

//         const data = await res.json();
//         const userChannels = data.channels || [];
//         setChannels(userChannels);

//         if (userChannels.length > 0) {
//           setSelectedChannelId(userChannels[0]._id);
//           setChannel(userChannels[0]);
//         } else {
//           // No channel → force create
//           setShowCreateModal(true);
//         }
//       } catch (err) {
//         console.log(err);
//         setShowCreateModal(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChannels();
//   }, []);

//   // ================= IMAGE PICKER =================
//   const pickImage = async (type) => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const uri = result.assets[0].uri;
//       if (type === "avatar") {
//         setNewChannel((prev) => ({ ...prev, channelImageUri: uri }));
//       } else if (type === "banner") {
//         setNewChannel((prev) => ({ ...prev, channelBannerUri: uri }));
//       } else if (type === "thumbnail") {
//         setThumbnailUri(uri);
//       }
//     }
//   };

//   // ================= VIDEO PICKER =================
//   const pickVideo = async () => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: "video/*",
//       copyToCacheDirectory: true,
//     });

//     if (!result.canceled && result.assets?.[0]) {
//       setVideoUri(result.assets[0].uri);
//     }
//   };

//   // ================= CREATE CHANNEL =================
//   const handleCreateChannel = async () => {
//     const token = await getToken();
//     if (!token) {
//       setCreateError("Please login first");
//       return;
//     }

//     if (!newChannel.name.trim()) {
//       setCreateError("Channel name is required");
//       return;
//     }
//     if (!newChannel.category) {
//       setCreateError("Please select a category");
//       return;
//     }

//     try {
//       setCreating(true);
//       setCreateError("");

//       const formData = new FormData();
//       formData.append("name", newChannel.name.trim());
//       formData.append(
//         "channeldescription",
//         newChannel.channelDescription || "",
//       );
//       formData.append("category", newChannel.category);
//       formData.append("contactemail", newChannel.contactemail || "");

//       if (newChannel.channelImageUri) {
//         formData.append("channelImage", {
//           uri: newChannel.channelImageUri,
//           type: "image/jpeg",
//           name: "avatar.jpg",
//         });
//       }

//       if (newChannel.channelBannerUri) {
//         formData.append("channelBanner", {
//           uri: newChannel.channelBannerUri,
//           type: "image/jpeg",
//           name: "banner.jpg",
//         });
//       }

//       const response = await fetch(`${API_BASE}/uservideo/createchannel`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//         body: formData,
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to create channel");
//       }

//       // Refresh channels
//       const channelsRes = await fetch(`${API_BASE}/uservideo/channel`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (channelsRes.ok) {
//         const data = await channelsRes.json();
//         const updated = data.channels || [];
//         setChannels(updated);
//         setSelectedChannelId(result.channel._id);
//         setChannel(result.channel);
//       }

//       // Reset create form
//       setNewChannel({
//         name: "",
//         channelDescription: "",
//         category: "",
//         channelImageUri: null,
//         channelBannerUri: null,
//         contactemail: "",
//       });
//       setShowCreateModal(false);

//       // ✅ Channel create hone ke baad Upload Video form open karo
//       setSelectedUploadChannelId(result.channel._id);
//       setShowUploadModal(true);

//       Alert.alert("Success", "Channel created! Now upload your first video.");
//     } catch (error) {
//       console.log(error);
//       setCreateError(error.message || "Failed to create channel");
//     } finally {
//       setCreating(false);
//     }
//   };

//   // ================= UPLOAD VIDEO =================
//   const handleUploadVideo = async () => {
//     const token = await getToken();
//     if (!token) {
//       setUploadError("Please login first");
//       return;
//     }

//     if (!selectedUploadChannelId) {
//       setUploadError("Please select a channel");
//       return;
//     }
//     if (!videoUri) {
//       setUploadError("Please select a video file");
//       return;
//     }
//     if (!videoName.trim()) {
//       setUploadError("Please enter a video title");
//       return;
//     }
//     if (!videoCategory) {
//       setUploadError("Please select a category");
//       return;
//     }
//     if (!agreeTerms) {
//       setUploadError("Please agree to the terms");
//       return;
//     }

//     try {
//       setUploading(true);
//       setUploadError("");

//       const formData = new FormData();
//       formData.append("name", videoName.trim());
//       formData.append("description", videoDescription || "");
//       formData.append("category", videoCategory);
//       formData.append("video", {
//         uri: videoUri,
//         type: "video/mp4",
//         name: "video.mp4",
//       });

//       if (thumbnailUri) {
//         formData.append("thumbnail", {
//           uri: thumbnailUri,
//           type: "image/jpeg",
//           name: "thumbnail.jpg",
//         });
//       }

//       const response = await fetch(
//         `${API_BASE}/uservideo/upload/${selectedUploadChannelId}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//           body: formData,
//         },
//       );

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to upload video");
//       }

//       Alert.alert("Success", "Video uploaded successfully!");

//       // Reset
//       setShowUploadModal(false);
//       setVideoUri(null);
//       setVideoName("");
//       setVideoDescription("");
//       setVideoCategory("");
//       setThumbnailUri(null);
//       setAgreeTerms(false);
//     } catch (error) {
//       console.log(error);
//       setUploadError(error.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ================= LOADING =================
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#ef4444" />
//         <Text style={styles.loadingText}>Loading channels...</Text>
//       </View>
//     );
//   }

//   // ================= UI =================
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>
//             {channel?.name || "Your Channel"}
//           </Text>
//           <Text style={styles.headerSubtitle}>
//             {channel
//               ? `@${channel.name?.replace(/\s+/g, "")}`
//               : "Create your first channel"}
//           </Text>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.btn, styles.btnBlue]}
//             onPress={() => setShowCreateModal(true)}
//           >
//             <Plus size={18} color="#fff" />
//             <Text style={styles.btnText}>Create Channel</Text>
//           </TouchableOpacity>

//           {channels.length > 0 && (
//             <TouchableOpacity
//               style={[styles.btn, styles.btnGreen]}
//               onPress={() => {
//                 setSelectedUploadChannelId(
//                   selectedChannelId || channels[0]._id,
//                 );
//                 setShowUploadModal(true);
//               }}
//             >
//               <VideoIcon size={18} color="#fff" />
//               <Text style={styles.btnText}>Upload Video</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Channel List */}
//         {channels.length > 0 && (
//           <View style={styles.channelList}>
//             <Text style={styles.sectionTitle}>Your Channels</Text>
//             {channels.map((ch) => (
//               <TouchableOpacity
//                 key={ch._id}
//                 style={[
//                   styles.channelCard,
//                   selectedChannelId === ch._id && styles.channelCardActive,
//                 ]}
//                 onPress={() => {
//                   setSelectedChannelId(ch._id);
//                   setChannel(ch);
//                 }}
//               >
//                 <Text style={styles.channelName}>{ch.name}</Text>
//                 <Text style={styles.channelHandle}>
//                   @{ch.name?.replace(/\s+/g, "")}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       {/* ================= CREATE CHANNEL MODAL ================= */}
//       <Modal visible={showCreateModal} animationType="slide" transparent>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Create a new channel</Text>
//               <TouchableOpacity onPress={() => setShowCreateModal(false)}>
//                 <X size={24} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               {createError ? (
//                 <View style={styles.errorBox}>
//                   <Text style={styles.errorText}>{createError}</Text>
//                 </View>
//               ) : null}

//               <Text style={styles.label}>Channel name *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="My Awesome Channel"
//                 placeholderTextColor="#71717a"
//                 value={newChannel.name}
//                 onChangeText={(t) => setNewChannel({ ...newChannel, name: t })}
//               />

//               <Text style={styles.label}>Category *</Text>
//               <View style={styles.selectBox}>
//                 {categories.map((cat) => (
//                   <TouchableOpacity
//                     key={cat._id}
//                     style={[
//                       styles.categoryChip,
//                       newChannel.category === cat._id &&
//                         styles.categoryChipActive,
//                     ]}
//                     onPress={() =>
//                       setNewChannel({ ...newChannel, category: cat._id })
//                     }
//                   >
//                     <Text
//                       style={[
//                         styles.categoryText,
//                         newChannel.category === cat._id &&
//                           styles.categoryTextActive,
//                       ]}
//                     >
//                       {cat.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={styles.label}>Channel Image (avatar)</Text>
//               <TouchableOpacity
//                 style={styles.pickBtn}
//                 onPress={() => pickImage("avatar")}
//               >
//                 <Text style={styles.pickBtnText}>
//                   {newChannel.channelImageUri ? "Change Avatar" : "Pick Avatar"}
//                 </Text>
//               </TouchableOpacity>
//               {newChannel.channelImageUri && (
//                 <Image
//                   source={{ uri: newChannel.channelImageUri }}
//                   style={styles.avatarPreview}
//                 />
//               )}

//               <Text style={styles.label}>Channel Banner</Text>
//               <TouchableOpacity
//                 style={styles.pickBtn}
//                 onPress={() => pickImage("banner")}
//               >
//                 <Text style={styles.pickBtnText}>
//                   {newChannel.channelBannerUri
//                     ? "Change Banner"
//                     : "Pick Banner"}
//                 </Text>
//               </TouchableOpacity>
//               {newChannel.channelBannerUri && (
//                 <Image
//                   source={{ uri: newChannel.channelBannerUri }}
//                   style={styles.bannerPreview}
//                 />
//               )}

//               <Text style={styles.label}>Description (optional)</Text>
//               <TextInput
//                 style={[styles.input, styles.textarea]}
//                 placeholder="Tell people about your channel..."
//                 placeholderTextColor="#71717a"
//                 multiline
//                 value={newChannel.channelDescription}
//                 onChangeText={(t) =>
//                   setNewChannel({ ...newChannel, channelDescription: t })
//                 }
//               />

//               <Text style={styles.label}>Contact email (optional)</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="example@email.com"
//                 placeholderTextColor="#71717a"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 value={newChannel.contactemail}
//                 onChangeText={(t) =>
//                   setNewChannel({ ...newChannel, contactemail: t })
//                 }
//               />

//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[styles.modalBtn, styles.cancelBtn]}
//                   onPress={() => setShowCreateModal(false)}
//                 >
//                   <Text style={styles.btnText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.modalBtn, styles.createBtn]}
//                   onPress={handleCreateChannel}
//                   disabled={creating}
//                 >
//                   {creating ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <Text style={styles.btnText}>Create channel</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* ================= UPLOAD VIDEO MODAL ================= */}
//       <Modal visible={showUploadModal} animationType="slide" transparent>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Upload Video</Text>
//               <TouchableOpacity onPress={() => setShowUploadModal(false)}>
//                 <X size={24} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               {uploadError ? (
//                 <View style={styles.errorBox}>
//                   <Text style={styles.errorText}>{uploadError}</Text>
//                 </View>
//               ) : null}

//               <Text style={styles.label}>Upload to channel *</Text>
//               <View style={styles.selectBox}>
//                 {channels.map((ch) => (
//                   <TouchableOpacity
//                     key={ch._id}
//                     style={[
//                       styles.categoryChip,
//                       selectedUploadChannelId === ch._id &&
//                         styles.categoryChipActive,
//                     ]}
//                     onPress={() => setSelectedUploadChannelId(ch._id)}
//                   >
//                     <Text
//                       style={[
//                         styles.categoryText,
//                         selectedUploadChannelId === ch._id &&
//                           styles.categoryTextActive,
//                       ]}
//                     >
//                       {ch.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={styles.label}>Video file *</Text>
//               <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
//                 <Text style={styles.pickBtnText}>
//                   {videoUri ? "Change Video" : "Select Video"}
//                 </Text>
//               </TouchableOpacity>
//               {videoUri && (
//                 <Text style={styles.fileName} numberOfLines={1}>
//                   Selected
//                 </Text>
//               )}

//               <Text style={styles.label}>Thumbnail (optional)</Text>
//               <TouchableOpacity
//                 style={styles.pickBtn}
//                 onPress={() => pickImage("thumbnail")}
//               >
//                 <Text style={styles.pickBtnText}>
//                   {thumbnailUri ? "Change Thumbnail" : "Pick Thumbnail"}
//                 </Text>
//               </TouchableOpacity>
//               {thumbnailUri && (
//                 <Image
//                   source={{ uri: thumbnailUri }}
//                   style={styles.bannerPreview}
//                 />
//               )}

//               <Text style={styles.label}>Video Title *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter video title"
//                 placeholderTextColor="#71717a"
//                 value={videoName}
//                 onChangeText={setVideoName}
//               />

//               <Text style={styles.label}>Video Category *</Text>
//               <View style={styles.selectBox}>
//                 {categories.map((cat) => (
//                   <TouchableOpacity
//                     key={cat._id}
//                     style={[
//                       styles.categoryChip,
//                       videoCategory === cat._id && styles.categoryChipActive,
//                     ]}
//                     onPress={() => setVideoCategory(cat._id)}
//                   >
//                     <Text
//                       style={[
//                         styles.categoryText,
//                         videoCategory === cat._id && styles.categoryTextActive,
//                       ]}
//                     >
//                       {cat.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <Text style={styles.label}>Description</Text>
//               <TextInput
//                 style={[styles.input, styles.textarea]}
//                 placeholder="Describe your video..."
//                 placeholderTextColor="#71717a"
//                 multiline
//                 value={videoDescription}
//                 onChangeText={setVideoDescription}
//               />

//               <TouchableOpacity
//                 style={styles.checkboxRow}
//                 onPress={() => setAgreeTerms(!agreeTerms)}
//               >
//                 <View
//                   style={[
//                     styles.checkbox,
//                     agreeTerms && styles.checkboxChecked,
//                   ]}
//                 >
//                   {agreeTerms && (
//                     <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
//                   )}
//                 </View>
//                 <Text style={styles.checkboxLabel}>
//                   I agree to the Terms of Service and confirm I own/have rights
//                   to this content.
//                 </Text>
//               </TouchableOpacity>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[styles.modalBtn, styles.cancelBtn]}
//                   onPress={() => setShowUploadModal(false)}
//                   disabled={uploading}
//                 >
//                   <Text style={styles.btnText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.modalBtn, styles.uploadBtn]}
//                   onPress={handleUploadVideo}
//                   disabled={uploading}
//                 >
//                   {uploading ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <Text style={styles.btnText}>Upload</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ================= STYLES =================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0f0f0f",
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#0f0f0f",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#a1a1aa",
//     marginTop: 12,
//   },
//   header: {
//     padding: 24,
//     paddingTop: 16,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   headerSubtitle: {
//     fontSize: 15,
//     color: "#a1a1aa",
//     marginTop: 4,
//   },
//   actions: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 12,
//     paddingHorizontal: 24,
//     marginBottom: 24,
//   },
//   btn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 999,
//   },
//   btnBlue: {
//     backgroundColor: "#2563eb",
//   },
//   btnGreen: {
//     backgroundColor: "#16a34a",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   channelList: {
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#a1a1aa",
//     marginBottom: 12,
//   },
//   channelCard: {
//     backgroundColor: "#1a1a1a",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#333",
//   },
//   channelCardActive: {
//     borderColor: "#ef4444",
//   },
//   channelName: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   channelHandle: {
//     color: "#a1a1aa",
//     fontSize: 13,
//     marginTop: 2,
//   },

//   // Modal
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.75)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#1a1a1a",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: "90%",
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   errorBox: {
//     backgroundColor: "#450a0a",
//     borderWidth: 1,
//     borderColor: "#991b1b",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   errorText: {
//     color: "#fca5a5",
//     fontSize: 13,
//   },
//   label: {
//     color: "#d4d4d8",
//     fontSize: 13,
//     marginBottom: 6,
//     marginTop: 12,
//   },
//   input: {
//     backgroundColor: "#0f0f0f",
//     borderWidth: 1,
//     borderColor: "#374151",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     color: "#fff",
//     fontSize: 15,
//   },
//   textarea: {
//     height: 80,
//     textAlignVertical: "top",
//   },
//   selectBox: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   categoryChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: "#272727",
//     borderWidth: 1,
//     borderColor: "#333",
//   },
//   categoryChipActive: {
//     backgroundColor: "#ef4444",
//     borderColor: "#ef4444",
//   },
//   categoryText: {
//     color: "#a1a1aa",
//     fontSize: 13,
//   },
//   categoryTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   pickBtn: {
//     backgroundColor: "#272727",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#374151",
//   },
//   pickBtnText: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   avatarPreview: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginTop: 10,
//   },
//   bannerPreview: {
//     width: "100%",
//     height: 100,
//     borderRadius: 12,
//     marginTop: 10,
//   },
//   fileName: {
//     color: "#a1a1aa",
//     fontSize: 12,
//     marginTop: 6,
//   },
//   checkboxRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 10,
//     marginTop: 16,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1.5,
//     borderColor: "#52525b",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 2,
//   },
//   checkboxChecked: {
//     backgroundColor: "#ef4444",
//     borderColor: "#ef4444",
//   },
//   checkboxLabel: {
//     flex: 1,
//     color: "#a1a1aa",
//     fontSize: 12,
//     lineHeight: 18,
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//     marginTop: 24,
//     marginBottom: 10,
//   },
//   modalBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 999,
//   },
//   cancelBtn: {
//     backgroundColor: "#3f3f46",
//   },
//   createBtn: {
//     backgroundColor: "#2563eb",
//   },
//   uploadBtn: {
//     backgroundColor: "#16a34a",
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Dimensions,
  FlatList,
} from "react-native";
import {
  Edit,
  Video as VideoIcon,
  Plus,
  X,
  Play,
  Users,
  Search,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_ORIGIN } from "../../config/api";

const { width } = Dimensions.get("window");

const API_BASE = `${API_ORIGIN}/api`;
const API_CATEGORY = `${API_ORIGIN}/api/category`;
const BACKEND_URL = API_ORIGIN;

const STATIC_CATEGORIES = [
  { _id: "1", name: "Gaming" },
  { _id: "2", name: "Education" },
  { _id: "3", name: "Entertainment" },
  { _id: "4", name: "Music" },
  { _id: "5", name: "Technology" },
  { _id: "6", name: "Sports" },
  { _id: "7", name: "Cooking" },
  { _id: "8", name: "Travel" },
];

export default function ChannelScreen({ navigation }) {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Videos");

  // Create Channel Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    channelDescription: "",
    category: "",
    channelImageUri: null,
    channelBannerUri: null,
    contactemail: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Upload Video Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadChannelId, setSelectedUploadChannelId] = useState("");
  const [videoUri, setVideoUri] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const getToken = async () => await AsyncStorage.getItem("token");

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path.replace(/\\/g, "/")}`;
  };

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_CATEGORY);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCategories(
          Array.isArray(data) && data.length > 0 ? data : STATIC_CATEGORIES,
        );
      } catch (e) {
        setCategories(STATIC_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // ================= FETCH USER CHANNELS =================
  useEffect(() => {
    const fetchChannels = async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        setShowCreateModal(true);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/uservideo/channel`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch channels");

        const data = await res.json();
        const userChannels = data.channels || [];
        setChannels(userChannels);

        if (userChannels.length > 0) {
          setSelectedChannelId(userChannels[0]._id);
          setChannel(userChannels[0]);
        } else {
          setShowCreateModal(true);
        }
      } catch (err) {
        console.log(err);
        setShowCreateModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // ================= FETCH VIDEOS =================
  useEffect(() => {
    if (!selectedChannelId) return;

    const fetchVideos = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${API_BASE}/uservideo/channel/${selectedChannelId}/videos`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (res.ok) {
          const result = await res.json();
          setVideos(result.videos || []);
        }
      } catch (err) {
        console.log("Videos fetch error", err);
      }
    };

    fetchVideos();
  }, [selectedChannelId]);

  // ================= IMAGE / VIDEO PICKER =================
  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "avatar") {
        setNewChannel((prev) => ({ ...prev, channelImageUri: uri }));
      } else if (type === "banner") {
        setNewChannel((prev) => ({ ...prev, channelBannerUri: uri }));
      } else if (type === "thumbnail") {
        setThumbnailUri(uri);
      }
    }
  };

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  // ================= CREATE CHANNEL =================
  const handleCreateChannel = async () => {
    const token = await getToken();
    if (!token) {
      setCreateError("Please login first");
      return;
    }
    if (!newChannel.name.trim()) {
      setCreateError("Channel name is required");
      return;
    }
    if (!newChannel.category) {
      setCreateError("Please select a category");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      const formData = new FormData();
      formData.append("name", newChannel.name.trim());
      formData.append(
        "channeldescription",
        newChannel.channelDescription || "",
      );
      formData.append("category", newChannel.category);
      formData.append("contactemail", newChannel.contactemail || "");

      if (newChannel.channelImageUri) {
        formData.append("channelImage", {
          uri: newChannel.channelImageUri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });
      }
      if (newChannel.channelBannerUri) {
        formData.append("channelBanner", {
          uri: newChannel.channelBannerUri,
          type: "image/jpeg",
          name: "banner.jpg",
        });
      }

      const response = await fetch(`${API_BASE}/uservideo/createchannel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to create channel");

      const channelsRes = await fetch(`${API_BASE}/uservideo/channel`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (channelsRes.ok) {
        const data = await channelsRes.json();
        const updated = data.channels || [];
        setChannels(updated);
        setSelectedChannelId(result.channel._id);
        setChannel(result.channel);
      }

      setNewChannel({
        name: "",
        channelDescription: "",
        category: "",
        channelImageUri: null,
        channelBannerUri: null,
        contactemail: "",
      });
      setShowCreateModal(false);

      // Channel create hone ke baad Upload form open
      setSelectedUploadChannelId(result.channel._id);
      setShowUploadModal(true);

      Alert.alert("Success", "Channel created! Now upload your first video.");
    } catch (error) {
      setCreateError(error.message || "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  // ================= UPLOAD VIDEO =================
  const handleUploadVideo = async () => {
    const token = await getToken();
    if (!token) {
      setUploadError("Please login first");
      return;
    }
    if (!selectedUploadChannelId) {
      setUploadError("Please select a channel");
      return;
    }
    if (!videoUri) {
      setUploadError("Please select a video file");
      return;
    }
    if (!videoName.trim()) {
      setUploadError("Please enter a video title");
      return;
    }
    if (!videoCategory) {
      setUploadError("Please select a category");
      return;
    }
    if (!agreeTerms) {
      setUploadError("Please agree to the terms");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("name", videoName.trim());
      formData.append("description", videoDescription || "");
      formData.append("category", videoCategory);
      formData.append("video", {
        uri: videoUri,
        type: "video/mp4",
        name: "video.mp4",
      });

      if (thumbnailUri) {
        formData.append("thumbnail", {
          uri: thumbnailUri,
          type: "image/jpeg",
          name: "thumbnail.jpg",
        });
      }

      const response = await fetch(
        `${API_BASE}/uservideo/upload/${selectedUploadChannelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to upload video");

      Alert.alert("Success", "Video uploaded successfully!");

      // Refresh videos
      const videosRes = await fetch(
        `${API_BASE}/uservideo/channel/${selectedChannelId}/videos`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (videosRes.ok) {
        const data = await videosRes.json();
        setVideos(data.videos || []);
      }

      setShowUploadModal(false);
      setVideoUri(null);
      setVideoName("");
      setVideoDescription("");
      setVideoCategory("");
      setThumbnailUri(null);
      setAgreeTerms(false);
    } catch (error) {
      setUploadError(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading channel...</Text>
      </View>
    );
  }

  const currentChannel = channel || {
    name: "Your Channel",
    channelImage: null,
    channelBanner: null,
    channeldescription: "Create your channel to get started.",
    subscribers: 0,
  };

  const bannerUrl =
    getImageUrl(currentChannel.channelBanner) ||
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200";
  const avatarUrl =
    getImageUrl(currentChannel.channelImage) ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";

  const tabs = ["Videos", "Shorts", "Playlists", "Posts"];

  // ================= RENDER VIDEO ITEM =================
  const renderVideo = ({ item }) => {
    const thumb =
      getImageUrl(item.thumbnail) ||
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800";

    return (
      <TouchableOpacity style={styles.videoCard} activeOpacity={0.85}>
        <View style={styles.thumbnailWrapper}>
          <Image source={{ uri: thumb }} style={styles.thumbnail} />
          <View style={styles.playOverlay}>
            <View style={styles.playBtn}>
              <Play size={22} color="#fff" fill="#fff" />
            </View>
          </View>
        </View>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <Text style={styles.videoMeta}>
          {item.views?.toLocaleString() || 0} views
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ========== BANNER ========== */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: bannerUrl }} style={styles.banner} />
        </View>

        {/* ========== AVATAR + INFO ========== */}
        <View style={styles.profileSection}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />

          <Text style={styles.channelName}>{currentChannel.name}</Text>
          <Text style={styles.channelHandle}>
            @{currentChannel.name?.replace(/\s+/g, "") || "yourchannel"}
          </Text>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {(currentChannel.subscribers || 0).toLocaleString()} subscribers
            </Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{videos.length} videos</Text>
          </View>

          {currentChannel.channeldescription ? (
            <Text style={styles.description} numberOfLines={3}>
              {currentChannel.channeldescription}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Create</Text>
            </TouchableOpacity>

            {channels.length > 0 && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.uploadActionBtn]}
                onPress={() => {
                  setSelectedUploadChannelId(
                    selectedChannelId || channels[0]._id,
                  );
                  setShowUploadModal(true);
                }}
              >
                <VideoIcon size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ========== CHANNEL SWITCHER ========== */}
        {channels.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.switcher}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {channels.map((ch) => (
              <TouchableOpacity
                key={ch._id}
                style={[
                  styles.switcherChip,
                  selectedChannelId === ch._id && styles.switcherChipActive,
                ]}
                onPress={() => {
                  setSelectedChannelId(ch._id);
                  setChannel(ch);
                }}
              >
                <Text
                  style={[
                    styles.switcherText,
                    selectedChannelId === ch._id && styles.switcherTextActive,
                  ]}
                >
                  {ch.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ========== TABS ========== */}
        <View style={styles.tabsContainer}>
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
        </View>

        {/* ========== TAB CONTENT ========== */}
        <View style={styles.tabContent}>
          {activeTab === "Videos" && (
            <>
              {videos.length > 0 ? (
                <FlatList
                  data={videos}
                  keyExtractor={(item) => item._id}
                  renderItem={renderVideo}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={{ gap: 10 }}
                  contentContainerStyle={{ gap: 14 }}
                />
              ) : (
                <View style={styles.emptyState}>
                  <VideoIcon size={48} color="#52525b" />
                  <Text style={styles.emptyTitle}>No videos yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Upload your first video to get started
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => {
                      if (channels.length > 0) {
                        setSelectedUploadChannelId(
                          selectedChannelId || channels[0]._id,
                        );
                        setShowUploadModal(true);
                      } else {
                        setShowCreateModal(true);
                      }
                    }}
                  >
                    <Text style={styles.emptyBtnText}>
                      {channels.length > 0 ? "Upload Video" : "Create Channel"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {activeTab === "Shorts" && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Shorts yet</Text>
            </View>
          )}

          {activeTab === "Playlists" && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No playlists yet</Text>
            </View>
          )}

          {activeTab === "Posts" && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No community posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= CREATE CHANNEL MODAL ================= */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a new channel</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {createError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{createError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Channel name *</Text>
              <TextInput
                style={styles.input}
                placeholder="My Awesome Channel"
                placeholderTextColor="#71717a"
                value={newChannel.name}
                onChangeText={(t) => setNewChannel({ ...newChannel, name: t })}
              />

              <Text style={styles.label}>Category *</Text>
              <View style={styles.selectBox}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      newChannel.category === cat._id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setNewChannel({ ...newChannel, category: cat._id })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        newChannel.category === cat._id &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Channel Image (avatar)</Text>
              <TouchableOpacity
                style={styles.pickBtn}
                onPress={() => pickImage("avatar")}
              >
                <Text style={styles.pickBtnText}>
                  {newChannel.channelImageUri ? "Change Avatar" : "Pick Avatar"}
                </Text>
              </TouchableOpacity>
              {newChannel.channelImageUri && (
                <Image
                  source={{ uri: newChannel.channelImageUri }}
                  style={styles.avatarPreview}
                />
              )}

              <Text style={styles.label}>Channel Banner</Text>
              <TouchableOpacity
                style={styles.pickBtn}
                onPress={() => pickImage("banner")}
              >
                <Text style={styles.pickBtnText}>
                  {newChannel.channelBannerUri
                    ? "Change Banner"
                    : "Pick Banner"}
                </Text>
              </TouchableOpacity>
              {newChannel.channelBannerUri && (
                <Image
                  source={{ uri: newChannel.channelBannerUri }}
                  style={styles.bannerPreview}
                />
              )}

              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Tell people about your channel..."
                placeholderTextColor="#71717a"
                multiline
                value={newChannel.channelDescription}
                onChangeText={(t) =>
                  setNewChannel({ ...newChannel, channelDescription: t })
                }
              />

              <Text style={styles.label}>Contact email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#71717a"
                keyboardType="email-address"
                autoCapitalize="none"
                value={newChannel.contactemail}
                onChangeText={(t) =>
                  setNewChannel({ ...newChannel, contactemail: t })
                }
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.createBtn]}
                  onPress={handleCreateChannel}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Create channel</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= UPLOAD VIDEO MODAL ================= */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Video</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {uploadError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{uploadError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Upload to channel *</Text>
              <View style={styles.selectBox}>
                {channels.map((ch) => (
                  <TouchableOpacity
                    key={ch._id}
                    style={[
                      styles.categoryChip,
                      selectedUploadChannelId === ch._id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedUploadChannelId(ch._id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedUploadChannelId === ch._id &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {ch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Video file *</Text>
              <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
                <Text style={styles.pickBtnText}>
                  {videoUri ? "Change Video" : "Select Video"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Thumbnail (optional)</Text>
              <TouchableOpacity
                style={styles.pickBtn}
                onPress={() => pickImage("thumbnail")}
              >
                <Text style={styles.pickBtnText}>
                  {thumbnailUri ? "Change Thumbnail" : "Pick Thumbnail"}
                </Text>
              </TouchableOpacity>
              {thumbnailUri && (
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.bannerPreview}
                />
              )}

              <Text style={styles.label}>Video Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter video title"
                placeholderTextColor="#71717a"
                value={videoName}
                onChangeText={setVideoName}
              />

              <Text style={styles.label}>Video Category *</Text>
              <View style={styles.selectBox}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      videoCategory === cat._id && styles.categoryChipActive,
                    ]}
                    onPress={() => setVideoCategory(cat._id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        videoCategory === cat._id && styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe your video..."
                placeholderTextColor="#71717a"
                multiline
                value={videoDescription}
                onChangeText={setVideoDescription}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeTerms && (
                    <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the Terms of Service and confirm I own/have rights
                  to this content.
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.uploadBtn]}
                  onPress={handleUploadVideo}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Upload</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ================= STYLES (YouTube Mobile Style) =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#a1a1aa",
    marginTop: 12,
  },

  // Banner
  bannerContainer: {
    height: 140,
    backgroundColor: "#1a1a1a",
  },
  banner: {
    width: "100%",
    height: "100%",
  },

  // Profile
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -42,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "#0f0f0f",
    backgroundColor: "#272727",
  },
  channelName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
  channelHandle: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  statDot: {
    color: "#71717a",
  },
  description: {
    fontSize: 13,
    color: "#d4d4d8",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#272727",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  uploadActionBtn: {
    backgroundColor: "#ef4444",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  // Channel switcher
  switcher: {
    marginTop: 12,
    marginBottom: 4,
  },
  switcherChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  switcherChipActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  switcherText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  switcherTextActive: {
    color: "#000",
    fontWeight: "600",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },

  // Tab content
  tabContent: {
    padding: 12,
    minHeight: 300,
  },

  // Video grid
  videoCard: {
    flex: 1,
    maxWidth: (width - 34) / 2,
  },
  thumbnailWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 17,
  },
  videoMeta: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 2,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Modal (same as before)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  errorBox: {
    backgroundColor: "#450a0a",
    borderWidth: 1,
    borderColor: "#991b1b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
  },
  label: {
    color: "#d4d4d8",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  textarea: {
    height: 80,
    textAlignVertical: "top",
  },
  selectBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#272727",
    borderWidth: 1,
    borderColor: "#333",
  },
  categoryChipActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  categoryText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  pickBtn: {
    backgroundColor: "#272727",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  pickBtnText: {
    color: "#fff",
    fontSize: 14,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 10,
  },
  bannerPreview: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#52525b",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  checkboxLabel: {
    flex: 1,
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  cancelBtn: {
    backgroundColor: "#3f3f46",
  },
  createBtn: {
    backgroundColor: "#2563eb",
  },
  uploadBtn: {
    backgroundColor: "#16a34a",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
