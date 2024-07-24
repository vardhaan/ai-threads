import React from 'react';
import logo from './logo.svg';
import './App.css';
import Draggable from 'react-draggable';
import { ChatBox } from './components/ChatBox';
import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { Box } from '@mui/joy';
import { GraphController } from './GraphController';


function App() {
  return (
    <GraphController useLocalStorage={true} />
  );
}

export default App;
