const app = require("./app.json");

const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID || "";
const googleAndroidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID || "";
const googleIosClientId = process.env.GOOGLE_IOS_CLIENT_ID || "";

module.exports = {
  ...app,
  expo: {
    ...app.expo,
    plugins: [
      ...(app.expo.plugins || []),
      [
        "@react-native-google-signin/google-signin",
        {
          webClientId: googleWebClientId,
          androidClientId: googleAndroidClientId,
          iosClientId: googleIosClientId,
          iosUrlScheme: googleIosClientId
            ? `com.googleusercontent.apps.${googleIosClientId.split("-")[0]}`
            : "",
        },
      ],
    ],
    extra: {
      ...(app.expo.extra || {}),
      google: {
        webClientId: googleWebClientId,
        androidClientId: googleAndroidClientId,
        iosClientId: googleIosClientId,
      },
    },
  },
};
