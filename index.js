/**
 * Host half of the Azure Planet theme bundle.
 *
 * The whole theme lives in the Client half (`./client`): it overrides the
 * `--dsw-alias-*` design tokens and paints the starfield / planet backdrop
 * inside the page. The Host half exists because a Loader row needs a package
 * entry point; it registers nothing and never touches a service, so the theme
 * cannot break the Host.
 */
export function apply() {}
