import React, { useEffect, useState } from "react";

import { initAnalysisProcess } from "../utils/setupAnalyzer";

const Home = () => {
  const [bookData, setBookData] = useState();

  useEffect(() => {
    initAnalysisProcess(setBookData);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {bookData && Object.keys(bookData)
          ? JSON.stringify(bookData)
          : bookData}
      </header>
    </div>
  );
};

export default Home;
