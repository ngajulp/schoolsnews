import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {token ? <Dashboard /> : <Login />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
