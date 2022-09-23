// =========================================================
// * Volt React Dashboard
// =========================================================

// * Product Page: https://themesberg.com/product/dashboard/volt-react
// * Copyright 2021 Themesberg (https://www.themesberg.com)
// * Official Repository: https://github.com/themesberg/volt-react-dashboard
// * License: MIT License (https://themesberg.com/licensing)

// * Designed and coded by https://themesberg.com

// =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. Please contact us to request a removal.

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";

// core styles
import "./scss/volt.scss";
import reducer from "./reducer/store";
// vendor styles
import "react-datetime/css/react-datetime.css";
import App from "./App";

const store = createStore(reducer);

// ReactDOM.render(
//   <React.StrictMode>
//     <HashRouter>
//       <App />
//     </HashRouter>
//   </React.StrictMode>,
//   document.getElementById("root")
// );

const rootElement = document.getElementById("root");
ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <Router>
      <Switch>
        <Route>
          <App />
        </Route>
      </Switch>
    </Router>
  </Provider>,
  // </React.StrictMode>,
  rootElement
);
