import { ImageResponse } from 'next/og';

export const alt = 'Hey, I’m Gerald. Ask my AI avatar about bookkeeping for US and Australian businesses.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#000',
          color: '#F2F5F7',
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3 }}>Hey, I’m Gerald</div>
        <div style={{ fontSize: 40, color: '#9AA5AF', marginTop: 20 }}>
          QuickBooks Online bookkeeper for US & AU businesses
        </div>
        <div
          style={{
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            fontSize: 30,
            color: '#3CD7FF',
            border: '2px solid #3CD7FF',
            borderRadius: 999,
            padding: '16px 32px',
            alignSelf: 'flex-start',
          }}
        >
          Ask my AI avatar anything
        </div>
      </div>
    ),
    size,
  );
}
