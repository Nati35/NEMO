import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'NEMO - Learn Smarter';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Logo Icon (Using emoji for simplicity, or we could use SVG) */}
                    <div style={{ fontSize: 130 }}>🐠</div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontSize: 160,
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1,
                                letterSpacing: '-5px',
                                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            NEMO
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        fontSize: 40,
                        color: '#94a3b8',
                        marginTop: 40,
                        fontWeight: 600,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}
                >
                    Learning Reimagined
                </div>

            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
