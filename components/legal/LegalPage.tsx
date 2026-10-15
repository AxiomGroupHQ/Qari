// @ai-generated
import React from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme} from '@/hooks/useTheme';

interface Policy {
  title: string;
  blocks: {type: string; text: string}[];
}

export function LegalPage({policy}: {policy: Policy}) {
  const {theme} = useTheme();
  return (
    <View style={[styles.root, {backgroundColor: theme.colors.background}]}>
      <Stack.Screen
        options={{
          title: policy.title,
          headerShown: true,
          headerTintColor: theme.colors.text,
          headerStyle: {backgroundColor: theme.colors.background},
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {policy.blocks.map((block, index) => (
          <Text
            key={index}
            selectable
            accessibilityRole={block.type === 'heading' ? 'header' : undefined}
            style={[
              styles.text,
              {color: theme.colors.text},
              block.type === 'heading' && styles.heading,
              block.type === 'item' && styles.item,
            ]}>
            {block.type === 'item' ? '• ' : ''}
            {block.text}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  content: {
    padding: 24,
    paddingBottom: 80,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  text: {
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
    lineHeight: 25,
    marginBottom: 14,
  },
  heading: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 20,
    lineHeight: 30,
    marginTop: 20,
  },
  item: {paddingLeft: 12, marginBottom: 8},
});
