/**
 * WebView Web Implementation
 * Simple iframe wrapper for web platform
 */

import React, { useEffect, useRef, useImperativeHandle } from 'react';

interface WebViewWebProps {
  source: { uri: string } | { html: string };
  style?: any;
  onMessage?: (event: any) => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  injectedJavaScript?: string;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  allowsInlineMediaPlayback?: boolean;
  mediaPlaybackRequiresUserAction?: boolean;
  ref?: any;
  [key: string]: any;
}

export const WebView = React.forwardRef<any, WebViewWebProps>(({
  source,
  style,
  onMessage,
  onLoad,
  onLoadStart,
  onLoadEnd,
  onError,
  injectedJavaScript,
  ...props
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Expose methods that the parent component might call
  useImperativeHandle(ref, () => ({
    postMessage: (message: string) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    },
    reload: () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    },
    goBack: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.back();
      }
    },
    goForward: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.forward();
      }
    },
  }), []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      onLoadEnd?.();
      onLoad?.();

      // Inject JavaScript if provided
      if (injectedJavaScript) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const script = iframeDoc.createElement('script');
            script.textContent = injectedJavaScript;
            iframeDoc.head.appendChild(script);
          }
        } catch (e) {
          console.warn('Failed to inject JavaScript:', e);
        }
      }
    };

    const handleError = (e: any) => {
      onError?.(e);
    };

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Simulate loadstart
    handleLoadStart();

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [injectedJavaScript, onLoad, onLoadStart, onLoadEnd, onError]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source === iframeRef.current?.contentWindow) {
        onMessage?.({ nativeEvent: { data: event.data } });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  const src = 'uri' in source ? source.uri : `data:text/html,${encodeURIComponent(source.html)}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      style={{
        border: 'none',
        width: '100%',
        height: '100%',
        ...style,
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      {...props}
    />
  );
});
