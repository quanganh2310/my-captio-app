/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Modal, Button, Row, Col } from 'antd';
import { Radio, Switch, Slider, Tooltip } from 'antd';
import { Spin } from 'antd';
import { SettingFilled, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import './ConfirmModal.css';

import ModelDropdown from './ModelDropdown';

import UploadIcon from '../../../assets/icons/upload-icon.svg';
import BrowseIcon from '../../../assets/icons/browse-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';

export class PreviewModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  hidePreviewModal = () => {
    this.props.hidePreviewModal();
    const videoPreviewElement = document.querySelector('#videoPreview').srcObject;
    if (videoPreviewElement) {
      const tracks = videoPreviewElement.getTracks();
      tracks.forEach(track => track.stop());
      document.querySelector('#videoPreview').srcObject = null;
    }
  }

  handleStart = () => {
    const {stream} = this.props;
    this.props.hidePreviewModal();
    this.props.setStream(stream)
    const videoElement = document.querySelector('#video');
    if (videoElement) {
      console.log(videoElement);
      videoElement.srcObject = stream;
    };
    this.props.onListenClick();
  }

  handleBrowse = () => {
    console.log(this.dropzone);
    this.dropzone.open();
  }

  reset = (acceptedFiles) => {
    const files = acceptedFiles;
    if (this.props.transcriptEnd) {
      files.length = 0
      files.splice(0, acceptedFiles.length)
    }
  }

  render() {
    const { transcriptEnd, hidePreviewModal, handleUserFile, onChangeLanguage, onListenClick, model, visible, stream } = this.props;

    return (
      <>
        <Modal
          title={<div className="modal-title-container">
            <div className="modal-title">Upload a video or audio file</div>
            <div className="modal-subtitle">Browse your desktop or drag & drop your file here</div>
          </div>}
          visible={visible}
          // onOk={this.hideModal}
          onCancel={this.hidePreviewModal}
          width={700}
          footer={null}
        // okText="确认"
        // cancelText="取消"
        >
          <div className={"preview-modal-contents-container"}>
            <div className="language-select">
              <div className="content-text">Select language:</div>
              <ModelDropdown
                onChangeLanguage={onChangeLanguage}
                model={model}
              />
            </div>
            <div className="modal-contents">
              <div className="video-container">
                <video id="videoPreview" autoPlay muted>
                  <source type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="btn-container">
                    <Button className="btn browse-btn play-btn" onClick={this.handleStart}>
                      <img src={PlayIcon} alt="playIcon" />
                      <span>Start Transcript</span>
                    </Button>
                  </div>
          </div>

        </Modal>
      </>
    );
  }
}

export default PreviewModal;
