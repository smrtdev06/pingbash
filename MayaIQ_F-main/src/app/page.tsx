
import React from "react";
import Header from "@/components/landingPage/header";
import Welcome from "@/components/landingPage/welcome";

const Home: React.FC = () => {
  
  return (
    <div className="main-container n-0 p-0 box-border bg-custom-dark">
      <div className="bg-wrapper text-center pb-[72px]">
        <Header />
        <Welcome />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
