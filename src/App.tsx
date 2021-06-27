import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import './App.css';
import About from './pages/About';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <p>KappaSigmaMu Society</p>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>

      </div>
    </Router>
  );
}

export default App;
