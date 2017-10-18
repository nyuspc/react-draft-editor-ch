// @file: Link insert modal jsx file
// @auth: spc@data.me 2017/10/11

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    getSelectionText
} from '../../utils';

import './styles.css';
import linkIcon from '../../../../icon/link.svg';
import textIcon from '../../../../icon/text.svg';

export default class LinkModal extends Component {
    static propTypes = {
        currentState: PropTypes.object.isRequired,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func
    };
    constructor(props) {
        super(props);
        this.state = {
            linkTitle: '',
            linkTarget: ''
        };
    }
    componentWillMount() {
        if (this.props.currentState) {
            this.setState({
                linkTitle: getSelectionText(this.props.currentState)
            });
        }
    }
    componentDidMount() {
        if (this.state.linkTitle === '') {
            this.titleRef.focus();
        } else {
            this.linkRef.focus();
        }
    }
    addLink: Function = () => {
        const { linkTitle, linkTarget } = this.state;
        if (linkTitle === '') {
            this.props.onSubmit(linkTarget, linkTarget);
        } else {
            this.props.onSubmit(linkTitle, linkTarget);
        }
    }
    updateLinkTitle: Function = (event) => {
        this.setState({
            linkTitle: event.target.value
        });
    }
    updateLinkTarget: Function = (event) => {
        this.setState({
            linkTarget: event.target.value
        });
    }
    render() {
        return (
            <div className="rde-modal">
                <div className="rde-modal-body">
                    <div className="rde-modal-title">插入链接</div>
                    <div className="rde-modal-input-box">
                        <img src={textIcon} alt="" />
                        <input
                            className="rde-modal-input"
                            onChange={this.updateLinkTitle}
                            onBlur={this.updateLinkTitle}
                            value={this.state.linkTitle}
                            ref={(ref) => { this.titleRef = ref; }}
                            placeholder="输入链接文本"
                        />
                    </div>
                    <div className="rde-modal-input-box">
                        <img src={linkIcon} alt="" />
                        <input
                            className="rde-modal-input"
                            onChange={this.updateLinkTarget}
                            onBlur={this.updateLinkTarget}
                            value={this.state.linkTarget}
                            ref={(ref) => { this.linkRef = ref; }}
                            placeholder="输入链接地址"
                        />
                    </div>
                    <div className="rde-modal-btns">
                        <button className="rde-modal-btn-ok" disabled={this.state.linkTarget === ''} onClick={this.addLink}>确定</button>
                        <button className="rde-modal-btn-cancel" onClick={this.props.onCancel}>取消</button>
                    </div>
                </div>
            </div>
        );
    }
}
