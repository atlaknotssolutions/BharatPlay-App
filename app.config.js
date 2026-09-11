const fs = require("fs");
const path = require("path");
const app = require("./app.json");

const loadLocalEnv = () => {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {};

  return fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (match) {
        values[match[1]] = match[2]
          .replace(/;\s*$/, "")
          .replace(/^(["'])(.*)\1$/, "$2")
          .trim();
      }
      return values;
    }, {});
};

const localEnv = loadLocalEnv();
const getEnv = (name) => process.env[name] || localEnv[name] || "";

const googleWebClientId = getEnv("GOOGLE_WEB_CLIENT_ID");
const googleAndroidClientId = getEnv("GOOGLE_ANDROID_CLIENT_ID");
const googleIosClientId = getEnv("GOOGLE_IOS_CLIENT_ID");
const isGoogleClientId = (value) =>
  value.endsWith(".apps.googleusercontent.com") && !value.startsWith("GOCSPX-");

const googlePlugin =
  isGoogleClientId(googleWebClientId) &&
  isGoogleClientId(googleAndroidClientId) &&
  isGoogleClientId(googleIosClientId)
    ? [
        "@react-native-google-signin/google-signin",
        {
          webClientId: googleWebClientId,
          androidClientId: googleAndroidClientId,
          iosClientId: googleIosClientId,
          iosUrlScheme: `com.googleusercontent.apps.${googleIosClientId.split("-")[0]}`,
        },
      ]
    : null;

module.exports = {
  ...app,
  expo: {
    ...app.expo,
    plugins: [
      ...(app.expo.plugins || []),
      ...(googlePlugin ? [googlePlugin] : []),
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
