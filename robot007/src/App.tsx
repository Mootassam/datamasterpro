import "./App.css";
import Generate from "./components/Generate";
import {store, persistor} from "./store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import UpdateNotification from "./components/UpdateNotification";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UpdateNotification />
        <Generate />
      </PersistGate>
    </Provider>
  );
}

export default App;