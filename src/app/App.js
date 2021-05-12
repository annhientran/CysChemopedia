import React, { useState } from "react";
import Header from "containers/HeaderMenu/Header";
import Footer from "containers/Footer";
import Routes from "app/Routes";
import Notifications from "react-notify-toast";
import Preloader from "components/Preloader/FullPagePreloader/index";
import "styles/App.css";

const App = () => {
  const [loading, setLoading] = useState(null);
  const blindsPreloader = !loading ? "" : loading.cssClass;

  return (
    <div className="app-body-cover">
      <Preloader content={loading} />
      <Notifications /> 
      <div className={`app-body-cover ${blindsPreloader}`}>
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
