import { FileVideo2, Image as ImageIcon, ScanSearch, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { analyzeMedia, type LocalMediaAnalysis } from './analyzer';
import { useVisionI18n } from './i18n';

export function AnalyzerPanel() {
  const { t, option } = useVisionI18n();
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
      setError(reason instanceof Error ? reason.message : t('analyzer.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="analyzer-panel">
      <div className="analyzer-head">
        <div>
          <span className="micro">{t('analyzer.kicker')}</span>
          <h2>{t('analyzer.title')}</h2>
          <p>{t('analyzer.body')}</p>
        </div>
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload size={15} /> {busy ? t('analyzer.analyzing') : t('analyzer.choose')}
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
          <strong>{t('analyzer.none')}</strong>
          <span>{t('analyzer.noneBody')}</span>
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
            <div><dt>{t('analyzer.dimensions')}</dt><dd>{analysis.width} × {analysis.height}</dd></div>
            <div><dt>{t('analyzer.aspect')}</dt><dd>{analysis.aspectRatio}</dd></div>
            <div><dt>{t('analyzer.orientation')}</dt><dd>{option(analysis.orientation)}</dd></div>
            {analysis.kind === 'image' ? (
              <>
                <div><dt>{t('analyzer.averageLuma')}</dt><dd>{analysis.averageLuma}/255</dd></div>
                <div className="analysis-colors"><dt>{t('analyzer.colors')}</dt><dd>{analysis.dominantColors.map((color) => <span key={color} title={color} style={{ background: color }} />)}</dd></div>
              </>
            ) : (
              <>
                <div><dt>{t('analyzer.duration')}</dt><dd>{analysis.duration.toFixed(2)}s</dd></div>
                <div><dt>{t('analyzer.samples')}</dt><dd>{analysis.sampleTimes.join(' · ')}s</dd></div>
              </>
            )}
          </dl>
        </div>
      )}
    </section>
  );
}
