import Polish from './Polish'

function App(): React.JSX.Element {
  return (
    <div className="panel-root">
      <div className="drag-region" />
      <Polish />
      <div className="footer">
        <button className="link" onClick={() => window.pebble.quit()}>
          quit
        </button>
      </div>
    </div>
  )
}

export default App
