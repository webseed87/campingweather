import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CustomIcon from "@/components/ui/CustomIcon";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF8C00", // 오렌지색 (선택된 탭)
        tabBarInactiveTintColor: "#FFFFFF", // 흰색 (선택되지 않은 탭)
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            backgroundColor: "rgba(2, 86, 86, 0.8)",
            borderRadius: 10,
            marginHorizontal: 20,
            marginBottom: 20,
            paddingVertical: 10,
          },
          default: {
            backgroundColor: "rgba(2, 86, 86, 0.8)",
            borderRadius: 10,
            marginHorizontal: 20,
            marginBottom: 20,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "캠핑장 검색",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="tent" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="local"
        options={{
          title: "지역날씨",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="location" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notice"
        options={{
          title: "공지",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="info" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
