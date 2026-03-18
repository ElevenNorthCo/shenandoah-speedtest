import { useState } from 'react';
import { supabase, type SpeedResultInsert } from '../lib/supabase';
import type { SpeedTestResult } from '../lib/speedtest';
import type { IspInfo } from '../lib/ispDetect';
import type { TownInfo } from '../lib/geocode';
import { useAuth } from '../hooks/useAuth';

const CARRIERS = [
  'Comcast / Xfinity',
  'Shenandoah Telecommunications (Shentel)',
  'Starlink',
  'T-Mobile Home Internet',
  'Verizon',
  'Skyline / Skybest',
  'All Points Broadband',
  'HughesNet',
  'Viasat',
  'Other',
];

interface SubmitFormProps {
  result: SpeedTestResult;
  ispInfo: IspInfo | null;
  townInfo: TownInfo | null;
  detectedCarrier: string;
  onSubmitted: (id: string) => void;
}

export function SubmitForm({ result, ispInfo, townInfo, detectedCarrier, onSubmitted }: SubmitFormProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [carrier, setCarrier] = useState(detectedCarrier || 'Other');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const record: SpeedResultInsert = {
      username: username.trim().slice(0, 30) || 'Anonymous',
      download_mbps: result.downloadMbps,
      upload_mbps: result.uploadMbps,
      ping_ms: result.pingMs,
      carrier: carrier || null,
      isp_detected: ispInfo?.isp ?? null,
      town: townInfo?.town ?? null,
      region: townInfo?.region ?? ispInfo?.region ?? null,
      lat: townInfo?.lat ?? ispInfo?.lat ?? null,
      lng: townInfo?.lng ?? ispInfo?.lng ?? null,
      user_email: user?.email ?? (email.trim() ? email.trim().toLowerCase() : null),
    };

    try {
      const { data, error: insertError } = await supabase
        .from('speed_results')
        .insert(record)
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Optionally store email
      if (email.trim()) {
        await supabase.from('email_signups').upsert({
          email: email.trim().toLowerCase(),
          username: username.trim().slice(0, 30),
        });
      }

      onSubmitted(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle} htmlFor="username">
            Username <span style={{ color: 'var(--text-ghost)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Anonymous"
            maxLength={30}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="carrier">
            Carrier
          </label>
          <select
            id="carrier"
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            {CARRIERS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {!user && (
        <div>
          <label style={labelStyle} htmlFor="email">
            Email <span style={{ color: 'var(--text-ghost)', fontWeight: 400 }}>(optional — link results to your dashboard)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          />
        </div>
      )}

      {townInfo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Location: <span style={{ color: 'var(--text-primary)' }}>{townInfo.town}, {townInfo.region}</span>
          </span>
        </div>
      )}

      {error && (
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.85rem',
          color: 'var(--accent-danger)',
          padding: '8px 12px',
          background: '#FF444415',
          borderRadius: '6px',
          border: '1px solid #FF444430',
        }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '14px 32px',
          background: submitting ? 'var(--bg-elevated)' : 'var(--accent-signal)',
          color: submitting ? 'var(--text-secondary)' : '#080C10',
          border: 'none',
          borderRadius: '6px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          width: '100%',
        }}
      >
        {submitting ? 'SUBMITTING...' : 'SUBMIT TO LEADERBOARD'}
      </button>
    </form>
  );
}
