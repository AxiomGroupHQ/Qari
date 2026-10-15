import React, {useCallback, useLayoutEffect} from 'react';
import {useRouter, useNavigation, useFocusEffect} from 'expo-router';
import RecitersView from '@/components/RecitersView';
import {Reciter} from '@/data/reciterData';
import {useSiteHeaderStore} from '@/store/siteHeaderStore';

function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const setIsHome = useSiteHeaderStore(state => state.setIsHome);

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setIsHome(true);
      return () => setIsHome(false);
    }, [setIsHome]),
  );

  const handleReciterPress = useCallback(
    (reciter: Reciter) => {
      router.push({
        pathname: '/(tabs)/(a.home)/reciter/[id]',
        params: {id: reciter.id},
      });
    },
    [router],
  );

  return <RecitersView onReciterPress={handleReciterPress} />;
}

export default React.memo(HomeScreen);
