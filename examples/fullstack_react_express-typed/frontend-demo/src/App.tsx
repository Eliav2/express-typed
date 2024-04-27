import "./App.css";
import { useAppQuery } from "./queries";

const ReactQueryApp = () => {
  const query = useAppQuery("/mutate", "post");
  const data = query.data;
  //    ^?
  console.log("data", data);

  return (
    <>
      <div>response: {JSON.stringify(data)}</div>;
    </>
  );
};

function App() {
  return (
    <>
      <ReactQueryApp />
    </>
  );
}

export default App;
