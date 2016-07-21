import React from "react";
import { render } from "react-dom";
import { renderToString } from "react-dom/server";
import { Router, RouterContext, match, applyRouterMiddleware, useRouterHistory } from "react-router";
import { createMemoryHistory, createHistory } from "history";
import useScroll from "react-router-scroll";
import { renderAsHTML } from "./title-meta";

const routing = {
  base: process.env.NODE_ENV === "production" ? "/open-source/victory" : ""
};

import Index from "../../templates/index.hbs";
import routes from "../routes";

// ----------------------------------------------------------------------------
// With `static-site-generator-webpack-plugin`, the same bundle is responsible for
// both 1.) telling the plugin what to render to HTML and
// 2.) running the app on the client side. In other words, this entry point
// the roles of `server/index` and `client/app`.
// ----------------------------------------------------------------------------

// Client render (optional):
// `static-site-generator-webpack-plugin` supports shimming browser globals
// so instead of checking whether the document is undefined (always false),
// Check whether it’s being shimmed
if (typeof window !== "undefined" && window.__STATIC_GENERATOR !== true) { //eslint-disable-line no-undef
  const history = useRouterHistory(createHistory)({ basename: routing.base });
  render(
    <Router
      history={history}
      routes={routes}
      render={applyRouterMiddleware(useScroll())}
    />,
    document.getElementById("content")
  );
}

// Exported static site renderer:
export default (locals, callback) => {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    const content = renderToString(<RouterContext {...renderProps} />);
    callback(null, Index({
      titleMeta: renderAsHTML(),
      content,
      bundleJs: locals.assets.main,
      baseHref: `${routing.base}/`
    }));
  });
};