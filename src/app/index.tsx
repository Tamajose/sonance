import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

const index = () => {
  return (
    <ScreenWrapper>
      <View>
        <Text>index</Text>
        <Button title="welcome" onPress={() => router.push("welcome")} />
      </View>
    </ScreenWrapper>
  );
};

export default index;

const styles = StyleSheet.create({});
