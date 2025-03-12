import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import CustomIcon from "@/components/ui/CustomIcon";
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
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          marginTop: 5, // Adjust this value to reduce the space
        },

        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "rgb(2, 86, 86)",
            borderRadius: 10,
          },
          default: {
            backgroundColor: "rgb(2, 86, 86)",
            borderRadius: 10,
            height: 60,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "캠핑장 검색",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="tent" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="local"
        options={{
          title: "지역날씨",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="location" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notice"
        options={{
          title: "공지",
          tabBarIcon: ({ color, focused }) => (
            <CustomIcon name="info" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
