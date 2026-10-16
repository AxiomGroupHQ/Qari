// Explicit root screen for the tab navigator. Without it, "/" on web cold
// loads (refresh, shared link) resolved through group priority to whichever
// tab group sorted last - the Adhkar stack - so the site opened on Adhkar
// instead of Home. A route outside any group takes priority over grouped
// duplicates, so this pins "/" to Home deterministically.
export {default} from './(a.home)/index';
