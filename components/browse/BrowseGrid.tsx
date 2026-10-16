import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {moderateScale as moderateScaleCapped} from '@/utils/scale';
import {LegendList} from '@legendapp/list';
import {Reciter} from '@/data/reciterData';
import {Theme} from '@/utils/themeUtils';
import {BrowseReciterCard} from './BrowseReciterCard';
import {CircularBrowseCard} from './CircularBrowseCard';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

interface BrowseGridProps {
  reciters: Reciter[];
  onReciterPress: (reciter: Reciter) => void;
  theme: Theme;
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
  onScrollBeginDrag?: () => void;
  getRewayatIdForReciter?: (reciter: Reciter) => string | undefined;
  // Optional bottom inset to clear the floating mini-player + tab bar.
  // Callers compute via `useBottomInset` so the last grid row stays
  // tappable when the mini-player is visible. Defaults to 0 for callers
  // that don't need it; the original `moderateScale(80)` floor still
  // applies when the inset is small or unset.
  bottomInset?: number;
  // Circular photo + name cells (browse-all redesign). Default false keeps
  // the detailed rectangle cards used by rewayat/picker flows.
  circular?: boolean;
  // Scroll reporter for the collapsible tab bar.
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

function createStyles(_theme: Theme, bottomInset = 0) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    gridContainer: {
      paddingHorizontal: moderateScale(10),
      paddingBottom: Math.max(moderateScaleCapped(80), bottomInset),
      paddingTop: moderateScale(8),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    rowCircular: {
      justifyContent: 'space-evenly',
    },
    loadingContainer: {
      padding: moderateScale(20),
      alignItems: 'center',
    },
  });
}

// Create rows of items for grid layout
const createItemRows = (
  reciters: Reciter[],
  numColumns: number,
): Array<Reciter[]> => {
  const rows: Array<Reciter[]> = [];
  for (let i = 0; i < reciters.length; i += numColumns) {
    rows.push(reciters.slice(i, i + numColumns));
  }
  return rows;
};

const BrowseGrid = React.memo(
  ({
    reciters,
    onReciterPress,
    theme,
    onScrollBeginDrag,
    getRewayatIdForReciter,
    bottomInset = 0,
    circular = false,
    onScroll,
  }: BrowseGridProps) => {
    const {width: windowWidth} = useWindowDimensions();
    const [isLoading] = useState(false);

    // Calculate number of columns based on screen width
    const numColumns = useMemo(() => {
      // Circular reciter cells sit 3-up on a phone again, near the
      // pre-trim size; the circle itself is capped slightly below the
      // cell width so it reads a touch smaller than the old design.
      const minCardWidth = moderateScale(120);
      return Math.max(3, Math.floor(windowWidth / minCardWidth));
    }, [windowWidth]);

    // Convert flat list to rows for grid layout
    const itemRows = useMemo(() => {
      return createItemRows(reciters, numColumns);
    }, [reciters, numColumns]);

    const styles = useMemo(
      () => createStyles(theme, bottomInset),
      [theme, bottomInset],
    );

    // Calculate item dimensions
    const itemDimensions = useMemo(() => {
      const totalHorizontalPadding = moderateScale(16);
      const gapSpace = moderateScale(10) * (numColumns - 1);
      const availableWidth = windowWidth - totalHorizontalPadding - gapSpace;
      const itemWidth = availableWidth / numColumns;
      const circleWidth = circular
        ? Math.min(itemWidth, moderateScale(104))
        : itemWidth;
      const itemHeight = circular
        ? circleWidth + moderateScale(48)
        : itemWidth * 1.2;

      return {
        width: itemWidth,
        circleWidth,
        height: itemHeight,
      };
    }, [windowWidth, numColumns, circular]);

    // Render a row of items
    const renderRow = useCallback(
      ({item}: {item: Reciter[]}) => (
        <View style={[styles.row, circular && styles.rowCircular]}>
          {item.map(reciter =>
            circular ? (
              <CircularBrowseCard
                key={reciter.id}
                reciter={reciter}
                onPress={() => onReciterPress(reciter)}
                width={itemDimensions.circleWidth}
                theme={theme}
              />
            ) : (
              <BrowseReciterCard
                key={reciter.id}
                reciter={reciter}
                onPress={() => onReciterPress(reciter)}
                width={itemDimensions.width}
                height={itemDimensions.height}
                theme={theme}
                rewayatId={getRewayatIdForReciter?.(reciter)}
              />
            ),
          )}
          {/* Add empty placeholders for the last row if needed */}
          {item.length < numColumns &&
            Array(numColumns - item.length)
              .fill(null)
              .map((_, index) => (
                <View
                  key={`placeholder-${index}`}
                  style={{
                    width: circular
                      ? itemDimensions.circleWidth
                      : itemDimensions.width,
                  }}
                />
              ))}
        </View>
      ),
      [
        itemDimensions,
        onReciterPress,
        theme,
        numColumns,
        styles.row,
        styles.rowCircular,
        getRewayatIdForReciter,
        circular,
      ],
    );

    const keyExtractor = useCallback(
      (item: Reciter[], index: number) => `row-${index}`,
      [],
    );

    const renderFooter = useCallback(() => {
      if (!isLoading) return null;

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
        </View>
      );
    }, [isLoading, styles.loadingContainer, theme.colors.text]);

    return (
      <View style={styles.container}>
        <LegendList
          data={itemRows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.gridContainer}
          scrollIndicatorInsets={{bottom: bottomInset}}
          estimatedItemSize={itemDimensions.height}
          recycleItems
          drawDistance={2000}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps="handled"
          waitForInitialLayout
          onEndReachedThreshold={0.5}
          maintainVisibleContentPosition
          onScrollBeginDrag={onScrollBeginDrag}
          onScroll={onScroll}
        />
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.theme === nextProps.theme &&
    prevProps.onReciterPress === nextProps.onReciterPress &&
    prevProps.reciters.length === nextProps.reciters.length &&
    prevProps.getRewayatIdForReciter === nextProps.getRewayatIdForReciter &&
    prevProps.bottomInset === nextProps.bottomInset &&
    prevProps.circular === nextProps.circular,
);

BrowseGrid.displayName = 'BrowseGrid';

export default BrowseGrid;
