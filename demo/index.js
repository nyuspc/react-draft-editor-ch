import React, { Component } from 'react';
import { render } from 'react-dom'; // eslint-disable-line import/no-extraneous-dependencies
import { Editor } from '../js/src';
import { stateToHTML } from '../js/src';

import DocCard from './DocCard';
import styles from './styles.css'; // eslint-disable-line no-unused-vars

// const contentState = ContentState.createFromBlockArray(contentBlocks);
/* eslint-disable */
const rawContentState = undefined;

function formatValue(value, field, LANG) {
    let tempValue = '';
    switch (field.prop.field_type) {
        case 'name':
            if (tempValue === '') {
                tempValue = value.value[LANG];
            }
            break;
        case 'single_line_text':
        case 'long_text':
        case 'tag':
            let _lang = LANG;
            if (field.prop.trans_type === 'uni') {
                _lang = 'uni';
            }
            tempValue= value.value[_lang];
            break;
        case 'link':
        case 'number':
            let suffix = '';
            if (field.prop.local && field.prop.local[LANG] && field.prop.local[LANG].suffix) {
                suffix = field.prop.local[LANG].suffix;
            }
            if (typeof (value.value) === 'number') {
                tempValue = value.value + suffix;
            }
            break;
        case 'rich_text':
            tempValue = value.value && value.value[LANG].length > 0 ? convertFromRaw(JSON.parse(_deCipher(value.value[LANG]))).getPlainText('\n') : '';
            break;
        case 'doc_img':
        case 'image':
        case 'coordinate':
            tempValue = value.value;
            break;
        case 'multiple_select':
            if (Array.isArray(value.value)) {
                tempValue = value.value.map((val) => {
                    let opt = '';
                    Object.keys(field.prop.local[LANG].options).map((optionKey) => {
                        if (val === Number(optionKey)) {
                            opt = field.prop.local[LANG].options[optionKey].opt_name;
                        }
                    });
                    return opt;
                });
            }
            break;
        case 'single_select':
        case 'drop_list':
        case 's_attitude':
            if (Array.isArray(value.value)) {
                tempValue = value.value.map((val) => {
                    let opt = '';
                    Object.keys(field.prop.local[LANG].options).map((optionKey) => {
                        if (val === Number(optionKey)) {
                            opt = field.prop.local[LANG].options[optionKey].opt_name;
                        }
                    });
                    return opt;
                }).join(' ');
            }
            break;
        case 'date':
            if (value.value[0] <= 0) {
                tempValue = '';
            } else {
                tempValue = moment(value.value[0]).format('YYYY年MM月DD日');
            }
            break;
        case 'file':
            tempValue = value.value.split(',')[0];
            break;
        case 'toggle':
            tempValue = value.value;
            break;
        case 'phone':
            if (field.prop.area === 'PRChina') {
                const validateReg = /^((\+?86-)|(\(\+86-\)))/;
                const tempPhone = validateReg.test(value.value) ? value.value.replace('+86-', '') : value.value;
                tempValue = tempPhone;
            } else {
                tempValue = value.value;
            }
            break;
        default:
            tempValue = '不支持的字段类型';
    }
    return tempValue;
}

function transformDoc(displayConfig, docValues, formFields, LANG = 'zh') {
    if (!displayConfig || !docValues || !formFields) {
        return {};
    }
    const obj = {};
    Object.keys(displayConfig).map((key) => {
        if (typeof displayConfig[key] === 'number') {
            // 非combo 无拓展
            const fid = displayConfig[key];
            const field = formFields[fid.toString()];
            const vkeys = Object.keys(docValues).filter((key2) => {
                return (fid === docValues[key2].fid);
            });
            obj[key] = vkeys.length > 0 ? vkeys.map((vkey) => {
                return formatValue(docValues[vkey], field, LANG);
            })[0] : undefined;
        } else if (Array.isArray(displayConfig[key])) {
            // 非combo 拓展
            const fid = displayConfig[key][0];
            const field = formFields[fid.toString()];
            const vkeys = Object.keys(docValues).filter((key2) => {
                return (fid === docValues[key2].fid);
            });
            obj[key] = vkeys.length > 0 ? vkeys.map((vkey) => {
                return formatValue(docValues[vkey], field, LANG);
            }) : [];
        } else {
            // combo
            const comboConfig = displayConfig[key];
            if (comboConfig.returnArray) {
                // combo有拓展
                const valueArray = [];
                const comboFid = comboConfig.combo;
                const subFidsMap = comboConfig.subFids;
                Object.keys(docValues).forEach((key2) => {
                    // combo的第index个拓展 index从1开始
                    const index = docValues[key2].path[comboFid];
                    if (index) {
                        if (!valueArray[index-1]) {
                            valueArray[index-1] = {}
                        };
                        valueArray[index-1][key2] = docValues[key2];
                    }
                });
                obj[key] = valueArray.map(values => {
                    return transformDoc(subFidsMap, values, formFields, LANG);
                });
            } else {
                // combo无拓展
                const subFidsMap = comboConfig.subFids;
                obj[key] = transformDoc(subFidsMap, docValues, formFields, LANG);
            }
        }
    });
    return obj;
}

class Demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rawContentState,
            readOnly: false
        };
    }
    onContentStateChange: Function = (rawCS) => {
        this.setState({
            rawContentState: rawCS
        });
    }
    imageUploader: Function = (file) => {
        const headers = {
            Accept: 'application/json'
        };
        const url = 'https://api2.factube.com/dbc/api/qiniu/uploadandgetURL';
        const data = new FormData();
        data.append('file', file);
        return fetch(url, {
            method: 'POST',
            headers,
            body: data
        }).then(response => {
            return response.json();
        }).then( json => {
            return ( { src: json.src } );
        });
    }
    suggestCustomData: Function = (key) => {
        const data = {
            baseId: '595e0167293aed3f001cff18',
            qrOfFields: [{
                fid: 1,
                fieldType: 'name',
                reOverFields: 'AND',
                qrOfField: [{
                    qrFType: 'name',
                    qrFid: 1,
                    qrOptType: 'fuzzySearch',
                    qrValue: key,
                    reOpt: 'AND'
                }]
            }],
            rows: 10,
            start: 0
        };
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        const displayConfig = {
            // 标题
            title: 1,
            // 条目头像
            docImage: 2,
            // 正文
            desc: 25,
            author: 22
        }
        return fetch('https://api2.factube.com/dbc/api/search/doc', {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(resBody =>
                resBody.values.map((doc) => {
                    const transDoc = transformDoc(displayConfig, doc.value, resBody.fields);
                    const trimedValue = {
                        id: doc.id,
                        key: doc.id,
                        description: transDoc.desc,
                        author: transDoc.author,
                        image: transDoc.docImage,
                        name: transDoc.title,
                        type: 'doc'
                    };
                    return trimedValue;
                }));
    }
    goBaseLink: Function = (customData) => {
        if (customData) {
            window.open(`https://www.factube.com/doc/${customData.id}`);
        }
    }
    renderCustomData: Function = (customData) => {
        if (customData) {
            return <div>《{customData.name}》<span style={{color: '#3eb9e6'}}>{customData.author}</span></div>;
        }
        return null;
    }
    renderCustomBlock: Function = (customData) => {
        if (customData) {
            return (<DocCard cardData={customData} />);
        }
        return null;
    }
    // suggestCustomData: Function = (key) => {
    //     const data = {
    //         query: `resName:${key} AND resType:base`,
    //         rows: 10,
    //         start: 0
    //     };
    //     const headers = {
    //         Accept: 'application/json',
    //         'Content-Type': 'application/json'
    //     };
    //     return fetch('https://api2.factube.com/dbc/api/search/globalname', {
    //         method: 'POST',
    //         headers,
    //         body: JSON.stringify(data)
    //     }).then(response => response.json())
    //         .then(resBody =>
    //             resBody.values.map((value) => {
    //                 const trimedValue = {
    //                     id: value.id,
    //                     key: value.id,
    //                     description: value.prop.description,
    //                     image: value.prop.image,
    //                     name: value.prop.name,
    //                     type: value.type
    //                 };
    //                 return trimedValue;
    //             }));
    // }
    // goBaseLink: Function = (customData) => {
    //     if (customData) {
    //         window.open(`https://www.factube.com/base/${customData.id}`);
    //     }
    // }
    // renderCustomData: Function = (customData) => {
    //     if (customData) {
    //         return <div>{customData.name}</div>;
    //     }
    //     return null;
    // }
    // renderCustomBlock: Function = (customData) => {
    //     if (customData) {
    //         return (<BaseCard cardData={customData} />);
    //     }
    //     return null;
    // }
    render() {
        const customBlockConfig = {
            renderCustomBlock: this.renderCustomBlock,
            renderCustomData: this.renderCustomData,
            suggestCustomData: this.suggestCustomData,
            goLink: this.goBaseLink,
            customTitle: '添加数据道项目'
        };
        return (
            <div className="demo-root">
                <h2>React Draft Editor</h2>
                <button onClick={() => this.setState({readOnly: true})}>预览</button>
                <button onClick={() => this.setState({readOnly: false})}>编辑</button>
                <div className="demo-wrapper">
                    <div className="demo-content">
                        <Editor
                            initContentState={this.state.rawContentState}
                            onChange={this.onContentStateChange}
                            imageUploader={this.imageUploader}
                            customBlockConfig={customBlockConfig}
                            placeholder="写点什么吧..."
                            readOnly={this.state.readOnly}
                        />
                    </div>
                    <div className="demo-display">
                        <div dangerouslySetInnerHTML={{ __html: stateToHTML(this.state.rawContentState) }} />
                    </div>
                </div>
            </div>
        );
    }
}

render(<Demo />, document.getElementById('app'));
