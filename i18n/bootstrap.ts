// Importing this module initialises i18next and registers react-i18next (see ./index).
// It exists as a separate module on purpose: app/_layout.tsx also imports named exports from
// '@/i18n', and Babel merges two imports of the same specifier, after which Metro's
// inlineRequires defers the whole thing until first use (after the first render).
import './index';
