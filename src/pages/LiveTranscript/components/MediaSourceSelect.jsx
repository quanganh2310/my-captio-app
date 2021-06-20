import React, { Component } from 'react';
import { Select } from 'antd';

import './MediaSourceSelect.css';

import CameraIcon from '../../../assets/icons/camera.svg';
import MicrophoneIcon from '../../../assets/icons/microphone-icon.svg';

const { Option } = Select;


export class MediaSourceSelect extends Component {
  constructor() {
    super();
    this.state = {
    };
    this.handleChangeAudioInput = this.handleChangeAudioInput.bind(this);
    this.handleChangeVideoInput = this.handleChangeVideoInput.bind(this);
  }

  handleChangeAudioInput(value) {
    const audioInput = value;
    if (this.props.onChangeAudioInput) {
      this.props.onChangeAudioInput(audioInput);
    }
  }

  handleChangeVideoInput(value) {
    const videoInput = value;
    if (this.props.onChangeVideoInput) {
      this.props.onChangeVideoInput(videoInput);
    }
  }

  render() {
    const {
      currentAudio,
      currentVideo,
      audioInputs,
      videoInputs,
      stream
    } = this.props;

    return (
      <>
        <span className="mediaSrc-select-title">Choose</span>
        <Select
          className="mediaSrc-selector audioSrc-selector"
          // dropdownStyle={{background: 'rgba(26, 26, 26, 0.85)'}}
          placeholder="Audio input"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onChange={this.handleChangeAudioInput}
          value={currentAudio}
          // disabled
          disabled={ stream ? true : false}
        >
          {audioInputs.map((audioInput, index) => {
            return (
              <Option
                key={`audio-input-${index}`}
                className="model-option"
                value={audioInput.deviceId}
              >
                <img key={`mic-icon-${index}`} className="select-icon" src={MicrophoneIcon} alt="microphone"/>
                {audioInput.label}
              </Option>
            );
          })}
        </Select>

        <Select
          className="mediaSrc-selector videoSrc-selector"
          // dropdownStyle={{background: 'rgba(26, 26, 26, 0.85)'}}
          placeholder="Video input"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onChange={this.handleChangeVideoInput}
          value={currentVideo}
          clearIcon={CameraIcon}
          // disabled
          disabled={ stream ? true : false}
        >

          {videoInputs.map((videoInput, index) => {
            return (
              <Option
                key={`video-input-${index}`}
                className="model-option"
                value={videoInput.deviceId}
              >
                <img key={`camera-icon-${index}`} className="select-icon" src={CameraIcon} alt="camera"/>
                {videoInput.label}
              </Option>
            );
          })}
        </Select>
      </>
    );
  }
}

export default MediaSourceSelect;
