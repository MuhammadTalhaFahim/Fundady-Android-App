import React, { memo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './SvgIcon';
import { colors } from '../../theme/colors';
import { isTV, isTablet } from '../../utils/responsive';

const TrailerPlayer = ({ youtubeId, onEnd, width, height }) => {
  const webViewRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  if (!youtubeId) return null;

  // Extract clean YouTube ID from ID or full URL (watch?v=, youtu.be/, embed/, etc.)
  let cleanId = youtubeId;
  if (typeof youtubeId === 'string') {
    if (youtubeId.includes('v=')) {
      cleanId = youtubeId.split('v=')[1]?.split('&')[0];
    } else if (youtubeId.includes('youtu.be/')) {
      cleanId = youtubeId.split('youtu.be/')[1]?.split('?')[0];
    } else if (youtubeId.includes('embed/')) {
      cleanId = youtubeId.split('embed/')[1]?.split('?')[0];
    }
  }

  // On TV the D-pad cannot reach YouTube's own controls inside the cross-origin iframe,
  // so hide them and make the trailer itself one focusable element: OK toggles play/pause.
  const tvMode = isTV;
  // TV and tablet cap the box height, making it wider than 16:9, so the player must fill width.
  const fillWidth = isTV || isTablet;

  // HTML iframe embed using youtube-nocookie.com domain to prevent YouTube Error 150/152 restrictions in WebViews
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          body, html { width: 100%; height: 100%; overflow: hidden; background-color: #000; }
          iframe { width: 100%; height: 100%; border: none; }
          ${fillWidth ? `
          /* TV/tablet: the box is wider than 16:9, so size the player to full width at 16:9 and
             center it vertically (top/bottom get cropped) instead of pillarboxing. */
          iframe { position: absolute; left: 0; top: 50%; width: 100vw; height: 56.25vw; transform: translateY(-50%); }
          ` : ''}
        </style>
      </head>
      <body>
        <iframe
          id="ytplayer"
          src="https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&mute=${tvMode ? 0 : 1}&playsinline=1&controls=${tvMode ? 0 : 1}&enablejsapi=1&rel=0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen>
        </iframe>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          function post(msg) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          }

          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('ytplayer', {
              events: {
                'onStateChange': function(event) {
                  // YT.PlayerState: 0 = ENDED, 1 = PLAYING, 2 = PAUSED
                  if (event.data === 0) {
                    post({ event: 'ended' });
                  } else if (event.data === 1) {
                    post({ event: 'playing' });
                  } else if (event.data === 2) {
                    post({ event: 'paused' });
                  }
                },
                'onError': function(event) {
                  post({ event: 'error', code: event.data });
                }
              }
            });
          }

          // Called from React Native via injectJavaScript (TV remote OK button)
          window.togglePlayback = function() {
            if (!player || !player.getPlayerState) return;
            if (player.getPlayerState() === 1) { player.pauseVideo(); } else { player.playVideo(); }
          };
        </script>
      </body>
    </html>
  `;

  const togglePlayback = () => {
    webViewRef.current?.injectJavaScript('window.togglePlayback && window.togglePlayback(); true;');
  };

  const Container = tvMode ? Pressable : View;

  return (
    <Container
      style={[styles.container, { width, height }, tvMode && isFocused && styles.containerFocused]}
      {...(tvMode && {
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        onPress: togglePlayback,
      })}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://www.youtube-nocookie.com' }}
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.event === 'ended') {
              onEnd && onEnd();
            } else if (data.event === 'playing') {
              setIsPlaying(true);
            } else if (data.event === 'paused') {
              setIsPlaying(false);
            }
          } catch (err) {}
        }}
      />

      {tvMode && !isPlaying && (
        <View pointerEvents="none" style={styles.pausedOverlay}>
          <Icon name="play-arrow" size={56} color={colors.white} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  containerFocused: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(TrailerPlayer);
