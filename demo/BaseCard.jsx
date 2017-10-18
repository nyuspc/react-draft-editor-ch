// 集、库、目录卡片 by wangchao 2016.9.7
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class BaseCard extends PureComponent {
    static propTypes = {
        cardData: PropTypes.object.isRequired
    };
    render() {
        const { cardData } = this.props;
        return (
            cardData ?
                <div className="base-card">
                    <div className="base-card-left">
                        { cardData.image && <img src={cardData.image.replace('?', '?imageView2/1/w/55/h/55&')} alt="" />}
                    </div>
                    <div className="base-card-right">
                        { cardData.name ? <div className="base-card-name">{cardData.name}</div> : null }
                        { cardData.description ? <div className="base-card-des">{cardData.description}</div> : null }
                    </div>
                </div>
                : null
        );
    }
}
