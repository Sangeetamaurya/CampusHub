import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { SourceSerif4_600SemiBold } from "@expo-google-fonts/source-serif-4";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  LoginScreen,
  RegisterAboutScreen,
  RegisterScreen,
  SplashScreen,
} from "./src/screens/auth";
import { CreateScreen } from "./src/screens/create";
import { ApplyScreen, EventScreen } from "./src/screens/event";
import { GuideScreen } from "./src/screens/guide";
import { MainScreen } from "./src/screens/main";
import { EditProfileScreen, ProfileScreen } from "./src/screens/people";
import { ApplicantScreen, NotificationsScreen } from "./src/screens/work";
import { AppProvider } from "./src/store";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_600SemiBold,
  });

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: "fade",
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="RegisterAbout"
              component={RegisterAboutScreen}
            />
            <Stack.Screen name="Guide" component={GuideScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Event" component={EventScreen} />
            <Stack.Screen name="Apply" component={ApplyScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Applicant" component={ApplicantScreen} />
            <Stack.Screen name="Create" component={CreateScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
