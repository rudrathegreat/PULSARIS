import { useState, useEffect } from "react";
import Papa from "papaparse";
import LoaderScreen from "./components/LoaderScreen";
import ReviewScreen from "./components/ReviewScreen";
import pulsarsCsvUrl from "./assets/pulsars.csv?url";

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pulsars, setPulsars] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    Papa.parse(pulsarsCsvUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const mappedPulsars = results.data
          .filter(p => p.JNAME && p.P0)
          .map(p => ({
            name: p.JNAME,
            period: p.P0,
            dm: p.DM || 0,
          }));
        setPulsars(mappedPulsars);
      },
      error: (err) => {
        console.error("Failed to load pulsar catalogue:", err);
      }
    });
  }, []);

  return (
    <>
      {!dataLoaded ? (
        <LoaderScreen
          setReviewItems={setReviewItems}
          setPulsars={setPulsars}
          setDataLoaded={setDataLoaded}
          isDarkMode={isDarkMode}
        />
      ) : (
        <ReviewScreen
          reviewItems={reviewItems}
          setReviewItems={setReviewItems}
          index={index}
          setIndex={setIndex}
          pulsars={pulsars}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}
    </>
  );
}
