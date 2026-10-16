import {useCallback, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {useTabBarCollapseStore} from '@/store/tabBarCollapseStore';

// Minimum scroll delta before the bar flips state, so tiny jitter and
// momentum noise do not thrash the animation.
const COLLAPSE_DELTA = 10;
// Near the top of a list the bar always returns to its expanded form.
const TOP_RESET_OFFSET = 40;

/**
 * Scroll-direction reporter for the collapsible floating tab bar
 * (web/Android). Spread the returned `onScroll` onto a screen's primary
 * ScrollView/FlatList/FlashList/LegendList and set
 * `scrollEventThrottle={16}`. Scrolling down collapses the bar to a
 * compact icon-only pill; scrolling up (or reaching the top) restores it.
 * iOS liquid-glass devices use the native minimized tab bar instead, so
 * this is a no-op there by virtue of BottomTabBar not being rendered.
 */
export function useCollapsibleTabBar() {
  const lastOffsetY = useRef(0);
  const setCollapsed = useTabBarCollapseStore(state => state.setCollapsed);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const dy = y - lastOffsetY.current;
      lastOffsetY.current = y;

      if (y <= TOP_RESET_OFFSET) {
        setCollapsed(false);
        return;
      }
      if (dy > COLLAPSE_DELTA) {
        setCollapsed(true);
      } else if (dy < -COLLAPSE_DELTA) {
        setCollapsed(false);
      }
    },
    [setCollapsed],
  );

  return {onScroll};
}
