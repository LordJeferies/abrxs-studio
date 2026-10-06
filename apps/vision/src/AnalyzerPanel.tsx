import { FileVideo2, Image as ImageIcon, ScanSearch, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { analyzeMedia, type LocalMediaAnalysis } from './analyzer';

export function AnalyzerPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<LocalMediaAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      setAnalysis(await analyzeMedia(file));
    } catch (reason) {
      setAnalysis(null);
      setError(reason instanceof Error ? reason.message : 'Could not analyze this file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="analyzer-panel">
      <div className="analyzer-head">
        <div>
          <span className="micro">LOCAL ANALYZER · OFFLINE</span>
          <h2>Inspect an image or video before sending anything to AI.</h2>
          <p>Metadata, aspect, orientation and a lightweight local visual summary stay on this device.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload size={15} /> {busy ? 'Analyzing…' : 'Choose media'}
        </button>
      </div>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*,video/*"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void run(file);
          event.currentTarget.value = '';
        }}
      />

      {!analysis && !error && (
        <div className="analysis-empty">
          <ScanSearch size={30} />
          <strong>No media analyzed yet</strong>
          <span>Use local analysis first; add NVIDIA/Gemini only when semantic interpretation is useful.</span>
        </div>
      )}

      {error && <div className="analysis-error">{error}</div>}

      {analysis && (
        <div className="analysis-result">
          <div className="analysis-kind">
            {analysis.kind === 'image' ? <ImageIcon size={22} /> : <FileVideo2 size={22} />}
            <div><span className="micro">{analysis.kind.toUpperCase()}</span><strong>{analysis.name}</strong></div>
          </div>
          <dl className="analysis-facts">
            <div><dt>Dimensions</dt><dd>{analysis.width} × {analysis.height}</dd></div>
            <div><dt>Aspect</dt><dd>{analysis.aspectRatio}</dd></div>
            <div><dt>Orientation</dt><dd>{analysis.orientation}</dd></div>
            {analysis.kind === 'image' ? (
              <>
                <div><dt>Average luminance</dt><dd>{analysis.averageLuma}/255</dd></div>
                <div className="analysis-colors"><dt>Dominant colors</dt><dd>{analysis.dominantColors.map((color) => <span key={color} title={color} style={{ background: color }} />)}</dd></div>
              </>
            ) : (
              <>
                <div><dt>Duration</dt><dd>{analysis.duration.toFixed(2)}s</dd></div>
                <div><dt>Suggested sample frames</dt><dd>{analysis.sampleTimes.join(' · ')}s</dd></div>
              </>
            )}
          </dl>
        </div>
      )}
    </section>
  );
}
