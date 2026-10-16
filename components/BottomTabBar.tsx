import React, {useCallback, useMemo} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import {useTheme} from '@/hooks/useTheme';
import {moderateScale} from 'react-native-size-matters';
import {
  HomeIcon,
  QuranIcon,
  SearchIcon,
  CollectionIcon,
  MoonIcon,
} from '@/components/Icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CommonActions} from '@react-navigation/native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Theme} from '@/utils/themeUtils';
import Color from 'color';
import {
  FLOATING_UI_HORIZONTAL_MARGIN,
  FLOATING_TAB_BAR_BOTTOM_MARGIN,
} from '@/utils/constants';
import {GlassView} from 'expo-glass-effect';
import {USE_GLASS, useGlassColorScheme} from '@/hooks/useGlassProps';
import {FrostedView} from '@/components/FrostedView';
import {useTabBarCollapseStore} from '@/store/tabBarCollapseStore';

function getIcon(
  routeName: string,
  isFocused: boolean,
  theme: Theme,
  iconSize: number,
) {
  const color = isFocused
    ? theme.colors.text
    : Color(theme.colors.text).alpha(0.5).toString();

  switch (routeName) {
    case '(a.home)':
      return <HomeIcon filled={isFocused} color={color} size={iconSize} />;
    case '(b.surahs)':
      return (
        <QuranIcon filled={isFocused} color={color} size={iconSize * 1.2} />
      );
    case '(b.search)':
      return <SearchIcon filled={isFocused} color={color} size={iconSize} />;
    case '(c.collection)':
      return (
        <CollectionIcon filled={isFocused} color={color} size={iconSize} />
      );
    case '(e.adhkar)':
      return <MoonIcon color={color} size={iconSize} />;
    default:
      return null;
  }
}

interface TabItemProps {
  routeName: string;
  routeKey: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  theme: Theme;
  iconSize: number;
  collapsed: boolean;
}

const TabItem = React.memo(function TabItem({
  routeName,
  label,
  isFocused,
  onPress,
  theme,
  iconSize,
  collapsed,
}: TabItemProps) {
  const labelColor = isFocused
    ? Color(theme.colors.text).alpha(0.85).toString()
    : Color(theme.colors.text).alpha(0.5).toString();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{selected: isFocused}}
      style={[styles.tabButton, collapsed && styles.tabButtonCollapsed]}>
      {getIcon(routeName, isFocused, theme, iconSize)}
      {!collapsed && (
        <Animated.Text
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(120)}
          style={[
            styles.tabText,
            {
              color: labelColor,
              fontFamily: isFocused ? 'Manrope-SemiBold' : 'Manrope-Medium',
            },
          ]}>
          {label}
        </Animated.Text>
      )}
    </Pressable>
  );
});

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const {theme} = useTheme();
  const glassColorScheme = useGlassColorScheme();
  const insets = useSafeAreaInsets();
  const iconSize = moderateScale(22, 0.2);
  const collapsed = useTabBarCollapseStore(state => state.collapsed);
  const setCollapsed = useTabBarCollapseStore(state => state.setCollapsed);

  // Collapsible floating pill: expanded spans the full width with labels;
  // collapsed shrinks to a centered icon-only pill (the iOS 26 "minimized"
  // look, which NativeTabs already applies on liquid-glass iPhones).
  const wrapperStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      bottom: insets.bottom + FLOATING_TAB_BAR_BOTTOM_MARGIN,
      left: FLOATING_UI_HORIZONTAL_MARGIN,
      right: FLOATING_UI_HORIZONTAL_MARGIN,
      alignItems: 'center' as const,
    }),
    [insets.bottom],
  );

  const containerStyle = useMemo(
    () => ({
      borderRadius: moderateScale(100),
      overflow: 'hidden' as const,
      borderWidth: USE_GLASS ? 0 : 1,
      borderColor: USE_GLASS
        ? undefined
        : Color(theme.colors.text).alpha(0.1).toString(),
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8,
    }),
    [theme.colors.text],
  );

  const handleTabPress = useCallback(
    (route: (typeof state.routes)[number], index: number) => {
      const isFocused = state.index === index;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        setCollapsed(false);
        navigation.dispatch(
          CommonActions.navigate({name: route.name, merge: true}),
        );
      } else if (
        isFocused &&
        !event.defaultPrevented &&
        route.name === '(e.adhkar)'
      ) {
        // Tapping the active Adhkar tab returns to the category list, even
        // when the stack was entered mid-way (reload or direct link).
        navigation.dispatch(
          CommonActions.navigate({
            name: route.name,
            params: {screen: 'adhkar/index'},
          }),
        );
      }
    },
    [state.index, navigation, setCollapsed],
  );

  const Container = USE_GLASS ? GlassView : FrostedView;

  return (
    <View pointerEvents="box-none" style={wrapperStyle}>
      <Animated.View
        layout={LinearTransition.duration(220)}
        style={{width: collapsed ? undefined : '100%'}}>
        <Container
          style={containerStyle}
          {...(USE_GLASS
            ? {
                glassEffectStyle: 'regular' as const,
                colorScheme: glassColorScheme,
              }
            : {})}>
          <View style={styles.content}>
            {state.routes.map((route, index) => {
              // Settings is opened from the header icon, not the tab bar.
              // 'index' is the explicit web root screen pinned to Home.
              if (route.name === '(d.settings)' || route.name === 'index')
                return null;
              const {options} = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              const isFocused = state.index === index;

              return (
                <TabItem
                  key={route.key}
                  routeName={route.name}
                  routeKey={route.key}
                  label={typeof label === 'string' ? label : ''}
                  isFocused={isFocused}
                  onPress={() => handleTabPress(route, index)}
                  theme={theme}
                  iconSize={iconSize}
                  collapsed={collapsed}
                />
              );
            })}
          </View>
        </Container>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(8),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(7),
  },
  tabButtonCollapsed: {
    flex: 0,
    paddingHorizontal: moderateScale(14),
  },
  tabText: {
    fontSize: moderateScale(10, 0.2),
    marginTop: moderateScale(3),
  },
});

export default BottomTabBar;
