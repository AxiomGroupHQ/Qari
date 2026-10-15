// @ai-generated
import {router} from 'expo-router';

// Deep links and reloads leave no history, so back() would do nothing.
const originalBack = router.back.bind(router);
router.back = () => {
  if (router.canGoBack()) {
    originalBack();
  } else {
    router.replace('/');
  }
};
