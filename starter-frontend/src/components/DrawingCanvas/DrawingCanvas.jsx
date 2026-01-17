import { useState, useEffect, useRef } from 'react'
import PropTypes from "prop-types";
import { upload } from '../../services/image'
import './DrawingCanvas.css'

const colors = ['black', 'red', 'green', 'blue', 'yellow']

// Below are two simple stateless functional components that are used by the
// DrawingCanvas component to allow the user to select a color and brush size.
// You can factor our small features like this into their own components to
// make your code more modular and easier to understand. We could have just as
// easily defined these components inside the DrawingCanvas component, or even
// put them in a separate file and imported them. This is a matter of preference,
// and there are many ways to organize your code.

const ColorSelector = (props) =>  (
  <div className='color-selector'>
    <select onChange={e => props.setColor(e.target.value)}>
      {colors.map(color => (
        <option key={color} value={color}>
          {color}
        </option>
      ))}
    </select>
  </div>
)

// The `propTypes` property is used to define the types of the props that a
// component should receive. This is useful for catching bugs and documenting
// the expected usage of a component. It is not required, but it is a good
// practice to use it in your components. In this repository, we've set up the
// linter to enforce the use of propTypes
ColorSelector.propTypes = {
  setColor: PropTypes.func.isRequired
}

const BrushSizeSlider = (props) => (
  <div className='brush-size-slider'>
    <input
      type='range'
      min={1}
      max={50}
      value={props.brushSize}
      onChange={e => props.setBrushSize(e.target.value)}
    />
  </div>
)

BrushSizeSlider.propTypes = {
  brushSize: PropTypes.number.isRequired,
  setBrushSize: PropTypes.func.isRequired
}

// This component is meant to showcase one of the strengths of React: the ability to
// encapsulate complex state and behavior into a single component. The DrawingCanvas
// component is a simple drawing application that allows the user to draw lines on a
// canvas using different colors and brush sizes. It also provides buttons to clear the
// canvas, export the drawing as an image, and upload the drawing to the server.
//
// However, from the perspective of the parent component, the DrawingCanvas component is
// a black box. It doesn't need to know how the drawing is implemented, it only needs to
// know how to interact with it.
//
// In the same way, your team should strive to create components that are easy to use and
// understand, and that hide their implementation details from the rest of the application.
// This way, you can build complex applications by combining simple, well-defined components,
// and can work on different parts of the application in parallel without stepping on each
// other's toes.

const DrawingCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [lines, setLines] = useState([])
  const [currentLine, setCurrentLine] = useState([])
  const [color, setColor] = useState('black')
  const [brushSize, setBrushSize] = useState(5)
  const canvasRef = useRef(null)

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setCurrentLine([{ x: offsetX, y: offsetY, color, brushSize }])
    setIsDrawing(true)
  }

  const endDrawing = () => {
    setLines([...lines, currentLine])
    setCurrentLine([])
    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return
    }
    const { offsetX, offsetY } = nativeEvent
    setCurrentLine(prevLine => [...prevLine, { x: offsetX, y: offsetY, color, brushSize }])
  }

  const clear = () => {
    setLines([])
    setCurrentLine([])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.lineJoin = 'round'
    context.lineWidth = brushSize

    lines.forEach(line => {
      context.beginPath()
      line.forEach(({ x, y, color, brushSize }) => {
        context.strokeStyle = color
        context.lineWidth = brushSize
        context.lineTo(x, y)
      })
      context.stroke()
    })

    context.beginPath()
    currentLine.forEach(({ x, y, color, brushSize }) => {
      context.strokeStyle = color
      context.lineWidth = brushSize
      context.lineTo(x, y)
    })
    context.stroke()
  }, [lines, currentLine, brushSize])

  const handleExport = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'canvas.png'
    link.click()
  }

  const handleUpload = async () => {
    const canvas = canvasRef.current
    const image = canvas.toDataURL('image/png')
    await upload(image)
    // refresh the page to show the new image
    window.location.reload()
  }

  return (
    <div className='drawing-canvas-container'>
      <canvas
        className='drawing-canvas'
        ref={canvasRef}
        width={700}
        height={500}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
      />

      <div className='brush-config'>
        <ColorSelector setColor={setColor} />
        <BrushSizeSlider brushSize={brushSize} setBrushSize={setBrushSize} />
      </div>

      <div className='control-buttons'>
        <button className='export-button' onClick={handleExport}>Export</button>
        <button className='clear-button' onClick={clear}>Clear</button>
        <button className='upload-button' onClick={handleUpload}>Upload</button>
      </div>
    </div>
  )
}

export default DrawingCanvas
