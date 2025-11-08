import { useState, useEffect } from 'react';
import { Code, Play, Lightbulb, FileCode, Database, Brain, Upload, FileSpreadsheet, FileText, X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function Simulators() {
  // Sample code for each simulator type
  const sampleCodes = {
    python: `# Python Data Science Practice
import pandas as pd
import numpy as np

# Create sample dataset
data = {'Name': ['Alice', 'Bob', 'Charlie'],
        'Age': [25, 30, 35],
        'Score': [85, 90, 88]}

df = pd.DataFrame(data)
print(df)
print("\\nMean Age:", df['Age'].mean())`,
    sql: `-- SQL Practice Query
SELECT
  customer_id,
  COUNT(*) as order_count,
  SUM(total_amount) as total_spent
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;`,
    ml: `# Machine Learning Practice
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import numpy as np

# Generate sample data
X = np.random.rand(100, 1) * 10
y = 2 * X + 1 + np.random.randn(100, 1)

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LinearRegression()
model.fit(X_train, y_train)

print(f"Score: {model.score(X_test, y_test):.4f}")
print(f"Coefficient: {model.coef_[0][0]:.4f}")`,
  };

  // Hints for each simulator type
  const hints = {
    python: 'Use pandas for data manipulation, numpy for numerical operations. Try modifying the data or adding more columns.',
    sql: 'Use SELECT, FROM, WHERE, GROUP BY, ORDER BY clauses. Practice with different aggregate functions like COUNT, SUM, AVG.',
    ml: 'Experiment with different test_size values, try different models from sklearn, or modify the data generation parameters.',
  };

  const [selectedSimulator, setSelectedSimulator] = useState('python');
  const [code, setCode] = useState(sampleCodes.python);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const [datasetFileName, setDatasetFileName] = useState('');
  const [datasetPreview, setDatasetPreview] = useState(null);

  // Update code when simulator type changes
  useEffect(() => {
    if (sampleCodes[selectedSimulator]) {
      if (uploadedDataset && uploadedDataset.length > 0) {
        // Update code to use uploaded dataset
        const columns = Object.keys(uploadedDataset[0]);
        if (selectedSimulator === 'python') {
          setCode(`# Python Data Science Practice with Uploaded Dataset
import pandas as pd
import numpy as np

# Load your uploaded dataset
# The dataset has ${uploadedDataset.length} rows and ${columns.length} columns
# Columns: ${columns.join(', ')}

# Example: Access the dataset
# df = pd.DataFrame(uploaded_data)
# print(df.head())
# print(df.info())
# print(df.describe())

# Your code here...
print("Dataset loaded successfully!")
print(f"Rows: ${uploadedDataset.length}, Columns: ${columns.length}")`);
        } else if (selectedSimulator === 'sql') {
          setCode(`-- SQL Practice Query with Uploaded Dataset
-- Dataset: ${datasetFileName}
-- Columns: ${columns.join(', ')}

-- Example query structure:
-- SELECT * FROM dataset LIMIT 10;
-- SELECT column_name, COUNT(*) FROM dataset GROUP BY column_name;

-- Your SQL query here...`);
        } else if (selectedSimulator === 'ml') {
          setCode(`# Machine Learning Practice with Uploaded Dataset
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import numpy as np
import pandas as pd

# Load your uploaded dataset
# Dataset: ${datasetFileName}
# Rows: ${uploadedDataset.length}, Columns: ${columns.length}
# Features: ${columns.join(', ')}

# Example: Prepare data for ML
# X = df[['feature1', 'feature2']]
# y = df['target']
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
# model = LinearRegression()
# model.fit(X_train, y_train)

# Your ML code here...
print("Dataset ready for ML training!")`);
        }
      } else {
        setCode(sampleCodes[selectedSimulator]);
      }
      setOutput('');
      setError('');
      setShowHint(false);
    }
  }, [selectedSimulator, uploadedDataset, datasetFileName]);

  // Update simulator type
  const handleSimulatorChange = (type) => {
    setSelectedSimulator(type);
  };

  // Handle CSV file upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setDatasetFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          return;
        }
        setUploadedDataset(results.data);
        setDatasetPreview(results.data.slice(0, 5)); // Preview first 5 rows
        setError('');
      },
      error: (error) => {
        setError('Error reading CSV file: ' + error.message);
      },
    });
  };

  // Handle Excel file upload
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setDatasetFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        setUploadedDataset(jsonData);
        setDatasetPreview(jsonData.slice(0, 5)); // Preview first 5 rows
        setError('');
      } catch (error) {
        setError('Error reading Excel file: ' + error.message);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading Excel file');
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Remove uploaded dataset
  const handleRemoveDataset = () => {
    setUploadedDataset(null);
    setDatasetFileName('');
    setDatasetPreview(null);
    setError('');
  };

  const runCode = () => {
    setOutput('');
    setError('');
    
    // Simulate code execution with appropriate output based on simulator type
    setTimeout(() => {
      try {
        if (uploadedDataset && uploadedDataset.length > 0) {
          // Use uploaded dataset for output
          const columns = Object.keys(uploadedDataset[0]);
          let outputText = '';
          
          if (selectedSimulator === 'python') {
            // Display dataset preview
            outputText = `Dataset: ${datasetFileName}\n`;
            outputText += `Rows: ${uploadedDataset.length}\n`;
            outputText += `Columns: ${columns.join(', ')}\n\n`;
            outputText += 'First 10 rows:\n';
            
            // Format as table
            const headerRow = columns.join('  |  ');
            outputText += headerRow + '\n';
            outputText += '-'.repeat(headerRow.length) + '\n';
            
            uploadedDataset.slice(0, 10).forEach((row) => {
              const values = columns.map(col => String(row[col] || '')).join('  |  ');
              outputText += values + '\n';
            });
            
            // Calculate basic statistics for numeric columns
            const numericColumns = columns.filter(col => {
              const sample = uploadedDataset.find(row => row[col] !== undefined && row[col] !== '');
              return sample && !isNaN(parseFloat(sample[col]));
            });
            
            if (numericColumns.length > 0) {
              outputText += '\nBasic Statistics:\n';
              numericColumns.forEach(col => {
                const values = uploadedDataset
                  .map(row => parseFloat(row[col]))
                  .filter(val => !isNaN(val));
                if (values.length > 0) {
                  const sum = values.reduce((a, b) => a + b, 0);
                  const mean = sum / values.length;
                  outputText += `${col}: Mean = ${mean.toFixed(2)}\n`;
                }
              });
            }
          } else if (selectedSimulator === 'sql') {
            outputText = `Dataset: ${datasetFileName}\n`;
            outputText += `Rows: ${uploadedDataset.length}\n`;
            outputText += `Columns: ${columns.join(', ')}\n\n`;
            outputText += 'Query Results (First 10 rows):\n';
            
            const headerRow = columns.join(' | ');
            outputText += headerRow + '\n';
            outputText += '-'.repeat(headerRow.length) + '\n';
            
            uploadedDataset.slice(0, 10).forEach((row) => {
              const values = columns.map(col => String(row[col] || '')).join(' | ');
              outputText += values + '\n';
            });
            
            outputText += `\n(${uploadedDataset.length} rows total)`;
          } else if (selectedSimulator === 'ml') {
            outputText = `Dataset: ${datasetFileName}\n`;
            outputText += `Rows: ${uploadedDataset.length}\n`;
            outputText += `Columns: ${columns.join(', ')}\n\n`;
            outputText += 'Model Training with Uploaded Dataset:\n';
            outputText += `Training samples: ${Math.floor(uploadedDataset.length * 0.8)}\n`;
            outputText += `Test samples: ${Math.ceil(uploadedDataset.length * 0.2)}\n`;
            outputText += `Features: ${columns.length}\n`;
            outputText += 'Model trained successfully!\n';
            outputText += 'R² Score: 0.9234';
          }
          
          setOutput(outputText);
        } else {
          // Use default simulated output if no dataset uploaded
          if (selectedSimulator === 'python') {
            const simulatedOutput = `   Name  Age  Score
0  Alice   25     85
1    Bob   30     90
2 Charlie   35     88

Mean Age: 30.0`;
            setOutput(simulatedOutput);
          } else if (selectedSimulator === 'sql') {
            const simulatedOutput = `customer_id | order_count | total_spent
------------|-------------|------------
     1001   |     15      |   12500.50
     1002   |     12      |    9800.25
     1003   |     18      |   15200.75
     1004   |      9      |    7200.00
     1005   |     11      |    8900.50

(10 rows returned)`;
            setOutput(simulatedOutput);
          } else if (selectedSimulator === 'ml') {
            const simulatedOutput = `Score: 0.9234
Coefficient: 2.0123

Model trained successfully!
Training samples: 80
Test samples: 20
R² Score: 0.9234`;
            setOutput(simulatedOutput);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    }, 500);
  };

  const simulators = [
    {
      id: 'python',
      name: 'Python',
      description: 'Practice Python',
      icon: FileCode,
      color: 'text-green-400',
      bgColor: 'bg-gray-900',
      activeBgColor: 'bg-primary/20',
      borderColor: 'border-gray-800',
      activeBorderColor: 'border-primary',
    },
    {
      id: 'sql',
      name: 'SQL',
      description: 'Practice SQL',
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-gray-900',
      activeBgColor: 'bg-primary/20',
      borderColor: 'border-gray-800',
      activeBorderColor: 'border-primary',
    },
    {
      id: 'ml',
      name: 'ML Models',
      description: 'Practice ML Models',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-gray-900',
      activeBgColor: 'bg-primary/20',
      borderColor: 'border-gray-800',
      activeBorderColor: 'border-primary',
    },
  ];

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Code size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-white">Practice Simulators</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Write and execute code in a safe practice environment
          </p>
        </div>

        {/* Simulator Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {simulators.map((simulator) => {
            const Icon = simulator.icon;
            const isActive = selectedSimulator === simulator.id;
            return (
              <button
                key={simulator.id}
                onClick={() => handleSimulatorChange(simulator.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  isActive
                    ? `${simulator.activeBgColor} ${simulator.activeBorderColor} button-glow`
                    : `${simulator.bgColor} ${simulator.borderColor} hover:border-gray-700`
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={32}
                    className={isActive ? 'text-primary' : simulator.color}
                  />
                  <div className="text-left">
                    <h3
                      className={`font-bold text-lg ${
                        isActive ? 'text-primary' : 'text-white'
                      }`}
                    >
                      {simulator.name}
                    </h3>
                    <p className="text-sm text-gray-400">{simulator.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Code Editor */}
            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode size={20} className="text-primary" />
                  <h2 className="font-bold text-white">Code Editor</h2>
                </div>
                <button
                  onClick={runCode}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                  <Play size={18} />
                  Run Code
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 bg-black text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:border-primary resize-none"
                  placeholder={`Write your ${selectedSimulator === 'python' ? 'Python' : selectedSimulator === 'sql' ? 'SQL' : 'ML'} code here...`}
                />
              </div>
            </div>

            {/* Output Console */}
            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-bold text-white">Output Console</h2>
              </div>
              <div className="p-4 min-h-[200px]">
                {error ? (
                  <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                    {error}
                  </div>
                ) : output ? (
                  <div className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {output}
                  </div>
                ) : (
                  <div className="text-gray-500 font-mono text-sm">
                    Output will appear here after running code...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Tips & Hints */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-primary" />
                <h2 className="font-bold text-white">Tips & Hints</h2>
              </div>
              {showHint ? (
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-300">{hints[selectedSimulator]}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium button-glow hover:bg-opacity-90 transition-all"
                >
                  Show Hint
                </button>
              )}
            </div>

            {/* Practice Guidelines */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h2 className="font-bold text-white mb-4">Practice Guidelines</h2>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Modify the sample code to learn by experimentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Use print statements to debug your code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Try different parameters and observe the results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Read error messages carefully for debugging</span>
                </li>
              </ul>
            </div>

            {/* Upload Dataset Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Upload Dataset</h2>
                {uploadedDataset && (
                  <button
                    onClick={handleRemoveDataset}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Remove dataset"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {!uploadedDataset ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-3">
                    Upload your own dataset (CSV or Excel) to practice with real data
                  </p>
                  
                  {/* CSV Upload Option */}
                  <label className="block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <div className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:border-primary transition-colors cursor-pointer bg-gray-800 hover:bg-gray-750">
                      <FileText size={20} className="text-green-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Upload CSV</div>
                        <div className="text-xs text-gray-400">.csv files</div>
                      </div>
                      <Upload size={18} className="text-gray-400" />
                    </div>
                  </label>

                  {/* Excel Upload Option */}
                  <label className="block">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <div className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:border-primary transition-colors cursor-pointer bg-gray-800 hover:bg-gray-750">
                      <FileSpreadsheet size={20} className="text-blue-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Upload Excel</div>
                        <div className="text-xs text-gray-400">.xlsx or .xls files</div>
                      </div>
                      <Upload size={18} className="text-gray-400" />
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      {datasetFileName.endsWith('.csv') ? (
                        <FileText size={16} className="text-green-400" />
                      ) : (
                        <FileSpreadsheet size={16} className="text-blue-400" />
                      )}
                      <span className="text-sm font-medium text-white">{datasetFileName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {uploadedDataset.length} rows • {Object.keys(uploadedDataset[0] || {}).length} columns
                    </div>
                  </div>

                  {/* Dataset Preview */}
                  {datasetPreview && datasetPreview.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs font-medium text-gray-300 mb-2">Preview (First 5 rows):</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-700">
                              {Object.keys(datasetPreview[0]).map((col, idx) => (
                                <th key={idx} className="text-left py-1 px-2 text-gray-300 font-medium">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {datasetPreview.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b border-gray-700/50">
                                {Object.values(row).map((cell, cellIdx) => (
                                  <td key={cellIdx} className="py-1 px-2 text-gray-400">
                                    {String(cell || '').substring(0, 20)}
                                    {String(cell || '').length > 20 ? '...' : ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    The simulator will now use your uploaded dataset when you run code
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}