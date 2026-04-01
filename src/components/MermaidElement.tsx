import React, { useEffect, useState, useRef, useId } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
    code: string;
}

// Simple text cache to prevent re-rendering identical diagrams when switching tabs/modes
const renderCache = new Map<string, string>();

const MermaidElement: React.FC<Props> = ({ code }) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId().replace(/:/g, ''); // Mermaid requires unique IDs
    const { theme } = useTheme();

    useEffect(() => {
        let isMounted = true;

        const renderDiagram = async () => {
            if (!code) return;

            // Generate a cache key that includes the theme colors so it re-renders on theme change
            const cacheKey = `${code}-${theme.background_primary}-${theme.text_primary}`;

            if (renderCache.has(cacheKey)) {
                setSvgContent(renderCache.get(cacheKey)!);
                return;
            }

            try {
                // DYNAMIC IMPORT - Lazy loading Mermaid!
                // This ensures mermaid.js is completely code-split and only loads when a diagram exists.
                const mermaidModule = await import('mermaid');
                const mermaid = mermaidModule.default;

                // Determine if theme is dark based on background luminance
                // The ThemeProvider already provides isLight utility, but we can do a simple heuristic
                // or just pass explicit colors to Mermaid's base theme.
                const isDark = theme.background_primary.toLowerCase() < '#888888';

                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'base',
                    themeVariables: {
                        primaryColor: theme.background_secondary,
                        primaryTextColor: theme.text_primary,
                        primaryBorderColor: theme.border_color,
                        lineColor: theme.text_secondary,
                        secondaryColor: theme.accent_color,
                        tertiaryColor: theme.background_primary,
                        darkMode: isDark
                    },
                    fontFamily: 'inherit'
                });

                // Render returns an object { svg, bindFunctions }
                const { svg } = await mermaid.render(`mermaid-svg-${uniqueId}`, code);

                if (isMounted) {
                    setSvgContent(svg);
                    renderCache.set(cacheKey, svg);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Mermaid Render Error", err);
                if (isMounted) {
                    setError(err.message || 'Syntax Error in Mermaid diagram');
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code, theme, uniqueId]);

    if (error) {
        return (
            <div style={{ color: '#E81123', padding: '12px', border: '1px solid #E81123', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                <strong>Mermaid Syntax Error:</strong>
                <pre style={{ margin: 0, marginTop: '8px', whiteSpace: 'pre-wrap' }}>{error}</pre>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>
                <span className="mermaid-spinner" style={{ display: 'inline-block', marginRight: '8px' }}>⚒️</span>
                Rendering diagram...
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="mermaid-wrapper"
            style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

export default MermaidElement;
