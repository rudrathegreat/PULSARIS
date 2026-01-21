import { useState, useEffect } from "react";
import Papa from "papaparse";
import LoaderScreen from "./components/LoaderScreen";
import ReviewScreen from "./components/ReviewScreen";
import pulsarsCsvUrl from "./assets/pulsars.csv?url";
import { parseJName } from "./utils/coords";

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pulsars, setPulsars] = useState([]);
  const [allPulsars, setAllPulsars] = useState([]);
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
          .map(p => {
            const coords = parseJName(p.JNAME);
            return {
              name: p.JNAME,
              period: p.P0,
              dm: p.DM || 0,
              ra: coords?.ra ?? null,
              dec: coords?.dec ?? null
            };
          });
        setAllPulsars(mappedPulsars);
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
          allPulsars={allPulsars}
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
