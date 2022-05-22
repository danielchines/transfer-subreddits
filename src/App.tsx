// import Home from './Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Transfer from './Transfer';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <div className='App'>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Transfer />} />
            <Route path='/login/callback' element={<Transfer />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
