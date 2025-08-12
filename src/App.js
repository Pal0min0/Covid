import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Globe, TrendingUp, MapPin, Calendar } from 'lucide-react';
import './App.css';

const App = () => {
  const [globalData, setGlobalData] = useState(null);
  const [usaData, setUsaData] = useState(null);
  const [historicalGlobal, setHistoricalGlobal] = useState(null);
  const [historicalUSA, setHistoricalUSA] = useState(null);
  const [countriesData, setCountriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mundial');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const globalResponse = await fetch('https://disease.sh/v3/covid-19/all');
        const global = await globalResponse.json();
        setGlobalData(global);

        const usaResponse = await fetch('https://disease.sh/v3/covid-19/countries/USA');
        const usa = await usaResponse.json();
        setUsaData(usa);

        const historicalGlobalResponse = await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=60');
        const histGlobal = await historicalGlobalResponse.json();
        setHistoricalGlobal(histGlobal);

        const historicalUSAResponse = await fetch('https://disease.sh/v3/covid-19/historical/USA?lastdays=60');
        const histUSA = await historicalUSAResponse.json();
        setHistoricalUSA(histUSA);

        const countriesResponse = await fetch('https://disease.sh/v3/covid-19/countries?sort=cases');
        const countries = await countriesResponse.json();
        setCountriesData(countries.slice(0, 15));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-ES').format(number);
  };

  const processHistoricalData = (data) => {
    if (!data || !data.cases) return [];
    
    const dates = Object.keys(data.cases);
    return dates.slice(-30).map(date => ({
      date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      casos: data.cases[date],
      muertes: data.deaths[date],
      recuperados: data.recovered ? data.recovered[date] : 0
    }));
  };

  const processUSAHistoricalData = (data) => {
    if (!data || !data.timeline || !data.timeline.cases) return [];
    
    const dates = Object.keys(data.timeline.cases);
    return dates.slice(-30).map(date => ({
      date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      casos: data.timeline.cases[date],
      muertes: data.timeline.deaths[date],
      recuperados: data.timeline.recovered ? data.timeline.recovered[date] : 0
    }));
  };

  const getTopCountriesData = () => {
    return countriesData.slice(0, 10).map(country => ({
      name: country.country,
      casos: country.cases,
      muertes: country.deaths,
      recuperados: country.recovered
    }));
  };

  const getContinentData = () => {
    const continents = {};
    countriesData.forEach(country => {
      const continent = country.continent || 'Unknown';
      if (!continents[continent]) {
        continents[continent] = {
          name: continent,
          casos: 0,
          muertes: 0,
          recuperados: 0
        };
      }
      continents[continent].casos += country.cases;
      continents[continent].muertes += country.deaths;
      continents[continent].recuperados += country.recovered;
    });
    return Object.values(continents);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Cargando datos del COVID-19...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Estadisticas COVID-19</h1>
          <p>Datos a tiempo real sobre la pandemia mundial</p>
          <p className="source">
            Fuente: disease.sh API - Actualizado: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        {globalData && (
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-content">
                <img 
                  src="https://i.pinimg.com/736x/28/a3/46/28a3466f564aabe7824487048c0dd019.jpg" 
                  alt="Casos Totales" 
                  className="stat-image"
                />
                <div className="stat-text">
                  <p className="stat-label">Casos Totales</p>
                  <p className="stat-value">{formatNumber(globalData.cases)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card red">
              <div className="stat-content">
                <img 
                  src="https://i.pinimg.com/736x/e4/ff/b6/e4ffb611422768b1c2f733569c0f147f.jpg" 
                  alt="Muertes Totales" 
                  className="stat-image"
                />
                <div className="stat-text">
                  <p className="stat-label">Muertes Totales</p>
                  <p className="stat-value">{formatNumber(globalData.deaths)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-content">
                <img 
                  src="https://i.pinimg.com/736x/a6/2c/ce/a62cceadcfa986e56fdaef78f16acda6.jpg" 
                  alt="Recuperados" 
                  className="stat-image"
                />
                <div className="stat-text">
                  <p className="stat-label">Recuperados</p>
                  <p className="stat-value">{formatNumber(globalData.recovered)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-content">
                <img 
                  src="https://i.pinimg.com/736x/15/d6/3c/15d63cac2c98a5b0b9b6a8c821ab978b.jpg" 
                  alt="Casos Activos" 
                  className="stat-image"
                />
                <div className="stat-text">
                  <p className="stat-label">Casos Activos</p>
                  <p className="stat-value">{formatNumber(globalData.active)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="tabs-container">
          <div className="tabs">
            {['mundial', 'historia', 'usa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'mundial' && <Globe className="tab-icon" />}
                {tab === 'historia' && <Calendar className="tab-icon" />}
                {tab === 'usa' && <MapPin className="tab-icon" />}
                {tab === 'mundial' ? 'Vista Mundial' : tab === 'historia' ? 'Datos Históricos' : 'Estados Unidos'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'mundial' && (
          <div className="content">
            <div className="chart-container">
              <h2 className="chart-title">
                <TrendingUp className="title-icon" />
                Top 10 Paises por Casos
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getTopCountriesData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="casos" fill="#8884d8" name="Casos" />
                  <Bar dataKey="muertes" fill="#ff7300" name="Muertes" />
                  <Bar dataKey="recuperados" fill="#82ca9d" name="Recuperados" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid-2">
              <div className="chart-container">
                <h3 className="chart-subtitle">Distribucion por Continentes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getContinentData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="casos"
                    >
                      {getContinentData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-subtitle">Estadisticas Globales Hoy</h3>
                <div className="stats-today">
                  <div className="stat-today blue">
                    <span>Casos Hoy:</span>
                    <span>{formatNumber(globalData?.todayCases || 0)}</span>
                  </div>
                  <div className="stat-today red">
                    <span>Muertes Hoy:</span>
                    <span>{formatNumber(globalData?.todayDeaths || 0)}</span>
                  </div>
                  <div className="stat-today green">
                    <span>Recuperados Hoy:</span>
                    <span>{formatNumber(globalData?.todayRecovered || 0)}</span>
                  </div>
                  <div className="stat-today purple">
                    <span>Tasa de Mortalidad:</span>
                    <span>{((globalData?.deaths / globalData?.cases) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historia' && historicalGlobal && (
          <div className="content">
            <div className="chart-container">
              <h2 className="chart-title">
                <Calendar className="title-icon" />
                Evolución Global (Ultimos 30 dias)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={processHistoricalData(historicalGlobal)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="casos" stroke="#8884d8" strokeWidth={2} name="Casos" />
                  <Line type="monotone" dataKey="muertes" stroke="#ff7300" strokeWidth={2} name="Muertes" />
                  <Line type="monotone" dataKey="recuperados" stroke="#82ca9d" strokeWidth={2} name="Recuperados" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'usa' && usaData && (
          <div className="content">
            <div className="stats-grid-3">
              <div className="stat-card usa">
                <h3>Estados Unidos</h3>
                <div className="stat-details">
                  <div className="stat-row">
                    <span>Casos Totales:</span>
                    <span>{formatNumber(usaData.cases)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Casos Hoy:</span>
                    <span>{formatNumber(usaData.todayCases)}</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card deaths">
                <h3>Muertes</h3>
                <div className="stat-details">
                  <div className="stat-row">
                    <span>Total:</span>
                    <span>{formatNumber(usaData.deaths)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Hoy:</span>
                    <span>{formatNumber(usaData.todayDeaths)}</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card recovery">
                <h3>Recuperacion</h3>
                <div className="stat-details">
                  <div className="stat-row">
                    <span>Recuperados:</span>
                    <span>{formatNumber(usaData.recovered)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Activos:</span>
                    <span>{formatNumber(usaData.active)}</span>
                  </div>
                </div>
              </div>
            </div>

            {historicalUSA && (
              <div className="chart-container">
                <h2 className="chart-title">
                  <MapPin className="title-icon" />
                  Evolucion en Estados Unidos (Últimos 30 dias)
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processUSAHistoricalData(historicalUSA)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="casos" stroke="#1f77b4" strokeWidth={3} name="Casos" />
                    <Line type="monotone" dataKey="muertes" stroke="#ff7f0e" strokeWidth={3} name="Muertes" />
                    <Line type="monotone" dataKey="recuperados" stroke="#2ca02c" strokeWidth={3} name="Recuperados" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="chart-container">
              <h3 className="chart-subtitle">Info Extra de Estados Unidos</h3>
              <div className="grid-2">
                <div className="info-section">
                  <div className="info-item">
                    <span>Población:</span>
                    <span>{formatNumber(usaData.population)}</span>
                  </div>
                  <div className="info-item">
                    <span>Test Realizados:</span>
                    <span>{formatNumber(usaData.tests)}</span>
                  </div>
                  <div className="info-item">
                    <span>Casos por Millon:</span>
                    <span>{formatNumber(usaData.casesPerOneMillion)}</span>
                  </div>
                </div>
                <div className="info-section">
                  <div className="info-item">
                    <span>Muertes por Millon:</span>
                    <span>{formatNumber(usaData.deathsPerOneMillion)}</span>
                  </div>
                  <div className="info-item">
                    <span>Tests por Millon:</span>
                    <span>{formatNumber(usaData.testsPerOneMillion)}</span>
                  </div>
                  <div className="info-item">
                    <span>Casos Criticos:</span>
                    <span>{formatNumber(usaData.critical)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          <p>2025 Dashboard COVID-19. Datos proporcionados por disease.sh API</p>
          <p>Creado para fines informativos y educativos</p>
        </div>
      </div>
    </div>
  );
};

export default App;