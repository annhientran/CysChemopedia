import React, { useState } from "react";
import Header from "containers/HeaderMenu/Header";
import Footer from "containers/Footer";
import Routes from "app/Routes";
import Preloader from "components/Preloader/index";
import "styles/App.css";

const App = () => {
  const [loading, setLoading] = useState(null);

  return (
    <div className="app-body-cover">
      <Preloader content={loading} />
      <div className={loading ? "app-body-cover blinder" : "app-body-cover"}>
      <Header />
      <div
        style={{
          margin: `0 6rem`
          // maxWidth: 960,
          // padding: `0 1.0875rem 1.45rem`
        }}
        // className="d-flex justify-content-center align-items-center"
      >
        <Routes preloader={loading} setPreloader={setLoading} />
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default App;
