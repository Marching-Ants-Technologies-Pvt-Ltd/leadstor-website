import { useEffect, useState } from "react";
import { CityContext } from "./cityContext";

export const CityProvider = ({ children }) => {
  const [city, setCity] = useState("New York");

  useEffect(() => {
    fetch('/api/getCity')
    .then((res)=> res.json())
    .then((data) => {setCitues(data)})
    .catch((err) => console.log(err))
  })

  return (
    <CityContext.Provider value={{ city}}>
      {children}
    </CityContext.Provider>
  );
};