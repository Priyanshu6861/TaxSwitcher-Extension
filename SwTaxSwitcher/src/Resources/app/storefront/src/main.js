// Import all necessary Storefront plugins
import TaxSwitcherPlugin from './tax-switcher/tax-switcher';

// Register your plugin via the existing PluginManager
const PluginManager = window.PluginManager;

PluginManager.register('TaxSwitcherPlugin', TaxSwitcherPlugin, '[data-tax-switcher]');
