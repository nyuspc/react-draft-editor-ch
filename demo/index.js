import React, { Component } from 'react';
import { render } from 'react-dom'; // eslint-disable-line import/no-extraneous-dependencies
import {
    convertFromHTML,
    ContentState,
    EditorState
} from 'draft-js';
import { Editor } from '../js/src';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

const contentBlocks = convertFromHTML('<p>请测试</p>');

const contentState = ContentState.createFromBlockArray(contentBlocks);

class Demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createWithContent(contentState)
        };
    }
    onEditorStateChange: Function = (editorState) => {
        this.setState({
            editorState
        });
    }
    render() {
        const { editorState } = this.state;
        return (
            <div className="demo-root">
                <div className="demo-wrapper">
                    <div className="demo-content">
                        <Editor
                            editorState={editorState}
                            onChange={this.onEditorStateChange}
                            placeholder="测试"
                        />
                    </div>
                </div>
                <button onClick={this.setContentState}>重置编辑器</button>
            </div>
        );
    }
}

render(<Demo />, document.getElementById('app'));
