import React from "react";
import Divider from "components/Divider/index";
import ReturnLink from "components/ReturnHome";

export default () => (
  <div className="text-center">
    <img src="/o-cat.jpg" alt="meow" />
    <h1>Sorry, page not found!</h1>
    <Divider />
    <ReturnLink />
  </div>
);
