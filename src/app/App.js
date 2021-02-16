import Header from "containers/HeaderMenu/Header";
import Footer from "containers/Footer";
import Routes from "app/Routes";
import "styles/App.css";

function App() {
  return (
    <>
      <Header />
      <div
        style={{
          margin: `0 6rem`
          // maxWidth: 960,
          // padding: `0 1.0875rem 1.45rem`
        }}
        // className="d-flex justify-content-center align-items-center"
      >
        <Routes />
      </div>
      <Footer />
    </>
  );
}

export default App;
