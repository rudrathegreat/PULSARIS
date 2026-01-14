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

  useEffect(() => {
    Papa.parse(pulsarsCsvUrl, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const mappedPulsars = results.data
          .filter(p => p.JNAME && p.P0) // Ensure valid rows
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
        />
      ) : (
        <ReviewScreen
          reviewItems={reviewItems}
          setReviewItems={setReviewItems}
          index={index}
          setIndex={setIndex}
          pulsars={pulsars}
        />
      )}
    </>
  );
}
