import { Component } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";

class App extends Component {
  render() {
    return (
      <div className="app-shell">
        <Header />
        <Dashboard />
      </div>
    );
  }
}

export default App;
