import React, { useState, useEffect, useCallback } from 'react';
import './App.scss';

function App() {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [esCorrecta, setEsCorrecta] = useState(null);
  const [claseContenedor, setClaseContenedor] = useState('');
  const [respuestaDada, setRespuestaDada] = useState(false);
  const [ultimasPreguntas, setUltimasPreguntas] = useState([]);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);


  const setPreguntaAleatoria = useCallback((data) => {
    let preguntaNueva = null;
    let intentos = 0;
    do {
      preguntaNueva = data[Math.floor(Math.random() * data.length)];
      intentos++;
      if (intentos > data.length) break;
    } while (ultimasPreguntas.includes(preguntaNueva.id));
  
    setPreguntaActual(preguntaNueva);
  
    setUltimasPreguntas(prevUltimasPreguntas => {
      const nuevasUltimasPreguntas = [...prevUltimasPreguntas, preguntaNueva.id];
      if (nuevasUltimasPreguntas.length > 5) {
        nuevasUltimasPreguntas.shift();
      }
      return nuevasUltimasPreguntas;
    });
  }, [ultimasPreguntas]);

  useEffect(() => {
    fetch('/questions.json')
      .then(response => response.json())
      .then(data => {
        setPreguntas(data);
      });
  }, []);
  

  const manejarSeleccion = (respuesta) => {
    const esRespuestaCorrecta = respuesta === preguntaActual.respuestaCorrecta;
    setRespuestaSeleccionada(respuesta);
    setEsCorrecta(esRespuestaCorrecta);
    setClaseContenedor(esRespuestaCorrecta ? 'contenedor-correcto' : 'contenedor-incorrecto');
    setRespuestaDada(true);

    if (esRespuestaCorrecta) {
      setRachaActual(rachaActual => {
        const nuevaRacha = rachaActual + 1;
        if (nuevaRacha > mejorRacha) {
          setMejorRacha(nuevaRacha);
        }
        return nuevaRacha;
      });
    } else {
      setRachaActual(0);
    }
  };

  const manejarNuevaPregunta = () => {
    setPreguntaAleatoria(preguntas);
    setRespuestaDada(false);
    setClaseContenedor('');
    setRespuestaSeleccionada(null);
    setEsCorrecta(null);
  };  

  return (
    <div className="app-container">
      <div className="rachas">
        <p>Mejor Racha: {mejorRacha}</p>
        <p>Racha Actual: {rachaActual}</p>
      </div>
      {preguntaActual && (
        <div key={preguntaActual.id} className={`contenedor-pregunta ${claseContenedor} ${respuestaDada ? 'respuesta-dada' : ''}`}>
          <h2 className="pregunta" style={{ display: respuestaDada ? 'none' : 'block' }}>
            {preguntaActual.pregunta}
          </h2>
          {preguntaActual.opciones.map(opcion => (
            <button
              key={opcion}
              className={`boton-opcion ${respuestaSeleccionada === opcion ? (esCorrecta ? 'correcta' : 'incorrecta') : ''}`}
              onClick={() => manejarSeleccion(opcion)}
              style={{ 
                display: respuestaDada && opcion !== respuestaSeleccionada ? 'none' : 'inline-block',
                position: respuestaDada ? 'absolute' : 'static',
                top: respuestaDada ? '50%' : 'auto',
                left: respuestaDada ? '50%' : 'auto',
                transform: respuestaDada ? (opcion === respuestaSeleccionada ? 'translate(-50%, -50%) scale(1.5)' : 'scale(1.5)') : 'none'
              }}
              disabled={respuestaDada}
            >
              {opcion}
            </button>
          ))}
          {!esCorrecta && respuestaDada && (
            <div className="respuesta-correcta">
              Respuesta Correcta: {preguntaActual.respuestaCorrecta}
            </div>
          )}
        </div>
      )}
      <button className="boton-nueva-pregunta" onClick={manejarNuevaPregunta}>
        Nueva Pregunta
      </button>
    </div>
  );
}

export default App;
