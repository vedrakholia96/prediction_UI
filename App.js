import React, { useState, useEffect } from 'react';

function App() {
  const [availableParameters] = useState([
    { id: 'glucose', name: 'Glucose', initialValuePlaceholder: 'Initial value (g/L)' },
    { id: 'ph', name: 'pH', initialValuePlaceholder: 'Set point' },
    { id: 'lactate', name: 'Lactate', initialValuePlaceholder: 'Initial value (g/L)' }
  ]);

  const [selectedParameterIds, setSelectedParameterIds] = useState([]);
  
  const [parameters, setParameters] = useState({
    seedingDensity: '',
    volume: '',
    cultureDuration: '',
  });
  
  const [parameterValues, setParameterValues] = useState({
    glucose: { initialValue: '' },
    ph: { initialValue: '' },
    lactate: { initialValue: '' },
  });
  
  const [selectedTab, setSelectedTab] = useState('realtime');
  
  // Initialize column headers based on selected parameters
  // Always include Day and Cell Density
  const getInitialColumns = () => {
    return ['Day', 'Cell Density', ...selectedParameterIds.map(id => 
      availableParameters.find(param => param.id === id)?.name || id
    )];
  };
  
  // State for column headers
  const [columns, setColumns] = useState(getInitialColumns());
  
  // Update columns when selected parameters change
  useEffect(() => {
    setColumns(getInitialColumns());
    updateDataStructure();
  }, [selectedParameterIds]);
  
  // Update data structure when culture duration changes
  useEffect(() => {
    if (parameters.cultureDuration) {
      updateDataStructure();
    }
  }, [parameters.cultureDuration]);
  
  // Initialize empty data tables with dynamic columns and rows
  const createEmptyData = () => {
    const duration = parseInt(parameters.cultureDuration) || 3; // Default to 3 if not specified
    const numRows = Math.max(1, duration); // Ensure at least 1 row
    
    return Array(numRows).fill().map((_, rowIndex) => {
      const row = Array(columns.length).fill('');
      row[0] = rowIndex.toString(); // Fill the Day column with sequential days
      return row;
    });
  };
  
  const [realtimeData, setRealtimeData] = useState(createEmptyData());
  const [predictedData, setPredictedData] = useState(createEmptyData());
  
  // Update data structure when columns or culture duration change
  const updateDataStructure = () => {
    const newData = createEmptyData();
    setRealtimeData(newData);
    setPredictedData(newData);
  };
  
  // Handle parameter selection
  const handleParameterSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedParameterIds(selectedOptions);
  };
  
  // Handle input changes for basic parameters
  const handleInputChange = (field, value) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle input changes for parameter values
  const handleParameterValueChange = (paramId, value) => {
    setParameterValues(prev => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        initialValue: value
      }
    }));
  };
  
  // Handle real-time data cell changes
  const handleCellChange = (rowIndex, cellIndex, value) => {
    const newData = [...realtimeData];
    newData[rowIndex][cellIndex] = value;
    setRealtimeData(newData);
  };
  
  // Handle plus button click in predicted data
  const handlePlusClick = (rowIndex, cellIndex) => {
    const newData = [...predictedData];
    const currentValue = newData[rowIndex][cellIndex];
    const numValue = currentValue === '' ? 0 : parseFloat(currentValue);
    newData[rowIndex][cellIndex] = isNaN(numValue) ? '1' : (numValue + 1).toString();
    setPredictedData(newData);
  };
  
  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1>
          <span style={styles.welcomeText}>Welcome,</span> Mellisa
        </h1>
        <p style={styles.subheader}>Click on any card to get started!</p>
        <div style={styles.profileIcon}></div>
      </header>
      
      <div style={styles.parametersSection}>
        <div style={styles.parameterCard}>
          <h2 style={styles.parameterCardTitle}>Choose your parameters</h2>
        </div>
        
        <div style={styles.parameterDropdowns}>
          <div style={styles.dropdown}>
            <select 
              style={styles.select} 
              multiple 
              onChange={handleParameterSelect}
              size={3}
            >
              {availableParameters.map(param => (
                <option key={param.id} value={param.id}>{param.name}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.dropdown}>
            <select style={styles.select} defaultValue="">
              <option value="" disabled>Vessel Type</option>
            </select>
          </div>
        </div>
        
        <div style={styles.parameterInputs}>
          <input 
            style={styles.input}
            type="text" 
            placeholder="Seeding Density (E6/ml)" 
            value={parameters.seedingDensity}
            onChange={(e) => handleInputChange('seedingDensity', e.target.value)}
          />
          
          <input 
            style={styles.input}
            type="text" 
            placeholder="Volume (ml)" 
            value={parameters.volume}
            onChange={(e) => handleInputChange('volume', e.target.value)}
          />
          
          <input 
            style={styles.input}
            type="text" 
            placeholder="Culture Duration (Days)" 
            value={parameters.cultureDuration}
            onChange={(e) => handleInputChange('cultureDuration', e.target.value)}
          />
        </div>
      </div>
      
      <div style={styles.selectionsPanel}>
        <div style={styles.selectionsHeader}>
          <h3 style={styles.selectionsTitle}>Selections:</h3>
        </div>
        
        <div style={styles.parameterSelections}>
          {selectedParameterIds.map(paramId => {
            const param = availableParameters.find(p => p.id === paramId);
            return (
              <div style={styles.parameterRow} key={paramId}>
                <button style={styles.parameterButton}>{param.name}</button>
                <input 
                  style={styles.input}
                  type="text" 
                  placeholder={param.initialValuePlaceholder}
                  value={parameterValues[paramId]?.initialValue || ''}
                  onChange={(e) => handleParameterValueChange(paramId, e.target.value)}
                />
              </div>
            );
          })}
          
          <div style={styles.parameterRow}>
            <button style={styles.addButton}>Add +</button>
          </div>
        </div>
      </div>
      
      <div style={styles.dataSection}>
        <div style={styles.tabs}>
          <button 
            style={selectedTab === 'realtime' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => setSelectedTab('realtime')}
          >
            Real time data
          </button>
          <button 
            style={selectedTab === 'predicted' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => setSelectedTab('predicted')}
          >
            Predicted data
          </button>
        </div>
        
        <div style={styles.tablesContainer}>
          {/* Real-time data table with editable cells */}
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              {columns.map((column, index) => (
                <div style={styles.headerCell} key={`header-${index}`}>{column}</div>
              ))}
            </div>
            
            {realtimeData.map((row, rowIndex) => (
              <div style={styles.tableRow} key={`realtime-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <div style={styles.tableCell} key={`realtime-${rowIndex}-${cellIndex}`}>
                    <input
                      style={{
                        ...styles.cellInput,
                        backgroundColor: cellIndex === 0 ? '#444' : 'transparent', // Make Day column slightly different
                        cursor: cellIndex === 0 ? 'default' : 'text' // Change cursor for Day column
                      }}
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                      readOnly={cellIndex === 0} // Make Day column read-only
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Predicted data table with + buttons */}
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              {columns.map((column, index) => (
                <div style={styles.headerCell} key={`header-${index}`}>{column}</div>
              ))}
            </div>
            
            {predictedData.map((row, rowIndex) => (
              <div style={styles.tableRow} key={`predicted-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <div style={styles.tableCell} key={`predicted-${rowIndex}-${cellIndex}`}>
                    {cellIndex === 0 ? (
                      <input
                        style={{
                          ...styles.cellInput,
                          backgroundColor: '#444',
                          cursor: 'default'
                        }}
                        type="text"
                        value={cell}
                        readOnly={true}
                      />
                    ) : (
                      <div style={styles.predictedCellContent}>
                        <span>{cell}</span>
                        <button 
                          style={styles.plusButton}
                          onClick={() => handlePlusClick(rowIndex, cellIndex)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  appContainer: {
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '30px',
  },
  welcomeText: {
    color: '#c9b06e',
    fontWeight: 'normal',
  },
  subheader: {
    color: '#888',
    marginLeft: '20px',
  },
  profileIcon: {
    width: '50px',
    height: '50px',
    backgroundColor: '#c9b06e',
    borderRadius: '50%',
    position: 'absolute',
    right: '20px',
    top: '10px',
  },
  parametersSection: {
    marginBottom: '30px',
  },
  parameterCard: {
    backgroundColor: '#c9b06e',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    display: 'inline-block',
    marginBottom: '20px',
  },
  parameterCardTitle: {
    margin: 0,
    fontSize: '1.2rem',
  },
  parameterDropdowns: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  dropdown: {
    flexGrow: 0,
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: 'white',
    border: 'none',
    width: '230px',
  },
  parameterInputs: {
    display: 'flex',
    gap: '20px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    width: '230px',
  },
  selectionsPanel: {
    backgroundColor: '#333',
    borderRadius: '5px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
  },
  selectionsHeader: {
    width: '100px',
  },
  selectionsTitle: {
    margin: 0,
  },
  parameterSelections: {
    flexGrow: 1,
  },
  parameterRow: {
    display: 'flex',
    marginBottom: '10px',
    alignItems: 'center',
  },
  parameterButton: {
    backgroundColor: '#c9b06e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    width: '130px',
    textAlign: 'center',
    marginRight: '20px',
    cursor: 'pointer',
  },
  addButton: {
    backgroundColor: '#c9b06e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    width: '130px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  dataSection: {
    backgroundColor: '#333',
    borderRadius: '5px',
    padding: '20px',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  tab: {
    backgroundColor: '#c9b06e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    width: '160px',
  },
  activeTab: {
    backgroundColor: '#b59d5e',
  },
  tablesContainer: {
    display: 'flex',
    gap: '10px',
  },
  table: {
    flex: 1,
    border: '1px solid #555',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#c9b06e',
    color: 'white',
  },
  headerCell: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    borderRight: '1px solid #b59d5e',
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #555',
  },
  tableCell: {
    flex: 1,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid #555',
    padding: '0',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: 'white',
    textAlign: 'center',
    padding: '0',
  },
  predictedCellContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  plusButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 5px',
  },
};

export default App;