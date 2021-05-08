import React, { Component } from 'react';
import { Card, Row, Switch } from 'antd';
import { Space, Button, Divider } from 'antd';
import { AudioOutlined, ProfileFilled } from '@ant-design/icons';
import  {DesktopOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
// eslint-disable-next-line import/no-webpack-loader-syntax
// import SampleVideo from '-!file-loader!./sintel-short.mp4';

import './App.css';

// import ModelDropdown from './components/ModelDropdown';
import CaptionMenu from './components/CaptionMenu';
import FullscreenBtn from './components/FullscreenBtn';

import recognizeMic from '../../lib/speech-to-text/recognize-microphone';

// const { TextArea } = Input;

const displayMediaOptions = {
  video: {
    cursor: "always",
    frameRate: { ideal: 60, max: 120 },
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  }
};

let active = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

function dragStart(e, dragItem) {
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.target === dragItem || dragItem.contains(e.target)) {
    active = true;
  }
}

function dragEnd() {
  initialX = currentX;
  initialY = currentY;

  active = false;
}

function setTranslate(xPos, yPos, el) {
  // eslint-disable-next-line no-param-reassign
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function drag(e, dragItem) {

  if (active) {

    // e.preventDefault();

    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragItem);
  }
}

class LiveTranscript extends Component {
  constructor() {
    super()
    this.state = {
      audioSource: null,
      text: '',
      model: 'en-US_BroadbandModel',
      speakerLabels: false,
      stream: undefined,
      stereoMix: '',
      showMenu: false,
      showCaption: true,
    }
    this.onChangeLanguage = this.onChangeLanguage.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.stopCapture = this.stopCapture.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.cameraCapture = this.cameraCapture.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  componentDidMount() {

    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.label.includes("Stereo Mix")) {
            this.setState({
              stereoMix: device.deviceId
            });
          }
          console.log(`${device.kind}: ${device.label
            } id = ${device.deviceId}`);
        });
      })
      .catch((err) => {
        console.log(`${err.name}: ${err.message}`);
      });
  }

  onChangeLanguage(e) {
    console.log(e);
    const model = e;
    this.setState({
      model
    });
  }

  showVideoControls = () => {
    const videoControls = document.querySelector('.video-controls-bottom');
    if (videoControls) {
      videoControls.style.visibility = "visible";
    }
  }

  hideVideoControls = () => {
    const videoControls = document.querySelector('.video-controls-bottom');
    if (videoControls && !this.state.showMenu) {
      videoControls.style.visibility = "hidden";
    }
  }

  handleShowMenu = (showMenu) => {
    this.setState({
      showMenu
    });
  }

  handleShowCaption = () => {
    this.setState({
      showCaption: !this.state.showCaption
    });
  }

  onListenClick() {
    fetch('http://localhost:8002/api/v1/credentials')
      .then((response) => {
        return response.text();
      }).then((token) => {
        const data = JSON.parse(token)
        console.log('token is', data.accessToken)
        const stream = recognizeMic({
          mediaStream: this.state.stream,
          model: this.state.model,
          url: data.serviceUrl,
          token: data.accessToken,
          accessToken: data.accessToken,
          speakerLabels: false,
          objectMode: true, // send objects instead of text
          extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
          format: true, // optional - performs basic formatting on the results such as capitals an periods,
        });
        stream.on('data', (rawData) => {
          const { transcript } = rawData.alternatives[0];
          console.log(rawData);
          this.setState({
            text: rawData.alternatives[0].transcript,
          });
          document.querySelector('.caption-segment').scrollTop = 9999999;
          document.querySelector('.caption-segment').innerHTML = transcript;

        });
        stream.on('error', (err) => {
          console.log(err);
        });
        document.querySelector('#stop').onclick = stream.stop.bind(stream);
      }).catch((error) => {
        console.log(error);
      });
  }

  onResetClick() {
    console.log('stopped');
    this.setState(
      {
        audioSource: null,
        text: '',
        speakerLabels: false,
        zoom_end_point_url: null,
        stream: undefined
      }
    )
  }

  async cameraCapture() {
    if (this.state.stream) {
      this.stopCapture();
    }
    try {
      const videoElement = document.querySelector('#video');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: this.state.stereoMix, 'echoCancellation': true } }, video: true });
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      this.setState({
        stream
      });
      console.log(stream)
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  async startCapture() {
    if (this.state.stream) {
      this.stopCapture();
    }
    try {
      let stream = null;
      const videoElement = document.querySelector('#video');
      const videoStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      if (videoStream && videoStream.getAudioTracks().length > 0) {
        stream = videoStream;
      }
      else {
        const voiceStream = this.state.stereoMix && await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: this.state.stereoMix, 'echoCancellation': true } }, video: false });
        const tracks = [...videoStream.getTracks(), ...voiceStream.getAudioTracks()]
        stream = new MediaStream(tracks);
      }
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      this.setState({
        stream
      });
      console.log(stream)
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  stopCapture() {
    const videoElement = document.querySelector('#video').srcObject;
    if (videoElement) {
      const tracks = videoElement.getTracks();
      tracks.forEach(track => track.stop());
    }
    document.querySelector('#video').srcObject = null;
    this.setState({
      stream: undefined
    });
  }

  handleDragStart(e) {
    const dragItem = document.querySelector(".caption-window");
    dragStart(e, dragItem);
  }

  handleDragEnd(e) {
    dragEnd(e);
  }

  handleDrag(e) {
    const dragItem = document.querySelector(".caption-window");
    drag(e, dragItem)
  }

  render() {
    return (
      <>
        <div className="App">
          <div className="page-container">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card className="capture-btn-container">

                <Divider>What do you want to capture ?</Divider>
                <Space>
                  { this.state.stream ? (<Button id='stopCapture' onClick={this.stopCapture.bind(this)} type="primary" shape="round" danger>
                    Stop
                  </Button>) : (<><Button id='start'
                    className="capture-btn"
                    onClick={this.startCapture.bind(this)}
                    icon={<DesktopOutlined />}
                  >
                    Screen
                  </Button>
                  <Button id='start'
                    className="capture-btn"
                    onClick={this.cameraCapture}
                    icon={<VideoCameraOutlined />}
                  >
                    Camera
                  </Button></>)}
                </Space>
              </Card>
              <Card
                className="player-theater-card"
              >
                <div className="player-theater-container" onMouseOver={this.showVideoControls} onMouseOut={this.hideVideoControls}>
                  <div className={ this.state.stream ? "video-container" : "video-container no-stream" }>
                    <video className="video-stream" id="video" autoPlay muted>
                      <source type="video/mp4" />
                    </video>
                  </div>

                  { !this.state.stream ? (<div
                    className="caption-window-container"
                  >
                    <div className="no-stream-content">
                      <PlayCircleOutlined className="no-stream-container-icon" />
                      <span className="stream-container-text">Captured media will be displayed here</span>
                    </div>
                  </div>) : (<><div
                    className="caption-window-container"
                    onMouseDown={this.handleDragStart}
                    onMouseUp={this.handleDragEnd}
                    onMouseMove={this.handleDrag}
                    onTouchStart={this.handleDragStart}
                    onTouchEnd={this.handleDragEnd}
                    onTouchMove={this.handleDrag}
                  >
                    <div className="caption-window">
                      <span className="caption-text">
                        {/* <span className="caption-visual-line"> */}
                        { this.state.showCaption && <span className="caption-segment">
                          This is closed caption
                                        </span>}
                        {/* </span> */}
                      </span>
                    </div>
                  </div>

                  <div className="video-controls-bottom">
                    <Row className="controls-container" justify="end">
                      {/* <div className="caption-menu-button fullscreen-btn transcript-switch-container">
                        <Switch className="transcript-swt-btn" checkedChildren="S2T" unCheckedChildren="关闭" defaultChecked />
                      </div> */}
                      <Button
                        id='s2t'
                        onClick={this.handleShowCaption}
                        className="caption-menu-button fullscreen-btn"
                        shape="circle"
                        size="large"
                        icon={<AudioOutlined className="video-controls-icon" />}
                      />
                      <Button
                        id='cc'
                        onClick={this.handleShowCaption}
                        className="caption-menu-button fullscreen-btn"
                        shape="circle"
                        size="large"
                        icon={<ProfileFilled className="video-controls-icon" />}
                      />
                      <CaptionMenu
                        onChangeLanguage={this.onChangeLanguage.bind(this)}
                        model={this.state.model}
                        handleShowMenu={this.handleShowMenu}
                      />
                      <FullscreenBtn />
                    </Row>
                  </div></>)}


                </div>
                {/* } */}
              </Card>
              {/* <ModelDropdown onChangeLanguage={this.onChangeLanguage.bind(this)} model={this.state.model} /> */}
              {/* <Space>
                <Button onClick={this.onListenClick.bind(this)} type="primary" shape="round" icon={<AudioOutlined />}>
                  Record Audio
                            </Button>
                <Button id='stop' type="primary" shape="round" danger>
                  Stop
                            </Button>
                <Button id='reset' onClick={this.onResetClick.bind(this)} type="primary" shape="round" danger>
                  Reset
                            </Button>
              </Space> */}
              <video className="video-capture" id="video" autoPlay muted>
                <source type="video/mp4" />
              </video>
              {/* <div>
                <TextArea
                  value={this.state.text}
                  placeholder="Text"
                  autoSize={{ minRows: 3 }}
                  style={{ fontSize: '30px', width: '700px', height: '200px', overFlowY: 'scroll' }}
                />
              </div> */}
            </Space>
          </div>
        </div>
      </>
    );
  }
}

export default LiveTranscript;
