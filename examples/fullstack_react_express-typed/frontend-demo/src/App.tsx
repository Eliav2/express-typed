import "./App.css";
import { useAppQuery } from "./queries";

function App() {
  const query = useAppQuery("/nested/", "get");
  const data = query.data;
  //    ^? const query: UseQueryResult<"Hello world", Error>

  console.log("data", data);

  return <>{JSON.stringify(data)}</>;
}

export default App;
