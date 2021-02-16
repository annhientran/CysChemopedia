import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "containers/Home";
import Sites from "containers/Sites";
import Upload from "containers/Upload";
import Help from "containers/Help";
import ExternalRef from "containers/Help";
import NotFound from "containers/NotFound";

const Routes = () => (
  <Switch>
    {/* nav bar routes */}
    <Route exact path="/">
      <Home />
    </Route>
    <Route path="/sites">
      <Sites />
    </Route>
    <Route path="/upload">
      <Upload />
    </Route>
    <Route path="/help">
      <Help />
    </Route>
    <Route path="/external">
      <ExternalRef />
    </Route>

    {/* 404 page */}
    <Route>
      <NotFound />
    </Route>
  </Switch>
);

export default Routes;
