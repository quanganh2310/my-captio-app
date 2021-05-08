/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

function isFullScreen() {
  return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
}

function setFullscreenData(state, videoContainer) {
  videoContainer.setAttribute('data-fullscreen', !!state);
}

function handleFullscreen(videoContainer) {
  if (isFullScreen()) {
     if (document.exitFullscreen) document.exitFullscreen();
     else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
     else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
     else if (document.msExitFullscreen) document.msExitFullscreen();
     setFullscreenData(false, videoContainer);
  }
  else {
     if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
     else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
     else if (videoContainer.webkitRequestFullScreen) videoContainer.webkitRequestFullScreen();
     else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
     setFullscreenData(true, videoContainer);
  }
}

export class FullscreenBtn extends Component {

  handleFullscreenClick = () => {
    const theaterContainer = document.querySelector('.player-theater-container');
    const fullscreen = document.getElementById('fs');

    const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled ||
      document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);
    if (!fullScreenEnabled) {
      fullscreen.style.display = 'none';
    }
    handleFullscreen(theaterContainer);
    // document.addEventListener('fullscreenchange', () => {
    //   setFullscreenData(!!(document.fullscreen || document.fullscreenElement));
    // });
    // document.addEventListener('webkitfullscreenchange', () => {
    //     setFullscreenData(!!document.webkitIsFullScreen);
    // });
    // document.addEventListener('mozfullscreenchange', () => {
    //     setFullscreenData(!!document.mozFullScreen);
    // });
    // document.addEventListener('msfullscreenchange', () => {
    //     setFullscreenData(!!document.msFullscreenElement);
    // });
  }

  render() {
    return (
      <Button
        id='fs'
        onClick={this.handleFullscreenClick}
        className="caption-menu-button fullscreen-btn"
        shape="circle"
        size="large"
        icon={<ExpandOutlined className="video-controls-icon" />}
      />
    );
  }
}

export default FullscreenBtn;
